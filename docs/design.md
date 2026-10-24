# THE SHELF — Visual Design Contract

**Project:** The Shelf
**Owner:** Ayush Jain
**Experience type:** single-page, interactive, drawer-based portfolio with stable crawlable record URLs
**Implementation:** Astro, TypeScript, CSS, and selective client-side islands
**Status:** approved concept direction. Visual reference: the concept board [reference/the-shelf-concept-board.png](reference/the-shelf-concept-board.png) (original at `context/The Shelf_ A Personal Portfolio Archive.png`). Final content comes only from the verified inventory, **never from the board's sample text**.
**Derived from:** `context/design.md` (2026 baseline). All baseline decisions are preserved. Additions are marked _(Phase 1)_.

Related contracts: [micro-interactions.md](micro-interactions.md) (interaction contract and tokens), [physics-and-interactions.md](physics-and-interactions.md) (simulated motion, lighting, physics architecture), [responsive-design.md](responsive-design.md) (layout modes and viewports), [content-inventory-template.md](content-inventory-template.md) (data), [asset-organization.md](asset-organization.md) (files), [seo-optimization.md](seo-optimization.md) (URLs and metadata).

---

## 0. Design invariants

### 0.0 Decision hierarchy _(Phase 1.1)_

When requirements conflict, resolve them in this order. Record the resolution in §0.2 or [open-decisions.md](open-decisions.md).

1. Truthful and safe presentation of professional information.
2. Accessibility and essential functionality.
3. The approved shelf and drawer concept.
4. Physical believability.
5. Responsive usability.
6. Performance.
7. Decorative effects.

Example: a physics behaviour that hides content when interrupted loses to accessibility (2 over 4), so drawer content follows the logical state, not the visual pull ([physics-and-interactions.md](physics-and-interactions.md) §4.9).

These rules must not change without explicit owner approval, recorded in [open-decisions.md](open-decisions.md). Any pull request that breaks one fails review.

| ID     | Invariant                                                                                                                                                                                                                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV-01 | The interface is an illustrated shelf/cabinet. It is the information architecture, not a decorative image.                                                                                                                                                                                                                            |
| INV-02 | No conventional navigation bar (no top bar, hamburger menu, side nav, or dock). The shelf is the navigation surface.                                                                                                                                                                                                                  |
| INV-03 | No headline counters ("30+ projects", "9 patents", "3 internships") on the home scene, in page titles, meta descriptions, OG images, or structured data. Inside an **opened** drawer, the header may show a count computed from the published records (e.g. "Projects — 24 Builds", as on the concept board). It is never hard-coded. |
| INV-04 | The cabinet remains recognizable in every state: home, drawer open, record open, mobile sheet, 404.                                                                                                                                                                                                                                   |
| INV-05 | Interface chrome is monochrome. Colour comes only from authentic assets (§3.2).                                                                                                                                                                                                                                                       |
| INV-06 | Authentic screenshots, photos, and videos are never recoloured, desaturated, or tinted to fit the shell.                                                                                                                                                                                                                              |
| INV-07 | The identity/photo frame is present in the scene and uses a real, approved photo (D-05).                                                                                                                                                                                                                                              |
| INV-08 | Only one primary surface (drawer or record) is open at a time. No stacked modals.                                                                                                                                                                                                                                                     |
| INV-09 | All meaningful content exists as server-rendered HTML at a stable URL. Nothing important exists only in JavaScript state.                                                                                                                                                                                                             |
| INV-10 | No autoplay video, no autoplay sound, no continuous or looping animation by default.                                                                                                                                                                                                                                                  |
| INV-11 | Everything reachable by pointer is reachable by keyboard and touch. Hover is never the only way to see information.                                                                                                                                                                                                                   |
| INV-12 | The site is fully usable with `prefers-reduced-motion: reduce` and with animation disabled.                                                                                                                                                                                                                                           |
| INV-13 | No fabricated facts, media, links, dates, metrics, statuses, or placeholder claims on the public site.                                                                                                                                                                                                                                |
| INV-14 | Patent status uses exact legal terminology. "Filed" and "published" are never presented as "granted" or "patented".                                                                                                                                                                                                                   |
| INV-15 | Exactly eight required drawers remain present (D-34); optional empty categories and sections are omitted.                                                                                                                                                                                                                             |
| INV-16 | Desktop is the primary art direction. Mobile is a purposeful reinterpretation, not a scaled screenshot.                                                                                                                                                                                                                               |
| INV-17 | Do not claim the concept is unprecedented. Originality comes from execution, illustration, interaction quality, and content.                                                                                                                                                                                                          |
| INV-18 | Never display age, date of birth, or any identity-document data. No government IDs, marks, roll numbers, compensation, or signatures appear anywhere on the site.                                                                                                                                                                     |
| INV-19 | Every functional object (drawers, laptop, Writing spines, identity frame, pinned links) works through a plain click, tap, or Enter/Space. Physics is an enhancement, never a requirement ([physics-and-interactions.md](physics-and-interactions.md) §1).                                                                             |

### 0.1 The concept board

[reference/the-shelf-concept-board.png](reference/the-shelf-concept-board.png) is the approved visual reference. It has 10 panels: home scene, Projects drawer (opened), Project detail, Patents drawer, Patent detail, Experience drawer, Experience detail, Other drawers, Writing (Books / Blogs), and Responsive view.

How to use it:

- **Composition, object set, layout, and component anatomy** come from the board.
- **Behaviour, accessibility, states not drawn, and data rules** come from this text and [micro-interactions.md](micro-interactions.md).
- **All text on the board is sample data**: names, numbers, counts, dates, companies, bullets, and checklist items. Never copy it into content. Some samples contradict the sources, and one names an employer's client (S-08).
- Where the board and the original text contract disagree, §0.2 decides. Items marked _decision_ wait for the owner and use the stated default meanwhile.

### 0.2 Board ↔ text reconciliation

