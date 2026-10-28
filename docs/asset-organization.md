# Asset & Component Organization

**Derived from:** `context/asset-organization.md`. Phase 1 changes: optimizable images move from `public/` to `src/assets/` so Astro can process them; videos and documents go in `public/media/`; content-collection schemas, SEO utilities, tests, and validation scripts get defined locations; the internal inventory is separated from public content.

**Guiding rules:**

- Organize by feature/domain first. Shared primitives are separate from drawer-specific components.
- Data is separate from components. No facts are hard-coded in `.astro` files.
- No component per decorative line. No abstractions without a second use.
- One copy of each media file. Never duplicate large media across folders.
- Follow Astro's documented conventions for the version actually installed. Verify `content.config.ts`, loaders, and `astro:assets` APIs against that version's docs at implementation time.

---

## 1. Target structure

```text
portfolio2.0/
├── README.md  AGENTS.md  CLAUDE.md  agent.md
├── docs/                         # this documentation set (not shipped)
│   └── reference/                # concept board (the-shelf-concept-board.png) — private (D-16, S-08); never in dist/
├── content/
│   └── inventory/                # INTERNAL inventory (contest.md §5) — never imported by src/
├── astro.config.mjs              # site URL from one constant; integrations minimal
├── package.json / lockfile       # created in Phase 3, Stage 4, not before
├── tsconfig.json
├── public/                       # copied verbatim; no processing
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── robots.txt                # or generated (seo-optimization.md §6)
│   ├── llms.txt                  # ai-optimization.md §5
│   ├── og/                       # social preview images (1200×630)
│   ├── fonts/                    # self-hosted, subset, licensed
│   └── media/
│       ├── video/<project-slug-or-episode>.mp4
│       ├── posters/<name>.webp   # only if not generated via astro:assets
│       ├── captions/<name>.vtt   # only real transcripts
│       └── documents/            # public-safe PDFs only: ayush-jain-resume.pdf (approved public variant, D-24); never placement/ files
├── src/
│   ├── assets/                   # processed by astro:assets (resized, modern formats, dimensions)
│   │   ├── identity/             # approved profile photo (D-05)
│   │   ├── projects/<slug>/cover.png, shot-01.png …
│   │   ├── patents/<slug>/…      # official diagrams if public
│   │   ├── logos/                # organization logos (usage reviewed)
│   │   ├── shelf/objects/        # hand-drawn object illustrations (globe stand, lamp, plants, cube, laptop base/lid, mug, frame) — transparent AVIF/WebP or SVG
│   │   ├── shelf/lighting/       # per-object lamp-light, lamp-shadow, ambient contact-shadow layers (physics §3.2)
│   │   ├── shelf/globe/          # world-equirect.webp (public-domain source; licence in media.csv)
│   │   ├── resume/               # resume-page-1 preview generated at build from the approved PDF
│   │   ├── credentials/          # issuer badge images only when imagePublishable (template §7a)
│   │   ├── shelf/pictograms/     # folder pictograms per project group (D-19)
│   │   └── writing/<slug>.webp   # article covers
│   ├── content/                  # PUBLIC content collections (approved, provenance stripped)
│   │   ├── projects/<slug>.md
│   │   ├── patents/<slug>.md
│   │   ├── experience/<slug>.md
│   │   ├── education/<id>.yaml
│   │   ├── achievements/<id>.yaml
│   │   ├── credentials/<id>.yaml # course certificates, training badges (template §7a)
│   │   ├── articles/<slug>.yaml  # link-out records (D-11)
│   │   ├── skills.yaml
│   │   └── social.yaml
│   ├── content.config.ts         # collection definitions + schemas (§3)
│   ├── data/
│   │   ├── site.ts               # name, canonical site URL, default meta
│   │   ├── drawers.ts            # drawer list + order (D-03)
│   │   ├── shelf-objects.ts      # object roles, labels, targets (design.md §4.4)
│   │   ├── currently-building.ts # null by default (D-12)
│   │   ├── scene-layout.ts       # per-layout-mode object positions (responsive-design.md §5)
│   │   ├── resume.ts             # approved résumé metadata + original-portfolio URL (D-23, D-24); null until approved
│   │   └── services.ts           # Work with me (D-13), empty until approved
│   ├── components/
│   │   ├── shelf/       ShelfScene, ShelfObject, IdentityBlock, FocusChips, IdentityFrame, BookSpines, SocialTabs,
│   │   │                CurrentlyBuildingNote, BusinessCardHolder, Globe, RubiksCube, PlinthIndex
│   │   ├── drawers/     DrawerFront, DrawerTray, FilterChips, DrawerSearch, ShelfBreadcrumbs, CloseControl,
│   │   │                RecordTabs, StatusPill, CurrentlyBuildingDrawer
│   │   ├── projects/    ProjectArchive, ProjectFolder, ProjectRecord, DeviceFrame
│   │   ├── patents/     PatentRegister, PatentDossier
│   │   ├── experience/  ExperienceTimeline, ExperienceRecord
│   │   ├── writing/     WritingBooklet, WritingEntry
│   │   ├── toolbox/     ToolboxTray
│   │   ├── media/       MediaViewer, VideoPoster, ScreenshotGallery
│   │   └── shared/      ExternalLink, RecordMetadata, EmptyState, ErrorSlip, Toast, SkipLink
│   ├── layouts/
│   │   ├── BaseLayout.astro      # <head>: meta, canonical, OG, JSON-LD slot, fonts
│   │   └── ShelfLayout.astro     # cabinet shell; accepts initial drawer/record state
│   ├── pages/
│   │   ├── index.astro
│   │   ├── [drawer]/index.astro  # /projects/, /patents/ … (static, drawer open)
│   │   ├── projects/[slug].astro
│   │   ├── patents/[slug].astro
│   │   ├── experience/[slug].astro
│   │   ├── about.astro           # if About record approved
│   │   ├── work-with-me.astro    # if D-13 approved
│   │   └── 404.astro
│   ├── scripts/
│   │   ├── shelf-controller.ts   # the single UI state/history/focus controller (micro-interactions.md §3)
│   │   └── physics/              # scheduler, integrators, bodies, globe renderer (physics-and-interactions.md §5.2); lazy-loaded except the drawer body
│   ├── styles/
│   │   ├── tokens.css            # colour, type, space, shadow, z-index (design.md §3)
│   │   ├── motion.css            # motion tokens + reduced-motion overrides (micro-interactions.md §2, §9)
│   │   ├── global.css
│   │   ├── shelf.css
│   │   └── drawers.css
│   └── lib/
│       ├── seo/
│       │   ├── meta.ts           # title/description/canonical builders
│       │   └── jsonld.ts         # Person, WebSite, ProfilePage, BreadcrumbList, CreativeWork builders
│       ├── urls.ts               # safe external URL validation (https only, allowlist)
│       └── media.ts              # poster/size helpers
├── scripts/                      # Node validation scripts run in CI (no runtime use)
│   ├── validate-content.mjs      # visibility/confidence gate, forbidden phrases, required fields
│   ├── check-links.mjs           # local Markdown + built HTML internal links
│   └── scan-output.mjs           # secret/PII patterns over dist/
└── tests/
    ├── e2e/                      # browser interaction tests (implementation-and-validation.md §6)
    ├── a11y/                     # automated accessibility checks per route
    ├── fixtures/                 # TEST-ONLY fake records, never in src/content
    └── unit/physics/             # deterministic step() tests (T-PHY-*)
```

