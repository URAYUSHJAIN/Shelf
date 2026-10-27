# Implementation Plan, Acceptance Criteria & Test Catalogue

> **STAGE MAP — PHASES 2–4.** Under the owner’s 2026-10-24 prompt (D-32), Phase 2 covers research/content/asset preparation, Phase 3 covers implementation, and Phase 4 covers release and indexing. Stages 1–3 have preparation evidence in [../phase-2-report.md](reports/phase-2-report.md), with publication gates still open. Stages 4–21 are future Phase 3 work; Stages 22–23 are Phase 4. No application stage has run.

**Derived from:** `context/implementation-and-validation.md`. Phase 1 added test IDs with failure definitions, tooling recommendations, and the release checklist. **Phase 1.1** restructured the plan into 23 stages, each with dependencies, acceptance criteria, tests, rollback, and completion evidence, and added the physics, responsive, résumé, and credential work.

**Rules for every stage:**

- Inspect before editing. Read the owning docs ([documentation-quality.md](documentation-quality.md) §1) and the current code first.
- Build in small, verifiable steps. Each stage ends with its acceptance criteria checked and the evidence recorded in the PR description.
- Report honestly: list the tests run, their results, and the tests **not** run. "Done" means the acceptance criteria passed.
- Owner decisions block only the items listed. Where a decision is pending, use the default in [open-decisions.md](open-decisions.md).
- **Rollback** for every stage: for Phase 3/4, use a branch and one PR per implementation stage when Git work is authorized; revert the PR if acceptance fails after merge. Phase 2 does not initialize Git or make commits. Nothing is deployed to production before Stage 22.

---

## 1. Tooling (recommended; introduce with owner approval in Phase 3)

| Purpose                                                     | Recommended tool                                                     | Status in workspace                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| Framework                                                   | Astro (current stable at implementation)                             | Not installed                                      |
| Type checking                                               | `astro check` / TypeScript                                           | Not installed                                      |
| Unit tests (physics `step()` functions, content validators) | Vitest or Node's built-in test runner (`node --test`, no dependency) | Node 20.20.0 installed                             |
| End-to-end interaction tests                                | Playwright                                                           | Not installed                                      |
| Automated accessibility                                     | axe-core via `@axe-core/playwright`                                  | Not installed                                      |
| Lighthouse/perf                                             | Lighthouse CI or the Chrome Lighthouse CLI                           | Not installed                                      |
| Markdown lint                                               | markdownlint-cli2                                                    | Not installed                                      |
| Formatting                                                  | Prettier                                                             | **Installed (3.3.3, global)**                      |
| Secret scan                                                 | gitleaks                                                             | Not installed. Fallback: `scripts/scan-output.mjs` |
| PDF metadata and page-1 preview (résumé)                    | qpdf / pdftoppm (poppler) or an equivalent build step                | Not installed (Phase 1.1 found `pdftoppm` missing) |
| Link check                                                  | `scripts/check-links.mjs` (Node, no dependency)                      | Node installed                                     |
| Structured data                                             | Schema.org validator; Google Rich Results Test (manual, online)      | Online tools                                       |

Package manager: `npm` 11.9.0 and `pnpm` 10.18.0 are both installed. The owner picks one, and only one lockfile is committed.

---

## 2. Retained stage numbers (Phase 2 preparation, Phase 3 implementation, Phase 4 release)

Notation: **Dep** = dependencies · **Accept** = acceptance criteria · **Tests** = test IDs (§6 and the linked docs) · **Rollback** = what to undo or switch off if it fails · **Evidence** = what the PR must contain.

### Stage 1 — Source-content audit

- **Dep:** owner approval of Phase 2 preparation (D-32, already provided); D-16 decided (repository visibility) before `git init`.
- **Work:** execute [contest.md](contest.md) Phases A–I and F2. Produce every file in `content/inventory/`.
- **Accept:** every inventory file exists; every record has `confidence` and `visibility`; no count was forced; identity, financial, and academic files remain unopened (S-13).
- **Tests:** T-CNT-03 (provenance), DQ-15 (no PII in inventory).
- **Rollback:** the inventory is internal; delete and regenerate.
- **Evidence:** `extraction-report.md` with exact counts, commands run, and files opened.

### Stage 2 — Fact verification and publication review

