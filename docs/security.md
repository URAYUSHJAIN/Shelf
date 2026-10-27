# Security, Privacy & Publication Safety — The Shelf

**Derived from:** `context/security.md`. Phase 1 additions: the concrete findings from the workspace audit, public/private boundaries for `portfolio2.0/` itself, a CSP baseline, source-map and repository-exposure rules, copyright and permission checks for each media class, and **release-blocking conditions**.

The Shelf is a static, public portfolio with no accounts, no database, no uploads, and no server-side code at launch. Keep it that way unless the owner approves a feature. **Do not add backend features just because this document describes how to secure them.**

---

## 1. Threat model

| Threat                                                             | Likelihood here                                                           | Primary control                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------- |
| Secrets copied from source repos into the new site or docs         | **Medium** (3 real `.env` files exist, S-01)                              | §4 scanning, §5 secret rules, RB-01 |
| Personal data published (phone, address, IDs in PDFs/certificates) | **Medium** (phone in source data S-02; résumé reviewed and withheld S-03) | §3 classification, §11              |
| Confidential employer/client material published                    | **Medium** (client names in experience copy, S-05)                        | §3, RB-04                           |
| Copyright/licence violation (music, fonts, logos, screenshots)     | **Medium** (S-04 trial font, S-06 music)                                  | §12, RB-05                          |
| XSS via rendered Markdown or JSON-LD                               | Low (static, owner-authored)                                              | §6                                  |
| Unsafe external links / schemes                                    | Low                                                                       | §7                                  |
| Supply-chain compromise via dependencies                           | Low–medium                                                                | §9                                  |
| Exposure of internal docs/inventory/source maps                    | Medium if the repo is public (D-16)                                       | §3.3, §10                           |
| Third-party tracking / privacy leakage                             | Low (none planned)                                                        | §13                                 |
| Resource abuse (large media hot-linking)                           | Low                                                                       | Host limits, file budgets           |

## 2. Workspace-specific findings (Phase 1 audit)

Values were **not read or reproduced**. Paths are workspace-relative. Details: [workspace-audit.md](workspace-audit.md) §5.

| ID   | Finding                                                                                                                                                  | Required action                                                                                                | Owner action                                                                                            |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| S-01 | Real env files: `BuildLog/BuildLog/BuildLog/projects/Shayoga/client/.env`, `.../NyayAI/frontend/.env.development`, `.../NyayAI/frontend/.env.production` | Never copy, quote, or open them for content                                                                    | Check whether they hold live credentials and whether they are in public Git history. Rotate if exposed. |
| S-02 | Personal phone number in `portfolio/src/data/resume.tsx`                                                                                                 | Do not publish                                                                                                 | Approve explicitly only if wanted                                                                       |
| S-03 | Résumé PDF reviewed; unsafe to re-host                                                                                                                   | Do not link until reviewed for personal data and hidden metadata                                               | Approve the version to publish                                                                          |
| S-04 | Trial-licensed font in a BuildLog composition                                                                                                            | Never use on the site                                                                                          | —                                                                                                       |
| S-05 | Experience copy names an employer's institutional clients                                                                                                | Treat as confidential                                                                                          | Confirm employer clearance                                                                              |
| S-06 | Music/SFX inside episode videos, licence unknown                                                                                                         | Do not self-host videos until cleared (D-07)                                                                   | Confirm the licence covers website use                                                                  |
| S-07 | Many `.env.example` files                                                                                                                                | Scan before quoting any config                                                                                 | —                                                                                                       |
| S-08 | The concept board's sample text names an employer's client (`context/The Shelf_ A Personal Portfolio Archive.png`, copy in `docs/reference/`)            | Keep `docs/reference/` private and out of `dist/`; never transcribe its text                                   | Decide on repository visibility (D-16)                                                                  |
| S-09 | Compensation figures (stipends, salary, PPO package)                                                                                                     | `placement/Ayush_Achievements.xlsx`, offer letters                                                             | Never publish or quote                                                                                  | —                                              |
| S-10 | Signed offer letter with a secrecy clause                                                                                                                | `placement/INTERN/Districtd/Ayush_jain_166.pdf`, other offer letters                                           | Private; no DistrictD client names, systems, or screenshots without written clearance                   | Confirm what may be said publicly (D-28, S-05) |
| S-11 | Credential PDF prints the personal email                                                                                                                 | AWS Cloud Architecting PDF in `placement/Certification/cloud/`                                                 | Link to the issuer badge; never publish the file or image                                               | —                                              |
| S-12 | Badge screenshot shows a redemption coupon code                                                                                                          | `placement/Certification/Hacktoberfest 2025.jpeg`                                                              | Never publish the screenshot                                                                            | —                                              |
| S-13 | Identity, financial, academic-record, and signature documents                                                                                            | `placement/ID'S/**`, `placement/doc/**` (except the résumé), signature PNG, `placement/Registration/aktu.jpeg` | **Never opened, copied, or published.** Excluded from every scan output except by path.                 | —                                              |
| S-14 | Third-party personal contact data                                                                                                                        | Experience letter; inventor and applicant addresses in patent records                                          | Never publish                                                                                           | —                                              |
| S-15 | The live old-site résumé includes the phone number and employer client names                                                                             | `portfolio/public/AYUSH_JAIN.pdf` (served at `/resume`)                                                        | Do not reuse. Publish only an approved public variant (D-24).                                           | Consider replacing the old site's résumé now   |

