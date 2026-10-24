"""Export public-field allowlists from content/inventory into src/data/records.json.

The inventory is internal. This script copies only named public fields, never
provenance, review notes, open questions, conflicts, raw source paths or hashes.
Every record keeps its `visibility` so the Astro build can apply the D-35 gate:
loopback dev may show `needs-owner-review`; release builds use only records
listed in src/data/release-allowlist.json with an approved visibility.

Review media stays under assets/review/. This script also writes downscaled WebP
review derivatives to assets/review/derived/ (never public/). Originals are
never modified.

Run: py -X utf8 scripts/export_content.py
"""

from __future__ import annotations

import json
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
INV = ROOT / "content" / "inventory"
OUT = ROOT / "src" / "data" / "records.json"
DERIVED = ROOT / "assets" / "review" / "derived"
REVIEW_URL = "/review-media"  # served only by the dev-server middleware

ALLOWED = {"needs-owner-review", "public-approved", "public-source-verified"}


def load(name: str):
    with open(INV / name, encoding="utf8") as fh:
        return yaml.safe_load(fh)


def keep(rec: dict) -> bool:
    return bool(rec.get("previewAllowed")) and rec.get("visibility") in ALLOWED


def pick(rec: dict, fields: list[str]) -> dict:
    out = {"id": rec["id"], "slug": rec["slug"], "visibility": rec["visibility"]}
    for f in fields:
        v = rec.get(f)
        if v not in (None, "", [], {}):
            out[f] = v
    return out


def review_url(preview_src: str | None) -> str | None:
    if not preview_src or not preview_src.startswith("assets/"):
        return None
    return REVIEW_URL + "/" + preview_src[len("assets/"):]


def derive(preview_src: str, max_side: int) -> dict | None:
    """Downscale a quarantined image to WebP for review use; keep the original."""
    src = ROOT / preview_src
    if not src.is_file():
        return None
    rel = Path(preview_src).relative_to("assets/review/projects")
    dest = DERIVED / rel.with_suffix(f".{max_side}.webp")
    with Image.open(src) as im:
        w, h = im.size
        if not dest.is_file():
            dest.parent.mkdir(parents=True, exist_ok=True)
            copy = im.convert("RGB")
            copy.thumbnail((max_side, max_side), Image.LANCZOS)
            copy.save(dest, "WEBP", quality=82, method=6)
        with Image.open(dest) as d:
            dw, dh = d.size
    return {
        "src": review_url(dest.relative_to(ROOT).as_posix()),
        "width": dw,
        "height": dh,
        "originalWidth": w,
        "originalHeight": h,
    }


# Readable display titles: case and acronym corrections only. Exact official
# titles are kept separately and shown as "Official title".
PATENT_DISPLAY = {
    "pat-0001": "GenShakti: AI-Driven Smart Energy Saver",
    "pat-0002": "GenShakti: AI-Driven Smart Zone Selection for Renewable Energy",
    "pat-0003": "Decentralized Document Control System",
    "pat-0004": "Blockchain-Driven Pharmaceutical Supply Chain Optimizer",
    "pat-0005": "ArogyaPlus: Smart Medical Insights Navigator",
    "pat-0006": "Promptly: Prompt Versioning SaaS",
    "pat-0007": "AI-Powered DigiLocker-Based Documentless Admission & Verification System",
    "pat-0008": "Proof-Based Automated Attendance Verification System",
}


def projects():
    out = []
    for r in load("projects.yaml"):
        if not keep(r):
            continue
        p = pick(r, ["title", "summary", "kind", "deploymentState", "group", "technologies",
                     "problem", "body", "features", "architecture", "displayOrder", "featuredOrder"])
        repo = (r.get("repo") or {}).get("url")
        if repo:
            p["repo"] = repo
        live = r.get("liveUrl") or {}
        if live.get("url") and live.get("checkResult") not in (None, "not-checked", "unreachable"):
            p["demo"] = live["url"]
        media = r.get("media") or {}
        images = []
        for img in media.get("images") or []:
            d = derive(img["previewSrc"], 1280) if img.get("previewSrc") else None
            t = derive(img["previewSrc"], 480) if img.get("previewSrc") else None
            if not d:
                continue
            images.append({
                "media": img.get("media"),
                "alt": img.get("alt") or f"{r['title']} interface capture",
                "full": d,
                "thumb": t,
                "approved": bool(img.get("publishable")) and bool(img.get("src")),
            })
        cover = media.get("cover")
        if cover:
            images.sort(key=lambda i: i["media"] != cover)
        p["images"] = images
        videos = []
        for v in media.get("videos") or []:
            if not v.get("previewSrc"):
                continue
            videos.append({
                "src": review_url(v["previewSrc"]),
                "start": v.get("startSeconds"),
                "duration": v.get("durationSeconds"),
                "shared": len(v.get("sharedWith") or []) > 0,
                "approved": bool(v.get("publishable")) and bool(v.get("src")),
            })
        p["videos"] = videos
        p["hasConflict"] = bool(r.get("conflicts"))
        out.append(p)
    out.sort(key=lambda p: (p.get("featuredOrder") or 99, p.get("displayOrder") or 99))
    return out