- **Dep:** Stage 1; read-only public-source checks authorized by D-32.
- **Work:** check live URLs, repo visibility, social profiles (D-25), credential verify pages, and **current InPASS status** for all 8 applications (C-18 to C-21). The owner answers `owner-questions.md` and decides D-02, D-03, D-05, D-24, D-28 to D-31.
- **Accept:** every public-intended field is `verified-official`, `official-snapshot` re-checked live, or `owner-confirmed`; every conflict is resolved or its field omitted.
- **Tests:** T-CNT-02, T-CNT-05, T-AEO-02.
- **Rollback:** unverified fields stay omitted.
- **Evidence:** updated `conflicts.md` with resolution dates; dated status checks.

### Stage 3 — Asset organization

- **Dep:** Stage 2 (`media.csv` approved rows).
- **Work:** copy approved assets once into their destinations ([asset-organization.md](asset-organization.md) §2), with kebab-case names and EXIF stripped. Prepare or specify the illustration and lighting layers ([physics-and-interactions.md](physics-and-interactions.md) §3.2). Source the globe texture (public domain).
- **Accept:** every copied asset has ownership, licence, and privacy entries; no `placement/` file except the approved résumé variant.
- **Tests:** T-MED-04, T-SEC-09.
- **Rollback:** remove the copied files; the originals are untouched.
- **Evidence:** `media.csv` diff with `output_path` values.

### Stage 4 — Astro foundation

- **Dep:** Phase 3 implementation approval already recorded in D-33; use project-local Node 24.22.1.
- **Work:** initialize Astro in `portfolio2.0/`: static output, `site` from one constant (D-02), trailing-slash policy, `BaseLayout`, `ShelfLayout`, content collections with schemas, `scripts/validate-content.mjs`, test tooling.
- **Accept:** `astro build` succeeds with **test fixtures only**; the schemas reject internal fields; preview builds are `noindex`; source maps are off.
- **Tests:** T-CNT-01, T-SEO-09, T-SEC-04, T-PERF-01.
- **Rollback:** revert the PR (no content yet).
- **Evidence:** build log, lockfile, dependency list with the reasons for each.

### Stage 5 — Design tokens

- **Dep:** Stage 4; D-22 (paper warmth), D-19, D-20.
- **Work:** `tokens.css` (design.md §3) and `motion.css` (micro-interactions.md §2), sampled against the concept board; self-hosted licensed fonts.
- **Accept:** tokens defined once; contrast passes in both lamp states.
- **Tests:** T-DES-03, T-A11Y-03, T-DES-05.
- **Rollback:** token-file revert.
- **Evidence:** token table vs board samples; contrast report.

### Stage 6 — Shelf composition

- **Dep:** Stages 3 and 5.
- **Work:** static scene per [design.md](design.md) §2 and the board: identity column, crown, 8 drawer fronts as links, pinned area, desk objects (static), skip link, layout modes from [responsive-design.md](responsive-design.md) (static positions).
- **Accept:** the 10-second test passes; no navbar or home counters; every object is a labelled control or `aria-hidden`; board fidelity for the home panel.
- **Tests:** T-DES-01, T-DES-02, T-DES-07, T-A11Y-06, T-RWD-01.
- **Rollback:** revert the PR.
- **Evidence:** screenshots at 1280×720, 1440×900, 768×1024, 375×667 beside the board.

### Stage 7 — Drawer and folder mechanics

- **Dep:** Stage 6.
- **Work:** `shelf-controller.ts` (URL-derived state, history, focus, interruption), the CSS drawer path, the drawer body (KIN + SIM), trays and sheets, filter chips, search, folder → record, record tabs. Prototype with fixtures in the Projects drawer only.
- **Accept:** all interaction tests pass in Chromium and WebKit; the owner reviews the feel on a laptop and a phone.
- **Tests:** T-INT-01 to T-INT-11, T-PHY-04, T-PHY-12.
- **Rollback:** feature-flag the physics drawer body off; the CSS path remains.
- **Evidence:** Playwright report; a screen recording of the interactions.

### Stage 8 — Project integration