## 3. Public vs private boundaries

Phase 2 added private preparation files, now under `docs/internal/` (`content.md`, `content-review.md`, `asset-manifest.md`) with the CSV ledger in `content/inventory/`, staging derivatives under `assets/`, and audit utilities under `content/inventory/`. None is a web root or automatic publication source. Keep review artifacts private until a sanitized public export is prepared.

### 3.1 Source material

- `portfolio/`, `BuildLog/`, `placement/`, and `context/` are read-only. Their contents are **private by default**. Only items that pass §3.2 classification are published, and only as processed copies.
- `placement/` holds the most sensitive material in the workspace (S-09 to S-14). Agents open only the files listed as relevant in [workspace-audit.md](workspace-audit.md) §3.9. Identity, financial, academic, and signature files are never opened. Nothing from `placement/` is copied into `portfolio2.0/` except, after approval, the public résumé variant (D-24).
- Workplace repositories, screenshots, and descriptions are confidential until the owner confirms clearance.

### 3.2 Classification (per record and per asset)

`public-approved` · `public-source-verified` · `needs-owner-review` · `private-or-confidential` · `exclude` (definitions: [content-inventory-template.md](content-inventory-template.md) §1.3). Only the first two ship. The build enforces this (T-CNT-02).

Check every asset and record for: home address, personal phone, private email, student/government IDs, signatures, QR codes with personal data, private repository links, internal dashboards, client names, customer data, production endpoints, proprietary code or screenshots, credentials, internal hostnames, and other people's personal data.

### 3.3 The `portfolio2.0/` repository itself

- `docs/workspace-audit.md` and `content/inventory/` contain local paths and internal review notes, and `docs/reference/` holds the concept board with sample text naming an employer's client (S-08). If the repository is or may become public (D-16), add all three to `.gitignore` **before the first commit**, or keep the repository private.
- No file under `portfolio2.0/` may contain secret values, phone numbers, government IDs, or confidential employer details, whatever the repo's visibility.
- `docs/` is never copied to `public/` or `dist/`.

## 4. Secret and credential scanning

| When                                       | What                             | Tool                                                                                                                                                                              |
| ------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Before the first commit of `portfolio2.0/` | Entire working tree              | Recommended: `gitleaks` (not installed; introduce via [documentation-quality.md](documentation-quality.md) §3 with approval). Fallback: `scripts/scan-output.mjs` regex patterns. |
| Every CI run                               | Changed files plus `dist/`       | Same                                                                                                                                                                              |
| Before release                             | `dist/` and the full Git history | Same, plus a manual review of the top findings                                                                                                                                    |

