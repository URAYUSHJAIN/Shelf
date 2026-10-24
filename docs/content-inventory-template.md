# Content Inventory Template & Data Contract

**Derived from:** `context/content-inventory-template.md`. Phase 1 additions: the shared field block, the patent lifecycle model (application, publication, and grant kept distinct), project kind and deployment state, the media and social schemas, many-to-many video mapping, and open questions per record.

**Two layers:**

1. **Inventory** (`portfolio2.0/content/inventory/*.yaml`, `media.csv`) is internal. It holds provenance, confidence, visibility, and open questions. It is **never** imported by site code.
2. **Content collections** (`portfolio2.0/src/content/...`) are public. They are generated or hand-copied from approved inventory records **with internal fields removed**. Schemas: [asset-organization.md](asset-organization.md) §3.

The examples below use placeholders in CAPITALS or `null`. **They are not real records.** Every field must be sourced or left `null`/`unknown`.

---

## 1. Shared conventions

### 1.1 Shared fields (every record type)

```yaml
id: "proj-0001" # stable, never reused; prefix per type (proj, pat, exp, edu, skill, ach, art, soc, media)
slug: "stable-url-slug" # lowercase kebab-case; frozen after first public deploy
visibility: "needs-owner-review" # see 1.3
confidence: "source-documented" # record-level; see 1.2
indexable: true # false → no standalone page / excluded from sitemap
provenance: # internal only
  - source: "portfolio/src/data/resume.tsx" # workspace-relative path, URL, or "owner:YYYY-MM-DD"
    locator: "projects[0]" # line, key path, section heading, or timestamp
    fields: ["title", "summary"]
    confidence: "source-documented"
fieldConfidence: {} # optional per-field overrides, e.g. { liveUrl: "conflict" }
openQuestions: [] # e.g. ["Q-07: Is the live URL still active?"]
conflicts: [] # IDs from content/inventory/conflicts.md, e.g. ["C-05"]
ownerReviewRequired: true
lastReviewed: null # YYYY-MM-DD when the owner approved
```

### 1.2 Confidence values

| Value               | Meaning                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `verified-official` | Matches an authoritative public source (official registry, issuer credential page, live deployed site)                                  |
| `official-snapshot` | Matches an official record **as captured on a dated printout or screenshot** (e.g. InPASS printouts). Re-check live before publication. |
| `owner-confirmed`   | Explicitly confirmed by the owner (record the date in provenance)                                                                       |
| `source-documented` | Present in an owner-provided file but not independently checked                                                                         |
| `conflict`          | Sources disagree. Listed in `conflicts.md`.                                                                                             |
| `unknown`           | No evidence                                                                                                                             |

### 1.3 Visibility values

| Value                     | Ships?                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `public-approved`         | Yes                                                                                 |
| `public-source-verified`  | Only if the owner has signed off the category (e.g. "all project repos are public") |
| `needs-owner-review`      | No                                                                                  |
| `private-or-confidential` | Never                                                                               |
| `exclude`                 | Never (duplicate, placeholder, irrelevant)                                          |

**Build rule:** the content loader rejects any public collection entry whose source inventory record is not `public-approved` or `public-source-verified`. See [implementation-and-validation.md](implementation-and-validation.md) T-CNT-02.

### 1.4 Provenance rules

- Every public fact has at least one provenance entry.
- Local paths are workspace-relative and **never** rendered publicly.
- Never store secret values, phone numbers, government IDs, or private document text in the inventory (decision D-16 assumes the repo may become public).

---

## 2. Project

File: `content/inventory/projects.yaml` (a list).

```yaml
- id: "proj-0000"
  slug: "PROJECT-SLUG"
  title: "PROJECT TITLE AS SHOWN IN ITS OWN UI/README"
  aliases: [] # repo name, folder name, former names (C-10)
  summary: "One or two accurate sentences."
  kind: "original" # original | contribution | fork | course-work | hackathon | experiment | group-project | work-assignment
  deploymentState: "unknown" # live | prototype | archived | concept | unknown  (see 2.1)
  group: null # primary filter-chip group: ai | full-stack | web3 | healthcare | tools | early-work (owner-approved list)
  tags: [] # search terms, not filter chips
  featured: false
  featuredOrder: null
  startedAt: null # YYYY-MM or YYYY; only if sourced
  completedAt: null
  repo:
    url: null # e.g. from local `git remote` — record exactly
    visibility: "unknown" # public | private | unknown
  liveUrl:
    url: null
    lastCheckedAt: null # YYYY-MM-DD; null = never checked
    checkResult: null # ok | redirect | 404 | error | not-checked
  technologies: [] # each must be evidenced in source, not just package.json
  contribution: null # Ayush's personal contribution
  teamContext: null # solo | team of N | null
  problem: null
  features: []
  architecture: null
  outcomes: [] # sourced metrics only
  media:
    cover: null # media id
    screenshots: [] # media ids, max 6 shortlisted
    videos: [] # [{ media: "media-0012", startSeconds: null, sharedWith: ["proj-0003"] }]
  relatedArticles: [] # article ids
  relatedProjects: [] # explicit relations only
  relatedPatents: [] # only if owner-confirmed (D-17)
  buildlog:
    episode: null # e.g. "02"
    draft: null # path to output/drafts/NN-*.md
  seoTitle: null
  seoDescription: null
  # + shared fields (1.1)
```

