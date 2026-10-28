# The Shelf — Ayush Jain's Portfolio (portfolio2.0)

**The Shelf** is an Astro-based personal portfolio presented as a physical workspace. Instead of pages and a navbar, visitors explore an illustrated shelf: drawers open into folders, and folders open into detailed project, patent, experience, and credential records. Every record also has its own stable, crawlable URL. Desk objects behave physically: a laptop opens to the résumé and the original portfolio, a decorative lamp supplies permanent warm light (D-27), and a globe spins as a real sphere. The interface is monochrome; real project screenshots and video supply the colour.

**Current state (2026-10-28):** The Phase 3 Astro 7.4.2 application is implemented (D-33, D-36). The profile layout, contact entry point, responsive scene positioning, and desk-object placement have been refined. Publication decisions and factual verification gaps remain; see [phase-2-report.md](docs/reports/phase-2-report.md) and [docs/open-decisions.md](docs/open-decisions.md). Nothing is deployed, and deployment remains outside the current implementation scope.

**Run (Node 22 >=22.23.4 or Node 24 LTS):** `npm install`, then `npm run dev` for the loopback review preview at http://127.0.0.1:4321/ (shows `needs-owner-review` records with a review notice and noindex). `npm run build` is the release build: `scripts/release-gate.mjs` runs first and `scripts/check-dist.mjs` scans `dist/` afterwards; only ids in `src/data/release-allowlist.json` with approved visibility are rendered. The current release gate reports 135 approved allowlisted records. `node scripts/release-gate.mjs --selftest` proves review-only fixtures are rejected. After inventory changes, re-run `npm run export:content` to regenerate `src/data/records.json` (explicit public-field allowlist) and the review-only WebP derivatives in `assets/review/derived/`.

**Content state:** 39 project records (the 31 local projects plus eight preview-cleared extras), eight patent records and all other collections render in the loopback preview. The release allowlist currently contains 135 approved records; review-only records are still excluded from production output. Project media stays quarantined outside `public/`. Exact eight drawers follow D-34; loopback review versus publication follows D-35.

---

## What is implemented

The application is an HTML-first, statically rendered portfolio with progressive enhancement:

- The home route presents the illustrated cabinet and desk as the primary navigation surface.
- The left profile area contains the `THE SHELF` heading, Ayush Jain's concise introduction, four skill chips, the `Contact Me` link, and verified social links.
- The `Contact Me` link routes to the existing notebook/contact experience at `/contact/`; it does not pretend to send a message.
- The cabinet exposes exactly eight drawer categories. Drawer and record routes are stable, prerendered URLs and remain usable without client-side JavaScript.
- The laptop is a CSS 3D desk object. Its résumé and original-portfolio actions are handled by the existing laptop interaction.
- The mug, rocket, clock, speaker, lamp, globe, notebook, pen, cabinet, and other desk objects remain part of the existing scene. The former separate “Rotate workspace” control has been removed.
- Desktop scene coordinates are controlled by CSS custom properties in `src/styles/shelf.css`. The current desktop placement keeps the laptop near the foreground center and places the mug to its right without covering the clock, speaker, or rocket.
- Responsive layouts reinterpret the scene at smaller widths instead of exposing a conventional navigation bar or replacing the cabinet with a card grid.

### Rendering and content flow

Public content follows this one-way path:

1. Read-only source material is reviewed and classified.
2. Internal records in `content/inventory/` preserve provenance and visibility decisions.
3. `scripts/export_content.py` produces the public-field-only `src/data/records.json`.
4. `src/data/site.ts` applies the development preview and production release rules.
5. Astro prerenders the routes into `dist/`.
6. The release gate and distribution scan reject preview-only or disallowed records.

The loopback development server may show public-safe `needs-owner-review` records with a visible review notice and `noindex`. A production build rejects those records and renders only the approved release allowlist. Review media remains outside `public/` until it has the required approval.

## Important application files