Create folders only when the first file needs them. Do not scaffold empty directories.

## 2. Where each asset type goes

| Asset                                                             | Location                                                                                           | Why                                                                                                                                                               |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project screenshots, covers, profile photo, logos, article covers | `src/assets/...`                                                                                   | `astro:assets` generates responsive sizes and modern formats, and sets width/height (prevents CLS)                                                                |
| Shelf illustration (cabinet, drawers, objects)                    | Inline SVG inside components, or `src/assets/shelf/*.svg` imported as components                   | Interactive and accessible per element. Never one flattened raster.                                                                                               |
| Videos                                                            | `public/media/video/`                                                                              | Served as-is. Range requests are handled by the host.                                                                                                             |
| Original desk audio                                               | `public/media/desk-theme.wav`                                                                       | Procedurally composed for this site; loaded only after explicit playback. No third-party source or licence is needed.                                            |
| Desk speaker GLB                                                  | `public/media/models/portable-handle-speaker.glb`                                                   | Source is the Innerscene Carry Sound part (D-44), CC0 with embedded materials; local hosting avoids a runtime dependency on the library URL.                    |
| Video posters                                                     | Generated from a still in `src/assets/` via `astro:assets` (preferred), or `public/media/posters/` |                                                                                                                                                                   |
| Captions                                                          | `public/media/captions/*.vtt`                                                                      | Only real transcripts                                                                                                                                             |
| Public PDFs                                                       | `public/media/documents/`                                                                          | Only after privacy review. Prefer linking to official records instead of re-hosting.                                                                              |
| Résumé (approved public variant)                                  | `public/media/documents/ayush-jain-resume.pdf`                                                     | Static, `noindex` header, metadata stripped ([security.md](security.md) §11.1). The page-1 preview is in `src/assets/resume/`. **Never copied during Phase 1.1.** |
| Credential badge images                                           | `src/assets/credentials/`                                                                          | Only if clean (no email, codes, or QR to personal data)                                                                                                           |
| Globe texture                                                     | `src/assets/shelf/globe/`                                                                          | Public-domain source recorded                                                                                                                                     |
| Lighting layers                                                   | `src/assets/shelf/lighting/`                                                                       | Pre-authored per lamp state                                                                                                                                       |
| Fonts                                                             | `public/fonts/`                                                                                    | Self-hosted, subset, open licence. Never the BuildLog trial font (S-04).                                                                                          |
| OG images                                                         | `public/og/`                                                                                       | Stable absolute URLs for crawlers                                                                                                                                 |
| Test fixtures                                                     | `tests/fixtures/`                                                                                  | Never mixed with real content                                                                                                                                     |