### 2.1 Deployment state definitions

| Value       | Definition                                                                                            | Evidence required                                   |
| ----------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `live`      | A working public deployment is reachable now                                                          | `liveUrl.checkResult: ok` within 30 days of release |
| `prototype` | Built and demonstrable (video, screenshots, or runs locally), not publicly deployed or not maintained | Screenshots, video, or README run instructions      |
| `archived`  | Previously deployed or completed, now not maintained or offline                                       | Prior URL or owner statement                        |
| `concept`   | Design or idea stage only (e.g. patent-only)                                                          | Owner statement                                     |
| `unknown`   | Not established                                                                                       | —                                                   |

Never display "Live" unless the state is `live`. A dead `liveUrl` downgrades the state to `archived` and removes the link.

Rules: never fabricate dates or metrics; confirm names against the README or UI; slugs are stable after first indexing.

---

## 3. Patent

File: `content/inventory/patents.yaml`.

The model separates the three lifecycle stages. **An application, a publication, and a grant are different events with different identifiers.**

```yaml
- id: "pat-0000"
  slug: "PATENT-SLUG"
  title: "TITLE IN DISPLAY CASE"
  officialTitle: "EXACT OFFICIAL TITLE AS REGISTERED"
  jurisdiction: null # e.g. "IN" — only when verified
  office: null # issuing patent office name, when verified
  application:
    number: null # exact string, preserve all digits/prefixes
    filingDate: null # YYYY-MM-DD
    type: null # provisional | complete | null
  publication:
    published: null # true | false | null
    journalIssue: null # e.g. "14/2025": InPASS labels this field "Publication Number" (C-02 resolved); display with the official label
    publicationType: null # e.g. "INA", as shown on the official record
    publicationDate: null
  grant:
    granted: null # true only with official evidence
    patentNumber: null
    grantDate: null
  status: "unknown" # see 3.1
  statusAsOf: null # date the status was checked
  statusSource: null # "inpass-live" | "inpass-printout" | "owner-summary"
  fieldOfInvention: null # as officially listed
  ipcClasses: [] # as officially listed (optional)
  applicants: [] # as officially listed (e.g. the institution). The owner is NOT an applicant unless listed.
  inventors: [] # as officially listed, in official order; must include the owner to be published
  ownerRole: null # "named-inventor" | "applicant" | "inventor-and-applicant"; drives public wording (D-30)
  abstract: null # official abstract text or owner-approved plain-language summary
  officialRecordUrl: null
  documentUrl: null # public document only
  relatedProjects: [] # owner-confirmed only (D-17)
  # + shared fields (1.1)
```

### 3.1 Status vocabulary

| Value                                 | Public label                    | Requires                                                       |
| ------------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| `application-filed`                   | Application filed               | Application number plus filing evidence                        |
| `application-published`               | Application published           | Official publication record                                    |
| `under-examination`                   | Under examination               | Official status                                                |
| `granted`                             | Granted                         | Official grant record, `grant.patentNumber`, `grant.grantDate` |
| `refused` / `withdrawn` / `abandoned` | Refused / Withdrawn / Abandoned | Official status                                                |
| `unknown`                             | _(not shown)_                   | —                                                              |

Rules:

- Never display "patented", "patent holder", or "granted" unless `status: granted` and `confidence: verified-official`.
- Preserve exact number formatting.
- Never infer dates from filenames, and never infer publication from a journal-issue string alone.
- Do not publish nonpublic applications or documents.
- The owner must appear in `inventors` or `applicants` per the official record.
- Public wording follows `ownerRole`: "Named inventor" (never "patent holder" or "owner" unless `applicant`).
- Co-inventor names come only from the official record and are shown only if D-30 allows. Inventor and applicant **addresses are never copied**.

---

## 4. Experience (internships, employment, leadership)

File: `content/inventory/experience.yaml`.

