# AGENTS.md — The Shelf

Canonical instructions for any coding agent working in `portfolio2.0/`. `CLAUDE.md` adds Claude Code specifics on top of this file. `agent.md` points here. If the three ever disagree, **this file wins**, and the disagreement is a documentation bug to fix.

Detailed rules live in `docs/`. This file summarizes them and links to them. It does not replace them.

## 0. Phase boundary (read first)

The owner authorized Phase 3 implementation on 2026-10-24 (D-33). The Astro application is now implemented (D-36); maintain it under the rules below. Deployment, public publication and Git mutations remain unauthorized.

- Phase 1–2 preparation is historical. Do not rerun completed discovery or destructive generators.
- Require a supported Node 22 >=22.23.4 or Node 24 LTS (system Node 24.22.1 verified 2026-10-24). Astro 7.4.2 is pinned in `package.json`. An optional, unused portable Node fallback remains in `.tools/node-v24.22.1-win-x64/`; never change system Node or PATH.
- Local loopback development previews may display public-safe `needs-owner-review` records with a visible review notice and noindex. Production builds/exports must reject unapproved records and preview mode (D-35); privacy exclusions apply in every mode.
- All 67 uncleared project media files are outside `public/`, under `assets/review/projects/`. Only reviewed public assets may enter the static public directory.
- Exact eight drawers and open desk book follow D-34 and `content/inventory/implementation-policy.json`. No Memories or ninth drawer.
- Avoid new Markdown files; extend the owning document. Historical reports live in `docs/reports/`, private preparation manuscripts in `docs/internal/`. Preserve unrelated instructions, sources and existing work.
- Never run git add, commit, push or deployment from the parent repository. Work only in portfolio2.0.

## 1. Project

**The Shelf** is the Astro-based personal portfolio of Ayush Jain. A single-page illustrated shelf is the navigation: drawers open into folders, and folders open into project, patent, experience, and other records. Desk objects are physical: a laptop that opens to the résumé and the original portfolio, a lamp that switches the scene's light, and a globe you can spin. Every record also has a stable, prerendered URL.

## 2. Non-negotiables

From [docs/design.md](docs/design.md) §0. Breaking one requires recorded owner approval in [docs/open-decisions.md](docs/open-decisions.md). Conflicts are resolved with the decision hierarchy in design.md §0.0: truth and safety, then accessibility, then the shelf concept, then physical believability, then responsiveness, then performance, then decoration.

