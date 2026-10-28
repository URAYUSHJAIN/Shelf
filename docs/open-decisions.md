# Open Decisions — Owner Approval Required

These decisions are **not** made by the documentation. Each entry states the question, the options, a recommendation, and the default an implementing agent must follow **until the owner decides**. The default is always the conservative choice and never invents content.

When the owner decides, update the entry's **Status** to `decided (YYYY-MM-DD): <choice>`. Then update every document listed under **Affects** in the same change.

| ID   | Decision                                                             | Status                                                                                       |
| ---- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| D-01 | Approved shelf reference image                                       | resolved 2026-10-24: concept board found in `context/`                                       |
| D-02 | Domain and canonical host                                            | open                                                                                         |
| D-03 | Final drawer set (thin drawers)                                      | open (board set is the default)                                                              |
| D-04 | Writing entry object                                                 | proposed resolution from board — confirm                                                     |
| D-05 | Approved profile photo                                               | open                                                                                         |
| D-06 | Project curation (all vs reviewed subset; early work)                | open                                                                                         |
| D-07 | Video hosting and music licensing                                    | open                                                                                         |
| D-08 | Contact mechanism                                                    | open                                                                                         |
| D-09 | Analytics                                                            | open                                                                                         |
| D-10 | AI crawler policy                                                    | open                                                                                         |
| D-11 | Writing: republish or link out                                       | open                                                                                         |
| D-12 | "Currently Building" note content                                    | open                                                                                         |
| D-13 | Freelance services surface                                           | open                                                                                         |
| D-14 | Plinth index (crawlable plain-link index)                            | open                                                                                         |
| D-15 | Location disclosure                                                  | open                                                                                         |
| D-16 | Repository visibility for `portfolio2.0/` docs and inventory         | open                                                                                         |
| D-17 | Patent-to-project cross-links                                        | open                                                                                         |
| D-18 | View-transition API for drawer → record pages                        | open                                                                                         |
| D-19 | Folder pictogram colour (board tint vs monochrome)                   | open                                                                                         |
| D-20 | Status badge colour (board tints vs monochrome)                      | open                                                                                         |
| D-21 | Home tagline and focus chips                                         | open                                                                                         |
| D-22 | Paper warmth: board's warm cream vs "primarily black-and-white"      | open                                                                                         |
| D-23 | Where the original portfolio lives after launch (laptop link target) | open                                                                                         |
| D-24 | Public résumé variant                                                | open — blocks the laptop's résumé items                                                      |
| D-25 | Instagram (and other unverified) profile URLs                        | open                                                                                         |
| D-26 | Rubik's cube manipulation level                                      | open (Level 1 default)                                                                       |
| D-27 | Lamp default state and persistence                                   | decided 2026-10-25: always lit, no switch                                                    |
| D-28 | DistrictD public role label and type                                 | open                                                                                         |
| D-29 | Which credentials to show                                            | open                                                                                         |
| D-30 | Patent wording and co-inventor display                               | open                                                                                         |
| D-31 | Academic results (CGPA) publication                                  | open (not published)                                                                         |
| D-32 | Owner-authorized phase redefinition                                  | decided 2026-10-24: preparation in Phase 2, implementation in Phase 3, deployment in Phase 4 |
| D-38 | Physical materials and permanent decorative lighting                 | decided 2026-10-25: owner-authorized realism pass; laptop preserved |
| D-39 | Live portfolio inside the laptop screen                              | decided 2026-10-25: interactive, scrollable iframe approved |
| D-40 | Desk speaker replaces three decorations                             | decided 2026-10-25: original SVG inspired by a view-only Editorial model |
| D-41 | Left desk plant reference and placement                              | decided 2026-10-25: adapt CodePen's stem and leaf silhouette, move plant left |
| D-43 | GSAP animation library and fitted viewport                           | decided 2026-10-25: GSAP drives all scripted motion; desktop never scrolls, no visible scrollbars |

---

### D-01 Approved shelf reference image

- **Status:** resolved 2026-10-24. The concept board appeared at `context/The Shelf_ A Personal Portfolio Archive.png` during Phase 1 (see [workspace-audit.md](workspace-audit.md) §2.1, L-01). A working copy is at [reference/the-shelf-concept-board.png](reference/the-shelf-concept-board.png).
- **Consequence:** [design.md](design.md) §0.1–§0.2 reconcile the board with the text contract. Conflicts that need the owner are D-03, D-04, D-13, D-19, D-20, and D-21.
- **Owner check:** confirm this board is the final approved reference. If later boards supersede it, add them to `docs/reference/` and update design.md §0.