- **Dep:** Stages 2 and 7.
- **Work:** project collection entries, folders, records, media slots, related links, early-work handling (D-06).
- **Accept:** only approved projects; no "N/A"; deployment states evidenced.
- **Tests:** T-CNT-02, T-CNT-04, T-MED-01, T-MED-05.
- **Rollback:** unpublish entries (visibility gate).
- **Evidence:** list of published projects with their inventory ids.

### Stage 9 — Patent integration

- **Dep:** Stage 2 (live InPASS checks).
- **Work:** register, dossiers, "named inventor" wording, status with check date, official record links (D-30).
- **Accept:** every displayed status is `verified-official`; correct application numbers (C-18, C-19); no addresses.
- **Tests:** T-CNT-05, T-SEO-06, RB-11.
- **Rollback:** hide the Patents drawer (INV-15 path).
- **Evidence:** a table of each record vs the live InPASS check, with the date.

### Stage 10 — Internship, experience, and education content

- **Dep:** Stage 2 (C-23 to C-26, D-28, D-31).
- **Work:** Experience timeline and records; Education cards; Clubs & Leadership cards.
- **Accept:** types accurate; no client names without clearance (S-05, S-10); no marks unless approved.
- **Tests:** T-CNT-02, T-SEC-02.
- **Rollback:** unpublish entries.
- **Evidence:** owner sign-off on each experience entry.

### Stage 11 — Certifications (credentials) and achievements

- **Dep:** Stage 2 (credential URLs checked; D-29).
- **Work:** Achievements drawer for results/open source; separate Certifications drawer for course/training/credential sheets (D-34).
- **Accept:** each credential is labelled by its true kind; no unsafe images.
- **Tests:** T-CNT-06, T-SEC-02.
- **Rollback:** hide the Credentials chip.
- **Evidence:** credentials table with live-check dates.

### Stage 12 — Résumé access

- **Dep:** D-24 (approved public variant), Stage 3.
- **Work:** `resume.ts` data, page-1 preview generation, laptop panel résumé block, the PDF `noindex` header, the `/resume` redirect.
- **Accept:** the public variant passes every check in `resume.yaml`; the panel hides the résumé block when it is not approved.
- **Tests:** T-INT-12, T-SEC-02, T-SEC-09.
- **Rollback:** set `resume.approved: false` (the panel falls back to link-only).
- **Evidence:** a PDF metadata dump (no personal data), screenshots of the panel.

### Stage 13 — Original portfolio access

- **Dep:** D-23 (and D-02 for the archive host).
- **Work:** the laptop panel link (new tab); the optional screenshot tile; no iframe.
- **Accept:** the link resolves; no `<iframe>`; CSP `frame-src 'none'`.
- **Tests:** T-SEC-10, T-SEC-03.
- **Rollback:** the link points to the current live URL.
- **Evidence:** link-check output.

### Stage 14 — Social links and writing section

- **Dep:** Stage 2 (D-25), D-11.
- **Work:** pinned link cards, open desk book, verified writing entries and optional approved album category.
- **Accept:** only reviewed, source-associated profile URLs; `sameAs` uses the individually eligible subset in social.yaml; booklet keyboard and touch parity.
- **Tests:** T-AEO-02, T-SEC-03, T-INT-01.
- **Rollback:** remove an unverified card.
- **Evidence:** URL check log.

### Stage 15 — Physics and lighting

- **Dep:** Stages 3, 6, and 7.
- **Work:** scheduler, globe (WebGL + fallbacks), laptop hinge, lamp layers, pen, cube state model, leaves ([physics-and-interactions.md](physics-and-interactions.md)).
- **Accept:** all T-PHY tests pass; lazy modules ≤ 12 KB; idle loop stops.
- **Tests:** T-PHY-01 to T-PHY-16.
- **Rollback:** per-object feature flags. Reduced-physics mode is forced on. Functional objects keep their CSS paths.
- **Evidence:** unit-test report, bundle report, frame-time trace on a mid-range phone.

### Stage 16 — SEO and structured data

- **Dep:** Stages 8–14.
- **Work:** metadata builders, canonical, sitemap, robots (D-10), OG images, JSON-LD builders, generated `llms.txt`, 404, redirect config.
- **Accept:** see [seo-optimization.md](seo-optimization.md) §16.
- **Tests:** T-SEO-01 to T-SEO-09, T-AEO-01, T-AEO-04 to T-AEO-06.
- **Rollback:** revert metadata changes; preview stays `noindex`.
- **Evidence:** validator outputs, sitemap listing.