```yaml
- id: "exp-0000"
  slug: "ORG-ROLE-SLUG"
  organization: "ORGANIZATION DISPLAY NAME"
  organizationLegalName: null # e.g. parent company, only if public
  organizationUrl: null
  role: "ROLE TITLE"
  type: "internship" # internship | employment | trainee-programme | freelance | volunteer | leadership | organizer | mentor | other
  programme: null # e.g. "12-month trainee programme" (public-safe description only; D-28)
  current: false
  startDate: null # YYYY-MM
  endDate: null # YYYY-MM | null if current
  location: null # public-safe city/remote only
  workMode: null # on-site | remote | hybrid
  summary: null
  responsibilities: []
  systems: [] # systems/features contributed to (public-safe)
  technologies: []
  outcomes: [] # verified only
  confidentialNotes: null # INTERNAL: why parts are withheld (no confidential content itself)
  employerClearance: "unknown" # cleared | not-cleared | unknown
  logo: null # media id; third-party logo usage noted in media record
  # + shared fields (1.1)
```

Rules: `type` must be accurate. Leadership never appears as employment. Client names, internal systems, and proprietary screenshots require `employerClearance: cleared`.

## 5. Education

```yaml
- id: "edu-0000"
  institution: "OFFICIAL INSTITUTION NAME"
  affiliation: null # e.g. affiliating university, if verified
  program: null # e.g. degree
  discipline: null
  startYear: null
  endYear: null # expected or actual — say which:
  endYearKind: null # expected | completed | null
  status: null # enrolled | completed | null
  institutionUrl: null
  # + shared fields (1.1)
```

Do not infer graduation from a timeline.

## 6. Skill

```yaml
- id: "skill-0000"
  name: "SKILL NAME"
  category: "frontend" # language | frontend | backend | database | ai-ml | blockchain | cloud-devops | tools | fundamentals
  evidence: [] # record ids: ["proj-0004", "exp-0001"] — at least one for public display
  # + shared fields (1.1) — confidence derived from evidence
```

No proficiency percentages, bars, or ratings. A skill with no evidence records is `needs-owner-review`.

## 7. Achievement / certificate / recognition

```yaml
- id: "ach-0000"
  slug: "SLUG"
  kind: "award" # award | hackathon-result | badge | speaker | publication | other  (course credentials use §7a)
  teamContext: null # "individual" | "team of N"
  title: "EXACT TITLE"
  issuer: null
  event: null
  date: null # YYYY-MM
  result: null # winner | finalist | top-N | participant | organizer | speaker | nominee | completed
  credentialUrl: null
  credentialId: null # only if it matches the issuer's record (C-08)
  urlCheck: { lastCheckedAt: null, checkResult: null }
  image: null # media id; reject images with personal data
  # + shared fields (1.1)
```

Never inflate a result.

### 7a. Credential (course certificate, training badge, participation)

File: `content/inventory/credentials.yaml`. Rendered in the Achievements drawer's "Credentials" chip (design.md §5.1.2).

```yaml
- id: "cred-0000"
  slug: "SLUG"
  title: "EXACT TITLE AS PRINTED"
  issuer: null # organization that authorizes the course (e.g. a university)
  platform: null # delivery platform (e.g. Coursera, Credly, Skilljar, Holopin)
  kind: "course-certificate" # course-certificate | training-badge | statement-of-achievement | participation | badge | professional-certification
  issueDate: null # YYYY-MM-DD (normalized)
  issueDateAsPrinted: null # e.g. "04/01/2026" (keeps the original format)
  expiryDate: null
  hours: null # only if printed
  verifyUrl: null # issuer verification page; checked live before publication
  urlCheck: { lastCheckedAt: null, checkResult: null }
  relatedSkills: [] # skill ids
  sourceFile: null # workspace-relative path (internal)
  imagePublishable: false # false if the image shows email, codes, QR to personal data, etc.
  # + shared fields (1.1)
```

Rules: `professional-certification` is used only for exam-based certifications with issuer verification. None were found in Phase 1.1. Never show the source image when `imagePublishable: false`.

## 8. Club & leadership

Leadership roles are stored in `experience.yaml` with `type: leadership | organizer | volunteer`. Additional optional fields: `activities: []`, `communitySize: null` (with provenance, or omit), `eventPhotos: []` (approved media ids).

## 9. Article / writing

```yaml
- id: "art-0000"
  slug: "SLUG"
  title: "EXACT TITLE"
  type: "article" # article | note | idea | build-log
  category: null # writing category = book spine (articles | notes | ideas | builds), only if content exists
  platform: "medium" # medium | self | other
  canonicalUrl: null # the original location
  republished: false # true only if full text is on The Shelf with permission (D-11)
  publishedAt: null # YYYY-MM-DD from the article itself
  updatedAt: null
  summary: null # original 1–2 sentence summary written for The Shelf
  tags: []
  coverImage: null # media id
  author: "Ayush Jain"
  # + shared fields (1.1)
```

## 10. Social profile

