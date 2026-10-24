# Phase 3 Handoff — Implementation Readiness

Prepared 2026-10-24. This file connects the completed preparation work to the existing implementation stages. It does not authorize application code, dependency installation, deployment, or publication during Phase 2.

## Current implementation entry — approved

**IMPLEMENTED 2026-10-24 (D-33, D-36).** The Astro application exists; see README "Run". The text below is the preparation-time specification and remains the contract. Existing factual/publication gaps are release gates, not local implementation blockers.

### Runtime

Astro **7.4.2** was checked in the [npm registry](https://registry.npmjs.org/astro/latest); its engine is Node **>=22.23.4**, npm >=9.6.5. [Astro installation requirements](https://docs.astro.build/en/install-and-setup/) agree. [Node 24.22.1 is LTS](https://nodejs.org/en/download/archive/v24.22.1).

A portable Node **24.22.1** is installed only at `.tools/node-v24.22.1-win-x64/`, with the ZIP SHA-256 matched to the official SHASUMS256.txt. System Node 20.20.0 and the separate existing Node 22.23.3 are not compatible with this Astro engine. No machine installation or persistent PATH was changed.

**Latest owner instruction:** the owner will update the laptop’s Node version. Do not install or change Node further. Verify `node --version` before the final implementation; require Node 22 >=22.23.4 or supported Node 24 LTS, then use that installation. The already downloaded portable fallback is optional and inactive; no PATH modification was performed. Pin Astro and one lockfile during implementation. No Astro packages are installed yet.

### Content preview and publication

All 31 local projects and eight patent records are available. Local **development-server-only**, loopback previews may display safe needs-owner-review records with a visible review notice and noindex. Do not expose preview to LAN, CI, a public preview host or deployment. No private notes, raw certificates, disputed identifiers or secrets are allowed even locally in rendered content.

Production content uses an explicit approved-record allowlist, stripping provenance. Review-mode builds must fail. Production must reject unapproved records/media and unresolved legal claims; changing an environment flag cannot waive approval. Run `py -X utf8 content/inventory/phase3_gate.py --mode local-preview` now. During Stage 4 implement equivalent mandatory prebuild/build guards, with fixtures proving release rejection. The preparation gate alone is not a tested Astro build.

### Media and credentials

All 50 project images and 17 videos now reside at `assets/review/projects/<slug>/`, outside public. Their checked hashes and associations remain in media.csv. Use `previewSrc` for local-only review; `src` is null until approved. Never run the old collection generator, which targets public staging. Promote only cleared media into production inputs.

Five safe, unchanged PNG badge files are at `public/media/certifications/` (Cisco ×3 and AWS Academy ×2). Credentials retain course/training/statement/participation labels and needs-owner-review record status. These are badge artwork, not proof of an individual award. Certificate originals containing identifiers, QR links, private email or coupon codes stay excluded. No source file was altered.

### Exact scene and content map

**About Me · Projects · Patents · Experience · Education · Achievements · Skills & Toolbox · Certifications.** Exactly eight drawers; latest visual reference `docs/reference/refrance2.0.png`. The owner’s labels override printed annotations. About uses identity copy; Experience includes work and leadership sections; Achievements shows results/open-source activity; Certifications owns credentials. The open book on the **desk** opens verified writing, notes, articles and approved photo albums. No Memories drawer, no ninth drawer. Empty optional book categories are omitted; required drawer surfaces stay usable without fabricated entries.

Lamp, globe, laptop, pen/contact fallback, cube, plant, steam, responsive modes, keyboard/focus and reduced-motion acceptance criteria remain in their owning docs. Current patent status, sanitized résumé, media rights, domain/archive choice and optional album photographs do not block local implementation; unresolved items cannot enter a production release.

## Phase numbering and authority

The owner’s Phase 2 Master Execution Prompt supersedes the older phase labels: **Phase 2 is research, content, media preparation, and specifications; Phase 3 is application implementation; Phase 4 is deployment and search-engine submission.** Historical completion reports retain their original wording. The stage numbers in [implementation-and-validation.md](implementation-and-validation.md) remain stable for traceability. Stages 1–3 now have Phase 2 preparation evidence; Stage 4 onward is future work. Stage 22–23 release and monitoring belong to Phase 4.

The request explicitly authorizes local research, public-source checks, content drafting, and safe asset preparation. It does not approve every new factual claim or asset for public release. Existing owner decisions and release blockers still apply to publication. A blocked patent check or optional media item does not prevent building the shell or integrating a reviewed subset later.

## Inputs and ownership

| Input                                                                                                                   | Use in Phase 3                                                         | Public output boundary                                                                        |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [../content.md](internal/content.md)                                                                                          | Readable review manuscript with actual copy                            | Export approved wording only; never serve the manuscript                                      |
| [../content-inventory.csv](../content/inventory/content-inventory.csv)                                                                    | Candidate and publication ledger                                       | Internal only                                                                                 |
| `content/inventory/{projects,patents,experience,education,credentials,achievements,articles,skills,social,resume}.yaml` | Detailed records, IDs, provenance, and withheld fields                 | Hand-copy or export an explicit public field allowlist; never import the inventory at runtime |
| [../content/inventory/ui-copy.yaml](../content/inventory/ui-copy.yaml)                                                  | Exact UI labels, actions, feedback, alt text                           | Export public copy groups; omit publication notes                                             |
| [../content/inventory/seo-metadata.yaml](../content/inventory/seo-metadata.yaml)                                        | Per-route title, description, eligibility                              | Resolve origin and publication gates before output                                            |
| [../asset-manifest.md](internal/asset-manifest.md) and [../content/inventory/media.csv](../content/inventory/media.csv)       | Candidate files, source association, validation, preparation decisions | Use only reviewed derivatives from the ledger                                                 |
| `assets/profile/`, `assets/projects/`, `assets/objects/`, `assets/social/`                                              | Small Phase 2 staging collection                                       | Transfer approved image paths to `src/assets/`; social PNG to `public/og/`                    |

Stable IDs are preserved. Freeze slugs at first deployment; any later change needs a redirect. Repository URLs are evidence of public source availability, not evidence of sole authorship. Git history is not proof of employment or product usage. A reachable landing page is not a functional deployment test.

## Collection export specification

Public project fields: ID, slug, title, summary, body, problem where supported, verified features, technologies, kind, deployment state, group, featured rank, approved repo/demo URLs, approved media, approved related links, SEO title/description, and public review date. Omit null fields.

Private fields that must never enter public schemas: provenance, sourceReview, fieldConfidence, openQuestions, conflicts, reviewNotes, liveUrl candidate fields, employer-clearance notes, raw source paths, internal filenames, source hashes, and source document text. The public renderer never recursively serializes a record. It uses an explicit allowlist.

For patents, preserve the exact official title separately from a readable display title. The journal issue is not a grant number. Unknown grant status stays absent. The five historical publications have dated evidence but lack a current live status check; their dossiers remain excluded from release under RB-11 until that check or an explicit owner-approved historical-only policy is recorded. Later candidates are not represented as officially verified. Omit the conflicted DigiLocker number.

Experience dates that conflict are absent; no `Present` label is inferred. Community roles appear in a Leadership section of Experience, separate from employment. Credentials retain their kind labels. Generic course artwork does not verify an award. Social-profile pin eligibility and `sameAs` eligibility are separate: a source-associated profile may be linked after review while stronger entity assertions remain withheld.

## Default composition and curation

Keep the reconciled reference composition above, warm-neutral palette, cabinet, real portrait, books, lamp, globe, laptop, mug, plants, cube, and pen. No navbar or homepage counters. One primary content surface at a time. Portrait preparation uses the existing photographic avatar; the cartoon is excluded. The final identity-frame choice still requires D-05.

Proposed featured project order: Arogya, GenShakti, XenoCRM Mini, VigilAI, DevStudy, AadhaarPulse. This balances technical depth and evidence; it is a review proposal, not a release approval. GenShakti and ArogyaPlus have multiple commit authors. All other supported projects remain accessible through filters after review. Coursework sits behind Early work without standalone indexable pages. New Promptly material is a client interface prototype, not evidence of a complete prompt-versioning backend. Aventra and Finance Categorizer are useful additional candidates.

Render exactly the D-34 drawer set above. The desk book starts with verified Articles; other book categories require content. Credentials belong in Certifications; current work is optional and is not a drawer. No freelance availability or services are inferred. Contact lives in About; retain the existing one-step contact affordance rather than adding a new desk object without D-13.

Place the small “Email Ayush” link directly under the identity introduction so contact remains reachable from the home scene without opening another surface. It is an ordinary text link in the identity column, not a navigation bar. When seven approved drawers remain, retain equal-width fronts in row-major order; the last front occupies the left position of the last row and the right position is plain cabinet material, without an empty or disabled drawer. On mobile, render only the seven real fronts as a list. If the pinned current-work note is hidden, keep the verified social cards in the right zone without a blank note placeholder.

Use system Georgia with a serif fallback for the display wordmark and byline, and Arial with a sans-serif fallback for interface text. This satisfies the serif/sans hierarchy without introducing unlicensed files or a font download. Optional licensed font replacement is a later reviewed choice. No fonts were installed or copied.

## Navigation, focus, and fallback resolutions

Drawer fronts and functional content-navigation objects are real anchors styled as physical controls. Their `href` points to the stable prerendered route. Native anchor keyboard activation is Enter; the enhanced controller must preserve modified clicks. Use buttons for state-only actions: close, lamp, toys, and utility laptop dialog. A drag handle can be a separate enhanced affordance, without nested interactive elements. The same drawer front must not be both a link and a nested button.

Desktop drawer trays are non-modal named regions and leave other drawer controls operable. Tablet, mobile, and short-landscape trays are modal dialogs/sheets with inert background and contained focus. Closing returns focus to the trigger or the drawer heading if the original trigger is absent. Direct route loads do not forcibly move focus. Drawer-to-record switches replace the active surface; they do not stack dialogs.

With JavaScript disabled, drawer and record anchors perform full navigation to real HTML. A native `details` laptop utility provides original-portfolio and contact links; approved résumé links can be added later. Lamp, globe, and toys may be static decorative objects when their enhancement is unavailable; no content depends on them. No nonworking buttons appear. With reduced motion, retain every content path and focus rule, while disabling inertia and toy motion.

Laptop history: opening may push one same-URL entry with a private `history.state.shelfUtility` marker. Back closes the utility without leaving the page. The URL-derived content state remains unchanged. Closing by button consumes that marker rather than pushing another entry; direct loads and Forward are covered by T-INT-12. The marker never stores personal data or record content.

The lighting layers affect illustrations only. Correct text contrast must survive both lamp states and the 55% inactive-drawer treatment: dim decorative artwork separately, not label text. Focus indicators on modal sheets are never clipped. Browser zoom testing changes CSS viewport size and includes real browser zoom; DPR emulation alone is not reflow testing.

## Layout and asset authoring

Use [responsive-design.md](responsive-design.md) for D, D+, T, M, and L. The underlying scale is calculated before clamping; use the unclamped value to choose a layout mode. Width under 600 CSS px selects M unless the short-landscape condition selects L. Heights under 600 CSS px with width at least 600 and outside L use T. Remaining space with raw scale below 0.66 uses T; D caps visual scale at 1.25. At 600px, allow two 260px drawer fronts plus 16px gutters and a 16px gap. Labels never scale below 15px.

The concept board is a private reference and cannot be shipped as the cabinet. There is no approved finished object-art bundle. Author cabinet and interactive geometry in native HTML/CSS/inline SVG in Phase 3. For layered object art, require a base layer, contact shadow, lamp highlight, and cast-shadow layer with consistent bounds and anchors. Laptop base/lid, globe stand/sphere, cube state, and pen must be independently transformable. Use the prepared equirectangular Natural Earth texture with north up and east right. Do not replace genuine project media with generated interfaces.

## Performance and security budgets

Existing limits remain: critical controller including drawer body at most 30 KB compressed; lazy physics at most 12 KB compressed; idle animation scheduler schedules zero frames. Additional preparation targets: initial home transfer at most 350 KB compressed including HTML, CSS, portrait, and scene art; CSS at most 35 KB compressed; no webfont transfer in the default system-font plan. Record deviations before accepting them. Record media loads on intent, with images sized to the visible slot. Video uses `preload="none"`, one player at a time, real captions only, and no autoplay.

Target LCP at most 2.5 seconds, INP at most 200 ms, and CLS at most 0.1 at the 75th percentile; these are targets, not measured results. Measure lab and field separately. Degrade decorative physics before sacrificing functional accessibility.

No backend is needed for the default mail-app/copy contact mode. A future delivered-message form needs a separately approved provider. No analytics, external widgets, iframe, or runtime AI service is needed. Use existing CSP and HTTP-header specifications. Exclude all preparation scripts, manifests, review sheets, source snapshots, inventory, and docs from the build. Never re-host placement documents. New public-source metadata reveals credential-file paths in one template repository; those values were not fetched.

## Implementation order and acceptance

1. Review the publication subset and blocking identity/role facts. The shell can be built while optional factual records remain withheld.
2. Stage 4: explicitly authorize and scaffold Astro in Phase 3, selecting a supported installed version and one lockfile. Verify API details against that version; the public docs were checked during Phase 2 but are not a version pin.
3. Stages 5–7: tokens, responsive cabinet, native links, URL-derived state, focus, no-JS pages, one drawer prototype, CSS fallback.
4. Stages 8–14: approved collections, galleries, external links, Writing, About/contact, laptop. Integrate images only when their derivative and release decision match.
5. Stages 15–20: bounded custom physics, accessibility, security, SEO, and performance. No physics or animation library is required.
6. Stage 21: real build, content/schema gates, T-INT/T-A11Y/T-RWD/T-PHY/T-SEO/T-SEC/T-MED and bundle checks. Record untested browsers honestly.
7. Phase 4: approved release, headers, redirects, canonical validation, Search Console/Bing verification, sitemap submission, indexing inspection, and monitoring.

Useful current references: [Astro content collections](https://docs.astro.build/en/guides/content-collections/), [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Core Web Vitals](https://web.dev/articles/vitals), [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), and [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum). These support the architecture and test targets; no runtime compliance test has been claimed.