1. The shelf is the information architecture. No conventional navbar, hamburger menu, side nav, or dock.
2. No counters ("30+ projects", "9 patents") on the home scene, in titles, meta, OG images, or structured data. An opened drawer's header may show a count computed from published records.
3. The cabinet stays recognizable in every state. Never replace it with a dashboard or card grid.
4. Warm-neutral monochrome UI, as on the concept board (D-22). Other colour comes only from real media (screenshots, video, the profile photo, real diagrams, cover art, organizations' own logos), the plants, the globe, the cube stickers, and the focus ring ([docs/design.md](docs/design.md) §3.2). Never recolour real media.
5. One primary surface (drawer, record, booklet, or laptop panel) open at a time.
6. All content is server-rendered HTML at stable URLs. It works without JavaScript.
7. No autoplay, no looping or continuous animation. Full keyboard, touch, and reduced-motion parity. Physics is an enhancement; every functional object works with a plain click, tap, or Enter/Space.
8. **Never fabricate** facts, links, dates, metrics, media, or statuses. Patent applications are never described as granted or "patented". Ayush is a "named inventor"; the applicant is ABES Engineering College.
9. Render exactly the eight required drawers. If a release category has no approved entries, its content surface explains that no public entries are available; never fabricate records. Omit empty optional book categories and record sections.
10. The latest approved reference ([docs/reference/refrance2.0.png](docs/reference/refrance2.0.png)) defines visual direction; the exact owner drawer labels and desk-book instruction in D-34 override its annotations. The original concept board supplies detailed component anatomy. **Its text is sample data. Never copy names, numbers, dates, or bullets from it.** Board-vs-text conflicts are settled in [docs/design.md](docs/design.md) §0.2.
11. Never display age, identity-document data, marks or CGPA (unless approved, D-31), compensation, signatures, or third-party contact details.

## 3. Workspace

Paths are relative to the workspace root `drawer/` (the parent of this folder).

| Directory       | Role                                                                                                                 | Agent permission                                                                                                                                                                                                                                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `portfolio/`    | Old portfolio: identity and content source                                                                           | **Read-only.** Never edit, move, rename, or delete.                                                                                                                                                                                                                                                                                                                        |
| `BuildLog/`     | Project repos, videos, screenshots, project plans (real content at `BuildLog/BuildLog/BuildLog/`)                    | **Read-only.** Never run its code. Its own AGENTS.md/CLAUDE.md govern the video pipeline only and do not apply here.                                                                                                                                                                                                                                                       |
| `placement/`    | Résumés, credentials, internship letters, patent printouts, achievements sheet, **identity and financial documents** | **Read-only and restricted.** Open only the files marked relevant in [docs/workspace-audit.md](docs/workspace-audit.md) §3.9. Never open identity, financial, academic-record, or signature files (S-13). Safe reviewed certificate assets are explicitly authorized for copying by D-33; other material remains restricted. A public résumé still requires D-24 approval. |
| `context/`      | Original documentation baseline and the original concept board                                                       | **Read-only.** Superseded by `portfolio2.0/docs/`. Kept for history.                                                                                                                                                                                                                                                                                                       |
| `portfolio2.0/` | The new site and its docs                                                                                            | Read/write, within §0 and the rules below                                                                                                                                                                                                                                                                                                                                  |

## 4. Read before working

1. [README.md](README.md): purpose, structure, workflow
2. [docs/open-decisions.md](docs/open-decisions.md): what is undecided, plus the default to use meanwhile
3. [docs/design.md](docs/design.md): visual contract
4. [docs/micro-interactions.md](docs/micro-interactions.md): interaction contract
5. [docs/physics-and-interactions.md](docs/physics-and-interactions.md): simulated motion and lighting
6. [docs/responsive-design.md](docs/responsive-design.md): layout modes and viewports
7. [docs/workspace-audit.md](docs/workspace-audit.md), [docs/contest.md](docs/contest.md), and [docs/content-inventory-template.md](docs/content-inventory-template.md): sources, extraction, and data
8. [docs/asset-organization.md](docs/asset-organization.md): where things go
9. [docs/seo-optimization.md](docs/seo-optimization.md), [docs/ai-optimization.md](docs/ai-optimization.md), [docs/security.md](docs/security.md)
10. [docs/implementation-and-validation.md](docs/implementation-and-validation.md): Phase 3 implementation stages, tests, release checklist
11. [docs/documentation-quality.md](docs/documentation-quality.md): doc gates, requirements and traceability matrices

At minimum, read the docs that own the area you are changing (see [docs/documentation-quality.md](docs/documentation-quality.md) §1).

## 5. Data and verification

- Production public content comes **only** from approved records in `content/inventory/` (classification: [docs/contest.md](docs/contest.md) §4). Release builds reject anything not `public-approved`/`public-source-verified`. Loopback dev preview may include public-safe `needs-owner-review` under D-35.
- Discovery expectations ("about 30 projects", "9 patents", "3 internships") are not facts. Found so far: 31 project candidates, 8 patent applications (5 with official evidence), 2 internships, one trainee-programme candidate plus leadership roles, 15 credential records represented by 20 source files ([docs/workspace-audit.md](docs/workspace-audit.md)).
- Known corrections: the old site has two wrong patent application numbers (C-18, C-19). Use the official ones.
- Conflicting sources: record both, ask the owner, and omit the field publicly until resolved.
- Never copy secrets, phone numbers, IDs, marks, compensation, or confidential employer details into any file under `portfolio2.0/`, including docs and inventory.
- Inspect source projects statically. Do not install their dependencies or run their scripts.

## 6. Architecture boundaries (Astro, Phase 3)

- Static output. Prerender every route.
- Content collections with strict schemas. Internal fields (provenance and similar) never exist in public schemas.
- One small UI controller (`src/scripts/shelf-controller.ts`) owns state, history, and focus. State is derived from the URL.
- Physics: a custom 1-DOF integrator and scheduler plus one raw-WebGL globe shader, lazy-loaded, and a small raw-WebGL mug-steam shader (D-43). No physics library, no 3D engine ([docs/physics-and-interactions.md](docs/physics-and-interactions.md) §5).
- CSS custom properties for every token. Motion uses `transform`/`opacity`.
- Images through `astro:assets`. Videos and documents under `public/media/`. The original portfolio is linked, never iframed.
- Verify Astro APIs against the installed version's documentation; do not rely on memory.
- File locations: [docs/asset-organization.md](docs/asset-organization.md).

## 7. Working rules

- **Inspect before editing.** Read the target files and the owning docs first. Never overwrite a file you have not read.
- **Smallest correct change.** No speculative features, no unrequested refactors, no new abstractions without a second use.
- **Dependencies:** none without owner approval. Never add a dependency for something CSS or a few lines of TypeScript can do. No 3D, physics, animation, state-management, or UI-kit libraries. Sole exception: GSAP core, owner-approved for scripted motion (D-43).
- **Design changes:** none without approval. If a requirement seems wrong, raise it; do not "improve" it silently.
- **Network access:** the Phase 2 request authorizes read-only public-source checks. Never upload local files. Deployment still requires release approval; environment-level sandbox prompts still apply.
- **Git:** do not commit, push, or rewrite history unless asked. Keep `content/inventory/`, `docs/workspace-audit.md`, and `docs/reference/` out of any public repo (D-16).
- **Docs travel with code:** if behaviour changes, update the owning doc in the same change.

## 8. Quality expectations

- Accessibility: WCAG 2.2 AA, keyboard-complete, focus management per [docs/micro-interactions.md](docs/micro-interactions.md) §4.
- SEO and AI discovery: truthful metadata; JSON-LD only for visible, verified content; no manipulative AI-directed text; internal docs never exposed.
- Security: release blockers RB-01 to RB-14 in [docs/security.md](docs/security.md) §15.
- Performance: budgets in [docs/design.md](docs/design.md) §17 and [docs/physics-and-interactions.md](docs/physics-and-interactions.md) §5–§6.
- Responsive: every layout mode in [docs/responsive-design.md](docs/responsive-design.md).

## 9. Testing

Run the tests for the area you touched (catalogue: [docs/implementation-and-validation.md](docs/implementation-and-validation.md) §6 and the linked T-PHY and T-RWD tables), plus `npm run build` (release gate, build, output scan), `npm test` (gate self-test, link check) and a browser check of `npm run dev`. Never claim a test passed unless you ran it and saw it pass. Distinguish _passed_, _failed_, and _not run_.

## 10. Reporting (required at the end of every task)

1. Files created or modified (paths)
2. What changed and why, with links to the requirements or decisions involved
3. Commands and tests run, and their results (including failures)
4. Tests not run, and why
5. Open questions and owner decisions needed
6. Any deviation from the docs, and why it was necessary
7. Confirmation of the phase boundary: what phase the work belongs to, and that no out-of-phase work was done