```yaml
- id: "soc-0000"
  platform: "github" # github | linkedin | x | medium | npm | other
  url: null # exact canonical URL, consistent casing (C-06)
  handle: null
  ownershipEvidence: null # e.g. "linked from owner's verified profile", "owner-confirmed"
  useInSameAs: false # true only for verified, owner-controlled, active profiles
  showOnShelf: false
  # + shared fields (1.1)
```

Never infer a URL from a username. Placeholder URLs (C-15) are `visibility: exclude` until confirmed.

## 11. Media asset

File: `content/inventory/media.csv`.

```text
media_id,type,source_path,original_filename,bytes,width,height,duration_s,related_records,role,ownership,license_note,privacy_review,contains_audio_third_party,processing,output_path,status,notes
```

| Column                       | Values / notes                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `type`                       | `screenshot`, `video`, `poster`, `photo`, `logo`, `certificate-image`, `document`, `diagram`, `illustration` |
| `related_records`            | Semicolon-separated record ids. A video may relate to many projects.                                         |
| `role`                       | `cover`, `screenshot`, `demo-video`, `episode-video`, `profile`, `logo`, `proof`                             |
| `ownership`                  | `owner-created`, `third-party-logo`, `third-party-media`, `unknown`                                          |
| `privacy_review`             | `pending`, `clear`, `contains-personal-data`, `contains-confidential`                                        |
| `contains_audio_third_party` | `yes`, `no`, `unknown` (music/SFX licensing, S-06)                                                           |
| `processing`                 | e.g. `webp+avif 640/1280`, `poster@1s`, `strip-exif`                                                         |
| `status`                     | `candidate`, `shortlisted`, `approved`, `rejected`                                                           |

No secret values or private document contents.

## 12. "Currently Building" note

File: `src/data/currently-building.ts` (public, approved content only).

```ts
export const currentlyBuilding: {
  title: string;
  line: string;
  projectSlug?: string;
  lastUpdated?: string; // YYYY-MM-DD, real only
} | null = null; // null → note hidden (D-12 default)
```

## 13. Work with me (services)

```yaml
services:
  - id: "svc-0000"
    title: "SERVICE TITLE (owner-approved)"
    description: null
    evidence: [] # project/experience ids proving the capability
availability: null # owner-approved text
contact:
  method: "mailto" # D-08
  value: null # owner-confirmed public address
```

A service with no evidence is not shown. No testimonials unless real and permitted.

## 14. Inventory report tables

For each category, `extraction-report.md` includes: candidates found · duplicates · verified · source-documented · conflict · unknown · excluded/private · missing assets/links. Report the exact discovered counts. Do not force results to match the owner's expectations.

## 15. Résumé record

File: `content/inventory/resume.yaml`. Drives the laptop panel ([physics-and-interactions.md](physics-and-interactions.md) §4.3).

```yaml
resume:
  approved: false # true only after owner approval (D-24)
  sourceCandidates: [] # [{ path, sha256, fileDate, contentSummary }] (internal)
  publicFile: null # e.g. "/media/documents/ayush-jain-resume.pdf" once the public variant exists
  publicVariantChecks: # all must be true before approved: true
    noPhoneNumber: false
    noEmployerClientNames: false
    patentNumbersVerified: false
    internshipFactsReconciled: false
  updatedAt: null # real date of the approved version
  bytes: null
  previewImage: null # page-1 image generated at build
originalPortfolio:
  url: null # D-23 (single constant)
  previewImage: null # optional owner-approved screenshot
```

## 16. Concrete Phase 2 preparation contract

The populated internal files use YAML lists, including `resume.yaml`. Stable IDs, confidence, visibility, provenance, field confidence, conflicts, questions, and review dates retain §1 meanings. Additional editorial fields include `body`, `reviewNotes`, `sourceReview`, `researchedAt`, and per-field reachability checks. `indexable` is proposed page eligibility, never release approval. All currently drafted records still require publication review.

The résumé list entry uses `status`, `publicFile`, `preview`, `candidates`, and `originalPortfolioUrl`; Phase 3 maps the approved entry into the public laptop data shape above. No file is approved merely because a candidate exists. The media CSV adds SHA-256, format, validation, public-use decision, output path, associations, alt text for selected files, and notes. Its broad type is `image`, `video`, or `document`; screenshot/photo/production-art roles are distinguished by source path and public-use decision. The derivative ledger records each generated file separately, with method, source hash, destination hash, size, and dimensions.

`reachable-unexercised` means an HTTP landing response succeeded without exercising a feature. It does not set deploymentState to live. `blocked` distinguishes access controls/rate limits from missing content. No unknown or conflicted field is projected into the public collection. See [phase-3-handoff.md](phase-3-handoff.md) for the explicit export allowlist and private-field exclusions.
