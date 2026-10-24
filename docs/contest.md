# Content Extraction & Source-Reconciliation Brief

> **Filename note.** This file keeps its original name, `contest.md`, as the owner requested. It is **not** about a contest. It is the operating brief for the agent that extracts content from the source folders and reconciles conflicting records before anything is built.

**Derived from:** `context/contest.md`. Updated in Phase 1 with the real workspace paths, the discovery results in [workspace-audit.md](workspace-audit.md), the five-way verification classification, and the `portfolio2.0/` output locations. **Phase 1.1** added the `placement/` folder (§2, Phase F2), the publication-handling classes (§4.1), the content-integrity distinctions (§3.1), and the official patent evidence.

> **Phase boundary.** Executed as authorized Phase 2 preparation under D-32. See [../phase-2-report.md](reports/phase-2-report.md) for results and [phase-3-handoff.md](phase-3-handoff.md) for implementation. No application code is permitted.

---

## 1. Objective

Produce a **verified, deduplicated, source-linked content inventory and asset manifest** for The Shelf. Implementation (described in [design.md](design.md)) may only use records from this inventory.

Order of work: inventory → extract → compare → verify → classify → owner review → build. Do not write site code during this brief.

## 2. Sources

| Source            | Path (workspace-relative)     | What to expect (from the Phase 1 audit)                                                                                                                                                                                                                                                                                                                      |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Old portfolio     | `portfolio/`                  | Identity, bio, 6 featured projects, 8 patent records, 3 internships plus 1 leadership role, 2 education records, 6 certificates, 3 Medium articles, social links, profile images, résumé PDF, old SEO files                                                                                                                                                  |
| Project archive   | `BuildLog/BuildLog/BuildLog/` | 31 project repos in `projects/`; master plan in `BuildLog/BuildLog/BuildLog/context/MASTER-PROJECT-PLAN.md`; 17 episode videos in `output/media_specs/`; post copy in `output/drafts/`; 207 screenshots in `brag-output/**/shots/`                                                                                                                           |
| Placement records | `placement/`                  | 4 résumé versions; 15 credential files; internship letters (one experience letter, offer letters); official InPASS printouts for 5 patents plus an owner summary (`patents.docx`); an achievements sheet (`Ayush_Achievements.xlsx`); **identity, financial, and academic documents (never open)**. See [workspace-audit.md](workspace-audit.md) §3.9–§3.11. |
| Owner statements  | Owner, in conversation        | About 30 projects, 9 patents, 3 internships                                                                                                                                                                                                                                                                                                                  |

The owner statements are **discovery expectations, not facts**. Report the numbers actually found and explain any gap. Never pad a category to reach an expected number.

### 2.1 Do not treat as sources

