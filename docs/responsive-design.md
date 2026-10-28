# Responsive Design Specification

**Status:** new in Phase 1.1. This is the authoritative document for layout modes, breakpoints, scaling, viewport behaviour, and responsive tests. [design.md](design.md) §11–§12 summarise and link here.
**Principle:** never just scale the desktop scene down. Each layout mode keeps the shelf metaphor (cabinet, drawers, identity, desk objects) in a form that is readable and operable at that size.

---

## 1. Layout modes

The mode is chosen by **available content size**, not device type. Evaluate the raw scale before clamping. Mode precedence and the 500–599px height gap are resolved in [phase-3-handoff.md](phase-3-handoff.md): L, then M, then T for short/undersized scenes, then D/D+. Container queries apply to the scene container; media queries apply only to the viewport-level shell.

| Mode                    | When                                                         | Composition                                                                                                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **D — Desktop scene**   | Scene scale `s ≥ 0.66` (§3) **and** viewport height ≥ 600 px | Concept-board composition: identity column on the left, cabinet in the centre, pinned note and social pins on the right, desk objects below. Tray opens over the lower cabinet.                                                                                                                  |
| **D+ — Large desktop**  | `s` would exceed 1.25                                        | Same as D. Scene capped at `s = 1.25` and centred. The extra space becomes canvas margin, not stretched objects.                                                                                                                                                                                 |
| **T — Tablet stacked**  | `s < 0.66` and content width ≥ 600 px                        | Identity block across the top. Cabinet full-width below (2 × 4 drawers). Crown objects on top of the cabinet. Pinned note and social pins in a row under the cabinet. Desk strip last. The tray opens as a large panel over the cabinet; the rest is inert.                                      |
| **M — Mobile list**     | Content width < 600 px                                       | As on the concept board's phone mock: wordmark and byline, tagline, a compact crown strip (frame, Writing spines, globe), a **vertical list of full-width drawer buttons**, then the note, social pins, and contact, and an optional desk strip. Drawers and records open as full-height sheets. |
| **L — Short landscape** | Height < 500 px and width ≥ 568 px (phones in landscape)     | Two columns: identity plus the crown strip on the left (scrolls with the page), and the drawer list in 2 columns on the right. Sheets are full height. No desk strip.                                                                                                                            |

Breakpoints are **content-driven**. The switch D → T happens when drawer fronts would drop below **200 px** wide at the minimum label size. T → M happens when the 2-column drawer bank would drop below **260 px** per drawer. These map approximately to the scale and width thresholds above. The implementation uses container queries on the drawer bank (`@container drawer-bank (width < …)`) so the layout reacts to real space, including zoom.

---

## 2. Representative viewports

The **mode** column is the expected result. Test IDs refer to §8.

| Category         | Viewport             | Expected mode              | Key checks                                                                                                  |
| ---------------- | -------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Small mobile     | 320 × 568            | M                          | No horizontal overflow. Labels unclipped. 44 px targets. Sheet close button visible with the keyboard open. |
| Standard mobile  | 375 × 667            | M                          | Same as above, plus the crown strip fits on one row.                                                        |
| Large mobile     | 430 × 932            | M                          | Drawer list spacing; the identity block fits in the first viewport.                                         |
| Mobile landscape | 667 × 375, 932 × 430 | L                          | Two-column layout; sheets full height; no clipped close control.                                            |
| Small tablet     | 600 × 960            | T                          | Cabinet 2 × 4 readable; objects not overlapping labels.                                                     |
| Tablet portrait  | 768 × 1024           | T                          | Tray panel width; the touch flows work.                                                                     |
| Tablet landscape | 1024 × 768           | D (s ≈ 0.71)               | Every drawer label visible without scrolling. Tray minimum width.                                           |
| Small laptop     | 1280 × 720           | D (s ≈ 0.80, height-bound) | 10-second test (design.md §1.1). Nothing clipped vertically.                                                |
| Standard laptop  | 1366 × 768           | D                          | 10-second test.                                                                                             |
| Large laptop     | 1440 × 900           | D (s = 1.0)                | Reference composition: matches the concept board.                                                           |
| Desktop          | 1920 × 1080          | D (s = 1.2)                | Balance; no stretched objects.                                                                              |
| Large desktop    | 2560 × 1440          | D+ (s capped 1.25)         | Centred scene; margins; image sharpness (2× assets).                                                        |

**Intermediate widths:** sweep 320 → 2560 px in 10 px steps at a fixed height of 800, and 500 → 1440 px of height at a width of 1280 (T-RWD-06). No overflow, no overlap of interactive elements, and a mode switch occurs only at the defined thresholds.

**Orientation:** rotate 375 × 667 ↔ 667 × 375 and 768 × 1024 ↔ 1024 × 768 with a drawer and a record open. The logical state and focus are preserved (T-RWD-05).