### Stage 17 — Responsive implementation

- **Dep:** Stages 6, 7, 15.
- **Work:** layout modes D, D+, T, M, L; scene scaling; per-mode positions ([responsive-design.md](responsive-design.md)).
- **Accept:** see responsive-design.md §8.
- **Tests:** T-RWD-01 to T-RWD-10.
- **Rollback:** fall back to mode M for affected widths.
- **Evidence:** screenshot grid for every viewport in responsive-design.md §2.

### Stage 18 — Accessibility

- **Dep:** Stages 6–17.
- **Accept:** WCAG 2.2 AA per design.md §13; a manual screen-reader pass recorded.
- **Tests:** T-A11Y-01 to T-A11Y-10, T-PHY-13, T-PHY-14.
- **Rollback:** block release (no partial rollback for accessibility).
- **Evidence:** axe report, a screen-reader log (tool, browser, flows, date).

### Stage 19 — Security review

- **Dep:** Stages 1–18.
- **Accept:** release blockers RB-01 to RB-14 clear ([security.md](security.md) §15).
- **Tests:** T-SEC-01 to T-SEC-10.
- **Rollback:** block release.
- **Evidence:** scan reports (paths and categories only).

### Stage 20 — Performance

- **Dep:** Stages 15–17.
- **Accept:** budgets in design.md §17 and physics §5.2; Core Web Vitals lab targets.
- **Tests:** T-PERF-01 to T-PERF-06, T-PHY-15, T-PHY-16.
- **Rollback:** disable toy physics; lazy-load more.
- **Evidence:** Lighthouse reports (mobile and desktop), bundle report.

### Stage 21 — Automated and manual testing

- **Dep:** Stages 1–20.
- **Accept:** every test in §6 and the linked docs is run, or listed as not run with a reason; the browser matrix (§5) is covered or gaps are listed.
- **Tests:** all, plus T-BRW-01.
- **Rollback:** fix and re-run.
- **Evidence:** a consolidated test report by ID (pass, fail, not run).

### Stage 22 — Production build and deployment

- **Dep:** Stage 21; D-02 and D-23 infrastructure ready; the owner approves the release.
- **Accept:** the deployed preview passes T-REL-01; production passes T-REL-02 and T-REL-03; the release checklist (§7) is complete.
- **Tests:** T-REL-01 to T-REL-04, T-SEO-07, T-SEC-06, T-AEO-03.
- **Rollback:** the host's instant rollback to the previous deployment; for D-02 (b), restore the old site at `www` and remove the redirects.
- **Evidence:** deploy IDs, header checks, `docs/launch-log.md`.

### Stage 23 — Post-launch monitoring

- **Work:** Search Console and Bing setup; sitemap submission; URL inspection; Core Web Vitals; monthly AEO accuracy check (T-AEO-07); monthly link and credential-URL checks; monthly dependency audit; **re-check patent status** quarterly (status can change).
- **Evidence:** entries in `docs/launch-log.md`.

---

## 3. Functional QA matrix (summary)

| Scenario                                  | Expected                                                    | Test               |
| ----------------------------------------- | ----------------------------------------------------------- | ------------------ |
| Load `/` directly                         | Shelf renders with useful HTML and no blank state           | T-SEO-01, T-DES-01 |
| Open each drawer (mouse, keyboard, touch) | Correct drawer; shelf context remains; focus to heading     | T-INT-01           |
| Open a folder                             | Correct record; URL updates                                 | T-INT-04           |
| Close a record                            | Back to the same drawer, filter, scroll, and focused folder | T-INT-04           |
| Escape                                    | Closes the topmost surface                                  | T-INT-01           |
| Back/Forward                              | Exact traversal of states                                   | T-INT-02           |
| Direct record URL plus refresh            | Same record, without prior interaction, without JS          | T-SEO-01, T-INT-06 |
| Search / filter / no results              | Correct results; live announcement; reset works             | T-INT-11           |
| Missing image or video                    | Area collapses; no broken icon                              | T-MED-03           |
| Play video                                | Only on intent; one at a time; released on close            | T-INT-07           |
| External and social links                 | Verified destination; new tab; safe `rel`                   | T-SEC-03           |
| Mobile tap-only use                       | Every flow works                                            | T-RWD-03           |
| Reduced motion                            | Nothing moves; everything works                             | T-INT-05           |
| JavaScript disabled                       | Everything reachable via links                              | T-INT-06           |