def patents():
    out = []
    for r in load("patents.yaml"):
        if not keep(r):
            continue
        official = r.get("confidence") == "official-snapshot" and r.get("status") == "application-published"
        p = pick(r, ["summary", "body", "officialSearchUrl", "office", "applicants"])
        p["title"] = PATENT_DISPLAY.get(r["id"], r["title"])
        p["status"] = "application-published" if official else "unverified"
        p["grantClaim"] = False
        if official:
            p["officialTitle"] = r.get("officialTitle")
            p["applicationNumber"] = (r.get("application") or {}).get("number")
            p["filingDate"] = (r.get("application") or {}).get("filingDate")
            pub = r.get("publication") or {}
            p["publicationDate"] = pub.get("publicationDate")
            p["journalIssue"] = pub.get("journalIssue")
            p["statusCopy"] = r.get("publicStatusCopy")
            p["role"] = "Named inventor" if r.get("ownerRole") == "named-inventor" else None
        out.append(p)
    return out


def experience():
    out = []
    for r in load("experience.yaml"):
        if not keep(r):
            continue
        p = pick(r, ["organization", "role", "type", "programme", "summary", "body", "technologies"])
        # Conflicting records publish no dates (handoff: conflicting dates are absent).
        if not r.get("conflicts"):
            for f in ("startDate", "endDate"):
                if r.get(f):
                    p[f] = str(r[f])
        else:
            p["datesWithheld"] = True
        p["section"] = "work" if r.get("type") in ("internship", "trainee-programme", "employment") else "leadership"
        out.append(p)
    return out


def education():
    return [pick(r, ["institution", "program", "discipline", "startYear", "endYear", "endYearKind",
                     "institutionUrl", "summary"]) for r in load("education.yaml") if keep(r)]


def achievements():
    return [pick(r, ["title", "kind", "event", "issuer", "date", "result", "teamContext",
                     "credentialUrl", "summary"]) for r in load("achievements.yaml") if keep(r)]


BADGES = {
    "cred-0006": "aws-foundations",
    "cred-0007": "aws-architecting",
    "cred-0008": "cisco-cybersecurity",
    "cred-0009": "python-essentials-1",
    "cred-0010": "python-essentials-2",
}


def credentials():
    out = []
    for r in load("credentials.yaml"):
        if not keep(r):
            continue
        p = pick(r, ["title", "issuer", "platform", "kind", "issueDate", "hours", "verifyUrl", "summary"])
        folder = BADGES.get(r["id"])
        if folder and r.get("imagePublishable") and (ROOT / "public/media/certifications" / folder / "badge.png").is_file():
            p["badge"] = f"/media/certifications/{folder}/badge.png"
        out.append(p)
    return out


def skills():
    return [pick(r, ["name", "category", "evidence"]) for r in load("skills.yaml") if keep(r)]


def articles():
    return [pick(r, ["title", "type", "category", "platform", "canonicalUrl", "publishedAt", "summary"])
            for r in load("articles.yaml") if keep(r)]


def social():
    return [pick(r, ["platform", "url", "handle"]) for r in load("social.yaml")
            if keep(r) and r.get("showOnShelf") and r.get("url")]


def identity():
    ui = load("ui-copy.yaml")
    ident = ui["identity"]
    portrait = ROOT / "assets/profile/ayush-jain.webp"
    with Image.open(portrait) as im:
        w, h = im.size
    return {
        "copy": {k: ident[k] for k in ("wordmark", "byline", "role", "statement", "intro", "about",
                                         "shelfHint", "photoAlt", "contact", "publicEmail")},
        # D-05: default portrait, needs-owner-review; release builds omit it.
        "portrait": {"src": f"{REVIEW_URL}/profile/ayush-jain.webp", "width": w, "height": h,
                     "visibility": "needs-owner-review", "id": "media-0742"},
        "groups": ui["groups"],
        "drawerDescriptions": ui["drawerDescriptions"],
        "statusLabels": ui["statusLabels"],
        "originalPortfolio": load("resume.yaml")[0].get("originalPortfolioUrl"),
    }


def main():
    data = {
        "identity": identity(),
        "projects": projects(),
        "patents": patents(),
        "experience": experience(),
        "education": education(),
        "achievements": achievements(),
        "credentials": credentials(),
        "skills": skills(),
        "articles": articles(),
        "social": social(),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf8")
    counts = {k: len(v) for k, v in data.items() if isinstance(v, list)}
    print("wrote", OUT.relative_to(ROOT).as_posix(), counts)


if __name__ == "__main__":
    main()