| Area               | File or folder                                              | Responsibility                                                                         |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Page shell         | `src/pages/`                                                | Stable Astro routes and prerendered pages                                              |
| Scene composition  | `src/components/Scene.astro`                                | Profile panel, shelf scene composition, CTA, and social links                          |
| Desk objects       | `src/components/Desk.astro`                                 | Desk, laptop, mug, notebook, pen, rocket, clock, speaker, and related markup           |
| Laptop             | `src/components/Laptop.astro` and `src/styles/laptop.css`   | Accessible laptop controls and CSS 3D laptop geometry                                  |
| Cabinet and panels | `src/components/Shelf.astro`, `src/components/Panels.astro` | Shelf navigation, drawers, record surfaces, and contact notebook                       |
| Scene layout       | `src/styles/shelf.css`                                      | Tokens, responsive layout, object coordinates, drawers, profile panel, and CTA styling |
| Interaction state  | `src/scripts/shelf-controller.ts`                           | URL-derived state, drawer navigation, contact routing, focus handling, and history     |
| Content data       | `src/data/`                                                 | Schemas, exported records, social links, drawer data, and release allowlist            |
| Validation         | `scripts/`                                                  | Content export, release gate, link check, drawer check, and distribution scan          |
| Contracts          | `docs/`                                                     | Design, accessibility, responsive, content, security, and release requirements         |

## Local development

Use the supported system runtime: Node 22.23.4 or newer in the Node 22 line, or Node 24 LTS. The project currently uses Node 24.22.1 and Astro 7.4.2.

```powershell
npm install
npm run dev
```