## 4. Responsive test sizes

Owned by [responsive-design.md](responsive-design.md) §2: the 11 representative viewports (320 × 568 to 2560 × 1440), mobile landscape, intermediate-width sweeps, orientation changes, and zoom at 200% and 400%.

## 5. Browser matrix

Current stable: Chrome (Windows), Edge (Windows), Firefox (Windows), Safari (macOS) and Safari (iOS) where a device is available, Chrome (Android). Playwright covers Chromium, Firefox, and WebKit engines. Real-device Safari and Android checks are manual. **Any browser not tested is listed as "not tested" in the report.**

---

## 6. Test catalogue

Each test states its method and what counts as **failure**. "Auto" = automatable in CI. "Manual" = a human records the result.

### 6.1 Design (T-DES)

| ID       | Test                                           | Method                                                                                                                                                                                                                                                                                                                                                      | Failure                                                                                 |
| -------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| T-DES-01 | 10-second test (design.md §1.1)                | Manual plus a Playwright screenshot at 1366×768 and 1280×720: wordmark and name, tagline (if approved), all drawer labels, and a contact affordance are inside the viewport                                                                                                                                                                                 | Any of those outside the initial viewport                                               |
| T-DES-02 | No navbar; counters only inside opened drawers | Auto: no `nav` element except the breadcrumb and an optional plinth index. A regex for a number followed by "projects", "builds", "patents", "records", "roles", or "internships" over the home page HTML, every `<title>`, meta description, OG tag, JSON-LD block, and `llms.txt` finds nothing. Tray-header counts equal the number of rendered records. | Any match outside a tray header, or a tray count that differs from the rendered records |
| T-DES-03 | Token discipline                               | Auto: grep component CSS for hex colours, `ms` durations, and `z-index` numbers outside `tokens.css`/`motion.css`                                                                                                                                                                                                                                           | Any occurrence                                                                          |
| T-DES-04 | No empty drawers                               | Auto: every rendered drawer has at least one record                                                                                                                                                                                                                                                                                                         | An empty drawer rendered                                                                |
| T-DES-05 | Colour discipline                              | Manual review: colour only from design.md §3.2 sources. Auto: no colour values in CSS other than the defined warm-neutral tokens, the focus colour, and `--folder-art` / status tokens per D-19/D-20.                                                                                                                                                       | Hue used for state or category outside D-19/D-20                                        |
| T-DES-06 | Cabinet persistence                            | Manual plus screenshots: cabinet visible in home, drawer, record, Writing booklet, mobile sheet, and 404                                                                                                                                                                                                                                                    | Any state where the cabinet is not recognizable                                         |
| T-DES-07 | Concept-board fidelity                         | Manual side-by-side: home, Projects drawer, project record, Patents drawer, patent record, Experience drawer, experience record, Writing booklet, and mobile list against [reference/the-shelf-concept-board.png](reference/the-shelf-concept-board.png), with design.md §0.2 resolutions applied                                                           | Unexplained deviation in composition, object set, or component anatomy                  |
| T-DES-08 | No board sample text shipped                   | Auto: search `dist/` for distinctive sample strings from the board (sample project names such as "EduAssist", "MarketLens", "DocMind"; "Company B"; "Company C"; "Arogya v2")                                                                                                                                                                               | Any match the owner has not confirmed as real content                                   |

### 6.2 Interaction (T-INT)

T-INT-01 to T-INT-10 and T-INT-12 are defined in [micro-interactions.md](micro-interactions.md) §11. Method: Playwright (auto) plus a manual feel review.