### D-02 Domain and canonical host

- **Question:** Does The Shelf live at `shelf.urayushjain.tech` beside the existing `www.urayushjain.tech`, or does it replace the main portfolio at `www.urayushjain.tech`?
- **Phase 1.1 change:** the brief requires the laptop to open the **original portfolio**, so the old site must stay reachable somewhere (C-28, D-23).
- **Options:**
  - **(a) Side by side.** The Shelf at `shelf.urayushjain.tech`; the original stays at `www`. Both stay indexable. The original keeps its summary pages; The Shelf owns detail records. Each self-canonicalizes, and they cross-link.
  - **(b) Replace and archive.** The Shelf becomes `www`. The original moves to an archive host such as `classic.urayushjain.tech`, sent with `X-Robots-Tag: noindex`. Old `www` routes 301 to Shelf equivalents. The laptop links to the archive.
  - **(c) Subdomain now, migrate later.**
- **Recommendation:** (b). One canonical identity host concentrates signals, avoids two indexable sites describing the same records, and still keeps the original reachable through the laptop. It needs the old site redeployed to the archive host (owner infrastructure, Phase 4). If (a) is chosen, the old site's patent numbers must be corrected first (C-18, C-19), because two sites disagreeing on facts harms trust.
- **Default until decided:** Configure `site` from a single environment-independent constant. Emit `noindex` on all non-production deploys. Do not publish to either host.
- **Affects:** seo-optimization.md, ai-optimization.md, security.md, implementation-and-validation.md.

### D-03 Final drawer set

Resolved by the owner’s exact instruction (D-34): About Me · Projects · Patents · Experience · Education · Achievements · Skills & Toolbox · Certifications. The open book on the desk handles writing, notes, articles and approved photo albums. No Memories drawer or ninth drawer. Leadership is an Experience section. Certifications contains honestly labelled courses, training and badges, not an assertion that all items are professional certifications.

### D-04 Writing entry object

- **Question:** The Phase 1 brief names a booklet-style writing element. The original text named the globe/books area. Which object opens Writing?
- **Proposed resolution (from the concept board):** the **crown book spines** open Writing, one spine per category with content. The Writing view itself is the **open booklet** "My Writings" (design.md §9). The globe spins and never navigates, so one control never does two unrelated things.
- **Default until confirmed:** as proposed. Social profiles live on the pinned link cards (design.md §4.4, BR-15).
- **Affects:** design.md §4.4, micro-interactions.md §8.

### D-05 Approved profile photo

- **Question:** Which of `portfolio/public/ayu.webp`, `ayu.jpg`, `ayush.jpg` (or a new photo) goes in the identity frame?
- **Default until decided:** `ayu.webp` (the current live avatar), marked `needs-owner-review`. Never generate or alter a portrait.

### D-06 Project curation

- **Question:** Do all 31 discovered projects appear? Do beginner exercises (e.g. a CSS exercise and a college HTML/CSS assignment, per `MASTER-PROJECT-PLAN.md` Part 7 rationale) appear?
- **Recommendation:** Every public-approved project gets a folder. Folders are grouped by filter chips and ordered by featured rank (see design.md §6.2). Beginner exercises go last, behind an "Early work" chip, with short records and no standalone indexable pages.
- **Default until decided:** Publish only projects marked `public-approved` in the inventory. Early-work records get `indexable: false`.

### D-07 Video hosting and music licensing

- **Question:** Self-host the 17 episode MP4s (about 61 MB total), host them on a video platform, or link to the X posts? Does the music/SFX licence permit website use (S-06)?
- **Recommendation:** Self-host optimized copies from `public/media/video/` with posters, `preload="none"`, and on-demand players, **after** the licence is confirmed. If the licence is unclear, render silent or re-scored versions, or link out.
- **Default until decided:** Poster image plus "Video coming soon" is **not** allowed (it is a placeholder claim). Instead, omit the video block entirely.

### D-08 Contact mechanism