Open [http://127.0.0.1:4321/](http://127.0.0.1:4321/). If that port is already in use, Astro selects the next available port and prints it in the terminal.

Useful commands:

| Command                  | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `npm run dev`            | Start the local loopback preview                              |
| `npm run build`          | Run the release gate, build the static site, and scan `dist/` |
| `npm run preview`        | Serve the built `dist/` output locally                        |
| `npm test`               | Run the release-gate self-test and Markdown/local-link check  |
| `npm run check:gate`     | Run the release gate without building                         |
| `npm run check:links`    | Check local Markdown links and referenced paths               |
| `npm run export:content` | Regenerate public-field-only content after inventory changes  |

Do not run source projects from `portfolio/`, `BuildLog/`, `placement/`, or `context/`. They are read-only source material, and `placement/` also contains restricted personal documents.

## Layout and responsive verification

The scene should be checked at both representative desktop and mobile sizes:

- Mobile: 320×568, 375×667, and 430×932
- Landscape: 667×375
- Desktop: 1024×768, 1280×720, 1440×900, and 1920×1080

The layout pass verified that these sizes have no horizontal overflow and retain the profile CTA, cabinet drawer navigation, laptop, and mug. When changing scene objects, update the owning CSS scene coordinates rather than applying an unrelated absolute-position workaround elsewhere.

## Git and release boundary

This folder is the writable application workspace, but a passing build does not mean the site is ready for public release. Before staging or pushing, review:

1. `git status --short` and the focused diff.
2. Any deletion of temporary or generated files to ensure it is intentional.
3. `npm test` and `npm run build`.
4. The browser preview at desktop and mobile sizes.
5. The release checklist in [docs/implementation-and-validation.md](docs/implementation-and-validation.md) and all blockers in [docs/security.md](docs/security.md) §15.
6. Open owner decisions, especially repository visibility, résumé approval, domain, contact mechanism, and publication policy.

Do not commit, push, deploy, or publish from an agent session unless the owner explicitly authorizes that Git or deployment operation. The current implementation is ready for owner review and staging after the intentional cleanup deletions have been reviewed; it is not pushed by this workspace.

## Design principles (summary)

The full contract is [docs/design.md](docs/design.md) (invariants in §0).

- A single-page shelf experience; the shelf **is** the navigation. No conventional navbar.
- Monochrome (warm ink on paper, per the concept board). Colour only from real media and a few natural objects.
- Physical believability: layered depth, contact shadows, one consistent light source, simulated motion where it matters ([docs/physics-and-interactions.md](docs/physics-and-interactions.md)).
- Truth first: no fabricated facts, no counters on the home scene, exact patent wording ("named inventor", "application published").
- Accessible and usable with animation reduced or disabled; every functional object works with a plain click or key.
- Responsive by reinterpretation, not by shrinking ([docs/responsive-design.md](docs/responsive-design.md)).

## Workspace layout (verified)

```text
drawer/                      ← workspace root
├── portfolio/               ← old Next.js portfolio: identity and content SOURCE (read-only)
├── BuildLog/                ← 31 project repos, 17 episode videos, screenshots, project plan: SOURCE (read-only)
├── placement/               ← résumés, credentials, internship letters, patent printouts: SOURCE (read-only, RESTRICTED)
├── context/                 ← original documentation baseline + original concept board (read-only)
└── portfolio2.0/            ← THIS FOLDER: the Astro site and its docs
    ├── README.md  AGENTS.md  CLAUDE.md  agent.md
    ├── src/                 ← Astro pages, components, styles, client scripts, gated data
    ├── scripts/             ← content export, release gate, output scan, link check
    ├── public/              ← favicon, globe texture, OG image, release-gated badges
    ├── docs/                ← specifications; reference/ (private boards), internal/ (private manuscripts), reports/ (phase history)
    ├── assets/              ← staging and quarantined review media (never served in release)
    └── content/inventory/   ← internal source-linked inventory and audit artifacts
```

Facts flow one way: **sources → `content/inventory/` (internal, verified, classified) → `scripts/export_content.py` → `src/data/records.json` (explicit public-field allowlist, schema-checked) → `src/data/site.ts` (D-35 gate: review records in loopback dev only; release renders ids in `release-allowlist.json` with approved visibility) → the site.**

## Documentation map

| Kind                | File                                                                                                                                                                                    | Defines                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Design**          | [docs/design.md](docs/design.md)                                                                                                                                                        | Visual contract: invariants, decision hierarchy, board reconciliation, drawer IA, objects, records     |
|                     | [docs/micro-interactions.md](docs/micro-interactions.md)                                                                                                                                | Interaction contract: tokens, state machine, focus, per-interaction table (§12)                        |
|                     | [docs/physics-and-interactions.md](docs/physics-and-interactions.md)                                                                                                                    | Simulated motion, lighting model, globe, laptop, lamp, cube, pen, drawers, physics architecture, tests |
|                     | [docs/responsive-design.md](docs/responsive-design.md)                                                                                                                                  | Layout modes, viewport matrix, scaling, responsive tests                                               |
| **Content**         | [docs/workspace-audit.md](docs/workspace-audit.md)                                                                                                                                      | What the sources contain: patents, résumés, credentials, profile links, conflicts, sensitive findings  |
|                     | [docs/contest.md](docs/contest.md)                                                                                                                                                      | Extraction and reconciliation brief (the filename is historical; it is not about a contest)            |
|                     | [docs/content-inventory-template.md](docs/content-inventory-template.md)                                                                                                                | Record schemas, verification and visibility classes                                                    |
| **Implementation**  | [docs/asset-organization.md](docs/asset-organization.md)                                                                                                                                | Astro structure, asset placement, schemas                                                              |
|                     | [docs/implementation-and-validation.md](docs/implementation-and-validation.md)                                                                                                          | Phase 3 plan (legacy 23 stages), test catalogue, release checklist                                     |
| **Discoverability** | [docs/seo-optimization.md](docs/seo-optimization.md)                                                                                                                                    | Search: canonical host, metadata, sitemap, structured data                                             |
|                     | [docs/ai-optimization.md](docs/ai-optimization.md)                                                                                                                                      | Entity identity, verified profiles, AI crawlers, answer engines                                        |
| **Safety**          | [docs/security.md](docs/security.md)                                                                                                                                                    | Security, privacy, résumé access, licensing, release blockers                                          |
| **Governance**      | [docs/open-decisions.md](docs/open-decisions.md)                                                                                                                                        | Owner decisions D-01 to D-31 and interim defaults                                                      |
|                     | [docs/documentation-quality.md](docs/documentation-quality.md)                                                                                                                          | Doc checks, requirements-to-tests and traceability matrices, drift control                             |
|                     | [docs/reports/](docs/reports/) (phase 1, 1.1 and 2 reports, validation, self-containment audit) · [docs/internal/](docs/internal/) (content manuscript, content review, asset manifest) | Phase records and private preparation material                                                         |
| **Agents**          | [AGENTS.md](AGENTS.md) · [CLAUDE.md](CLAUDE.md) · [agent.md](agent.md)                                                                                                                  | Coding-agent instructions (AGENTS.md is canonical)                                                     |

## Recommended reading order

1. This README
2. [docs/open-decisions.md](docs/open-decisions.md): what is not decided yet
3. [docs/design.md](docs/design.md), then [docs/micro-interactions.md](docs/micro-interactions.md), [docs/physics-and-interactions.md](docs/physics-and-interactions.md), [docs/responsive-design.md](docs/responsive-design.md)
4. [docs/workspace-audit.md](docs/workspace-audit.md), then [docs/contest.md](docs/contest.md) and [docs/content-inventory-template.md](docs/content-inventory-template.md)
5. [docs/asset-organization.md](docs/asset-organization.md)
6. [docs/seo-optimization.md](docs/seo-optimization.md), [docs/ai-optimization.md](docs/ai-optimization.md), [docs/security.md](docs/security.md)
7. [docs/implementation-and-validation.md](docs/implementation-and-validation.md), then [docs/documentation-quality.md](docs/documentation-quality.md)

Coding agents start at [AGENTS.md](AGENTS.md).

## Source-of-truth rules

- Source folders are never modified. `placement/` is restricted: identity, financial, academic, and signature documents are never opened or copied.
- No fact is published without provenance and a verification class ([docs/contest.md](docs/contest.md) §4).
- Conflicts are recorded ([docs/workspace-audit.md](docs/workspace-audit.md) §4) and resolved by the owner, never by guessing.
- The concept board defines the look, but its text is sample data.
- Each topic has one authoritative document ([docs/documentation-quality.md](docs/documentation-quality.md) §1, §4.1).

## Phase scope

| Phase | Scope                                                                                                               | Status                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1     | Documentation system                                                                                                | Complete                                                |
| 1.1   | Documentation audit and refinement (placement audit, physics, responsive, SEO, AI discoverability, agent readiness) | Complete                                                |
| 2     | Research, content, asset preparation, and specifications                                                            | See [phase-2-report.md](docs/reports/phase-2-report.md) |
| 3     | Application implementation, legacy Stages 4–21                                                                      | Authorized (D-33)                                       |
| 4     | Deployment and monitoring, legacy Stages 22–23                                                                      | Defined, but not authorized for execution               |

## Workflow

The owner’s new phase definitions supersede older stage labels (D-32). Read [content.md](docs/internal/content.md), [asset-manifest.md](docs/internal/asset-manifest.md), [content-review.md](docs/internal/content-review.md), and [docs/phase-3-handoff.md](docs/phase-3-handoff.md) before the retained stage checklist below. Stages 1–3 have preparation evidence; they are not blanket publication approvals.

1. **Documentation review.** The owner reviews the docs and resolves [open decisions](docs/open-decisions.md). The most urgent are:
   - D-16: repository visibility, before any `git init`.
   - D-02 and D-23: domain and original-portfolio host.
   - D-24: the public résumé variant.
   - D-25: Instagram URL.
   - D-03 and D-12: thin drawers and Currently Building content.
   - D-19 to D-22: the board-vs-text visual choices.
2. **Phase 3 implementation approval already recorded** in D-33.
3. **Stages 1–2:** content audit and verification ([docs/contest.md](docs/contest.md)). The owner reviews `content/inventory/owner-questions.md`; research has already been performed.
4. **Phase 3 / Stages 4–20:** build, stage by stage, each with acceptance criteria, tests, and rollback.
5. **Stage 21:** full testing; results reported as passed, failed, or not run.
6. **Phase 4 / Stage 22:** release, against the release checklist and security release blockers RB-01 to RB-14.
7. **Phase 4 / Stage 23:** monitoring (Search Console, Core Web Vitals, monthly AI-answer accuracy check, link and credential checks, patent status re-checks).

## Validation workflow (documentation)

Run before accepting any documentation change ([docs/documentation-quality.md](docs/documentation-quality.md) §2):

- formatting: `prettier --check "**/*.md"` (Prettier is installed)
- local links and anchors, ID consistency (decisions, tests, conflicts, release blockers), and source-path existence (a Node script; see the completion report)
- privacy pattern scan (DQ-15, DQ-21)
- a manual contradiction review of the hot spots in documentation-quality.md §6

## Privacy and publication requirements

- `docs/workspace-audit.md`, `docs/reference/`, and `content/inventory/` are **internal**. Keep them out of any public repository (D-16) and never ship them in the site.
- Never publish phone numbers, identity-document data, marks or CGPA (unless approved), compensation, signatures, third-party contacts, employer client names, or redemption codes.
- The résumé is published only as an owner-approved public variant (D-24).

## Review before any public deployment

- [ ] [docs/security.md](docs/security.md) §15: release blockers RB-01 to RB-14 all clear
- [ ] [docs/open-decisions.md](docs/open-decisions.md): D-02, D-03, D-05, D-07, D-08, D-10, D-16, D-23, D-24, D-30 decided
- [ ] `content/inventory/conflicts.md`: no unresolved conflict affects a published field
- [ ] [docs/design.md](docs/design.md) §18: design acceptance checklist
- [ ] [docs/seo-optimization.md](docs/seo-optimization.md) §16 and [docs/ai-optimization.md](docs/ai-optimization.md) §11
- [ ] [docs/implementation-and-validation.md](docs/implementation-and-validation.md) §7: release checklist

## Implementation status

Phase 3 is implemented (D-36). See **Run** above for commands. Review-only records appear only in loopback development; production release gates remain strict and render only the approved allowlist. All 67 uncleared project media files are outside public. No deployment or parent Git mutation was performed.