| #     | Topic                          | Original text contract                           | Concept board                                                                                                                                   | Resolution                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-01 | Palette                        | White paper, neutral greys                       | Warm cream paper, warm-grey ink, soft beige shading                                                                                             | **Follow the board.** Warm-neutral monochrome tokens (§3.2). Still monochrome: one hue family.                                                                                                                                                                                                                                                                                                          |
| BR-02 | Illustration style             | Crisp, architectural line art                    | Hand-drawn ink lines with a soft warm wash                                                                                                      | **Follow the board** (§3.1). Interactive parts (drawer fronts, labels, chips, buttons) stay HTML/CSS; complex objects may be raster or SVG illustrations in the same style.                                                                                                                                                                                                                             |
| BR-03 | Shapes                         | 2px radii; no pills; no large rounded cards      | Rounded drawer fronts, rounded panels, pill chips and badges, rounded buttons                                                                   | **Follow the board** (§3.4).                                                                                                                                                                                                                                                                                                                                                                            |
| BR-04 | Display type                   | One sans for everything                          | Bold display serif for the "THE SHELF." wordmark and the name; sans for UI                                                                      | **Follow the board** (§3.3).                                                                                                                                                                                                                                                                                                                                                                            |
| BR-05 | Wordmark and identity          | Name as the most prominent text                  | "THE SHELF." wordmark, byline "A personal archive by Ayush Jain.", tagline, four focus chips                                                    | **Follow the board.** The h1 contains both wordmark and name (§4.1, [seo-optimization.md](seo-optimization.md) §5.1). Tagline and chips need owner-approved, evidenced wording (D-21).                                                                                                                                                                                                                  |
| BR-06 | Drawer set                     | 8 recommended, including Writing                 | 8 drawers: Projects, Patents, Experience, Clubs & Leadership, Education, Skills & Toolbox, Achievements, Currently Building. No Writing drawer. | **Follow the board** (§5.1). Writing is reached through the book spines (BR-07). Empty drawers still are not rendered (INV-15, D-03).                                                                                                                                                                                                                                                                   |
| BR-07 | Writing entry                  | Globe/books area (text); booklet (Phase 1 brief) | Crown book spines; Writing view is an open booklet "My Writings" beside category spines (Articles, Notes, Ideas, Builds)                        | **Follow the board.** Spines open Writing. The open booklet is the Writing view. The globe only spins (D-04, proposed resolution).                                                                                                                                                                                                                                                                      |
| BR-08 | Counts                         | "No counters on the homepage"                    | Opened-drawer headers show counts                                                                                                               | Allowed inside opened drawers only, computed (INV-03).                                                                                                                                                                                                                                                                                                                                                  |
| BR-09 | Folder face art                | Real screenshot peek (Phase 1 idea)              | Manila folder with a centred pictogram tinted lavender-blue                                                                                     | _Decision D-19._ Default: monochrome line pictogram per category on a manila-tone folder. The screenshot appears only in the record.                                                                                                                                                                                                                                                                    |
| BR-10 | Status badges                  | No colour for status                             | Green "Published", yellow "Filed" pills                                                                                                         | _Decision D-20._ Default: monochrome pill badges where state is carried by the text plus an outline style. The board's tints are the alternative.                                                                                                                                                                                                                                                       |
| BR-11 | Experience layout              | Personnel folders, "not a résumé timeline"       | Vertical timeline rail with node markers and stacked role cards                                                                                 | **Follow the board** (§8.1). The cards keep folder styling.                                                                                                                                                                                                                                                                                                                                             |
| BR-12 | Record layout                  | Stacked sections                                 | Tabs: Overview / Tech Stack / Architecture / Gallery (projects); Abstract / Novelty / Use Cases / Timeline (patents); action buttons            | **Follow the board** (§6.5, §7.3). Tabs appear only for sections with content. Without JS they render as stacked sections.                                                                                                                                                                                                                                                                              |
| BR-13 | Additional desk objects        | Mug, pen, cube                                   | Also desk lamp, closed laptop, hanging plant, potted plant on stacked books; mug carries an "AJ." monogram                                      | **Follow the board** for the object set. Superseded in part by the Phase 1.1 brief: the **laptop is functional** (résumé and original portfolio, BR-19) and the **lamp is a switch** that drives scene lighting (BR-20). Others are decorative or toy objects ([physics-and-interactions.md](physics-and-interactions.md) §1). The laptop shows **no brand logo** (the board's logo is not reproduced). |
| BR-14 | Identity frame                 | Owner's real photo                               | Frame shows a landscape picture                                                                                                                 | **Keep the text rule** (INV-07). The board's picture is a placeholder for the approved photo (D-05).                                                                                                                                                                                                                                                                                                    |
| BR-15 | Social links                   | Side spines/tabs                                 | Not shown                                                                                                                                       | **Phase 1.1 brief:** a **pinned area** for GitHub, LinkedIn, X, and Instagram. The pins sit beside the Currently Building note, as small pinned cards with pushpins. Only verified URLs are pinned (D-25).                                                                                                                                                                                              |
| BR-16 | Contact / Work with me         | Required by the Phase 1 brief                    | Not shown                                                                                                                                       | _Decision D-13._ Default: About record carries contact links. The business-card holder is added only if approved.                                                                                                                                                                                                                                                                                       |
| BR-17 | "Select a drawer" hint         | Required                                         | Not shown                                                                                                                                       | Keep it: one small line under the cabinet, in graphite.                                                                                                                                                                                                                                                                                                                                                 |
| BR-18 | Mobile                         | Stacked compact cabinet with objects             | Wordmark plus a vertical list of full-width drawer buttons (icon, label, chevron)                                                               | **Follow the board** for the drawer list ([responsive-design.md](responsive-design.md) §6). Identity, a reduced crown strip, and contact stay above or below the list.                                                                                                                                                                                                                                  |
| BR-19 | Laptop                         | Not in the text                                  | Closed laptop on the desk                                                                                                                       | **Phase 1.1 brief:** it opens (hinge) to a laptop panel with the résumé preview and download, plus "Open original portfolio" ([physics-and-interactions.md](physics-and-interactions.md) §4.3, D-23, D-24).                                                                                                                                                                                             |
| BR-20 | Lamp                           | Not in the text                                  | Lit desk lamp                                                                                                                                   | **Phase 1.1 brief:** an on/off switch driving the pre-authored lighting layers ([physics-and-interactions.md](physics-and-interactions.md) §3, §4.2). It is not a theme switch.                                                                                                                                                                                                                         |
| BR-21 | Drawer list vs Phase 1.1 brief | —                                                | 8 drawers (BR-06)                                                                                                                               | The brief lists Projects, Patents, Experience & internships, Education, Certifications & professional development, Skills & achievements, Articles & writing, and Other records, and asks that their placement be justified. §5.1 maps each to the board's 8 drawers.                                                                                                                                   |

---

## 1. Product vision

The Shelf is a personal digital archive whose **information architecture and interaction model are based on a physical shelf/cabinet (almirah)**. It is not a conventional portfolio with a shelf picture on top.

The visitor first sees one coherent illustrated scene. Drawers are the primary navigation. Opening a drawer reveals a collection format suited to that content. Opening an item reveals its detailed record, and the visitor is still clearly inside the same cabinet.

The desired impression:

- crafted and surprising, but not confusing
- editorial, tactile, architectural, and personal
- predominantly monochrome, with selective authentic colour
- playful through a few meaningful desk objects, not through constant animation
- professional enough for recruiters, engineering leaders, founders, freelance clients, and technical audiences
- lightweight, responsive, accessible, searchable, and shareable

**In one sentence:** a visitor discovers Ayush through an illustrated shelf, pulls out a drawer, browses physical-feeling folders or documents, and opens a detailed project, patent, experience, or writing record.

### 1.1 The 10-second test _(Phase 1)_

Within 10 seconds on a 1366×768 laptop, without scrolling or interacting, a first-time visitor must be able to answer:

1. Whose site is this? (name visible)
2. What does this person do? (one- or two-line intro visible)
3. How do I explore? (labeled drawers plus the hint "Select a drawer to explore")
4. How do I contact them? (a visible contact affordance: the social tabs, the identity frame that opens About, or the business-card holder if D-13 is approved)

If any answer requires a click, the composition fails. This test is acceptance test T-DES-01 in [implementation-and-validation.md](implementation-and-validation.md).

---

## 2. Scene anatomy

The geometry follows the home panel of the concept board (§0.1). The zones below carry the meaning of the scene. Proportions are tuned against the board; the zones and their roles are fixed.

```text
┌──────────────────────────────── viewport (desktop) ─────────────────────────────────┐
│ IDENTITY COLUMN        ┌──── CROWN (top shelf) ───────────────────────┐  lamp         │
│ THE SHELF. ✦           │ book spines · globe · identity frame         │  hanging      │
│ A personal archive by  ├──── DRAWER BANK (2 × 4) ─────────────────────┤  plant        │
│ Ayush Jain.            │ [▢ Projects      ›] [▢ Patents           ›]  │ ┌──────────┐  │
│ ───                    │ [▢ Experience    ›] [▢ Clubs & Leadership›]  │ │Currently │  │
│ tagline (2 lines)      │ [▢ Education     ›] [▢ Skills & Toolbox  ›]  │ │Building  │  │
│ (chip) (chip)          │ [▢ Achievements  ›] [▢ Currently Building›]  │ │ note     │  │
│ (chip) (chip)          └──────────────────────────────────────────────┘ │ pinned   │  │
│ plant on books     DESK: Rubik's cube · laptop · pen · "AJ." mug        │ links    │  │
│                    hint: "Select a drawer to explore"                                 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

| Zone                 | Contents                                                                                                                                                                              | Role                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Identity column      | Wordmark "THE SHELF." with sparkle, byline with the name (together the h1), owner-approved tagline, up to 4 focus chips (D-21), potted plant on stacked books (decorative)            | Answers "who" and "what"                       |
| Crown                | Writing book spines (BR-07), globe, identity frame (D-05), **desk lamp (switch; scene light source)**, hanging plant (decorative)                                                     | Writing entry, identity, lighting, personality |
| Drawer bank          | 8 drawer fronts in 2 columns × 4 rows (BR-06, D-03): icon, label, chevron, handle                                                                                                     | Primary navigation                             |
| Pinned area          | "Currently Building" paper note with pushpin and checklist (D-12), plus **pinned link cards** for GitHub, LinkedIn, X, and Instagram (verified URLs only, D-25), right of the cabinet | Current activity; verified identity links      |
| Desk surface         | **Laptop (functional: résumé and original portfolio)**, Rubik's cube, pen, mug with "AJ." monogram                                                                                    | Résumé access; delight                         |
| Business-card holder | Only if D-13 is approved; placed on the desk surface                                                                                                                                  | Work with me / contact                         |
| Plinth               | Optional plain-link index (D-14)                                                                                                                                                      | Accessibility and crawlability                 |

**DOM order** (which is also focus order) follows meaning, not visual layering: skip link → identity column (h1, tagline, chips) → drawer fronts (row by row, left to right) → pinned area (Currently Building note, then link cards) → open desk book → identity frame → laptop → lamp → globe → cube, then functional contact pen → plinth index. CSS positions elements; the DOM order never follows the illustration's z-order.

---

## 3. Visual art direction

### 3.1 Overall style

A hand-drawn, editorial shelf illustration with physical depth, as on the concept board (BR-02):

- confident ink outlines with a slight hand-drawn quality, plus a soft warm wash for shading (no hard gradients)
- restrained perspective (a near-frontal elevation, with the view slightly above the drawer bank)
- clearly separated shelf levels and drawer faces
- visible, consistent drawer handles or finger pulls
- layered edges, inner drawer shadows, and small paper/folder details
- objects that feel placed, not scattered
- generous white space around the cabinet
- readable labels on drawer fronts
- selective tactile detail, without excessive grain, skeuomorphic clutter, or photoreal wood

It should feel like an illustrated designer's workbench or archive, not an antique shop, an operating-system desktop, or a furniture store page.

### 3.2 Colour strategy

**Warm-neutral monochrome cabinet, authentic colour** (BR-01). The interface uses one warm hue family (cream paper, beige shading, warm-grey to near-black ink). Real work supplies the colour.

Phase 2 checked the board histogram and measured the token contrast. The board contains warm photographic washes rather than one exact palette; retain these stable tokens. Ink and graphite pass normal-text contrast on all four paper surfaces. Edge passes 3:1 on paper/canvas/muted-paper but only 2.69:1 on manila; use graphite for meaningful manila boundaries. Measured values are in the Phase 2 validation report; browser-rendered contrast still needs T-A11Y-03.

| Token                 | Value (estimate)      | Use                                                       | Contrast note                                      |
| --------------------- | --------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| `--shelf-canvas`      | `#F4EEE3`             | Page background behind the scene                          | —                                                  |
| `--shelf-paper`       | `#FBF8F2`             | Panels, trays, record sheets, drawer fronts               | —                                                  |
| `--shelf-muted-paper` | `#EFE6D6`             | Drawer interiors, selected card tint, beige shading       | —                                                  |
| `--shelf-manila`      | `#EAD9B8`             | Folder bodies and tabs                                    | Decorative fill. Text on it must still meet 4.5:1. |
| `--shelf-ink`         | `#1C1A17`             | Text, outlines, filled primary buttons and selected chips | about 16:1 on paper                                |
| `--shelf-graphite`    | `#5E574D`             | Secondary text, metadata                                  | about 6.7:1 on paper, about 6.2:1 on canvas        |
| `--shelf-divider`     | `#E3D9C8`             | Decorative rules only                                     | **Not** for meaningful boundaries (below 3:1)      |
| `--shelf-edge`        | `#8C8377`             | Meaningful boundaries (chips, inputs, outlined buttons)   | about 3.5:1 on paper, about 3.2:1 on canvas        |
| `--shelf-shadow`      | `rgba(60,45,25,0.14)` | Depth (warm shadow)                                       | —                                                  |
| `--shelf-focus`       | `#315E8A`             | Focus indicator (the only non-asset hue in the UI chrome) | about 6.4:1 on paper, about 5.9:1 on canvas        |

Colour outside the warm-neutral family is **allowed** only for:

- real project screenshots and product UI, including inside device frames
- project demo video
- the owner's real profile photo
- the plants (one restrained green family)
- the globe's map (muted)
- the stickers on the Rubik's cube
- real cover artwork, real diagrams, real patent document thumbnails, and organizations' own logos where their use is reasonable
- the focus indicator
- folder pictograms and status badges **only if** the owner chooses the board's tinted variants (D-19, D-20)

Otherwise colour is **forbidden** for drawer labels, buttons, borders, hover states, category chips, and backgrounds. State and category are communicated through shape, fill (ink vs paper), weight, position, depth, and text, never through hue alone.

**Dark mode:** none at launch. The paper metaphor is light. Respect `forced-colors: active` (Windows High Contrast): outlines must survive, and illustration washes may disappear.

### 3.3 Typography

- **Display serif** (bold, high-contrast, as on the board, BR-04) for the "THE SHELF." wordmark and the "Ayush Jain." byline only.
- **Sans-serif** (highly legible, bold weight available) for drawer labels, headings, body, chips, and buttons.
- **Monospace**, optional, for application numbers and record IDs. If omitted, use the sans with tabular figures.
- At most three families, self-hosted, subset, and openly licensed (never the trial font found in BuildLog, S-04). Load only the weights in use.

| Role                               | Face       | Size (fluid)                                    | Notes                                                 |
| ---------------------------------- | ---------- | ----------------------------------------------- | ----------------------------------------------------- |
| Wordmark "THE SHELF."              | Serif      | `clamp(2.5rem, 1.5rem + 3.5vw, 4.25rem)`        | Part of the h1. Two lines on desktop as on the board. |
| Byline with name                   | Serif      | `clamp(1.375rem, 1rem + 1.2vw, 2rem)`           | Part of the h1. Visible without scrolling.            |
| Tagline                            | Sans       | `clamp(1rem, 0.9rem + 0.4vw, 1.125rem)`         | At most 2 lines, max 36ch                             |
| Drawer label                       | Sans, bold | `1rem`–`1.25rem`, sentence case as on the board | Never below 15px computed                             |
| Tray title ("Projects — N Builds") | Sans, bold | `1.125rem`–`1.375rem`                           |                                                       |
| Record title (h2)                  | Sans, bold | `clamp(1.5rem, 1.1rem + 1.5vw, 2.25rem)`        |                                                       |
| Body                               | Sans       | `1rem`–`1.0625rem`, line-height 1.55–1.65       | max 68ch                                              |
| Chips, badges, metadata            | Sans/mono  | `0.8125rem`–`0.875rem`                          | Never below 12px computed                             |

Interactivity is never signalled by font weight alone. Use outline, handle, cursor, focus ring, and accessible name.

### 3.4 Spacing, borders, depth, layering

- Spacing scale (CSS custom properties): `--space-1: 4px` through `--space-8: 64px` on a 4/8 rhythm. Use the scale, not ad-hoc values.
- Borders: 1px `--shelf-ink` for cabinet structure, 1px `--shelf-edge` for interactive boundaries on paper; graphite on manila, 1px `--shelf-divider` for decorative ruling only.
- Radius (BR-03, from the board): `--radius-sm: 6px` (buttons, inputs), `--radius-md: 10px` (drawer fronts, cards, folder corners), `--radius-lg: 16px` (trays, record sheets, panels), `--radius-pill: 999px` (chips, status badges). Drawer handles are drawn shapes, not radii.
- Buttons, from the board's record panels: **primary** = ink fill with paper text plus a ↗ icon for external links (e.g. "Live Demo", "View Document"); **secondary** = paper fill with an `--shelf-edge` outline (e.g. "GitHub", "Video", "Official Record").
- Chips: outlined pills with optional leading line icon. **Selected** chip = ink fill with paper text (e.g. "All" on the board).

Depth communicates state, not decoration:

| State              | Treatment                                                                             |
| ------------------ | ------------------------------------------------------------------------------------- |
| Closed drawer      | Fine edge plus subtle inset shadow                                                    |
| Hover/focus drawer | Small forward lift (2–4px) plus a slightly stronger shadow                            |
| Open drawer        | Visible pull toward the viewer, with a clear inner cavity                             |
| Selected folder    | Raised edge or offset paper layers                                                    |
| Open record        | White document surface, clearly separated from the drawer by a strong but soft shadow |

Layering tokens (z-index). Use only these:
`--z-scene: 0` · `--z-object-active: 10` · `--z-drawer-open: 20` · `--z-tray: 30` · `--z-record: 40` · `--z-media: 50` · `--z-toast: 60`

Avoid extreme blur, giant floating glass cards, and neumorphism. `backdrop-filter` is not used.

---

## 4. Homepage composition

### 4.1 Initial viewport

At 1280×720 and above, all of the following are visible **without scrolling**:

1. the wordmark and byline with the owner's name, and the tagline
2. the cabinet, with **every drawer label** readable
3. the identity frame and the crown objects
4. the desk objects
5. pinned social profile cards
6. the hint "Select a drawer to explore"
7. the Currently Building note, only when verified content exists (D-12)

No navbar, no KPI strip, no counters, no hero banner, no cookie wall (there are no cookies, D-09).

Visual hierarchy (in order of first attention, as on the board): wordmark → cabinet silhouette → drawer labels → name → tagline and chips → crown objects → note → desk objects → socials → hint.

### 4.2 First-screen copy

Structure from the board. **The board's words are samples**, and the owner must approve the final copy:

- `h1`: "THE SHELF." (wordmark) + "A personal archive by Ayush Jain." (byline). Both are inside one `<h1>`, so the name is always part of the main heading.
- Tagline: up to 4 short role words. The board's sample is "Engineer. Builder. Inventor. System Thinker." "Inventor" may be used only once the owner is verified as a named inventor on at least one application (INV-14 still forbids "patent holder").
- Focus chips: up to 4 (the board shows Full-Stack, GenAI, System Design, Innovation). Each must be evidenced by at least one record (D-21).

No unverified titles, awards, or claims.

### 4.3 Identity frame

- A visible photo frame or pinned identity card that is part of the illustration, not a giant hero portrait.
- Uses the approved real photo (D-05), in natural colour, inside a monochrome frame.
- **Activation** opens the About record: summary, education link, résumé link (only after privacy review, S-03), contact, social links, and a link to Work with me (D-13).
- If no About record is approved, the frame stays but becomes decorative (`aria-hidden="true"` on the art, with no button).

### 4.4 Objects, roles, and behaviour

Each object has exactly one role. Its interaction contract is in [micro-interactions.md](micro-interactions.md) §8. Its motion and lighting model is in [physics-and-interactions.md](physics-and-interactions.md) §4. Class: **D** decorative · **I** interactive · **F** functional (reveals content or links) · **P** physics-driven · **E** environment-responsive (lamp light).

| Object                        | Zone                   | Class   | Role                                                                                                                       | Activates                                                             | Colour                                 |
| ----------------------------- | ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| Identity frame                | Crown                  | I F E   | Identity                                                                                                                   | About record                                                          | Photo only                             |
| Book spines                   | Crown                  | I F E   | **Writing entry** (BR-07, D-04). One spine per category with content (the board shows Blogs, Notes, Ideas, plus one more). | Writing booklet at that category                                      | Warm monochrome                        |
| Globe _(the rotating object)_ | Crown                  | I P E   | Curiosity delight: a real sphere you can spin                                                                              | Drag or keys rotate it (inertia). Does not navigate.                  | Muted map colours                      |
| Desk lamp                     | Crown (right)          | I E     | **Light switch** for the scene (BR-20)                                                                                     | Toggles lamp lighting on and off                                      | Warm monochrome; warm light pool       |
| Hanging plant; plant on books | Crown; identity column | D P E   | Life accent                                                                                                                | Hover sway only. Optional "Currently learning" only if maintained.    | One green family                       |
| Currently Building note       | Pinned area            | I F E   | Current activity (D-12)                                                                                                    | Currently Building drawer                                             | Warm monochrome                        |
| Pinned link cards             | Pinned area            | I F     | Verified GitHub, LinkedIn, X, Instagram (BR-15, D-25)                                                                      | External profile (new tab)                                            | Monochrome; platform icon in ink       |
| Laptop (no brand logo)        | Desk                   | I F P E | **Résumé and original portfolio** (BR-19)                                                                                  | Lid opens → laptop panel                                              | Warm monochrome; screen glow when open |
| Coffee mug ("AJ." monogram)   | Desk                   | D E     | Atmosphere; stable collider for the pen                                                                                    | Steam on hover only                                                   | Warm monochrome                        |
| Pen                           | Desk                   | I F E   | Contact-message entry                                                                                                      | Message composer; mail-app/copy fallback until delivery is configured | Warm monochrome                        |
| Rubik's cube                  | Desk                   | I P E   | Toy                                                                                                                        | Spin and turn it; activation plays a turn sequence (D-26)             | Sticker colours only                   |
| Business-card holder          | Desk                   | I F     | Work with me / contact. Only if D-13 is approved.                                                                          | Work-with-me record                                                   | Warm monochrome                        |
| Focus chips                   | Identity column        | I F     | Quick entry into evidenced areas (D-21)                                                                                    | Projects drawer filtered to the matching group                        | Outlined pills                         |

Object rules:

- Include an object only if an approved asset exists or it can be drawn in the same style. Never mix styles (no stock clip-art, no emoji, no photoreal renders).
- Decorative objects (mug, plants without content, stacked books) are `aria-hidden="true"` and not focusable. The cube may become decorative in reduced-motion mode; the functional pen remains operable.
- No third-party brand marks in the illustration (e.g. the board's laptop logo is not reproduced).
- Interactive objects are real `<button>` or `<a>` elements with accessible names stating what happens (e.g. "Open writing: Articles", "Open laptop: résumé and original portfolio", "Desk lamp").
- An object never blocks or overlaps a drawer label or another control at any breakpoint.
- The globe does **not** imply travel history.
- The Currently Building note never fakes a live feed and shows a "last updated" date only when real.
- Pinned links use verified URLs only. Instagram is pinned only once the owner confirms the exact URL (D-25). Never use the `uaryushjain` typo variants (C-22).
- Every functional object has a plain activation path (INV-19).

---

## 5. Drawer architecture

### 5.1 Drawer set

Owner-approved final order (D-34): **About Me · Projects · Patents · Experience · Education · Achievements · Skills & Toolbox · Certifications**. Use the latest reference `reference/refrance2.0.png` for visual direction; exact owner labels override image annotations. The **open book on the desk** opens writing, notes, articles and approved photo albums.

Drawers are data-driven (`src/data/drawers.ts`). Required drawers with no release-approved records use a purposeful empty content surface; optional empty sections are omitted (D-34). All eight required fronts remain present. Memories is an optional book category, never a drawer. Leadership sits within Experience; credentials sit exclusively in Certifications. See D-34.

Layout: 2 columns × 4 rows on desktop and tablet; a single-column list on mobile ([responsive-design.md](responsive-design.md) §6). Drawer fronts are equal size. Each front has a line icon on the left, the label, a chevron (›) on the right, and a drawn handle centred below the label, as on the board.

#### 5.1.1 Information architecture and justification _(Phase 1.1)_

The Phase 1.1 brief lists eight content areas (BR-21). Each is placed by its **actual volume** ([workspace-audit.md](workspace-audit.md) §3) and by the board's eight slots. No drawer is added just to add interaction.

| Brief's area                              | Placement                                                                                                                                   | Why                                                                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projects                                  | **Projects** drawer                                                                                                                         | 31 candidates. The largest collection; filter chips plus featured order (§6).                                                                                                          |
| Patents                                   | **Patents** drawer                                                                                                                          | 8 applications (5 with official evidence). A distinct register format (§7).                                                                                                            |
| Professional experience & internships     | **Experience** drawer (Internships & work)                                                                                                  | 3 roles. DistrictD's type is pending (D-28).                                                                                                                                           |
| Education                                 | **Education** drawer                                                                                                                        | 2 records. Thin, but expected by recruiters, and the board has the slot.                                                                                                               |
| Certifications & professional development | **Achievements** drawer → "Credentials" section                                                                                             | 15 low-weight course completions and badges, none a professional certification (§3.11). A separate drawer would over-weight them. The section is data-driven and updated continuously. |
| Skills & achievements                     | **Skills & Toolbox** drawer (skills, linked to evidence) + **Achievements** drawer (results, awards, badges)                                | The board separates them. Skills are an index into evidence; achievements are records.                                                                                                 |
| Articles & writing                        | **Writing booklet** via the open desk book (not a drawer)                                                                                   | 3 external articles. The booklet is the brief's editorial object.                                                                                                                      |
| Other relevant professional records       | **Clubs & Leadership** drawer (GDG co-organizer, Hackwave 2.0 organizer, Exora lead, Hackster mentor) and the **Currently Building** drawer | Leadership roles are evidenced (§3.7). "Other records" with no content get no drawer.                                                                                                  |
| Résumé                                    | **Laptop** (not a drawer)                                                                                                                   | A single document with a functional object of its own (BR-19).                                                                                                                         |

#### 5.1.2 Per-drawer specification

| Drawer           | Contents (record types)                     | Interior structure                         | Folder or record label                        | Sorting                           | Search / filter                                      | Empty state                                 |
| ---------------- | ------------------------------------------- | ------------------------------------------ | --------------------------------------------- | --------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| About Me         | Identity and professional introduction      | About record                               | Name + introduction                           | Single record                     | None                                                 | Public-safe introduction                    |
| Projects         | Projects                                    | Manila folders in a grid; chips            | Name + "Domain · Tech"                        | Featured order, then newest       | Chips by group + search                              | Not rendered (INV-15)                       |
| Patents          | Patent applications                         | Ruled register → dossier                   | Display title + application no. + status pill | Filing date, newest first         | Search by title or number when > 8 records; no chips | Not rendered                                |
| Experience       | Internships, employment, trainee programme  | Timeline rail + role cards                 | "Org — Role" + dates                          | Start date, newest first          | None (small set)                                     | Not rendered                                |
| Education        | Degrees, schooling                          | Academic index cards                       | Institution + programme                       | End year, newest first            | None                                                 | Not rendered                                |
| Skills & Toolbox | Skills grouped by category                  | Compartment tray of tags; "Used in:" links | Skill name                                    | Category order, then alphabetical | Category tabs if more than 6 categories              | Not rendered                                |
| Achievements     | Results, awards and open-source activity    | Result cards                               | Title + sourced result + date                 | Newest first                      | Type                                                 | Truthful empty surface if no public entries |
| Certifications   | Courses, training, badges and participation | Credential sheets                          | Exact title + issuer + date + kind            | Newest first                      | Kind                                                 | Truthful empty surface if no public entries |

Drawer interaction states are common to all drawers (§5.2–§5.4). Record layouts are in §6–§9.

### 5.2 Drawer front states

| State         | Visual                                                                                                                      | Required semantics                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Rest          | Icon, label, chevron, and handle visible; paper fill, `--radius-md`, warm shadow                                            | `<a href="/<drawer>/">`; enhancement may add `aria-expanded`/`aria-controls` (icon and chevron are `aria-hidden`) |
| Hover         | Lift 2–4px; shadow up one step; label stable                                                                                | —                                                                                                                 |
| Focus-visible | Hover visual **plus** a 2px `--shelf-focus` outline with 2px offset                                                         | Same as rest                                                                                                      |
| Pressed       | Brief 1px push-in (no bounce)                                                                                               | —                                                                                                                 |
| Opening       | Drawer pulls out; cavity appears; tray content fades in during the last 40% of the motion                                   | `aria-expanded="true"` set at the **start**                                                                       |
| Open          | Drawer front shows an "open" marker (handle rotated or a label underline); others at 55% opacity, still operable on desktop | `aria-expanded="true"`                                                                                            |
| Closing       | Reverse of opening                                                                                                          | `aria-expanded="false"` set at the start                                                                          |
| Disabled      | **Not used.** A drawer with no content is not rendered.                                                                     | —                                                                                                                 |

Motion timings and easing: [micro-interactions.md](micro-interactions.md) §2 tokens.

### 5.3 Open drawer (the tray)

- On desktop and tablet, the open drawer becomes a **tray**: a panel anchored to its drawer front, in front of the lower cabinet (`--z-tray`), at most the cabinet width plus 10%, with height up to `100dvh` minus the identity block.
- On the board the tray is the drawer itself, pulled out, with its contents standing inside (folders upright in the Projects drawer).
- Tray header, as on the board: a back chevron button (‹, accessible name "Close Projects drawer"), the title with a computed count ("Projects — N Builds", "Patents — N Records", "Experience — N Roles"; INV-03), and a search icon button on the right that expands the search field. The title is the tray's h2.
- A breadcrumb (`Shelf / Projects`) appears on records (board: "‹ Projects / Arogya"). In the tray the back chevron serves the same purpose.
- The rest of the cabinet stays visible around the tray. It is dimmed to 55% opacity (no blur) and remains clickable on desktop. Clicking another drawer switches drawers.
- Tray contents scroll inside the tray when needed. The page itself does not scroll-jump.
- Mobile behaviour differs ([responsive-design.md](responsive-design.md) §6).

### 5.4 States every drawer must design for

| State                     | Design                                                                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading                   | Content is server-rendered, so there is normally no loading state. If a record's media is loading, reserve its exact box and show a paper-texture skeleton. Never show a spinner over the whole tray. |
| Populated                 | Drawer-specific layout (§6–§9)                                                                                                                                                                        |
| Empty after filtering     | Index card: "No folders match '<query>'." plus a "Clear search and filters" button                                                                                                                    |
| Empty drawer              | Not rendered (INV-15)                                                                                                                                                                                 |
| Error (e.g. media failed) | Inline paper slip: "This video couldn't load." plus a link to the file or source if available. The rest of the record remains usable.                                                                 |

---

## 6. Projects drawer

### 6.1 Purpose

The verified project archive. Discovery found 31 project directories (see [workspace-audit.md](workspace-audit.md) §3.3). The published set is whatever the inventory marks `public-approved` (D-06). The tray header shows the computed count of published projects (INV-03); the home scene shows none.

### 6.2 Scaling to many folders _(Phase 1)_

The board shows six folders in a 3 × 2 grid with filter chips above. Thirty folders in one unordered grid would overcrowd the drawer, so scale comes from **order plus filter chips**:

- **Filter chips** (board: "All, GenAI, Full-Stack, Web3, Research") sit in a row under the tray header. **All** is selected by default, as on the board. Groups come from verified metadata. Candidates derived from `MASTER-PROJECT-PLAN.md` types: _AI_, _Full-Stack_, _Web3_, _Healthcare_, _Tools & productivity_, _Early work_. Final groups need owner approval. A chip appears only if its group has records.
- **Order:** owner-defined featured order first, so the first rows of _All_ always show the strongest work. Then newest first. Beginner exercises sit last, or behind the _Early work_ chip (D-06).
- Each folder belongs to exactly one primary group. Additional tags are search terms, not extra chips.
- **Search:** the header's search icon expands one text field ("Search projects"). It searches title, aliases, summary, and technologies within the selected chip.
- **URL state:** chip and query are reflected as `?group=ai&q=rag` so a filtered view is shareable. The default view has no query string.
- **Without JavaScript:** every folder is present in the server-rendered HTML ([seo-optimization.md](seo-optimization.md) §4). Groups render as labeled sections in order, and chips and search are hidden. Both are progressive enhancements.
- **Related projects:** the record's "See also" slip lists up to three related folders by shared group, shared BuildLog episode, or an explicit owner-defined relation. It never uses fuzzy title matching.

### 6.3 Folder appearance

Each project is a manila folder standing in the drawer, as on the board, not an ecommerce card:

- folder tab at the top-left; manila body (`--shelf-manila`) with an ink outline and a layered back sheet for depth
- a centred **pictogram** for the project's group. It is a line illustration in the board's style, monochrome by default; the board's lavender tint is D-19. It is not a fake screenshot, and no stock or generated imagery is used.
- project name (bold), below the pictogram
- a subtitle of two short facets, "Domain · Tech" (board: "Healthcare · RAG"), from verified data. It is visible without hover.
- deployment-state marker (text, not colour) only when verified: e.g. "Live", "Prototype", "Archived" (see the deployment states in [content-inventory-template.md](content-inventory-template.md))

Folder grid: 3 columns at ≥1280px tray width, 2 at tablet, 1 on mobile (2 compact columns only at ≥400px if titles fit without truncation).

### 6.4 Folder states

| State            | Visual                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Rest             | Folder flat in its slot                                                                     |
| Hover/focus      | Lift 2–4px; back sheet rises 3px; focus ring on focus-visible                               |
| Pressed          | 1px push                                                                                    |
| Selected/opening | Folder lifts out of the row and the record sheet emerges from it (micro-interactions.md §5) |
| Visited          | Small mono "seen" tick on the tab (session only, via `sessionStorage`), never colour        |

### 6.5 Project record (file view)

**Layout (from the board's Project Detail panel, BR-12):**

- breadcrumb "‹ Projects / <name>" (link back to the drawer)
- title (h2) plus a one-line subtitle (board: "Healthcare RAG System")
- tech chips (small outlined pills, linking to Toolbox entries)
- hero: the real screenshot inside a generic laptop device frame (no brand mark), on the right on desktop and above the text on mobile. The screenshot is unaltered (INV-06).
- 1–2 sentence summary
- action row: **primary** "Live Demo ↗" (only if `deploymentState: live`), **secondary** "GitHub ↗" (only if the repo is public), **secondary** "Video ▷" (only if a publishable video exists; it swaps the hero for the player, micro-interactions.md §7.1)
- section tabs: **Overview · Tech Stack · Architecture · Gallery**. A tab exists only if its section has verified content. Without JS, sections render stacked with h3 headings.

A project record may include, when source data exists:

- name and concise summary
- real hero screenshot, in colour
- demo video (poster first, player on demand, §6.6)
- problem or user need
- what was built
- Ayush's specific contribution, separated from team contributions
- technology stack (links to Toolbox entries)
- architecture or system design, when verified
- outcomes or metrics, only when sourced
- deployment state (Live / Prototype / Archived / Concept), only when verified
- GitHub repository, only if public (verify at implementation)
- live deployment, only if it resolves (C-05)
- related article or presentation
- "See also" related projects

Missing optional fields are hidden, never shown as "N/A". A project is never called deployed, maintained, or live unless that is verified.

### 6.6 Project media

- Use the project's own screenshots and videos (see [workspace-audit.md](workspace-audit.md) §3.4–3.5).
- Video: a poster image with a play button. The player loads only on activation, never autoplays, and never plays more than one video at a time.
- For merged BuildLog episodes, the record says "Appears in BuildLog episode: _Year One_, alongside 8 other projects". When a verified start offset exists (from `TIMELINE.md`), playback starts there.
- Captions/transcripts: BuildLog `caption.txt` files are social copy, **not** subtitles. Provide a WebVTT track only when a real transcript exists. Otherwise give a short written summary beside the video.
- Video-composition assets (UI SVGs, demo JSON, contact sheets) are never presented as screenshots.
- Missing media: the media area collapses. No placeholder box, no "coming soon".
- Never expose private repo URLs, secrets, or internal work screenshots.

---

## 7. Patents drawer

### 7.1 Presentation

A **technical document register**, not project folders with different titles. Layout from the board's Patents Drawer panel:

- tray header "Patents — N Records" (computed) plus a search icon
- a ruled list. Each row: a document line-icon, the title (bold), "Application No. <number>" beneath it (tabular figures), and a status pill on the right (§7.4; colour per D-20)
- rows separated by fine rules; the whole row is the link
- mobile: same row structure, with the status pill under the number

Discovery found 8 records in source, while the owner expects 9 (C-01). Publish only verified records. The header count is computed from what is published.

### 7.2 Register row (verified fields only)

Title · application number · journal/publication reference (only with verified semantics) · filing date · publication date · jurisdiction · status (exact) · "Open dossier".

### 7.3 Patent dossier

A formal document sheet, laid over the register like a dossier pulled from a file. Layout from the board's Patent Detail panel (BR-12):

- breadcrumb "‹ Patents / <application number>"
- title (h2) plus a status pill
- left: thumbnail of the official document's first page, **only** if a public official document exists (no mock document art)
- right: key-value block (Application No., Filing/Publication Date, Status), verified fields only
- actions: **primary** "View Document ↗" (only if a public document exists), **secondary** "Official Record ↗" (only if a verified official URL exists)
- section tabs: **Abstract · Novelty · Use Cases · Timeline**. Abstract comes from the official abstract. Novelty and Use Cases only from official text or owner-approved plain-language copy. Timeline only from verified dates. A tab with no verified content does not exist.

Fields, when verified:

1. title
2. plain-language summary (grounded in the official abstract, never invented)
3. inventor information, only as supported by the record
4. application number (mono, exactly as officially formatted)
5. publication reference, if any
6. filing and publication dates
7. jurisdiction
8. verified status, using exact terminology
9. "View official record" link to the official public record (external, new tab)
10. original document link, only if it is public and safe (S-03 style review)
11. related project, only if explicitly confirmed (D-17)

### 7.4 Status correctness

Allowed public status labels, and only when verified: _Application filed_, _Application published_, _Under examination_, _Granted_, _Refused_, _Withdrawn_, _Abandoned_. Never use "patented" or "granted" as a synonym for "filed" or "published". If status cannot be verified, omit it publicly and record "Status not verified" in the inventory. Do not publish nonpublic documents or private personal details.

**Role wording** _(Phase 1.1, from the official records)_: the **applicant** is ABES Engineering College, and Ayush Jain is a **named inventor**. Public copy says "Named inventor", never "patent holder" or "owner" (D-30). Each dossier shows "Status checked: <date>", because a status can change after the check.

### 7.5 Readability without overwhelm _(Phase 1)_

- The register shows at most 4 fields per row. Everything else lives in the dossier.
- Application numbers use tabular monospace figures and can be copied with one click (with a visually confirmed "Copied" toast, micro-interactions.md §6).
- Long all-caps official titles are displayed in title case, with the exact official casing kept in the dossier's "Official title" field and in structured data.

---

## 8. Experience drawer

### 8.1 Visual model

From the board's Experience Drawer panel (BR-11): a **vertical timeline rail** on the left with a node per role, beside stacked role cards (newest first). The cards keep paper-folder styling (paper fill, ink outline, `--radius-md`). The current or selected role's card has the `--shelf-muted-paper` tint, as on the board.

Card: "<Organization> — <Role>" (bold) · dates (if verified) on the second line. Work type and location appear in the record only, and only if public and verified.

Node style carries meaning without colour: a filled node = current role, a hollow node = past role. A text equivalent is in the card ("Present").

Internships and work are listed here. Leadership and community roles live in the Clubs & Leadership drawer (BR-06). Types are never merged (§8.3).

Experience record layout (board's Experience Detail): breadcrumb "‹ Experience / <Organization>"; organization monogram or approved logo in a circle; organization name (h2); "Role · dates"; an optional decorative building line-illustration (`aria-hidden`); a bullet list of responsibilities and work; tech chips.

### 8.2 Experience record

Company and role, dates, summary, responsibilities, systems/features built, technology and engineering decisions, outcomes (only if verified), public-safe links.

Do not disclose confidential client names, private production details, proprietary screenshots, credentials, customer information, or internal documents. Workplace repositories and descriptions are private until cleared (S-05).

### 8.3 Content integrity

Distinguish employment, internship, volunteer role, club/leadership role, and project collaboration. Never combine them into a misleading employment claim. Never invent impact metrics.

---

## 9. Other drawers

The board's "Other Drawers" panel shows each of these as a card with a line icon, title, and a one-line description of its contents (board samples: "B.Tech (CSE) @ ABES EC", "Tech stack, tools & workflow", "GDG, GDSC & community", "Hackathons, awards & recognitions"). Those descriptions must be rewritten from verified data. For example, "Hackathons" appears only if at least one hackathon result is evidenced (C-17).

### Education

Institution, programme, discipline, and dates, only when verified, presented as academic index cards. Certificates appear as small certificate sheets with "View credential" links, only when a real public credential URL exists and resolves. No certificate image showing personal data.

### Skills / Toolbox

- A toolbox tray with compartments per category (languages, frontend, backend, databases, cloud/devops, AI/ML, blockchain, tools), using only categories supported by evidence.
- Each skill is a label tag. Activating a tag shows "Used in:" with links to the project and experience records that evidence it (derived from record data, not hand-maintained lists).
- No progress bars, percentages, star ratings, or logos for unused technologies.

### Achievements / Recognition

Two chips: **Results** (hackathon placings, Hacktoberfest, documented awards) and **Credentials** (course certificates, training badges, participation; [workspace-audit.md](workspace-audit.md) §3.11, D-29). Credential sheets show title, issuer, date, kind, and "Verify ↗" (the issuer's page). Never show the certificate image when it contains personal data or codes (S-11, S-12). Never label a course certificate as a "certification".

Award or certificate sheets, or a compact ruled list. Exact award, event, year, result, and evidence link. Distinguish winner, finalist, top-N, participant, speaker, organizer, and nominee accurately. Unevidenced claims (C-17) are excluded.

### Clubs & Leadership

Separate from employment. Role, organization (official name, C-07), dates, activities, outcomes if verified, approved public event photos only.

### Currently Building (drawer)

- Lists current builds as short records: title, one-line description, optional link to a project record, and a real "last updated" date only if one exists.
- Shares its data with the pinned note (§4.4). The note shows up to 4 checklist items (done ✓ / pending ☐), as on the board.
- Not rendered while D-12 is undecided. **The board's checklist items are samples.**

### Writing (opened from the book spines, BR-07)

- From the board's "Writing (Books / Blogs)" panel: the Writing view is an **open booklet** titled "My Writings". To its left stand the category spines (board: Articles, Notes, Ideas, Builds), which select the category. The open page lists entries, each with a small document icon and the title.
- Spines and categories appear only when they have content. Today only external Medium articles exist, so only an "Articles" spine renders.
- Not labeled "Journal".
- Each entry: title, verified date, original 1–2 sentence summary (on activation or focus, or as a second line), source ("on Medium"), and an external link to the canonical article (D-11).
- Route: `/writing/` (static page with the booklet open), with `?category=` for spine selection.
- If articles are republished later, the reader view includes title, author, date, content, tags, references, a shareable URL, and a canonical pointing to the original.
- No empty posts (exclude `portfolio/content/hello-world.mdx`) and no fabricated dates.

### Laptop panel: résumé and original portfolio _(Phase 1.1, BR-19)_

Mechanics are in [physics-and-interactions.md](physics-and-interactions.md) §4.3; interaction states are in [micro-interactions.md](micro-interactions.md) §8.12.

- **Closed:** the laptop on the desk with no brand mark, a small cue light, and an accessible name stating its purpose.
- **Opening:** the lid rotates on the rear hinge, the screen wakes, then the screen expands into the **laptop panel**. The panel is a dialog drawn as the laptop screen: a dark-ink bezel around a paper-white screen, the only "screen" surface in the UI.
- **Panel layout (desktop):**
  - left: the résumé page-1 preview (portrait, shadowed like paper on screen)
  - right: heading "Résumé", "Updated <date>", primary "View résumé (PDF) ↗", secondary "Download PDF (<size>)"
  - a divider, then "Original portfolio" with a one-line description and secondary "Open original portfolio ↗"
  - footer: "Back to shelf"
- **Mobile:** a full-height sheet in the same order, with the preview at reduced height.
- **Unavailable résumé** (D-24 undecided or the file not approved): the résumé block is absent and the panel shows only the original-portfolio block and a contact link. Never "coming soon".
- No iframe of the original portfolio. An optional owner-approved screenshot tile may stand in as a preview.

### Work with me _(Phase 1, D-13)_

Not on the board (BR-16). A record opened from the business-card holder (if approved) and linked from About:

- what Ayush can build, with each service linked to at least one evidencing project record
- engagement types the owner actually offers (owner-approved copy only)
- contact method (D-08) and an expected response time, only if the owner commits to one
- no testimonials unless real and permitted; no client logos without permission

---

## 10. Shared interaction model

### 10.1 State hierarchy

`home` → `drawer-open(drawerId)` → `record-open(drawerId, recordId)`, plus optional query state (`group`, `q`). Only one drawer or record surface is active (INV-08). The full state machine, timings, and interruption rules are in [micro-interactions.md](micro-interactions.md) §3.

### 10.2 Back, close, Escape

- The close control returns to the previous level (record → drawer → home).
- `Escape` closes the topmost surface: record first, then drawer.
- Browser Back/Forward move between UI states, because each state has a URL.
- The breadcrumb (`Shelf / Projects / Arogya`) is visible on records, and each segment is a link.
- Returning from a record restores the drawer, filter chip, query, and scroll position.
- Loading a record URL directly renders the shelf with that drawer and record open, as server-rendered HTML.
- Never hijack navigation or block normal Back behaviour.

### 10.3 URL strategy (decided baseline recommendation)

- `/` is the shelf home.
- Each important record has a static route rendered inside the same cabinet shell: `/projects/<slug>/`, `/patents/<slug>/`, `/experience/<slug>/`, plus `/about/` and `/work-with-me/` if those records exist. Writing entries link out by default (D-11).
- Drawers are addressable as `/projects/`, `/patents/`, `/experience/`, `/clubs-and-leadership/`, `/education/`, `/toolbox/`, `/achievements/`, `/currently-building/`, and the Writing view as `/writing/`. Each is a static page rendering the shelf with that surface open.
- With JavaScript, folder and drawer links are intercepted. State changes in place and the URL updates via `history.pushState`. Without JavaScript, the same links perform normal navigation to the static pages. **The same `<a href>` serves both paths.**

### 10.4 External links

Descriptive labels. An external-link icon with accessible text "(opens in a new tab)". `rel="noopener noreferrer"`. Never invent GitHub, LinkedIn, X, demo, patent, or résumé URLs. Confirm repositories are public before linking.

---

## 11. Desktop layout

Layout modes, scaling, breakpoints, and viewport tests are owned by [responsive-design.md](responsive-design.md). Design requirements that must hold in desktop mode (D and D+):

- The cabinet is the visual centre. All 8 drawer labels, the wordmark and name, and the hint are visible without scrolling at 1280 × 720 and above.
- The open tray has room for real content without shrinking the shelf into a thumbnail.
- The selected drawer becomes the foreground tray, never a full-page dashboard (INV-04). There is always an obvious way back.

## 12. Tablet and mobile

Owned by [responsive-design.md](responsive-design.md) §5–§6. Design requirements that must hold in every mode:

- The shelf metaphor stays: drawer fronts (as a list on mobile, per the board's phone mock), the identity frame, Writing spines, the pinned links, and the laptop entry.
- No hover-only information; touch targets ≥ 44 px; no tilt or perspective on content surfaces.
- Drawers, records, the Writing booklet, and the laptop panel open as full-height sheets that keep cabinet cues (drawer-front header with handle; laptop bezel).

## 13. Accessibility

Target: WCAG 2.2 AA.

- Drawer fronts and content-navigation objects are real `<a href>` elements styled as physical controls. State-only actions use `<button>`. See phase-3-handoff.md for no-JS, modal, and native keyboard semantics.
- Full keyboard operation: Tab/Shift+Tab through controls in DOM order (§2); Enter/Space activate; Escape closes; arrow keys move within filter chip groups (radio-group pattern) and record section tabs (tablist pattern), and rotate the globe (slider pattern, [physics-and-interactions.md](physics-and-interactions.md) §4.1).
- A visible focus indicator on every control (2px `--shelf-focus`, 2px offset). It is never removed and never obscured by sticky elements (WCAG 2.4.11).
- Focus moves into an opened drawer or record (to its heading) and returns to the triggering control on close.
- `aria-expanded`/`aria-controls` on drawer fronts. Mobile sheets use dialog semantics (`<dialog>` with `showModal()` or equivalent) with an accessible name.
- The breadcrumb is a `<nav aria-label="Breadcrumb">`. This is not a site navbar and is allowed.
- Live-region announcements for filter results ("7 folders shown") and copy confirmations.
- Text contrast is at least 4.5:1 for normal text and at least 3:1 for large text and meaningful non-text boundaries.
- No information is conveyed only by colour, hover, or animation.
- Decorative art is hidden from assistive technology. Meaningful images get useful alt text. Purely decorative images get `alt=""`.
- Video: captions/transcripts when they exist, plus a text summary always.
- No flashing content, and no motion above 3 flashes per second.
- Target size is at least 24×24 CSS px everywhere (WCAG 2.5.8) and at least 44×44 on touch layouts.
- Core content works without JavaScript, because records are static pages (§10.3).

---

## 14. Responsive behaviour and sizing

- Max text width 68ch. Fluid type with safe minimums (§3.3).
- Labels never clip or truncate at the test widths. If a label cannot fit, the layout changes rather than ellipsizing.
- Avoid nested scroll traps. Only the tray or sheet scrolls, and only when its content exceeds the available space.
- Fix aspect ratios for all media to prevent layout shift.
- Cabinet structure and every interactive element (drawer fronts, labels, chips, buttons, spines, note) are HTML/CSS/inline SVG. Hand-drawn objects (globe, lamp, plants, cube, laptop, mug, frame) may be layered raster (AVIF/WebP with transparency) or SVG illustrations in the board's style. One giant raster image of the interface is forbidden. Every drawer, label, link, and record is an independent DOM element.

## 15. Implementation guidance for Astro

- Astro static output (prerendered) for every page.
- TypeScript for content schemas and state identifiers.
- CSS custom properties for all tokens (§3, and micro-interactions.md §2).
- CSS transforms and transitions for drawer and object motion. Use the Web Animations API only where interruption needs programmatic control.
- **One** small client-side controller (a vanilla TypeScript module or a single island) owns UI state, history, and focus. Use a UI framework only if a truly stateful component justifies it. The old portfolio's React stack does not by itself justify React here.
- Astro content collections with schemas for every record type.
- Lazy and on-demand media players.
- No 3D engine and no physics library. The concept is achievable in CSS and SVG, plus a small custom 1-DOF integrator and one isolated raw-WebGL globe shader ([physics-and-interactions.md](physics-and-interactions.md) §5).
- No dependency for a simple transition, icon, or focus trap.
- Data stays separate from visual components.

Component names (adjust to project conventions): `ShelfScene`, `ShelfObject`, `IdentityFrame`, `DrawerFront`, `DrawerTray`, `FilterChips`, `RecordTabs`, `StatusPill`, `ProjectFolder`, `ProjectArchive`, `ProjectRecord`, `DeviceFrame`, `PatentRegister`, `PatentDossier`, `ExperienceTimeline`, `ExperienceRecord`, `WritingBooklet`, `BookSpines`, `ToolboxTray`, `CurrentlyBuildingNote`, `CurrentlyBuildingDrawer`, `BusinessCardHolder`, `SocialTabs`, `FocusChips`, `ShelfBreadcrumbs`, `CloseControl`, `MediaViewer`. File locations: [asset-organization.md](asset-organization.md).

## 16. Content and data contract

All portfolio facts live in content collections and data files, never hard-coded into the illustration. Each record has a stable slug, title, type, summary, verification status, visibility, provenance (internal only), optional media and links, and dates only when sourced. Full schemas: [content-inventory-template.md](content-inventory-template.md).

When sources conflict: do not guess; record both claims; prefer authoritative current evidence where it is objectively clear; ask the owner; omit the public field until resolved.

## 17. Performance requirements

Validate on the deployed site; do not claim in advance.

- Core Web Vitals "good" thresholds (verify the current thresholds in official documentation at implementation time).
- Homepage JavaScript: target ≤ 30 KB compressed for the shelf controller (including the drawer body). Lazy physics modules ≤ 12 KB compressed, loaded only on interaction or idle ([physics-and-interactions.md](physics-and-interactions.md) §5.2). Exceeding either requires a written justification in the PR.
- No autoplay media. Responsive images in modern formats. Explicit dimensions on all media.
- Animate `transform` and `opacity` only (exceptions are listed in micro-interactions.md §2.4).
- No continuous animation. No expensive blur or filter effects.
- Self-hosted, subset fonts, preloading only the primary text face.

## 18. Design acceptance checklist

- [ ] Homepage shows the shelf, name and intro, photo frame, approved objects, labeled drawers; no counter strip (INV-01–03, INV-07).
- [ ] 10-second test passes at 1366×768 (§1.1).
- [ ] No conventional navbar (INV-02).
- [ ] Drawer labels are readable and visibly interactive at every test size.
- [ ] Opening a drawer preserves the shelf identity and spatial context (INV-04).
- [ ] Projects: filter chips (All by default) → manila folders in featured order → record with tabs and real media where available.
- [ ] Patents: ledger register → dossier with exact status semantics (INV-14).
- [ ] Experience: personnel folders; internships and leadership separated.
- [ ] Writing opens from the open desk book into the open booklet view (BR-07); entries link to canonical articles.
- [ ] Currently Building note shows only verified content, or is hidden.
- [ ] Pinned links are correct and verified; placeholders and `uaryushjain` typos excluded (D-25, C-22).
- [ ] The laptop opens to the résumé (if approved, D-24) and the original-portfolio link; focus returns on close; no iframe.
- [ ] The lamp toggles the lighting layers; UI contrast passes in both states.
- [ ] The globe rotates as a sphere with inertia and stops; keyboard alternative present (T-PHY-01–03).
- [ ] No age, identity-document data, compensation, or signatures appear anywhere (INV-18).
- [ ] Mobile preserves the concept and works with touch only.
- [ ] Keyboard, screen reader, Escape, Back/Forward, and reduced motion are tested.
- [ ] Every direct record URL renders the shelf with that record open, without JavaScript.
- [ ] No fabricated content, numbers, links, screenshots, patent details, or achievements (INV-13).
- [ ] Visual matches the concept board (§0.1) for every panel it shows, with the §0.2 resolutions applied; no sample text from the board appears on the site.

## 19. Instruction to the implementing agent

Treat this document as the approved design contract. Do not "improve" the concept by converting it to a standard portfolio, adding a navbar, adding counters, changing the shelf metaphor, or making all drawers identical cards.

First inspect the source folders and the concept board (§0.1). Then build a small prototype of shelf → drawer → folder → record. Validate it against this contract and [micro-interactions.md](micro-interactions.md) before populating content. Ask only for facts that cannot be verified from the sources. Preserve every verified piece of useful content from the existing site unless the owner asks to remove it.