- **Current baseline:** functional pen opens a message composer with “Open email app” and “Copy message”; a static contact page provides the public email when enhancement fails. Opening an email app never implies sent.
- **Delivered-message option:** requires a real approved service/backend, server validation and spam controls, and a verified receipt. No endpoint, account or secret is configured in this phase.
- **Implementation:** use the precise limits, focus, error and no-storage contract in phase-3-handoff.md. Provider selection blocks Send, not the fallback or Phase 3 shell.

### D-09 Analytics

- **Recommendation:** None at launch, or a cookieless, privacy-respecting tool if the owner wants traffic data.
- **Default until decided:** No analytics script, no third-party requests.

### D-10 AI crawler policy

- **Question:** The old site allows every AI crawler, including training crawlers. Keep that, or allow search/answer crawlers while blocking training-only crawlers?
- **Recommendation:** Allow search and user-triggered fetchers (they drive discovery and attribution). Training crawlers are the owner's choice, since allowing them has no proven ranking effect.
- **Default until decided:** Mirror the old site's permissive policy, so behaviour does not change silently. Re-verify user-agent tokens against current provider documentation at implementation time.
- **Affects:** ai-optimization.md §6, seo-optimization.md §6.

### D-11 Writing: republish or link out

- **Recommendation:** Link out to the canonical Medium articles from Writing cards with an original 1–2 sentence summary. Do not create `/writing/<slug>/` pages unless the owner republishes the full article. A republished article must set its canonical URL to the original.
- **Default until decided:** Link out only.

### D-12 "Currently Building" note