| ID       | Failure definition (supplements micro-interactions.md §11)                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-INT-01 | Wrong drawer opens, focus not moved to the heading, or focus not returned on close                                                                 |
| T-INT-02 | Any Back/Forward step lands on a state different from the URL                                                                                      |
| T-INT-03 | The final state is not the last-clicked drawer, or a surface is stuck mid-animation                                                                |
| T-INT-04 | Scroll offset differs by more than 4px, or focus is not on the originating folder                                                                  |
| T-INT-05 | Any computed transform changes during a transition with reduced motion emulated                                                                    |
| T-INT-06 | Any record unreachable with JS disabled                                                                                                            |
| T-INT-07 | Two videos play simultaneously, or `src` is retained after close                                                                                   |
| T-INT-08 | The cube is not solved after its sequence, re-activation starts a second sequence, or the globe exceeds its maximum ω or fails to come to rest     |
| T-INT-09 | `document.documentElement` keeps `overflow: hidden`, or `scrollY` changes after close                                                              |
| T-INT-10 | Any hover-revealed text is missing from the accessibility tree or not shown on focus or tap                                                        |
| T-INT-11 | Search/filter results do not match the data, the live region does not announce, or "Clear" does not restore the full list                          |
| T-INT-12 | Laptop panel focus not entering or returning, Back not closing the panel, an `<iframe>` present, or résumé controls shown while D-24 is unapproved |

### 6.3 Content (T-CNT)

| ID       | Test                                  | Method                                                                                                                                                                                                                    | Failure                          |
| -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| T-CNT-01 | Public schemas reject internal fields | Auto: fixture with `provenance` fails the build                                                                                                                                                                           | Build passes                     |
| T-CNT-02 | Visibility gate                       | Auto: every public entry maps to an inventory record with `public-approved`/`public-source-verified`                                                                                                                      | Any unmapped or non-public entry |
| T-CNT-03 | Every public fact has provenance      | Auto: inventory records backing public entries have at least one provenance entry per public field group                                                                                                                  | Missing provenance               |
| T-CNT-04 | Forbidden phrases                     | Auto: "patented", "patent holder", "granted" (unless status granted), "N/A", "TBD", "lorem", "coming soon", hard-coded counts in content                                                                                  | Any match                        |
| T-CNT-05 | Patent status integrity               | Auto: shown status requires `confidence: verified-official`; `granted` requires grant number and date                                                                                                                     | Violation                        |
| T-CNT-06 | Credential labelling                  | Auto: every credential has a `kind`; no individual item claimed as a professional certification unless `kind: professional-certification` with a verified issuer page; images rendered only when `imagePublishable: true` | Violation                        |

### 6.4 Media (T-MED)

| ID       | Test                                                      | Method                                                         | Failure                                                |
| -------- | --------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| T-MED-01 | Every referenced asset loads in the production build      | Auto: crawl `dist/`, check every `src`/`href` resolves         | Any 404                                                |
| T-MED-02 | No video data at page load                                | Auto: network log on each page load shows no `.mp4` request    | Any video request before activation                    |
| T-MED-03 | Missing-media behaviour                                   | Auto: fixture with a broken image or video path                | Broken icon visible, or layout shift greater than 0.01 |
| T-MED-04 | Every shipped asset has ownership/licence/privacy entries | Auto: cross-check `dist/` assets against `media.csv`           | Missing entry                                          |
| T-MED-05 | Image dimensions present                                  | Auto: every `<img>` has width and height (or aspect-ratio CSS) | Missing                                                |

### 6.5 SEO (T-SEO)

| ID       | Test                                             | Method                                                                                           | Failure                                   |
| -------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| T-SEO-01 | Direct URLs render content without JS            | Auto: fetch every route's HTML; assert record title and summary are present in the raw HTML      | Missing                                   |
| T-SEO-02 | Unique titles and descriptions                   | Auto over `dist/`                                                                                | Duplicate or missing on an indexable page |
| T-SEO-03 | Canonical correctness                            | Auto: absolute, self-referential, on the canonical host, trailing-slash policy                   | Violation                                 |
| T-SEO-04 | Sitemap correctness                              | Auto: every URL is indexable, canonical, and 200; no query URLs; `lastmod` is not the build time | Violation                                 |
| T-SEO-05 | robots.txt correctness                           | Auto: parses; references the sitemap; no rules for nonexistent paths; assets not blocked         | Violation                                 |
| T-SEO-06 | JSON-LD validity and visibility                  | Auto: parse plus a schema check; every string value appears in visible text. Manual: validators. | Error or invisible value                  |
| T-SEO-07 | Redirects, 404, host canonicalization (deployed) | Auto against the preview: expected codes per [seo-optimization.md](seo-optimization.md) §9       | Wrong code or chain longer than one hop   |
| T-SEO-08 | No thin or filtered pages indexable              | Auto: query URLs canonicalize; early-work records `noindex` or no page                           | Violation                                 |
| T-SEO-09 | Preview deployments `noindex`                    | Auto: non-production build output carries noindex                                                | Missing                                   |