- `BuildLog/BuildLog/.github/`, `BuildLog/BuildLog/Microsoft/`, `BuildLog/BuildLog/__MACOSX/`, `.DS_Store`, any `.venv/`, `node_modules/`, `dist/`, `build/`, `.next/`, caches, and logs.
- BuildLog's own `AGENTS.md`, `CLAUDE.md`, and `CONTINUE.md`. They govern the video pipeline, not The Shelf.
- `brag-output/**/composition/assets/` files other than `shots/`. Those are video-production assets (icons, demo data, music), not product evidence.
- `portfolio/content/hello-world.mdx` (empty placeholder post).
- `placement/ID'S/**`, `placement/doc/**` (except `AYUSH_JAIN_Resume.pdf`), `placement/Ayush-JAIN-SIGN 1.png`, `placement/Registration/**`, `placement/Material/**`, all offer letters, and `placement/index.html` (typo'd links, C-22). Identity, financial, academic, and signature files are **never opened** (S-13).
- The concept board `context/The Shelf_ A Personal Portfolio Archive.png`. Its names, numbers, dates, counts, companies, and bullets are **sample data** for the visual design ([design.md](design.md) §0.1). Several contradict the real sources.

## 3. Non-negotiable rules

1. Never fabricate any name, project, patent title, number, status, date, employer, role, award, metric, technology, URL, or outcome.
2. A repository name is not proof of the public title. Check the README, package metadata, app UI text, and existing portfolio copy.
3. Not every folder is a deployable product. Classify each as original, contribution, fork, tutorial/course work, experiment, hackathon submission, group project, or work assignment.
4. Never publish secrets. If one appears, record only the path and category (see [security.md](security.md) §4).
5. **Static inspection only.** Do not run project code, install scripts, build scripts, or binaries. Read-only public-source checks are authorized by D-32; do not upload local material.
6. Do not upload source code, private assets, workplace material, or personal documents to any external service.
7. Workplace and internship material is confidential until cleared.
8. A filename is not proof.
9. **Never modify** `portfolio/`, `BuildLog/`, `placement/`, or `context/`. All outputs go to `portfolio2.0/content/inventory/`.
10. Every public fact carries provenance.
11. Conflicts are recorded and escalated, never resolved by guessing.
12. Never copy compensation, identity-document data, academic marks, signatures, third-party contact details, or redemption codes into any output (S-09 to S-14).
13. Do not assume every record becomes a public entry. Publication is a separate decision (§4.1).

### 3.1 Content-integrity distinctions

Record these distinctions explicitly as schema fields ([content-inventory-template.md](content-inventory-template.md)). Never blur them in copy.

| Distinguish                                              | From                                                     | Field                                     |
| -------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------- |
| Prototype                                                | Deployed product, archived work                          | `project.deploymentState`                 |
| Repository                                               | Live deployment                                          | `project.repo` vs `project.liveUrl`       |
| Published patent application                             | Granted patent; filed (unpublished) application          | `patent.status`, `publication`, `grant`   |
| Named inventor                                           | Applicant or owner                                       | `patent.inventors` vs `patent.applicants` |
| Internship                                               | Full-time employment; trainee programme; leadership role | `experience.type`                         |
| Certificate of completion, training badge, participation | Professional (exam-based) certification                  | `credential.kind`                         |
| Personal achievement                                     | Team achievement                                         | `achievement.teamContext`                 |

## 4. Verification classification

Every record **and** every key field carries exactly one of these classes. They map onto the `confidence` field in [content-inventory-template.md](content-inventory-template.md) §1.

| #   | Class                             | `confidence` value                                 | Meaning                                                                                                                                                   | May appear publicly?                                                    |
| --- | --------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Verified                          | `verified-official` / `owner-confirmed`            | Corroborated by an authoritative source (an official registry, the live deployed page, the issuer's credential page) or explicitly confirmed by the owner | Yes                                                                     |
| 2   | Found, not independently verified | `source-documented`                                | Present in an owner-provided source file but not independently checked                                                                                    | Only after owner review, and never for patent status, dates, or metrics |
| 3   | Conflicting                       | `conflict`                                         | Sources disagree                                                                                                                                          | No, until resolved                                                      |
| 4   | Missing                           | `unknown`                                          | No evidence found                                                                                                                                         | No (field omitted)                                                      |
| 5   | Confidential or sensitive         | `visibility: private-or-confidential` or `exclude` | Must not be published regardless of accuracy                                                                                                              | Never                                                                   |

Classes 1–4 describe _accuracy_. Class 5 describes _publishability_. A record can be verified **and** confidential. Store both: `confidence` plus `visibility`.

Additional accuracy value (Phase 1.1): `official-snapshot`, meaning it matches an official record **as printed on a dated capture** (e.g. the InPASS printouts). It must be re-checked live before publication.

### 4.1 Publication handling (for documents and records)

| Class                      | Meaning                                                        | Examples found                                                                       |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Publicly publishable       | Already public and safe to cite or link                        | Official patent records (link, don't re-host); issuer verification pages             |
| Requires verification      | Plausible, but must be checked against an authoritative source | Credential URLs, live demo URLs, Promptly and EdTech patent numbers                  |
| Requires explicit approval | Accurate, but the owner must decide to publish                 | Résumé (D-24), CGPA (D-31), co-inventor names (D-30), DistrictD label (D-28)         |
| Private or confidential    | Never published                                                | Offer letters, compensation, identity, financial, and academic documents, signatures |
| Irrelevant                 | Not portfolio material                                         | Study material, templates, hackathon application confirmations                       |

## 5. Output files

All outputs go in `portfolio2.0/content/inventory/`. This directory is **internal** and is never imported by site code or copied to `public/` (see [security.md](security.md) §3 and decision D-16).

| File                                                                                                                    | Contents                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `source-inventory.md`                                                                                                   | Sources inspected, date, file counts, method, and what was skipped and why                |
| `projects.yaml`                                                                                                         | One entry per project candidate (schema: template §2)                                     |
| `patents.yaml`                                                                                                          | One entry per patent record (template §3)                                                 |
| `experience.yaml`                                                                                                       | Internships, employment, leadership (template §4)                                         |
| `education.yaml`, `skills.yaml`, `achievements.yaml`, `credentials.yaml`, `articles.yaml`, `social.yaml`, `resume.yaml` | Template §5–§10, §7a, §15                                                                 |
| `media.csv`                                                                                                             | Asset manifest (template §11)                                                             |
| `conflicts.md`                                                                                                          | Conflict register, seeded from [workspace-audit.md](workspace-audit.md) §4                |
| `secret-scan-report.md`                                                                                                 | Paths and categories only. No values.                                                     |
| `owner-questions.md`                                                                                                    | Numbered questions that need owner answers, each linked to a conflict or missing-field ID |
| `extraction-report.md`                                                                                                  | Final report (§13)                                                                        |

YAML is used for inventory so it diffs cleanly. After owner review, approved records are converted into Astro content-collection entries (see [asset-organization.md](asset-organization.md) §3), **with provenance stripped**.

## 6. Phase A — source discovery

1. List the full directory tree of each source, excluding §2.1 paths.
2. Identify frameworks, package managers, entry points, static assets, content files, READMEs, local Git remotes (`git config --get remote.origin.url` is local and safe), and nested repositories.
3. Detect duplicates, symlinks, generated output, large binaries, and archive artifacts.
4. Record the source folder names, inspection date, method, and file counts in `source-inventory.md`.
5. Do not conclude that something is missing until both sources and nested directories have been searched (e.g. search by title keywords, application numbers, and organization names).

For binaries: check type and size first. Extract PDF text where possible, and inspect pages visually only if extraction fails. For video: record filename, duration, dimensions, and the related `TIMELINE.md`/`SPEC.md`. Do not transcribe through an external service without permission.

## 7. Phase B — old portfolio

Extract from `portfolio/src/data/resume.tsx`, `portfolio/src/data/faq.ts`, `portfolio/src/app/**/page.tsx`, `portfolio/src/components/schema-markup.tsx`, `portfolio/public/llms.txt`, `robots.txt`, `sitemap.xml`, and `vercel.json`:

- name, bio, professional title or summary
- profile images (`ayu.webp`, `ayu.jpg`, `ayush.jpg`), with approval pending (D-05)
- social links. Mark Facebook and Instagram as `conflict` (the source marks them as placeholders, C-15).
- projects and descriptions
- patents (8 in source)
- experience: DistrictD, Joyfullminds, Singari Global (internships), GDG ABESEC (leadership)
- education, skills, certificates, articles
- résumé PDF: record its existence only, until privacy review (S-03)
- old SEO metadata, as a reference for [seo-optimization.md](seo-optimization.md) and [ai-optimization.md](ai-optimization.md)
- every claim in `faq.ts`, `about/page.tsx`, `schema-markup.tsx`, and `llms.txt` that is **not** in `resume.tsx` (hackathon wins, community size, open-source contributions, npm package, PPO). Log each one as `source-documented` with `ownerReviewRequired: true` (C-17).

Preserve facts and useful assets, not the old layout or old navigation.

## 8. Phase C — project archive

For each of the 31 directories in `BuildLog/BuildLog/BuildLog/projects/`:

1. **Identity:** the public name from the README title, app UI text (`index.html` `<title>`, header components), the master plan, and the old portfolio. Record aliases (e.g. `mental-health` ↔ "Zenati", `Fusion` ↔ "Fusion2048", `VordGuard` ↔ "InFrame Studio", SDE vs SDG Dashboard, C-10).
2. **Repository:** from local `.git` remotes, which all point to `github.com/URAYUSHJAIN/<repo>`. XenoCRM has two repos. Public visibility is `unknown` until checked online with permission.
3. **Live URL:** from the README, the master plan, and the old portfolio. Where they disagree (C-05), mark `conflict`. A URL becomes `verified` only after a successful check with network permission.
4. **Facts:** problem, audience, features, architecture, technologies, from the README, docs, and source structure. A dependency in `package.json` does not prove a feature.
5. **Type and deployment state:** see the template §2 (`kind`, `deploymentState`).
6. **Role:** solo or team, and Ayush's contribution, only where evidenced.
7. **Media:** the matching episode video (many-to-many, see the episode table in `MASTER-PROJECT-PLAN.md` Part 7), screenshots from `brag-output/NN-*/composition/assets/shots/`, and old-portfolio thumbnails.
8. **Narrative:** `output/drafts/NN-*.md` and `MASTER-PROJECT-PLAN.md` Part 3. These are owner-authored marketing copy, so classify their claims as `source-documented` and check them against the repo.
9. **Merged-episode offsets:** derive each project's start time from `brag-output/NN-*/TIMELINE.md` where it is explicit. Otherwise leave `videoStartSeconds: null`.
10. **Sensitive files:** note any `.env` or credential-like file by path (three are known, S-01).

Missing data is `unknown`, not an inference.

## 9. Phase D — patents (special verification)

**Expected:** 9 (owner). **Found across all sources:** 8. **Official evidence:** InPASS printouts for 5 (`placement/patent/patents.pdf`): applicant ABES Engineering College; Ayush Jain a named inventor; publication type INA; captured Apr and Jul 2025. Two old-site numbers are wrong (C-18, C-19). See [workspace-audit.md](workspace-audit.md) §3.6.

For each record:

1. Copy title, application number, the `publicationNumber` field value, and the date **exactly** (preserve casing, punctuation, and leading digits).
2. The `NN/YYYY` values are what InPASS labels "Publication Number" (the journal issue). Store them in `publication.journalIssue` and display them with the official label (C-02 resolved).
3. With owner permission for network access, look up each application number in the official Indian Patent Office public search. Record the official title, applicant(s), inventor(s), filing date, publication date, journal issue, and current status exactly as shown, plus the record URL. Mark `verified-official` only if every published field matches.
4. Confirm that Ayush is a named inventor or applicant. Being in the portfolio is not proof of inventorship.
5. Search for the missing 9th record: ask the owner, and search the sources for other 12-digit application numbers or titles. Report the outcome either way.
6. Resolve the "EduVerify" naming (C-03) and the Promptly status (C-04) with the owner.

Allowed status vocabulary: template §3. "Filed" and "published" never become "granted".

## 10. Phase E — internships and experience

**Expected:** 3 internships. **Found:** 3 (DistrictD, Joyfullminds, Singari Global) plus 1 leadership role (GDG ABESEC).

- Verify organization legal or display names, role titles, dates, and work mode with the owner (LinkedIn or offer letters are owner-held evidence. Do not request private documents to be stored in the repo).
- DistrictD is current. Its existing description names institutional clients (S-05). Mark that sentence `private-or-confidential` until the owner confirms employer clearance.
- The "confirmed PPO" claim (`faq.ts`, `schema-markup.tsx`) is `source-documented` and needs owner confirmation and willingness to publish.
- Keep leadership separate from internships (design.md §8.3).

## 10a. Phase F2 — placement records (résumé, credentials, other material)

**Résumé**

1. List candidates with path, format, hash, and date ([workspace-audit.md](workspace-audit.md) §3.10). Identify the most complete and most recent **by content**, not by file date.
2. Compare their facts with the old site and the sheet. Log differences as conflicts.
3. Do **not** copy any résumé into `public/`. Create `resume.yaml` (template §15) pointing to the owner-approved **public variant** once it exists (D-24).

**Credentials**

1. For each credential file ([workspace-audit.md](workspace-audit.md) §3.11), record: title, issuer, platform, issue date (normalize US-format dates and record the original), expiry (if any), kind, verification URL (as a field; check live with permission), related skills, associated media, and privacy flags (email or codes in the image).
2. Never infer validity from a file. A credential becomes `verified-official` only after its issuer page resolves and matches.
3. Classify kind honestly (`course-certificate`, `training-badge`, `statement-of-achievement`, `participation`, `badge`). None found are professional certifications.

**Internship letters and offers**

1. Extract only public-safe facts (organization display name, role title, dates) for conflict resolution (C-23 to C-25).
2. Never copy compensation, terms, signatures, or third-party contacts. Offer letters remain private.

**Achievements sheet** (`placement/Ayush_Achievements.xlsx`)

1. Extract achievement, result, date, level, and place. Drop the mentor names (third party) and all compensation.
2. Treat each row as `source-documented` until evidence exists (e.g. a certificate or an organizer page).

**Other placement material:** classify per §4.1 and record paths only.

## 11. Phase F — other categories

- **Education:** 2 records. Use official institution names. Do not infer graduation status.
- **Skills:** derive from evidenced project technologies, not only from the old skill list. Each skill links to evidence records.
- **Achievements and certificates:** 6 on the old site, 15 credential files in `placement/` (Phase F2). Verify that each credential URL resolves (with permission). C-08 is resolved (use the badge URL). Hackathon wins: one documented (Mind Mela 2026); the others stay `unknown` until the owner supplies event names and results (C-27).
- **Community leadership:** GDG chapter official name (C-07). The membership figure needs a source.
- **Articles:** 3 Medium articles. Canonical URL = the Medium URL. Dates from source; verify on the live page with permission.
- **Social profiles:** see template §10 and the profile-link inventory ([workspace-audit.md](workspace-audit.md) §3.2). GitHub canonical: `https://github.com/URAYUSHJAIN` (C-06 resolved). Instagram is unverified (D-25). Never use the `uaryushjain` variants (C-22).

## 12. Phase G — asset manifest and preparation

Create `content/inventory/media.csv` (columns in template §11). Rules:

- Prefer original project screenshots. Never use stock or generated imagery to represent a real product.
- Originals stay in the source folders. Safe selected derivatives may be prepared during Phase 2 under D-32; publication eligibility remains a separate review.
- **Do not copy every asset.** Shortlist per record: one cover, up to 6 screenshots, at most one video.
- Videos: confirm music and SFX licensing for web use (S-06, D-07) before marking a video publishable.
- Exclude documents or certificate images showing addresses, phone numbers, IDs, signatures, or QR codes with personal data.
- Exclude the trial font (S-04) and all composition-only assets.
- Record ownership for each asset: `owner-created` (screen captures of the owner's own projects), `third-party-logo`, `third-party-media`, or `unknown`.

## 13. Phase H — secret and privacy scan

Scan both sources for API keys, tokens, `.env` values, passwords, private keys, credentialed database URLs, internal endpoints, personal phone, address, or ID details, private repository URLs, and workplace or client data.

- Record the path, category, and recommendation only. **Never** print or copy values.
- Known items: S-01 (three real `.env` files), S-02 (phone number in `resume.tsx`). Recommend that the owner check whether those `.env` values are live and whether they are in public Git history.
- No destructive cleanup of source folders.

If a scanning tool is not installed, record the manual method used (pattern search) and recommend the tool in [documentation-quality.md](documentation-quality.md) §3. Do not install it without approval.

## 14. Phase I — dedup and conflicts

Create `content/inventory/conflicts.md`, starting from the [workspace-audit.md](workspace-audit.md) §4 seed, with columns: ID · entity/field · source A + path · source B + path · values (no secrets) · preferred evidence and reason (if objectively clear) · owner question ID · public handling until resolved.

Deduplicate projects by Git remote first, then package identity, README content, screenshot similarity, and shared structure. Never merge on name similarity alone. Keep separate versions if they are meaningfully different products (e.g. `Arogya` and `ArogyaPlus` are **distinct** repos and distinct projects).

## 15. Hand-off to implementation

Implementation (see [implementation-and-validation.md](implementation-and-validation.md)) may start only when:

- every inventory file exists
- every record has `confidence` and `visibility`
- `owner-questions.md` has been answered or explicitly deferred by the owner
- the secret scan is complete and no secret value appears in any `portfolio2.0/` file

## 16. Extraction report (`extraction-report.md`)

Include:

- candidate projects found, duplicates merged, and the proposed publishable set
- every project with its verification status per key field
- patent records found (count and exact titles), status confidence, and the 9-vs-8 outcome
- experience, education, skills, achievements, leadership, writing, and social records found
- asset totals: screenshots, videos, documents, certificates, profile images, and how many were shortlisted
- links verified vs unverified (and whether network checks were permitted)
- conflicts and owner questions outstanding
- confidential or private records excluded (category level only)
- secret scan summary (no values)
- exact commands run and whether they succeeded
- limitations

Do not say "complete" unless every phase ran. Distinguish _extracted_, _verified_, and _not checked_.