- **Question:** What real items go in the pinned note and the Currently Building drawer? (The board's checklist items are samples.)
- **Default until decided:** Note and drawer hidden. No text is invented. See design.md §4.4 and §9.

### D-13 Freelance services surface

- **Question:** Where does the "work with me" / services content live without a navbar?
- **Context:** the concept board has no contact or services surface (design.md §0.2, BR-16).
- **Recommendation:** A **business-card holder** on the desk surface, drawn in the board's style, opens a "Work with me" record: services grounded in evidenced projects, availability, and contact. The identity frame's About record links to it.
- **Default until decided:** About record includes contact links only. No services list until the owner approves the copy.

### D-14 Plinth index

- **Question:** May the cabinet base (plinth) carry a small, plain-text index of drawer and record links? It aids keyboard users, no-JS users, and crawlers. It is not a top navbar, but it is a navigation list.
- **Recommendation:** Yes. Style it as an engraved label strip in the plinth, visually quiet, at the end of the DOM order.
- **Default until decided:** Implement a visually hidden skip link plus a sitemap-like index on the 404 page only.

### D-15 Location disclosure

- **Recommendation:** City and country at most (e.g. "Ghaziabad, India"). No map link and no `PostalAddress` in structured data.
- **Default until decided:** Country only in structured data. City in visible copy only if the owner approves.

### D-16 Repository visibility

- **Question:** Will the `portfolio2.0/` Git repository be public? Docs and `content/inventory/` contain local source paths and internal review notes.
- **Recommendation:** Keep `content/inventory/`, `docs/workspace-audit.md`, and `docs/reference/` out of any public repository (gitignore them or keep the repo private). The concept board's sample text names an employer's client (S-08).
- **Default until decided:** Treat the repo as potentially public. Never write secret values, phone numbers, or confidential employer details into any file under `portfolio2.0/`.

### D-17 Patent-to-project cross-links

- **Question:** Titles suggest relationships (GenShakti project ↔ two GenShakti patents; ArogyaPlus project ↔ ArogyaPlus patent). May records cross-link?
- **Default until decided:** No cross-links. design.md §7.3 requires an explicitly supported relationship.

### D-18 View-transition API

- **Question:** Use the browser View Transitions API (via Astro's client router) for continuity between the shelf and record pages?
- **Recommendation:** Prototype it in Phase 3, Stage 7. Keep it only if it preserves Back/Forward, focus, and reduced-motion behaviour in every target browser.
- **Default until decided:** Same-page drawer state with `history.pushState`, and full page loads for direct record URLs. See micro-interactions.md §3.

### D-19 Folder pictogram colour

- **Question:** The concept board tints the folder pictograms lavender-blue. The text contract keeps UI chrome monochrome, and the Phase 1 brief repeats "monochrome with selective colour for project images". Which applies?
- **Options:** (a) monochrome ink pictograms on manila folders; (b) the board's single lavender tint for every pictogram; (c) a real screenshot "peek" instead of a pictogram.
- **Recommendation:** (a). It keeps colour reserved for real work, so the screenshot in the record stands out.
- **Default until decided:** (a). Implement the tint as one token (`--folder-art`) so switching to (b) is a single-token change.
- **Affects:** design.md §3.2, §6.3.

### D-20 Status badge colour

- **Question:** The board shows green "Published" and yellow "Filed" pills. Colour-only status conflicts with the monochrome rule, but tinted pills with text are still accessible.
- **Options:** (a) monochrome pills (filled ink = published or granted, outlined = filed), with text always present; (b) the board's tints plus text, with contrast verified.
- **Recommendation:** (a) for consistency. (b) is acceptable if the owner prefers the board's look, because the text label carries the meaning.
- **Default until decided:** (a).
- **Affects:** design.md §3.2, §7.1, §7.4.

### D-21 Home tagline and focus chips

- **Question:** What tagline and which (up to 4) focus chips appear under the wordmark? The board's samples are "Engineer. Builder. Inventor. System Thinker." and Full-Stack / GenAI / System Design / Innovation. Should the chips link to filtered Projects views or be plain labels?
- **Recommendation:** Chips that match a project group link to `/projects/?group=<id>`. Chips without a matching group are not shown. "Innovation" has no evidence group; replace it or drop it. "Inventor" is now supported: Ayush is a named inventor on 5 applications per the official InPASS printouts ([workspace-audit.md](workspace-audit.md) §3.6).
- **Default until decided:** Tagline and chips hidden. The byline and the drawers carry the page.
- **Affects:** design.md §4.2, §4.4, ai-optimization.md §2.2.

### D-22 Paper warmth

- **Question:** The Phase 1.1 brief says "monochrome, primarily black-and-white". The concept board renders warm cream paper with warm-grey ink. Which governs the tokens?
- **Options:** (a) the board's warm-neutral tokens ([design.md](design.md) §3.2); (b) neutral black-and-white tokens (paper `#FFFFFF`/`#F6F6F4`, ink `#111111`, greys).
- **Recommendation:** (a). It is still monochrome (one hue family, ink on paper) and matches the approved board. Either way, all colour stays restricted to real media.
- **Default until decided:** (a). The palette is a single token set (`tokens.css`), so switching is a one-file change; contrast is re-run (T-A11Y-03).
- **Affects:** design.md §3.2.

### D-23 Original portfolio location

- **Question:** Which URL does the laptop's "Open original portfolio" link use after launch?
- **Options:** `https://www.urayushjain.tech` (if D-02 = a); an archive host such as `https://classic.urayushjain.tech` (if D-02 = b).
- **Default until decided:** the link target is one constant in `src/data/site.ts`. Until the owner decides, use the current live URL `https://www.urayushjain.tech`, and never iframe it ([physics-and-interactions.md](physics-and-interactions.md) §4.3).

### D-24 Public résumé variant

- **Question:** Which résumé is published through the laptop?
- **Evidence:** four versions exist ([workspace-audit.md](workspace-audit.md) §3.10). The most complete one (currently live on the old site) contains the phone number and names DistrictD's institutional clients, which the offer letter's secrecy clause may forbid (S-02, S-05, S-10).
- **Recommendation:** the owner produces a public variant: no phone number, no client names, verified patent numbers, consistent internship facts (C-23 to C-25).
- **Default until decided:** no résumé is published. The laptop panel shows only the original-portfolio link and contact. No résumé file is copied anywhere in Phase 1.1.

### D-25 Instagram and other unverified profiles

- **Question:** What is the exact Instagram URL (the brief asks for a pinned Instagram link)? LeetCode? Facebook?
- **Evidence:** the only Instagram URL is a placeholder in `resume.tsx`. LeetCode appears only with the "uaryushjain" typo (C-22).
- **Default until decided:** the social pin area shows GitHub, LinkedIn, and X only (after live checks). Instagram's slot is omitted, not shown as disabled.

### D-26 Rubik's cube level

- **Options:** Level 1 (yaw spin, lift-and-turn, scripted face-turn sequence on a consistent state model) or Level 2 (user face turns).
- **Default:** Level 1 ([physics-and-interactions.md](physics-and-interactions.md) §4.4).

### D-27 Lamp default and persistence

- **Status:** decided (2026-10-25): the owner removed the ON/OFF control. The lamp is a decorative object with a permanent, subtle warm glow; there is no lamp state to persist.
- **Affects:** [physics-and-interactions.md](physics-and-interactions.md) §3/§4.2, [design.md](design.md) §4.4, [micro-interactions.md](micro-interactions.md) §8.13 and R-56/T-PHY-09. Any historical switch instructions are superseded by this entry.

### D-28 DistrictD public label

- **Question:** How should the DistrictD role appear? The offer letter describes a "Software Developer" position with a 12-month trainee programme from 15 Jun 2026. Résumés say "Software Developer Intern (Trainee)". The sheet records a PPO.
- **Default until decided:** "Software Developer Trainee, DistrictD (Utopian Dreams Pvt. Ltd.), Jun 2026 – present", typed `employment` with a "Trainee programme" note. It is listed in Experience, not counted as an internship. Owner confirmation required. No compensation or terms are ever published.

### D-29 Credentials shown

- **Question:** Show all 15 credentials ([workspace-audit.md](workspace-audit.md) §3.11), or a curated subset?
- **Recommendation:** show the ones relevant to the professional profile (Anthropic, AWS ×2, Cisco ×3, Google, Vanderbilt, Microsoft/LinkedIn, Hacktoberfest, Cyfrin, APERTRE). Keep the Canva 1-hour course, Pre-MBA Statistics, and Professional Voice only if the owner wants them. Never present any as a professional certification.
- **Default until decided:** none are published until each verification URL is checked live.

### D-30 Patent wording and co-inventors

- **Default wording:** "Named inventor on published Indian patent applications (applicant: ABES Engineering College)." The status is "Application published", with a dated check.
- **Question:** list co-inventors on dossiers? They are public in the official record. **Default:** don't copy co-inventor names into site copy; link to the official record, which shows them. If listed, list all inventors in official order.

### D-31 Academic results

- **Default:** CGPA, marks, and results are not published. The Education drawer shows the institution, programme, and dates only. The owner may approve a CGPA line explicitly.

### D-32 Owner-authorized phase redefinition

- **Status:** decided 2026-10-24 by the Phase 2 Master Execution Prompt. Phase 2 is research, content, safe asset preparation, and specifications. Phase 3 is application implementation. Phase 4 is deployment and search submission.
- **Authorized:** local read-only research, relevant public-source checks, safe fact extraction, complete copy, selected media derivatives, inventories and validation. No application code, package installs, source changes, uploads of local files, deployment, commits, or pushes.
- **Publication:** individual approval and factual gates remain in force. No new record is marked owner-approved merely because drafting is authorized.
- **Affects:** AGENTS.md, CLAUDE.md, agent.md, README.md, implementation-and-validation.md, contest.md, asset-organization.md, phase-3-handoff.md. Historical reports are preserved.

### D-33 Phase 3 implementation approval

- **Decided 2026-10-24:** owner explicitly authorizes Phase 3. Required Astro application work and local dependencies may proceed on the final implementation prompt without another approval request. This preparation turn must not scaffold or build the app.
- Safe certificate-asset copying is authorized. Source originals remain immutable. No system-wide Node change, deployment or parent-repository git add/commit/push is authorized.

### D-34 Exact eight drawers and visual authority

- **Decided by owner:** About Me, Projects, Patents, Experience, Education, Achievements, Skills & Toolbox, Certifications, in that order.
- `docs/reference/refrance2.0.png` is the latest supplied visual reference. The exact labels above override labels printed in the image. The original board remains a component reference.
- Open book on the desk opens verified writing, notes, articles and approved photo albums. Do not create a Memories or ninth drawer. Optional categories without approved content are omitted. All eight required drawers remain usable with truthful content or a purposeful empty surface.

### D-35 Local review versus release

- **Approved:** local loopback development may show public-safe needs-owner-review records with a visible review notice and noindex. This never approves publication or changes factual confidence.
- **Fail closed:** review mode cannot produce a static build or run in CI/deployment. Release exports use an explicit approved-record allowlist, strip all provenance/private fields, reject unresolved patent claims, and reject uncleared media. A guessed host is forbidden.
- All 67 uncleared project assets reside in assets/review/projects, outside public. The preparation gate is content/inventory/phase3_gate.py; port its contract into mandatory prebuild/build validation during Stage 4 and verify that review-only fixtures fail production builds.
- **Implemented 2026-10-24:** `scripts/release-gate.mjs` (prebuild, with `--selftest`), `scripts/check-dist.mjs` (postbuild), `src/data/release-allowlist.json` (empty), and a dev-only, loopback-only `/review-media/` middleware in `astro.config.mjs`. Review media never enters `public/` or `dist/`.

### D-36 Phase 3 implementation prompt — how owner requests were resolved

- **Owner prompt (2026-10-24)** asked for a faithful reproduction of the latest reference, focus chips, a "Currently Building" note, ambient object motion, and working résumé links.
- **Focus chips (D-21):** shown only when backed by records — Full-Stack, AI & Data, Web3 (project groups) and Invention (patent applications). "GenAI", "System Design" and "Innovation" were not used: no matching evidence group. Hidden in release until records are approved.
- **Sticky note (D-12 still open):** with no owner-supplied current items it is titled "Pinned builds" and links the proposed featured projects. Set `site.currentlyBuilding` in `src/data/site.ts` to show a real "Currently Building" list.
- **Motion vs. design §0 #7:** no continuous loop was added. The globe turns once on arrival and settles within about five seconds, turns while hovered, and spins on drag, click or Enter; plants sway and steam rises a couple of cycles on arrival and on hover. Reduced motion disables all of it. Owner may approve continuous motion explicitly.
- **Résumé (D-24 still open):** no résumé link or "unavailable" message is rendered; the laptop shows the original portfolio and email.
- **Book spines:** Blogs → articles, Notes → BuildLog walkthrough videos inside project folders, Ideas → invention-application records, Album → an explicit empty state (no approved photographs).
- **Laptop and pen** are surfaces at `/laptop/` and `/contact/` (noindex) instead of a `history.state` marker, so they work without JavaScript. The pen prepares a message in the visitor's own mail app; nothing is sent by the site.
- "Curiosity lives here." and "MAKE • LEARN • REPEAT" are decorative scene text from the latest reference, not factual claims.

### D-37 Physical drawer interaction

- **Owner request (2026-10-25):** implement the supplied six-section Drawer Interaction Specification in the existing Astro cabinet. It supersedes detached drawer panels, generic mobile sheets and earlier front-only pull distances. Preserve the eight drawers, existing data, illustrated palette and other scene objects.
- The entire drawer assembly pulls out: original front/handle, side and rear walls, bottom and content. Keep the cabinet slot stationary and expose its recess. Use browser-native transforms and perspective, without added dependencies.
- Counts and filters still come from the existing records; sample reference names and numbers do not authorize new content or publication. D-35 remains in force.
- Owning implementation contracts: [micro-interactions.md](micro-interactions.md) §5.1 and [responsive-design.md](responsive-design.md) §6.1. This is local Phase 3 maintenance; no deployment or Git mutation is authorized.

### D-38 Realistic study-desk materials

- **Decided (2026-10-25):** the owner requests more physically believable construction, materials, proportion and lighting in the existing scene. This supersedes §3.1's earlier restriction against realistic wood. Retain the warm handcrafted character, exact eight drawers, real records, search, filters, writing categories and verified links.
- Preserve the laptop's source, physical design, position, dimensions, keyboard, trackpad, hinge and screen behaviour. No new dependencies or rendering engine. Reaffirm D-27: the lamp is permanently lit and decorative, with no toggle, stored state or pointer-following light.
- Implementation uses connected lamp arms and recessed reflector/bulb geometry, directional wood grain and joinery, ceramic rims, paper edges, glass highlights, a shaded globe and deterministic foliage variation. Desktop plant placement keeps the pot on the crown and foliage clear of the portrait, drawers and checklist. The existing portrait is resolved through Astro's local asset import in development; D-35 still controls publication.
- **Task-specific execution exception:** the owner explicitly prohibited builds, tests, screenshots, browser checks, dev-server restarts and `git diff`. None were run for this pass. This supersedes AGENTS §9 for this task only; visual quality, responsiveness, release output and interactions remain unverified at runtime.
- Local Phase 3 maintenance only. No content approvals, uploads, deployment or Git mutations. Owning specifications: [design.md](design.md) §3.1 and [physics-and-interactions.md](physics-and-interactions.md) §3/§4.2.

### D-39 Live portfolio in the laptop

- **Decided (2026-10-25):** the owner explicitly requests `urayushjain.tech` open inside the laptop screen, scrollable and usable as a website. This supersedes the original link-only/no-iframe rule and D-38's screen-content preservation restriction. Laptop geometry, keyboard layout, placement and hinge remain unchanged.
- Use the existing HTTPS original-portfolio URL, which redirects to `https://www.urayushjain.tech/`. A read-only header request on 2026-10-25 returned 200 with no `X-Frame-Options` or CSP `frame-ancestors` restriction. This is header evidence, not a successful browser-rendering test.
- Load on laptop opening (including a direct `/laptop/` visit), with native iframe scrolling, clicks and keyboard input. Measure the untransformed screen viewport and apply a numeric scale to a 1024px-or-wider browsing viewport; derive its height from available screen height so it fills the display.
- Keep a parent-owned Close action and Open in tab fallback visible. Closed screen content is inert. Escape is handled by the parent only when focus is outside the remote document; no cross-origin interception or synthetic input forwarding. Illustrated letter keys operate the separate Shelf search view; Home returns to the portfolio. Clicking the illustrated trackpad focuses the iframe; wheel/touch scrolling occurs directly over the screen.
- A sandbox permits the site's scripts, same-origin storage, forms, downloads and new-tab links, but not top-level navigation. Do not proxy, copy or alter the old portfolio, and do not treat its content as newly approved Shelf records. CSP's documented `frame-src` exception is limited to the portfolio origin; `frame-ancestors 'none'` remains unchanged.
- Source changes only, with the earlier no-build/no-test/no-browser-check instruction retained. Public-header inspection passed after the sandbox network attempt failed. No dependencies, uploads, Git mutations or deployment; local Phase 3 maintenance.

### D-40 Desk speaker

- **Decided (2026-10-25):** the owner requests one portable speaker on the right desk in place of the pen holder, lantern and decorative stacked desk books. The functional contact pen, mug, steam, handwritten desk text, laptop, cabinet and content remain.
- **Reference review:** the [exact Sketchfab model](https://sketchfab.com/3d-models/portable-bluetooth-speaker-cdf5e9a6882d48b69f50849a24bd2b6b) is credited to ME.RROR Studio. Its [public model metadata](https://api.sketchfab.com/v3/models/cdf5e9a6882d48b69f50849a24bd2b6b) reports `isDownloadable: false` and an **Editorial** license limited to newsworthy or public-interest events. The published thumbnail was viewed only as design reference in a temporary local file; no model, thumbnail, texture, brand mark or viewer is used by the site.
- **Implementation:** one original inline SVG, informed by the visible rounded dark cabinet, fine woven grille, brown metal trim and shallow top controls. It has two feet and a compact contact shadow. It is decorative, static and hidden from assistive technology; no invented audio or Bluetooth feature. The object sits beyond the mug and above the handwritten desk text. The existing smaller-screen rule still omits decorative desk objects.
- **Execution:** local Phase 3 maintenance, no new dependency or service. The owner's explicit no-build/no-test/no-browser-check/no-screenshot/no-`git diff` instruction applies to this task; runtime appearance is not verified. No Git mutation or deployment.

### D-41 Left desk plant

- **Decided (2026-10-25):** the owner asked to use [Ismail Vtl's Plant Animation](https://codepen.io/ismailvtl/pen/wvQYGay) as the look for the left desk plant and move it a little left.
- The desk plant now has several arching stems and small, narrow leaves, drawn as original inline SVG using the site's existing vine geometry and leaf gradients. Its warm cream ceramic pot remains on the wood surface. No CodePen code, image, dependency or remote embed is shipped.
- Desktop x-position changes from `-72` to `-82` scene units; the low right sprig is shortened so it clears the social plaque. The existing finite sway and reduced-motion rule remain; no continuous animation is introduced.
- Local Phase 3 maintenance only. No build, tests, browser checks, screenshots, Git mutations or deployment were performed under the owner's standing task preference.

### D-42 Owner-supplied realistic desk reference

- **Decided (2026-10-25):** the owner requests the newly supplied photoreal desk image as the visual direction for the existing Astro scene. Follow its warmer wall light, deeper wood desk, taller cabinet, framed left portrait, and cork-backed note. The established eight drawers, real content, laptop behaviour, open writing book, speaker, mug and steam remain.
- The portrait reuses the existing publication-gated asset and is decorative on the left wall. The sample checklist text and branded speaker in the image do not establish real current projects or authorize use of a logo. Pinned links still come from verified records, and the cork board is hidden when no links qualify. The functional contact pen rests over the book; the extra wall prints and desk lettering are visually omitted on desktop.
- Owning specifications: [design.md](design.md) §3.1, [responsive-design.md](responsive-design.md) §4 and [physics-and-interactions.md](physics-and-interactions.md) §3. This is local Phase 3 maintenance. The owner's standing task preference excludes builds, tests, browser checks, screenshots, dev-server restarts and `git diff`; no deployment or Git mutation is authorized.

### D-43 GSAP and fitted viewport

- **Decided (2026-10-25):** the owner requires GSAP for the animations, an improved overall UX, and the site always opening fitted to the viewport with no scrollbar. This is a recorded exception to AGENTS.md §7's no-animation-library rule. `gsap` is pinned at 3.15.0 (core only, no plugins).
- GSAP now drives the drawer pull and push (rebuilt for consistency: one reversible 500 ms ease-in-out timeline per drawer, contents fading in last and out first; see [micro-interactions.md](micro-interactions.md) §5.1), the laptop lift, the mobile/desktop sheet entrance, the plant sway and the mug steam. Plain CSS state transitions (hover, the laptop hinge, focus) stay in CSS. Every tween is one-shot and skipped under reduced motion; no loop is introduced.
- The mug steam is a small raw-WebGL fragment shader (owner request), with the SVG wisps as the fallback; GSAP owns its time and intensity, so it draws frames only during a puff.
- UX: project folders settle in (2px rise, 30 ms stagger, at most six) when a filter changes, as [micro-interactions.md](micro-interactions.md) §5 already specified.
- Viewport: in the desktop layout (≥1000 × 560) `html` and `body` are locked to `100dvh` with `overflow: hidden`, and the 16:9 scene fits both dimensions. Scrollbars are hidden everywhere; panels and the narrow-screen flow still scroll by wheel, touch and keyboard. The narrow-screen flow is longer than one screen by design and is not squeezed into one viewport.

### D-44 Owner-directed spatial studio and live desk controls

- **Decided 2026-10-28:** the owner asks for a genuinely spatial inventor workspace, based on the supplied desk image and master brief. This authorizes Three.js for the requested 3D scene and supersedes the earlier no-engine restriction in D-38 and the decorative-only lamp and speaker rules in D-27 and D-40. The exact eight drawers, release gate, verified content, stable HTML routes, reduced-motion parity, and no deployment/Git mutation boundaries remain.
- The lamp is a keyboard-operable switch. Its illustrated light pool and the 3D model's local point light respond together. The speaker plays an original locally generated, finite audio clip only after a visitor gesture. The clock shows browser-local time. The board planner contains explicitly sample editable tasks saved locally; message text is not persisted. The notebook opens `/contact/` with introduction, project notes, directory and writing pages; the book spines still open `/writing/`.
- `three@0.180.0` is pinned and dynamically imported after idle on desktop. The current 3D geometry is a user-triggered overview layered over the existing illustrated scene; HTML drawers and prerendered content remain the primary interaction. **The owner's requested default, fully interactive 3D scene and photoreal material quality are not yet implemented.** This is an outstanding Phase 3 requirement, not an approved reduction in scope.
- The original Sketchfab speaker reference remains non-downloadable/editorial (D-40). The replacement speaker body uses Innerscene's [Carry Sound portable speaker](https://www.innerscene.com/tools/library/3d-parts/carry-sound-portable-speaker-c0beeded), downloaded through its official GLB link. The source labels it CC0, with embedded materials and no attribution requirement. No brand mark or sound was copied; the locally generated audio is original. The original SVG remains the WebGL fallback. No deployment, publication or Git mutation is authorized by this decision.