Minimum patterns: private keys (`-----BEGIN`), AWS/GCP/Azure key shapes, `sk-`/`ghp_`/`github_pat_`/`xox`-style tokens, JWT shapes, `postgres://user:pass@`, `mongodb+srv://…:…@`, `.env`-style `KEY=` lines with high-entropy values, Indian mobile-number patterns, email addresses other than the approved public one.

Reporting: path, line, and category only, never the value. Findings in source folders go to `content/inventory/secret-scan-report.md`. Findings in `portfolio2.0/` block release (RB-01).

## 5. Environment variables and secrets

- The launch site needs **no secrets**. If one becomes necessary, it lives in the host's secret store, never in Git.
- Any variable exposed to client code by the framework (e.g. Astro/Vite `PUBLIC_*`) is public. Never put a secret there.
- No secrets in frontend code, public assets, content, JSON-LD, `llms.txt`, source maps, or build logs.
- Commit `.env.example` only if configuration is genuinely needed, with placeholder values.
- `.gitignore` includes `.env*` except `.env.example` from the first commit.

## 6. Safe rendering

- Content is owner-authored Markdown/YAML, but it is still treated as untrusted at render time.
- Markdown: no raw HTML passthrough unless a reviewed need exists. If raw HTML is enabled, sanitize it with an allowlist.
- No `set:html` (Astro) or equivalent with content strings, except JSON-LD produced by `JSON.stringify` with `<` escaped as `\u003c`.
- No `eval`, `new Function`, or string-built inline handlers.
- Filenames, metadata, and repository descriptions are untrusted input. Never interpolate them into HTML attributes without escaping (Astro escapes expressions by default; keep it that way).

## 7. External links and embedded media

- External links: `target="_blank" rel="noopener noreferrer"` plus a visible new-tab indicator.
- URL validation at build time (`src/lib/urls.ts`): only `https:` (and `mailto:` for the contact link). Reject `javascript:`, `data:`, `vbscript:`, and `http:` (unless the owner explicitly approves a specific URL). Repo links are allowlisted to `github.com`.
- No third-party widgets or iframes except the owner-approved original portfolio (D-39), loaded on laptop opening/direct `/laptop/` visits. If a video platform embed is ever approved, load it on click only, use a privacy-enhanced embed domain where the provider offers one, and add that origin to the CSP `frame-src` only.
- Never embed private repo, drive, or document URLs.

## 8. HTTP, HTTPS, and headers

Set at the host (configuration file or dashboard). **Verify on the deployed response**, not just in config (T-SEC-06).