**Zoom:** 200% and 400% at 1280 × 720 (equivalent CSS widths 640 and 320). The content reflows to T and M without two-dimensional scrolling (WCAG 2.2 SC 1.4.10). Text-only zoom to 200% causes no clipped labels (SC 1.4.4). Text spacing overrides cause no loss (SC 1.4.12).

---

## 3. Scene scaling

- The scene is authored on a **1440 × 900** artboard (scene units, [physics-and-interactions.md](physics-and-interactions.md) §2.1).
- `s = min(W_avail / 1440, H_avail / 900)`, clamped to **[0.66, 1.25]**, where `H_avail = 100svh` minus safe-area insets. Outside that range, the mode switches (§1).
- Implement `s` as a CSS custom property `--scene-scale`, computed in CSS where possible (`min()`, `clamp()` with container units). JS only updates it if container units are unavailable.
- **What scales with `s`:** illustration geometry, object positions and sizes, shadows, cabinet dimensions, and physics bounds.
- **What does not scale with `s`:** text (uses rem/clamp from [design.md](design.md) §3.3), focus rings, hit-target minimums, and UI panels (trays and records use their own fluid widths).
- Drawer fronts scale their box, but their labels keep a minimum of 15 px computed. If a label cannot fit, that is the D → T trigger. Labels are never truncated.

---

## 4. Desktop and laptop (D, D+)

- D-43: the page is locked to the viewport (`100dvh`, no page scroll, no visible scrollbars); the 16:9 scene fits whichever dimension binds. Narrower modes keep their scrolling flow with hidden scrollbars.
- D-44: the desk and lamp controls remain available in the desktop scene, while the illustrated HTML portfolio remains the primary and fully accessible fallback without WebGL.
- Cabinet centred with balanced canvas margins. The identity column is ≤ 26% of the scene width.
- In the D-42 desktop composition, the cabinet crown is at y 250 scene units and its plinth meets the desk at y 634. The left portrait only appears when its existing media gate permits it. The cork board follows the pinned links gate. Tablet and mobile keep their existing flow layout.
- The tray (opened drawer) is at least 640 px wide at 1280 px, at most the cabinet width + 10%, and at most `100svh − 96px` tall, with its own scroll area.
- Records open as sheets over the tray, at most 960 px wide, with a 68ch text column.
- At 1280 × 720 (height-bound), the identity column moves its focus chips into two rows rather than pushing the cabinet down. All 8 drawer labels and the hint fit in the first viewport.
- D+ (≥ 1800 px of scene width): the scene stops growing at `s = 1.25`. Canvas texture or paper continues to the edges. Illustrations use 2× raster assets (and are SVG where possible) so they stay sharp.

## 5. Tablet (T)

- Touch-first: no hover dependency. Hover styles are gated by `@media (hover: hover)`.
- Desk objects reposition into the strip under the cabinet. Positions are defined per mode in a data table (`src/data/scene-layout.ts`), not by ad-hoc media queries scattered in components.
- The tray is a panel covering the cabinet, with a visible drawer-front header (handle and label) so the metaphor holds. The background is inert. Tap outside the tray closes it.
- The laptop panel is a large centred dialog. The lid animation is kept but shortened.

## 6. Mobile (M) and short landscape (L)

**D-37 update:** §6.1 supersedes generic drawer sheets in the mode table and earlier tablet/mobile drawer rules. Other object surfaces keep their existing presentation.

- The drawer list is the primary navigation. Each item: line icon, label, chevron, drawer-front styling. Minimum height 56 px; full width minus 16 px gutters.
- Drawer → full-height **sheet** sliding up (modal semantics, scroll lock, [micro-interactions.md](micro-interactions.md) §4.3). Record → replaces the sheet content, with "Back to <Drawer>".
- Folders: one column, or two compact columns at ≥ 400 px if titles fit without truncation.
- Writing booklet: a full-height sheet showing the open booklet page. Category spines become a horizontal chip row.
- Laptop: tap opens the laptop panel directly as a full-height sheet (lid animation ≤ 200 ms or skipped).
- Globe: rendered at ≥ 96 px diameter in the crown strip. Horizontal drag spins it; vertical drag scrolls the page (`touch-action: pan-y`).
- Cube and plants are optional in M. The pen may be omitted visually only when the same contact composer is reachable from a visible “Write a message” link.
- Use `100dvh` for sheet heights and keep the close/back button in a sticky header, so the on-screen keyboard never hides it.
- Respect `env(safe-area-inset-*)`.

### 6.1 Physical drawer adaptation (D-37)

Desktop places the tray's rear edge immediately below its original slot, constraining its width and depth to the viewport. The cabinet stays stationary and operable around the extended drawer; contents scroll inside its paper-lined floor. The original front and handle form the tray's lower edge. On shorter desktop windows the rear position is clamped to preserve a usable content area.