### 6.6 AI discovery (T-AEO)

T-AEO-01 to T-AEO-07 are defined in [ai-optimization.md](ai-optimization.md) §11.

### 6.7 Accessibility (T-A11Y)

| ID        | Test                                                                                      | Method                                                                                       | Failure                                                      |
| --------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| T-A11Y-01 | Automated scan per route and state (home, each drawer, one record per type, mobile sheet) | axe-core                                                                                     | Any serious or critical violation                            |
| T-A11Y-02 | Keyboard-only completion of all core flows                                                | Manual plus Playwright keyboard script                                                       | Any flow impossible, or a focus trap outside the modal sheet |
| T-A11Y-03 | Contrast                                                                                  | Auto: computed token pairs; manual spot-check                                                | Below the design.md §3.2 thresholds                          |
| T-A11Y-04 | Focus visible and not obscured                                                            | Manual plus a screenshot per control type                                                    | Missing or hidden focus                                      |
| T-A11Y-05 | Alt text                                                                                  | Auto: meaningful images have non-empty alt; decorative images have `alt=""` or `aria-hidden` | Violation                                                    |
| T-A11Y-06 | Objects labeled or hidden                                                                 | Auto: every interactive object has an accessible name; decorative objects not focusable      | Violation                                                    |
| T-A11Y-07 | Screen-reader pass                                                                        | Manual (NVDA, VoiceOver where available)                                                     | Drawer state, record title, or results count not announced   |
| T-A11Y-08 | Target size                                                                               | Auto: interactive bounding boxes ≥ 24×24 (≥ 44×44 at coarse-pointer widths)                  | Violation                                                    |
| T-A11Y-09 | Zoom and reflow                                                                           | Manual: 200% zoom and 320px width keep all content usable without horizontal scroll          | Loss of content or function                                  |
| T-A11Y-10 | Forced colours                                                                            | Manual: Windows High Contrast                                                                | Invisible controls or focus                                  |

### 6.8 Security (T-SEC)

| ID       | Test                                  | Method                                                                                                                                                                                                                                                     | Failure                                |
| -------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| T-SEC-01 | Secret scan of the tree and `dist/`   | gitleaks or the fallback script                                                                                                                                                                                                                            | Any non-false-positive finding (RB-01) |
| T-SEC-02 | PII scan of `dist/`                   | Script: phone, ID patterns, unapproved emails                                                                                                                                                                                                              | Any match (RB-03)                      |
| T-SEC-03 | External link safety                  | Auto: schemes allowed; new-tab links have `noopener noreferrer`                                                                                                                                                                                            | Violation (RB-07)                      |
| T-SEC-04 | No source maps                        | Auto: no `*.map` in `dist/`; no `sourceMappingURL` comments                                                                                                                                                                                                | Present (RB-06)                        |
| T-SEC-05 | No internal files or paths in `dist/` | Auto: no docs, inventory, tests, `.env*`, or local path strings                                                                                                                                                                                            | Present (RB-06)                        |
| T-SEC-06 | Headers on the deployed preview       | Auto: fetch and assert the [security.md](security.md) §8 headers                                                                                                                                                                                           | Missing (RB-08)                        |
| T-SEC-07 | CSP has no violations                 | Playwright: console has zero CSP errors across all routes                                                                                                                                                                                                  | Any violation                          |
| T-SEC-08 | No third-party requests               | Playwright: every request on page load is same-origin                                                                                                                                                                                                      | Any unapproved origin (RB-10)          |
| T-SEC-09 | No placement material shipped         | Auto: hash every file in `dist/` and compare against hashes of every `placement/` file (computed locally, never uploaded); only the approved résumé variant may match a derived file. Text scan for identity-document patterns, marks, compensation terms. | Any match (RB-12, RB-13)               |
| T-SEC-10 | No embedded original portfolio        | Auto: no `<iframe>` in `dist/`; CSP `frame-src 'none'` on deployed responses                                                                                                                                                                               | Present (RB-14)                        |