**Source → destination:** originals stay in `portfolio/` and `BuildLog/`. During implementation, approved assets (status `approved` in `media.csv`) are **copied once** into the destination with descriptive kebab-case names, and `media.csv.output_path` is updated. Nothing is moved or renamed in the sources.

## 3. Content collections and schemas

Define one collection per record type in `src/content.config.ts`. Each schema mirrors the **public subset** of [content-inventory-template.md](content-inventory-template.md). Internal fields (`provenance`, `fieldConfidence`, `openQuestions`, `conflicts`, `confidentialNotes`) do **not** exist in public schemas, so a stray one fails the build.

Schema requirements (pseudocode; use the installed Astro version's Zod import):

```ts
// projects
{
  title: string, slug: string, summary: string (≤ 200 chars),
  kind: enum[...], deploymentState: enum['live','prototype','archived','concept'],
  group: enum[owner-approved groups], tags: string[], featured: boolean, featuredOrder?: number,
  startedAt?: string /^\d{4}(-\d{2})?$/, completedAt?: same,
  repoUrl?: url (https, github.com allowlist), liveUrl?: url (https),
  technologies: string[] (each must exist in skills collection),
  cover?: image(), screenshots: image()[] (≤ 6),
  videos: { src: string (starts '/media/video/'), poster: image(), startSeconds?: number, durationSeconds: number, sharedWith: reference('projects')[] }[],
  relatedProjects: reference('projects')[], relatedPatents: reference('patents')[],
  indexable: boolean, seoTitle?: string, seoDescription?: string (≤ 160 chars)
}
// patents: status enum excludes 'unknown' (unknown → field omitted); 'granted' requires grant.patentNumber + grant.grantDate (refine)
// articles: canonicalUrl required; republished=false forbids a body
```

Cross-collection rules, enforced by `scripts/validate-content.mjs` (it runs before `astro build`):

- every `technologies` entry exists in `skills.yaml`
- `deploymentState: live` requires `liveUrl`
- no public entry contains forbidden phrases: "patented", "patent holder", "granted" (unless the status is `granted`), "N/A", "TBD", "lorem", "coming soon"
- every image referenced exists
- every public entry's inventory id has `visibility` of `public-approved` or `public-source-verified`

## 4. Component responsibilities

| Component                          | Responsibility                                                        | Must not                                |
| ---------------------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| `ShelfScene`                       | Composes zones (design.md §2) in meaningful DOM order                 | Contain content facts                   |
| `ShelfObject`                      | Shared object behaviour (button/link/decorative variants)             | Be focusable when decorative            |
| `IdentityFrame`                    | Approved photo plus About trigger                                     | Use an unapproved image                 |
| `DrawerFront`                      | Native navigation anchor, enhanced state, modified-click preservation | Use colour for state                    |
| `DrawerTray`                       | Shared open container: heading, breadcrumb, close, scroll area        | Lock page scroll on desktop             |
| `FilterChips`                      | Single-select radio group of project groups; writes `?group`          | Show empty groups                       |
| `RecordTabs`                       | Section tablist inside records; stacked sections without JS           | Render a tab with no content            |
| `StatusPill`                       | Patent/deployment status as a pill with text (D-20)                   | Show a status that is not verified      |
| `ProjectFolder`                    | Manila folder, pictogram, title, facets; link to record               | Hide the title or facets behind hover   |
| `ProjectRecord` / `DeviceFrame`    | Case-study layout per board; screenshot inside a generic frame        | Render "N/A"; show a brand logo         |
| `PatentRegister` / `PatentDossier` | Ledger plus formal record                                             | Display unverified status               |
| `ExperienceTimeline`               | Timeline rail plus role cards                                         | Use colour as the only current-role cue |
| `WritingBooklet` / `BookSpines`    | Writing view (open booklet) plus category spines                      | Render categories without content       |
| `MediaViewer` / `VideoPoster`      | On-demand players, single playback                                    | Autoplay or preload video data          |
| `ShelfBreadcrumbs`                 | `<nav aria-label="Breadcrumb">` plus `BreadcrumbList` JSON-LD data    | Act as a site navbar                    |
| `PlinthIndex`                      | Plain links to drawers and records (only if D-14 approved)            | Appear at the top of the page           |
| `shelf-controller.ts`              | URL-derived state, history, focus, interruption                       | Hold content data                       |

## 5. Naming conventions

- Components: PascalCase `.astro` (or `.tsx` only if an island framework is justified).
- Content slugs and asset filenames: lowercase kebab-case, ASCII, no spaces. Note that the old portfolio has filenames with spaces and curly quotes (e.g. `Your Idea Won’t Speak.webp`). Rename the **copies**, never the originals.
- IDs: type-prefixed, stable, independent of titles (`proj-0007`).
- CSS custom properties: `--shelf-*`, `--drawer-*`, `--record-*`, `--motion-*`, `--ease-*`, `--z-*`, `--space-*`.
- No absolute or machine paths in any shipped file.

## 6. Asset processing workflow

1. The asset is `approved` in `media.csv` (ownership, licence, and privacy reviewed).
2. Copy the original into its destination (§2) under a kebab-case name.
3. Strip EXIF/location metadata from photos (keep attribution if required).
4. Images: let `astro:assets` generate sizes matched to display widths (e.g. folder peek 320/640, record hero 800/1280/1600) with explicit dimensions.
5. Videos: verify the codec is H.264/AAC MP4 for compatibility (re-encode only if needed), keep files under the per-file budget (8 MB unless the owner approves more), and generate a poster.
6. Captions: only from real transcripts (WebVTT).
7. Record `output_path` in `media.csv`.
8. Verify the asset loads in the production build (T-MED-01).
9. Unused assets are removed from the destination before release (`scripts/validate-content.mjs` reports orphans).

## 7. Video policy

No loading at page load. No autoplay. Poster plus play button. Player initialized on intent. Self-hosted only after the music/SFX licence is confirmed (D-07). Captions only when they are real. One video plays at a time. Never private cloud-drive URLs. Details: [micro-interactions.md](micro-interactions.md) §7.1.

## 8. Cabinet illustration

**Phase 2 clarification:** layered raster or SVG objects are permitted by design.md §14; genuine photos/screenshots remain unaltered. The cabinet and interactive controls are independent DOM/SVG elements. Raster-only restrictions below concern the cabinet and controls, not the already approved layered object-art option.

Layered HTML/CSS and inline SVG for the cabinet frame, shelf levels, drawer faces, handles, perspective edges, shadows, folders, and object silhouettes. Raster images may also be used for layered decorative object art per design.md §14; never flatten the interactive cabinet. Review any externally sourced SVG for scripts, external references, and event-handler attributes before use. Optimize SVGs (remove editor metadata) while keeping them readable.

## 9. Avoid overengineering

- D-44 permits pinned Three.js for the spatial scene. No physics or state-management library or CSS framework is required (the old site's Tailwind is not a reason to add one; if adopted, tokens still live in `tokens.css`).
- No generic design system with unused tokens.
- No duplicated content across components.
- No provenance or internal notes in any public output.

## Current preparation inputs (D-33 to D-35)

Use `content/inventory/implementation-policy.json` for the exact eight drawers and gate contract. Local preview media lives in `assets/review/projects/`; it must not be copied wholesale to public. Five clean badge PNGs are in `public/media/certifications/`. Credentials are in their own Certifications drawer; the open desk book hosts approved writing and albums. Preview eligibility is not publication approval. Required schema release checks still apply.