| Header                       | Baseline value                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| HTTPS redirect               | 301 from HTTP to HTTPS, and from the non-canonical host to the canonical host                                                              |
| `Strict-Transport-Security`  | `max-age=31536000; includeSubDomains` (add `preload` only after confirming every subdomain is HTTPS)                                       |
| `Content-Security-Policy`    | See §8.1                                                                                                                                   |
| `X-Content-Type-Options`     | `nosniff`                                                                                                                                  |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                                                                                                          |
| `Permissions-Policy`         | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` (do not list deprecated or unknown features; they produce console warnings) |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                                                                                              |
| Clickjacking                 | CSP `frame-ancestors 'none'`                                                                                                               |
| Cache                        | Hashed assets `public, max-age=31536000, immutable`; HTML `public, max-age=0, must-revalidate`                                             |

Also: no directory listing; a 404 that reveals no paths or stack traces; no permissive CORS (none is needed).

### 8.1 CSP baseline

Start here and loosen only with a documented reason:

```text
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' data:;
media-src 'self';
font-src 'self';
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
frame-src https://www.urayushjain.tech;
upgrade-insecure-requests
```

- D-39 permits only the original portfolio origin in `frame-src`. The iframe uses `referrerpolicy="no-referrer"` and a sandbox allowing scripts, same-origin storage, forms, downloads and new-tab links; top-level navigation remains disallowed. The parent cannot read or control the remote DOM. Keep the Open in tab fallback and parent Close action available. This updates the deployment policy; no hosting headers or deployment are changed in Phase 3.
- The WebGL globe needs no CSP exception (same-origin script, `img-src 'self'` texture). A `blob:` worker or `wasm` is not used.

- Astro may inline small scripts or styles depending on configuration. Prefer bundling them as external files. If inline code is unavoidable, use hashes (Astro's experimental or stable CSP support, if present in the installed version, can generate them). **Never** add `'unsafe-eval'`. Add `'unsafe-inline'` only as a documented, time-boxed exception with an owner sign-off.
- JSON-LD `<script type="application/ld+json">` is not executed, but strict CSPs still apply to it in some browsers' reporting. Verify there are no violations in the console (T-SEC-07).
- Record every CSP exception and its reason in this section.

## 9. Dependencies and supply chain

- Minimal dependencies: Astro, plus at most the official sitemap integration, plus dev-only test and validation tools. Every addition needs its purpose, maintenance status, licence, and advisories reviewed, and it is listed in the PR.
- Commit the lockfile. Use one package manager (recommended: `pnpm` or `npm`, whichever the owner prefers; both are installed).
- Run the package manager's audit in CI. Triage findings; do not blanket-upgrade.
- Beware typosquats: copy package names from official docs.
- Pin the Node major version (`engines` plus host setting). Node 20 is installed locally; confirm it is supported by the Astro version chosen.
- Never run project install scripts from `BuildLog/` repositories.

## 10. Build output and exposure

- Production source maps: **off** (the Vite `build.sourcemap` default is false; assert it in config and test for the absence of `.map` files in `dist/`, T-SEC-04).
- `dist/` must not contain `docs/`, `content/inventory/`, `tests/`, `.env*`, `*.md` from docs, or any file under a source-folder path.
- Check that no workspace-relative or absolute local path (`C:\`, `/Users/`, `BuildLog/`, `portfolio/src`) appears in `dist/` (T-SEC-05).
- 404 and error pages expose no framework or stack details.

## 11. Documents and downloads

- Publish only documents intended to be public. Prefer linking to the official patent record over re-hosting.
- Before publishing a PDF: check embedded text for personal data, strip metadata (author, software, edit history) without altering content, and confirm the owner's approval.
- Never alter official documents in a misleading way.
- No user uploads exist. Do not add an upload feature.

### 11.1 Résumé access (laptop)

- Only the owner-approved **public variant** is served (D-24): no phone number, no employer client names, verified patent numbers. Checks are recorded in `resume.yaml` (template §15).
- Path: `/media/documents/ayush-jain-resume.pdf` (static). Headers: `Content-Type: application/pdf`, `X-Content-Type-Options: nosniff`, and `Content-Disposition: inline` for "View". The "Download" link uses the HTML `download` attribute. No query-string or user-supplied path selects a file (no path traversal surface).
- Metadata stripped (author, producer, edit history) before publication. The page-1 preview image is generated at build from the approved file only.
- The résumé is **not** indexed: `X-Robots-Tag: noindex` on the PDF, so search results lead to the site, not a stale PDF. Excluded from the sitemap.
- Never re-host placement documents (offer letters, credentials with personal data, patent printouts).

## 12. Copyright, licences, and permissions

| Media class                                                                                   | Rule                                                                                                         | Evidence required                                    |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Owner's project screenshots                                                                   | Allowed when the project is the owner's and contains no third-party personal data or confidential content    | `ownership: owner-created` + `privacy_review: clear` |
| Screenshots showing third-party data (e.g. real user records, government data visualizations) | Allowed only if the data is public or synthetic and permitted                                                | Note in `media.csv`                                  |
| BuildLog episode videos                                                                       | Allowed only after the music/SFX licence covers website use (S-06)                                           | Licence note in `media.csv`                          |
| Fonts                                                                                         | Open licence (e.g. OFL) or purchased web licence. Never trial fonts (S-04).                                  | Licence file kept in `public/fonts/`                 |
| Organization logos (employers, institutions, issuers)                                         | Nominative use next to factual records is generally reasonable. No modification, and no implied endorsement. | Owner confirmation for each employer logo            |
| Certificates                                                                                  | Use the issuer's public credential link. Use images only if free of personal identifiers.                    | `privacy_review: clear`                              |
| Employer/internship material                                                                  | Never without explicit employer clearance                                                                    | `employerClearance: cleared`                         |
| Third-party icons/illustrations                                                               | Only with a compatible licence. Record attribution if required.                                              | Licence note                                         |

## 13. Privacy, analytics, contact, spam

- **Analytics:** none at launch (D-09). If approved later: cookieless, no fingerprinting, no personal data in events, IP anonymized or not stored, documented in a short privacy note, and the origin added to CSP `connect-src`/`script-src` explicitly.
- **Contact:** pen composer with mail-app/copy fallback (D-08). No delivery endpoint is configured. Do not log or persist message text; never claim sent from a mailto action. The public email address is the owner-approved one only. Obfuscation is optional (it does not stop determined scrapers).
- **If a form is approved later:** server-side validation, rate limiting, a privacy-respecting challenge, a honeypot field, no storage in static assets, credentials only in the host secret store, and a data-handling note.
- No third-party requests on the closed home scene (T-SEC-08). D-39 permits the live portfolio's requests after laptop opening, including an explicit direct `/laptop/` visit; the remote site's own network activity is outside the parent CSP's control.
- D-44's speaker audio is original and hosted at `/media/desk-theme.wav`; playback begins only after a user gesture. Demo planner text and checked states are stored only in the visitor's local storage. Contact text and email addresses entered by visitors are never stored by the site.
- The release scan in `scripts/check-dist.mjs` excludes a ten-digit sequence when it is immediately preceded by a decimal point. This prevents Three.js colour-conversion fractions from looking like phone numbers while retaining the check for actual standalone phone-number-like values.

## 14. Logging

Static hosting logs are host-managed. Do not add client-side logging of personal data. Never log secrets or full query strings carrying personal data.

## 15. Release-blocking conditions

A release (any deploy to the production host) is **blocked** if any of these is true. The release checklist in [implementation-and-validation.md](implementation-and-validation.md) §7 must show each as checked.

| ID    | Condition                                                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RB-01 | Any secret-scan finding in `portfolio2.0/` or `dist/` that is not a documented false positive                                                                  |
| RB-02 | Any shipped record or asset whose classification is not `public-approved` / `public-source-verified`                                                           |
| RB-03 | A personal phone number, home address, government/student ID, or signature in `dist/`                                                                          |
| RB-04 | Workplace content without `employerClearance: cleared`                                                                                                         |
| RB-05 | A media asset without an ownership/licence entry, or a trial or unlicensed font                                                                                |
| RB-06 | Source maps, `docs/`, `content/inventory/`, `tests/`, or local paths present in `dist/`                                                                        |
| RB-07 | An external URL with a disallowed scheme, or a new-tab link without `rel="noopener noreferrer"`                                                                |
| RB-08 | Production headers missing HSTS, CSP, `nosniff`, or `frame-ancestors`, verified on the deployed preview                                                        |
| RB-09 | A dependency audit "critical" or "high" advisory affecting shipped runtime code, untriaged                                                                     |
| RB-10 | Any third-party request at page load that was not approved                                                                                                     |
| RB-11 | A patent shown with a status that is not `verified-official`                                                                                                   |
| RB-12 | Any file derived from `placement/` in `dist/` other than the approved public résumé variant                                                                    |
| RB-13 | Age, date of birth, identity-document data, marks or CGPA (unless D-31 approves), compensation, signatures, or third-party contact details anywhere in `dist/` |
| RB-14 | An `<iframe>` in `dist/`, or a CSP `frame-src` other than `'none'`, without a documented decision                                                              |

## 16. Incident handling

If a credential or private document is found:

1. Stop it entering the output or build.
2. Do not copy the value anywhere.
3. Record the path and category only.
4. Notify the owner with a safe summary.
5. Recommend revocation or rotation if it may have been exposed (including in public Git history of the source repos).
6. If it reached `portfolio2.0/` Git history, rewriting history is the owner's decision. Report it; do not force-push.
7. Do not claim it is resolved until the relevant scan has been re-run clean.