Tablet, mobile and short landscape reuse the same wooden assembly with reduced perspective, viewport gutters and an internally scrolling content area. They retain modal semantics and an inert background. The visual viewport controls available height when the keyboard opens. The heading, back control and front remain outside the scroll area. Project folders use three columns on desktop/tablet, two below 600 px, and one below 360 px. Filter chips scroll horizontally and remain keyboard accessible. The header search control reveals the input. Resizing preserves the current URL, query and focus and settles geometry immediately. Without JavaScript the original route-based content surfaces remain available.

---

## 7. Engineering requirements

| Topic                | Requirement                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fluid sizing         | `clamp()` for type and spacing. Container units for scene geometry. No fixed px widths on text containers.                                                                 |
| Min/max widths       | Text column ≤ 68ch. Tray 640 px (D) to 100% (M). Record sheet ≤ 960 px. Page min-width: none (320 px must work).                                                           |
| Text wrapping        | `overflow-wrap: anywhere` on long tokens (URLs, application numbers in narrow layouts). No ellipsis on labels or titles.                                                   |
| Images               | `astro:assets` responsive `srcset`/`sizes` per slot (folder pictogram, record hero, gallery). Explicit dimensions. `loading="lazy"` except the identity photo and hero.    |
| Video                | Poster sized to the slot. Player width 100% of its container, aspect ratio fixed. No autoplay in any mode.                                                                 |
| Scroll               | One scroll container per surface (page, tray, or sheet). `overscroll-behavior: contain` on trays and sheets. No scroll hijacking. No scroll-linked animation.              |
| Touch targets        | ≥ 44 × 44 px in T, M, L; ≥ 24 × 24 px elsewhere (WCAG 2.5.8). Adjacent targets ≥ 8 px apart.                                                                               |
| Object repositioning | Per-mode positions from a single data table. An object never overlaps a label or control (T-RWD-02).                                                                       |
| Overflow             | `scrollWidth ≤ clientWidth` at every tested width.                                                                                                                         |
| Keyboard and focus   | Same DOM order in every mode ([design.md](design.md) §2). Visual reordering only through CSS grid areas that keep the logical order. Focus is never lost on a mode switch. |
| Reduced motion       | Same as [micro-interactions.md](micro-interactions.md) §9 in every mode.                                                                                                   |
| Low-powered devices  | Physics lazy-loading and degradation from [physics-and-interactions.md](physics-and-interactions.md) §6. In M, toys load only after first interaction.                     |

---

## 8. Test cases

Do not report a test as passed unless it was executed. Record the browser and device for each run.

| ID       | Test                                                                                                                       | Method                                                                                       | Failure                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| T-RWD-01 | No horizontal overflow at every viewport in §2 and the 10 px sweep                                                         | Auto-e2e                                                                                     | `scrollWidth > clientWidth` anywhere                     |
| T-RWD-02 | No overlap between interactive elements or labels and objects                                                              | Auto-e2e (bounding-box intersection of every control and label vs every object)              | Any intersection                                         |
| T-RWD-03 | Touch-only completion of all core flows (open each drawer, a record, the Writing booklet, the laptop panel, a social link) | Auto-e2e (touch emulation) + Manual (one real phone, one real tablet)                        | Any flow needs hover or fails                            |
| T-RWD-04 | Keyboard open: search field and sheet close remain visible                                                                 | Manual (real iOS and Android)                                                                | Hidden control                                           |
| T-RWD-05 | Orientation change preserves state and focus                                                                               | Auto-e2e + Manual                                                                            | State or focus lost; layout broken                       |
| T-RWD-06 | Mode switching at the defined thresholds only; sweep widths and heights                                                    | Auto-e2e                                                                                     | Wrong mode for a size, or flicker between modes          |
| T-RWD-07 | Zoom 200% and 400%; text-only 200%; text-spacing override                                                                  | Manual + Auto-e2e (CSS viewport resizing, real browser zoom, CSS injection for text spacing) | Two-dimensional scrolling, clipped text, or lost content |
| T-RWD-08 | Large desktop cap: at 2560 × 1440 the scene scale is 1.25 and centred                                                      | Auto-e2e (computed `--scene-scale`)                                                          | s > 1.25 or off-centre                                   |
| T-RWD-09 | 10-second test at 1280 × 720 and 1366 × 768                                                                                | Same as T-DES-01                                                                             | See T-DES-01                                             |
| T-RWD-10 | Performance in M on a throttled CPU (4×) and a mid-range Android                                                           | Manual + Lighthouse mobile                                                                   | LCP > 2.5 s or long tasks > 50 ms during interactions    |

These replace the earlier T-RWD-01 to T-RWD-05 definitions, which [implementation-and-validation.md](implementation-and-validation.md) §6.9 now references.