### 6.9 Responsive (T-RWD)

T-RWD-01 to T-RWD-10 are defined in [responsive-design.md](responsive-design.md) §8. These replace the Phase 1 definitions.

### 6.10 Performance (T-PERF)

| ID        | Test                                                            | Target                                                                                          | Failure                                                            |
| --------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| T-PERF-01 | Production build succeeds                                       | —                                                                                               | Build error                                                        |
| T-PERF-02 | Lighthouse (mobile and desktop) on home, one drawer, one record | Performance ≥ 90, CLS ≤ 0.1, LCP ≤ 2.5 s (lab)                                                  | Below target, unless a documented and owner-accepted reason exists |
| T-PERF-03 | Shelf JS size                                                   | ≤ 30 KB compressed (design.md §17)                                                              | Over budget without a justification                                |
| T-PERF-04 | Image weight                                                    | Record hero ≤ 200 KB at 1280w; folder peek ≤ 40 KB                                              | Over budget                                                        |
| T-PERF-05 | Interaction smoothness                                          | DevTools trace on a mid-range phone: no long task > 50 ms during drawer open or folder → record | Long task present                                                  |
| T-PERF-06 | Field data (post-launch)                                        | CWV "good" at p75 once data exists                                                              | Reported, triaged                                                  |

### 6.12 Physics and lighting (T-PHY)

T-PHY-01 to T-PHY-16 are defined in [physics-and-interactions.md](physics-and-interactions.md) §8, including which are automated unit tests, automated end-to-end tests, and manual visual checks.

### 6.11 Browser and release (T-BRW, T-REL)

| ID       | Test                                                                                        | Failure                                                        |
| -------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| T-BRW-01 | Core flows in the §5 matrix                                                                 | Any failure in a tested browser. Untested browsers are listed. |
| T-REL-01 | Deployed preview passes T-SEO-07, T-SEC-06, T-AEO-03                                        | Any failure                                                    |
| T-REL-02 | Canonical host, HTTPS, and redirects on production after go-live                            | Any failure (roll back)                                        |
| T-REL-03 | Smoke test on production: home, each drawer, one record per type, video play, external link | Any failure                                                    |
| T-REL-04 | Documentation drift check ([documentation-quality.md](documentation-quality.md) §5)         | Unresolved drift                                               |

---

## 7. Release checklist

- [ ] Stage 1–21 acceptance criteria recorded with evidence
- [ ] Security release blockers RB-01 to RB-14 all clear ([security.md](security.md) §15)
- [ ] Owner sign-off: copy, photo (D-05), drawer set (D-03), domain (D-02), original-portfolio host (D-23), résumé variant (D-24), videos (D-07), contact (D-08), patent wording (D-30)
- [ ] Patent statuses re-checked live within 7 days of release
- [ ] Untested browsers and devices listed
- [ ] Rollback path known (previous deploy or host rollback)
- [ ] `docs/launch-log.md` created with the date, commit, and checks run

## 8. Final implementation report format

1. Delivered features. 2. File/folder structure. 3. Content totals with exact counts. 4. Items omitted and why. 5. Owner questions outstanding. 6. Commands run and results. 7. Test results by ID (pass / fail / not run). 8. SEO, security, accessibility, and performance results. 9. Risks and limitations. 10. Deployment steps and environment requirements. 11. What the owner must personally confirm before launch.

Never say "fast", "accessible", "secure", or "SEO optimized" without naming the tests behind the claim.

## Required Stage 4 release separation

D-44 local verification adds browser checks for: real browser-local clock time after load/visibility changes; lamp keyboard and light-state parity; audio play/pause after a trusted gesture and honest load failure; planner edit persistence; contact notebook route, page navigation, validation, preview, caret-linked pen and reset; 3D overview start/stop/return, reduced motion and WebGL failure fallback. The existing T-PHY, T-RWD, T-A11Y and release gates still apply. A successful static build is not a substitute for visual quality review or mobile-device testing.

Implement D-35 before content integration: review records only in a loopback development server, noindex and visible notice; every static/CI/release build rejects review mode and unapproved selected records/media. Keep quarantined assets outside public. Exercise both successful dev review and deliberately rejected release fixtures. Existing T-CNT-02 remains strict for release; no relaxation of privacy or patent truth rules.
