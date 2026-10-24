# Micro-Interaction Specification — The Shelf

**Status:** new in Phase 1, extended in Phase 1.1 (laptop, lamp, pinned links, credentials, interaction contract index §12). It is binding for implementation. Simulated motion models live in [physics-and-interactions.md](physics-and-interactions.md).
**Depends on:** [design.md](design.md) (visual contract and invariants INV-01…INV-17).
**Principle:** every motion reinforces the physical shelf metaphor (pulling, lifting, sliding paper, turning a cube). Motion that has no physical analogue, or that only decorates, is not added.

This document defines behaviour, not just animation ideas. For every interactive element it specifies: trigger, pointer/keyboard/touch behaviour, motion (tokens), transform origin, interruption, reduced-motion behaviour, focus, and failure states.

---

## 1. Global rules

1. **Physicality.** Things move the way their physical counterpart would: drawers translate along their own axis, paper lifts and slides, books pull up from a shelf. Nothing spins, bounces, or zooms without a physical reason.
2. **Short and finite.** No ANIM transition exceeds `--motion-max` (450 ms). Simulated motion is finite by construction and bounded by [physics-and-interactions.md](physics-and-interactions.md): globe coasting stops within 4 s, the cube sequence takes ≤ 2.1 s, and toys settle within 2 s. Nothing loops indefinitely.
3. **One focus of motion.** At most one _primary_ animation runs at a time: drawer, folder→record, or a sheet. Object delights never run during a primary animation, and a primary animation cancels any running delight.
4. **Compositor-only.** Animate `transform` and `opacity`. Exceptions are listed in §2.4.
5. **Never block input.** Animations never disable controls. Input during an animation is handled by the interruption rules (§3.3).
6. **Parity.** Every outcome reachable by pointer is reachable by keyboard and touch with equivalent feedback (INV-11).
7. **Reduced motion is a first-class mode**, not a degraded one (§9).
8. **No hover-only content.** Hover may preview; it never reveals something unavailable through focus or tap.
9. **Delights are optional.** Disabling every object delight must not remove any information or path.

---

## 2. Motion tokens

Define these once in `src/styles/motion.css` as custom properties. Components reference tokens, never raw values.

### 2.1 Durations

| Token              | Value   | Used for                                   |
| ------------------ | ------- | ------------------------------------------ |
| `--motion-instant` | `0ms`   | Reduced-motion state changes               |
| `--motion-micro`   | `90ms`  | Press feedback, toggle ticks               |
| `--motion-fast`    | `150ms` | Hover lift, focus shadow, colour-peek rise |
| `--motion-base`    | `220ms` | Folder → record, filter switch, fades      |
| `--motion-drawer`  | `320ms` | Drawer open/close, tray reveal             |
| `--motion-sheet`   | `360ms` | Mobile sheet slide                         |
| `--motion-max`     | `450ms` | Hard ceiling (except §8.3 and §8.6)        |

Acceptable tuning range: ±20% per token after testing on a real laptop and a mid-range phone. Tune tokens, never individual components.

### 2.2 Easing

| Token             | Value                              | Meaning                                                                       |
| ----------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| `--ease-pull`     | `cubic-bezier(0.22, 0.8, 0.24, 1)` | Opening and pulling toward the viewer (fast start, soft settle, no overshoot) |
| `--ease-push`     | `cubic-bezier(0.4, 0, 0.9, 0.6)`   | Closing and pushing away (gentle start, firm end)                             |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)`       | Lifts, fades, generic state changes                                           |
| `--ease-linear`   | `linear`                           | Only for the globe spin's constant phase                                      |

No spring and no overshoot easing. Wood and paper do not bounce.

### 2.3 Distance and depth

| Token                                                                  | Value                                 | Notes                                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `--lift-hover`                                                         | `3px` (range 2–4)                     | Drawer and folder hover                                                                         |
| `--lift-press`                                                         | `-1px`                                | Push-in on press                                                                                |
| `--drawer-pull`                                                        | `10px` translateY plus `scale(1.015)` | Drawer front when open (elevation view: "toward the viewer" reads as down plus slightly larger) |
| `--peek-rise`                                                          | `4px`                                 | Screenshot peek on folder hover                                                                 |
| `--sheet-offset`                                                       | `100%`                                | Mobile sheet start position                                                                     |
| `--dim-closed-drawers`                                                 | `0.55`                                | Opacity of non-active drawers while one is open                                                 |
| `--shadow-rest` / `--shadow-lift` / `--shadow-open` / `--shadow-paper` | Defined in `tokens.css`               | Depth steps (design.md §3.4)                                                                    |

### 2.4 Allowed non-compositor exceptions

- `clip-path: inset()` on the drawer tray reveal (one element at a time).
- `box-shadow` transitions on hover (cheap on small elements; never on more than one element per interaction).
- No `filter`, `backdrop-filter`, `width`, `height`, `top`, or `left` animation.

---

## 3. State model

### 3.1 States

```text
home ──open(d)──▶ drawer(d) ──openRecord(r)──▶ record(d, r)
  ▲                  │  ▲                           │
  └────close─────────┘  └─────────close─────────────┘
drawer(d) ──open(d2)──▶ drawer(d2)          (switch: close d fast, open d2)
any ──popstate──▶ state derived from URL
```

The UI state is always **derived from the URL** (path plus `?group&q`). Clicking a link or control pushes a URL. The controller renders from the URL. Back and Forward therefore work by construction.

Per-surface transient phases: `closed → opening → open → closing → closed`.

### 3.2 History rules

| Action                             | History                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| Open a drawer from home            | `pushState('/projects/')`                                                                         |
| Open a record                      | `pushState('/projects/<slug>/')`                                                                  |
| Change filter or search            | `replaceState('?group=…&q=…')` (filtering does not flood history)                                 |
| Close a record (button or Escape)  | If the previous entry is this drawer, call `history.back()`; otherwise `pushState` the drawer URL |
| Close a drawer                     | Same rule, targeting `/`                                                                          |
| Direct load of `/projects/<slug>/` | Render that state as static HTML. Closing pushes `/projects/`.                                    |

The controller must never trap Back. Pressing Back from the first loaded state leaves the site normally.

### 3.3 Interruption

| Situation                                             | Behaviour                                                                                                                          |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Click the same drawer while it is `opening`           | Reverse to `closing` from current progress (CSS transitions reverse naturally; with WAAPI, call `reverse()`)                       |
| Click another drawer while one is `opening` or `open` | Current drawer closes with `--motion-fast`, then the new one opens with `--motion-drawer`. Only the **latest** intent is honoured. |
| Escape during `opening`                               | Reverse to closed                                                                                                                  |
| Back/Forward during an animation                      | Cancel the running animation, jump to its end state, then apply the new URL state                                                  |
| Rapid repeated clicks (≥3 within 300 ms)              | The last click's intended end state wins. No queued animation chains.                                                              |
| Folder click during filter switch                     | Filter switch completes instantly (jump to end), then the record opens                                                             |
| Window resize across a breakpoint while open          | Keep the logical state. Re-render the surface in the new layout (tray ↔ sheet) with no animation.                                 |

Implementation note: one controller holds `currentState`, `targetState`, and a single `AbortController` for the running transition. Starting a transition aborts the previous one.

---

## 4. Focus, scroll, and layering

### 4.1 Focus management

| Event                     | Focus moves to                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Drawer opens              | The tray heading (`<h2 tabindex="-1">`) once `opening` completes (immediately in reduced motion)                                          |
| Record opens              | The record heading (`<h2 tabindex="-1">`)                                                                                                 |
| Record closes             | The folder that opened it (same element, not a re-rendered copy). If it is no longer in the DOM (filter changed), focus the tray heading. |
| Drawer closes             | The drawer front that opened it                                                                                                           |
| Direct load into a record | No forced focus (the browser default applies). The skip link offers "Skip to record".                                                     |
| Mobile sheet opens        | Sheet heading. Focus is contained in the sheet.                                                                                           |
| Mobile sheet closes       | The drawer front that opened it                                                                                                           |

Never call `focus()` on an element that is still `visibility: hidden` or `inert`. Wait for the phase to reach `open`.

### 4.2 Desktop region and tablet modal tray

- Desktop: the tray is a named non-modal region. Tablet: it is a modal dialog because the background is inert.
- Desktop: the rest of the cabinet stays operable. Tablet: the cabinet behind is `inert`, and tapping outside closes the tray.
- Desktop page scroll is not locked. Tablet modal trays use the scroll-lock and focus-containment rules in §4.3. The tray content uses `overscroll-behavior: contain`.

### 4.3 Mobile sheet (modal)

- Use `<dialog>` with `showModal()` (native inert background and Escape handling), or an equivalent with `inert` on siblings.
- **Scroll lock:** set `overflow: hidden` on `html`, preserve and restore `scrollY` exactly, and use `overscroll-behavior: contain` on the sheet.
- On close, always remove the lock in a `finally` path, so an error or interruption can never leave the page locked. Test T-INT-09 covers this.
- Swipe-down to close is optional. If implemented, it needs a visible close button too, a 30% height threshold, and no conflict with inner scrolling (only active when the sheet content is scrolled to the top).

### 4.4 Preventing accidental navigation

- Controller link interception applies only to unmodified primary clicks on same-origin shelf links. Ctrl/Cmd/Shift/middle-click keep native behaviour (open in a new tab or window).
- External links always open in a new tab with a visible indicator. They are never intercepted.
- No `beforeunload` prompts.
- Drag gestures never trigger navigation.

---

## 5. Element specifications: drawers, folders, records

### 5.1 Drawer front

| Aspect         | Spec                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Element        | Real `<a href="/projects/" data-drawer="projects">`, retained after enhancement. The controller intercepts only unmodified primary activation. Keep native new-tab behavior; never replace the anchor with a button or nest controls.                                                                                                                                                                                          |
| Hover          | `translateY(calc(var(--lift-hover) * -1))`, `--shadow-lift`, `--motion-fast` `--ease-standard`                                                                                                                                                                                                                                                                                                                                 |
| Focus-visible  | Same as hover, plus a focus ring. The ring appears instantly (no transition on the outline).                                                                                                                                                                                                                                                                                                                                   |
| Press          | `translateY(var(--lift-press))`, `--motion-micro`                                                                                                                                                                                                                                                                                                                                                                              |
| Open           | Front: `translateY(var(--drawer-pull)) scale(1.015)`, `--shadow-open`, `--motion-drawer` `--ease-pull`. Transform origin: `center top`. Tray: `clip-path: inset(0 0 100% 0)` → `inset(0)` over `--motion-drawer`. Contents fade 0 → 1 during the last 40% (`transition-delay: calc(var(--motion-drawer) * 0.6)`). Other drawers: decorative layers dim to `--dim-closed-drawers`; labels and focus indicators retain contrast. |
| Close          | Reverse, using `--ease-push`. Contents fade out over the first 30%.                                                                                                                                                                                                                                                                                                                                                            |
| Touch          | Tap = click. No hover state on touch (gate hover styles with `@media (hover: hover)`).                                                                                                                                                                                                                                                                                                                                         |
| Keyboard       | Enter activates the native anchor. Escape closes when focus is inside the tray.                                                                                                                                                                                                                                                                                                                                                |
| Handle drag    | Pointer drag on the handle moves the drawer along its track (KIN) with a simulated settle on release. Open if pulled past 35% or flicked; otherwise close. The motion model is in [physics-and-interactions.md](physics-and-interactions.md) §4.9. Without the physics module, the CSS transition above applies with the same end states.                                                                                      |
| Reduced motion | Front changes to its open style instantly. Tray appears with a 120 ms opacity fade only. No transforms.                                                                                                                                                                                                                                                                                                                        |

### 5.2 Filter chips (category filters, design.md §6.2)

- Semantics: a single-select group. Use native radio inputs styled as pills inside `<fieldset>` with a visually hidden `<legend>` ("Filter projects"). This gives arrow-key movement, one tab stop, and a correct announcement without custom ARIA.
- Visual (from the concept board): outlined pill chips; the selected chip is ink-filled with paper text. Hover: the outline thickens to 1.5px (no colour). Focus-visible: focus ring.
- Switching: outgoing folders fade out (`--motion-fast`), incoming folders fade in with a 2px upward settle (`--motion-base`). Stagger at most 30 ms per item, capped at 6 items (the rest appear together).
- Announce: polite live region "GenAI: 8 projects".
- Reduced motion: instant swap, announcement only.

### 5.3 Search field

- Collapsed behind the tray header's search icon button ("Search projects"), as on the board. Activation expands the field with a `--motion-fast` width/opacity reveal (opacity only in reduced motion) and focuses it.
- Debounced filtering at 120 ms. `Escape` inside the field clears it (first press), collapses it and returns focus to the search button (second press), and closes the drawer (third press).
- Results announce: "3 folders match 'rag'".
- No results: the empty-state index card (design.md §5.4) plus a "Clear search and filters" button that returns focus to the field.
- `/` focuses search only when the Projects tray is open and focus is not in a text input. It is documented in the tray's help text.

### 5.4 Project folder

| Aspect                  | Spec                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Element                 | `<a href="/projects/<slug>/">` containing the title (accessible name = project title)                                                                                                                                                                                                                                                                                    |
| Hover/focus             | Lift `--lift-hover`; the folder's back sheet rises `--peek-rise`; `--motion-fast`                                                                                                                                                                                                                                                                                        |
| Press                   | `--lift-press`                                                                                                                                                                                                                                                                                                                                                           |
| Open (folder → record)  | 1) Folder lifts 6px and fades to 0.0 over `--motion-base`. 2) The record sheet starts at the folder's bounding box (FLIP: measure the folder rect, set the sheet's transform to match, then animate to identity) with origin `top left`, over `--motion-base` `--ease-pull`. 3) Sheet content fades in during the last 40%. Only `transform` and `opacity` are animated. |
| Close (record → folder) | Reverse FLIP into the original folder rect. If the folder is no longer visible (scrolled away or filtered), the sheet fades out over `--motion-fast` instead.                                                                                                                                                                                                            |
| Scroll restoration      | The tray scroll position is saved on open and restored before the reverse FLIP starts                                                                                                                                                                                                                                                                                    |
| Touch                   | Tap opens. There is no hover preview, and the summary is always visible.                                                                                                                                                                                                                                                                                                 |
| Reduced motion          | No FLIP. The record replaces the list with a 120 ms fade.                                                                                                                                                                                                                                                                                                                |

### 5.5 Record sheet (project, experience, about, work-with-me)

- Close button: top-right, "Close <record title>". The breadcrumb's parent segment does the same.
- Prev/next record controls (optional): "Previous folder: <title>" / "Next folder: <title>", within the current filter's order. Left and Right arrow keys are **not** bound globally, to avoid conflicts with text selection and screen readers.
- Content enters as one block (no per-paragraph stagger).
- **Section tabs** (board: Overview · Tech Stack · Architecture · Gallery; patents: Abstract · Novelty · Use Cases · Timeline). Use the ARIA tablist pattern: `role="tablist"`/`tab`/`tabpanel`, `aria-selected`, roving `tabindex`, Left/Right/Home/End within the tablist only, activation follows focus. The selected tab has an ink underline (2px), as on the board. Panels swap with a `--motion-fast` opacity fade (instant in reduced motion). The selected tab is reflected in the hash (`#architecture`) via `replaceState`, so a section is linkable. Without JS, all panels render stacked with h3 headings.
- **Action buttons** (Live Demo ↗, GitHub ↗, Video ▷, View Document ↗, Official Record ↗): external links follow §4.4 and design.md §10.4. "Video ▷" is a button that swaps the hero image for the player (§7.1) and moves focus to it.

### 5.6 Patent register and dossier

- The register row is a link to `/patents/<slug>/`. Hover and focus thicken the row's rule from 1px to 2px (no colour) and show the "Open dossier" affordance, which is always present for screen readers.
- Dossier open: the sheet slides up 12px from the row while fading in (`--motion-base`), like a document pulled from a register. Close reverses.
- "Copy application number" button: on activation, show the toast "Application number copied" (`role="status"`) for 2 s, with a tick glyph swap. On clipboard failure, show "Copy failed — select the number manually" and select the text.
- "View official record": external link, new tab, with the label "View official record (opens in a new tab)". Never intercepted. If no verified official URL exists, the control is absent (not disabled).

---

## 6. Feedback surfaces

| Surface           | Spec                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toast             | Bottom-center (desktop), above the safe area (mobile). Paper slip style. `role="status"`. Auto-dismiss after 2 s. Hovering or focusing it pauses the timer. At most one toast at a time. Fade 0 → 1 over `--motion-fast`. |
| Inline error slip | Within the failed component. It never replaces the whole tray. Wording states what failed and what still works.                                                                                                           |
| Skeleton          | Only for media boxes. Static paper tone, **no shimmer animation**.                                                                                                                                                        |

---

## 7. Media

### 7.1 Video preview and playback

| Aspect                | Spec                                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial               | `<button>` overlay on a poster `<img>` (explicit width and height). Label: "Play video: <project> demo (<duration>)". No `<video>` element in the DOM yet.                  |
| Activation            | Replace the poster with `<video controls playsinline preload="metadata">` plus `src`, then call `play()` (allowed after the user gesture). Move focus to the video element. |
| Single playback       | Starting a video pauses any other playing video on the page                                                                                                                 |
| Close record          | Pause, remove `src`, call `load()` to release memory, and restore the poster                                                                                                |
| Merged-episode offset | When a verified offset exists, use a `#t=<seconds>` media fragment and show the visible note "Starts at this project's segment"                                             |
| Captions              | `<track kind="captions">` only when a real WebVTT file exists. Otherwise show a text summary beside the video.                                                              |
| Loading               | The poster stays visible until `canplay`. No spinner over the poster for the first 300 ms, then a small static "Loading…" label.                                            |
| Error                 | On `error`, restore the poster with an inline slip: "Video couldn't load." plus, if available, a link to the published post.                                                |
| Reduced motion        | Same behaviour. Video never autoplays in any mode.                                                                                                                          |
| Data saver            | If `navigator.connection?.saveData` is true, show the file size beside the play button                                                                                      |

### 7.2 Images

- Missing image: the media area collapses. No broken-image icon (handle `error` by removing the figure). Never use a stand-in image.
- Screenshot lightbox (optional): opens as a dialog with focus contained. Escape closes. Arrow keys move between images in the same record. Reduced motion uses a fade instead of a zoom.

---

## 8. Shelf objects

All interactive objects share the `ShelfObject` behaviour: a real `<a>` for content navigation or `<button>` for state-only actions with an accessible name stating the result, a hover/focus lift of 2px (objects lift less than drawers), and no motion while a primary animation runs.

### 8.1 Identity frame

- Hover/focus: the frame tilts `rotate(-1deg)` around `center top` (hanging-frame feel), `--motion-fast`.
- Activation: opens the About record (`/about/`) with the record-sheet behaviour (§5.5).
- Reduced motion: no tilt; focus ring only.
- Decorative fallback: if no About record exists, there is no button and the frame art is `aria-hidden`.

### 8.2 Books (spines)

- The open book on the desk is the **Writing entry** (D-04, design.md BR-07), one per category with content. Social profiles use the pinned link cards (§8.10), not crown spines.
- Element: `<a href="/writing/?category=<x>">`, upgraded by the controller like a drawer front (§5.1). Accessible name: "Open writing: <Category>".
- Hover/focus: the spine pulls up 4px (`translateY(-4px)`), as if being drawn from the shelf, `--motion-fast`.
- Activation: opens the Writing view (the open booklet, §8.7) at that category. History follows drawer rules (§3.2: `pushState('/writing/?category=<x>')`). Focus returns to the spine on close.
- Reduced motion: no pull; focus ring only.

### 8.3 Globe (the rotating object): SIM, see physics §4.1

- Trigger: horizontal drag (pointer or touch); Left/Right/Home/Enter/Space on the focused globe control.
- Initial state: at rest, facing the configured longitude. Result: rotated, coasting with inertia until friction stops it.
- Motion model, limits, rendering, and fallbacks: [physics-and-interactions.md](physics-and-interactions.md) §4.1. It is a true sphere (WebGL shader), not a flat image.
- Focus: the globe control keeps focus during keyboard rotation. Dragging does not move focus.
- Interruption: grabbing a coasting globe stops it (catch). Opening a drawer puts the globe to sleep.
- Error: no WebGL or canvas → static, decorative globe.
- Reduced motion: no inertia; arrow keys jump instantly.
- Navigates nowhere (D-04).
- Acceptance: T-PHY-01, T-PHY-02, T-PHY-03.

### 8.4 Plants: small SIM, see physics §4.7

- Hover only (pointer devices): leaf groups respond as damped springs to pointer movement (≤ ±4°) and settle within 1.5 s. Shadows follow the leaves.
- Not focusable unless a "Currently learning" record exists (then it behaves like §8.1).
- Reduced motion and touch: none.

### 8.5 Coffee mug

- Decorative (`aria-hidden`), not focusable, and never moves ([physics-and-interactions.md](physics-and-interactions.md) §4.8).
- Pointer hover only: three SVG steam paths rise 6px and fade over 1.2 s, **once per hover entry**, at most once every 4 s. No loop.
- Reduced motion and touch: none.

### 8.6 Rubik's cube: KIN + SIM + ANIM, see physics §4.4

- Trigger: horizontal drag (yaw spin), vertical drag (lift-and-turn), click/tap/Enter/Space (face-turn sequence).
- Element: `<button>` "Rubik's cube: play a short turn sequence".
- Face turns run on a 54-facelet state model. The sequence R U R′ U′ plus its inverse always ends solved. Re-activation during a sequence is ignored.
- Arrow keys are never bound. Orientation manipulation is pointer-only (decorative).
- Reduced motion: decorative (`aria-hidden`), no motion.
- Acceptance: T-PHY-06, T-PHY-11, T-PHY-14.

### 8.7 Writing booklet (the Writing view, design.md §9)

- The Writing surface is an **open booklet** ("My Writings"), as on the concept board, presented in the tray position (desktop/tablet) or the sheet (mobile). Region semantics and focus rules are the same as a drawer tray (§4).
- Opening: the booklet appears closed at the spine's position and opens. Its cover rotates from 0° to −160° around its left edge (`rotateY`, perspective 900px, origin at the left edge) over `--motion-drawer` with `--ease-pull`, while it translates into the tray position. The page content fades in during the last 40%.
- Inside: category spines stand at the booklet's left. Activating one swaps the page list with a `--motion-fast` page-turn: the outgoing page rotates −8° and fades, and the incoming page fades in. URL via `replaceState('?category=<x>')`. The category controls inside the desk book are a single-select group with the same semantics as filter chips (§5.2).
- Entries are external links (§4.4) by default (D-11).
- Closing: reverse (cover closes, booklet returns toward the spine); focus returns to the originating spine.
- Reduced motion: no cover rotation or page-turn; 120 ms fade only.

### 8.8 Business-card holder (D-13)

- Hover/focus: the top card rises 3px.
- Activation: opens `/work-with-me/` with record-sheet behaviour.
- Reduced motion: no rise.

### 8.9 Currently Building note (D-12)

- Hover/focus: the pinned corner lifts (`rotate(1.5deg)`, origin at the pin).
- Activation: opens the Currently Building drawer (`/currently-building/`), with the note as the return-focus target. Individual checklist items are plain text, not separate controls.
- Hidden entirely when no verified content exists.

### 8.10 Pinned link cards (GitHub, LinkedIn, X, Instagram)

- Pinned to the right-hand pinned area beside the Currently Building note: small paper cards, each with a pushpin, platform icon (ink), and visible label ("GitHub").
- Element: `<a href target="_blank" rel="noopener noreferrer">` with the accessible name "<Platform>: <handle> (opens in a new tab)". Cards are in a `<ul>` labelled "Profiles".
- Hover/focus: the card lifts 2px and rotates 1° about its pin. The focus ring follows the card's outline.
- Only verified URLs render (D-25). A missing platform leaves no empty card.
- Responsive: a row under the cabinet in T, and after the drawer list in M ([responsive-design.md](responsive-design.md)).
- Reduced motion: no lift or rotation.
- Acceptance: T-SEC-03, T-AEO-02, T-A11Y-06.

### 8.11 Focus chips (identity column, D-21)

- Only rendered when approved. A chip that maps to a project group is a link to `/projects/?group=<id>`, which opens the Projects drawer with that chip preselected (drawer rules, §3.2). A chip with no mapping is not rendered.
- Hover: outline thickens to 1.5px. Focus-visible: focus ring. No motion beyond that.

### 8.12 Laptop: résumé and original portfolio (KIN + SIM hinge, see physics §4.3)

- Trigger: click, tap, or Enter/Space on the laptop; or drag the lid edge.
- Initial state: lid closed (φ = 0°). Result: lid open at 105°, screen awake, laptop panel expanded (dialog).
- Duration: hinge ≈ 0.41 s (spring f = 2.6 Hz, ζ = 1), then 150 ms wake + 250 ms brightness, then the panel expands over `--motion-base`.
- Element: `<button aria-expanded aria-controls="laptop-panel">` named "Open laptop: résumé and original portfolio". The panel is a `<dialog>` labelled "Laptop".
- Focus: moves to the panel heading once expanded. Escape, "Back to shelf", or a click outside closes it, and focus returns to the laptop button.
- Panel actions: "View résumé (PDF) ↗", "Download PDF", "Open original portfolio ↗" (external; never iframed), "Back to shelf".
- Interruption: closing mid-open reverses from the current φ. Opening a drawer while the panel is open closes the panel first (one primary surface, INV-08).
- Error: résumé not approved → résumé block absent. Preview image fails → text links only. Original-portfolio link always present.
- Reduced motion: no hinge or expansion animation; the panel fades in over 120 ms.
- Mobile: the panel opens as a full-height sheet; the lid animation is ≤ 200 ms or skipped.
- History: no distinct URL. Push one same-URL utility-state marker on open; Back or the close action consumes it. Content state remains URL-derived. Exact handling: phase-3-handoff.md.
- Acceptance: T-PHY-05, T-INT-12.

### 8.13 Desk lamp (ANIM + FX, see physics §4.2)

- Trigger: click, tap, or Enter/Space on the lamp (`<button aria-pressed>` "Desk lamp").
- Initial state: on (D-27). Result: off (lamp-light and shadow layers fade out) or on again.
- Duration: on 180 ms bulb + 240 ms layers; off 160 ms. No flicker.
- Focus: stays on the lamp.
- Interruption: toggling mid-transition reverses from the current opacity.
- Error: lighting layers missing → only the bulb glow toggles.
- Reduced motion: instant.
- Acceptance: T-PHY-09.

### 8.14 Pen — contact message

Native link to `/contact/`, enhanced to the message composer specified in [phase-3-handoff.md](phase-3-handoff.md). Click/tap/Enter opens; Escape/Back/Close dismisses and returns focus to the pen. It replaces any open primary surface. Use the standard dialog/sheet semantics, 220ms opacity opening (≤120ms with reduced motion), persistent visible Close and no queued openings. Opening an email app and copying a message never claim delivery. Repeated activation focuses the existing composer rather than opening another. Validation retains text on error; clipboard failure exposes selectable text. No JavaScript: email link and copyable public address on the static contact page. No contact path depends on physics.

### 8.15 Credential and certificate sheets (Achievements drawer)

- Same as a folder → record (§5.4), but the record is a single certificate sheet: title, issuer, date, kind, and "Verify ↗" (issuer page, new tab).
- No certificate image is shown when it contains personal data or codes (security.md S-11, S-12). The sheet uses the issuer's badge image only when it is clean and its use is permitted.
- Acceptance: T-CNT-06.

### 8.16 Project images and videos

- Images: lightbox and missing-image behaviour as in §7.2. Video: §7.1 (the "Video ▷" button swaps the hero for the player).
- Acceptance: T-MED-02, T-MED-03, T-INT-07.

---

## 9. Reduced motion and input modes

| Mode             | Detection                                                                     | Behaviour                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reduced motion   | `@media (prefers-reduced-motion: reduce)` (CSS) and `matchMedia` (controller) | All transforms removed. Surfaces fade in at most 120 ms. The cube becomes decorative; the pen retains contact functionality. The globe stays operable, without inertia. Focus and state behaviour is identical. |
| No hover (touch) | `@media (hover: none)`                                                        | No hover styles. Objects that are hover-only (mug, plants) have no interaction. The pen and cube respond to taps. Summaries are always visible.                                                                 |
| Coarse pointer   | `@media (pointer: coarse)`                                                    | Targets at least 44×44. Spacing between adjacent targets at least 8px.                                                                                                                                          |
| Forced colours   | `@media (forced-colors: active)`                                              | Outlines use `CanvasText`. Shadows are dropped. Focus uses `Highlight`. Colour peeks may hide.                                                                                                                  |
| No JavaScript    | —                                                                             | Drawer controls are links to static pages (§5.1). Everything is readable. Delights are absent.                                                                                                                  |

The controller re-reads `prefers-reduced-motion` on its `change` event, so toggling the OS setting mid-session takes effect immediately.

---

## 10. Performance guardrails

- Use `will-change: transform` only on the element about to animate (set on `pointerenter`/`focus`, removed on `transitionend`). Never set it globally.
- Never animate more than 12 elements simultaneously (filter switch cap, §5.2).
- Pause all object motion when `document.hidden` is true.
- Long tasks over 50 ms during any interaction are a defect.
- Target interaction latency (INP) of 200 ms or less at the 75th percentile in field data. Verify the current "good" threshold in official documentation.

---

## 11. Acceptance tests (summary)

Full test IDs and failure definitions are in [implementation-and-validation.md](implementation-and-validation.md) §6.

- T-INT-01: Every drawer opens and closes with mouse, keyboard (Enter, Space, Escape), and touch, and focus returns correctly.
- T-INT-02: Back and Forward traverse home → drawer → record → drawer → home exactly.
- T-INT-03: Rapid clicking across drawers ends in the last-clicked drawer, with no stuck intermediate state.
- T-INT-04: Folder → record → close restores tray scroll position and focus to the same folder.
- T-INT-05: With reduced motion, no element moves (transform delta 0); all paths still work.
- T-INT-06: With JavaScript disabled, every drawer and record is reachable via links.
- T-INT-07: Only one video plays at a time; closing a record stops playback and releases the source.
- T-INT-08: The cube ignores re-activation mid-sequence and always ends solved. The globe never exceeds its maximum angular velocity and always comes to rest (see T-PHY-01, T-PHY-06).
- T-INT-09: After opening and closing the mobile sheet 20 times, including Escape, Back, and resize interruptions, the page is never scroll-locked.
- T-INT-10: No hover-only information: every hover-revealed text is present in the accessibility tree and visible on focus or tap.
- T-INT-12: The laptop panel opens and closes with mouse, keyboard, and touch. Focus enters the panel and returns to the laptop. Back closes the panel without leaving the page. No iframe exists. Unapproved résumé → no résumé controls.

---

## 12. Interaction contract index

One row per interaction listed in the Phase 1.1 brief. Columns: technique (ANIM, KIN, SIM, FX per [physics-and-interactions.md](physics-and-interactions.md) §0) · trigger · initial → result · timing · inputs · focus · interruption · error · reduced motion · acceptance. Details live in the linked section.

| Interaction                      | Tech         | Trigger                               | Initial → result            | Timing                      | Inputs                                | Focus                                  | Interruption                        | Error                            | Reduced motion          | Tests              |
| -------------------------------- | ------------ | ------------------------------------- | --------------------------- | --------------------------- | ------------------------------------- | -------------------------------------- | ----------------------------------- | -------------------------------- | ----------------------- | ------------------ |
| Drawer handle (§5.1)             | KIN+SIM      | Drag handle                           | p=0 → p∈[0,1] → open/closed | Spring f 3 Hz ζ 1 (≈0.35 s) | Pointer, touch                        | Unchanged during drag; heading on open | Grab takes over; latest intent wins | Physics fails → CSS path         | Instant + fade          | T-PHY-04           |
| Drawer open/close (§5.1, §3)     | ANIM / SIM   | Click, tap, Enter/Space, Escape, Back | closed ↔ open              | `--motion-drawer` 320 ms    | All                                   | Tray heading ↔ front                  | §3.3                                | Watchdog snap                    | 120 ms fade             | T-INT-01–03        |
| Folder hover/focus/select (§5.4) | ANIM         | Hover, focus, click                   | rest → lifted → record      | 150 / 220 ms                | All                                   | Record heading                         | Reverse FLIP or fade                | Missing folder → fade            | Fade                    | T-INT-04           |
| File open (record) (§5.4–5.5)    | ANIM         | Folder activation                     | list → record sheet         | 220 ms FLIP                 | All                                   | Record heading → back to folder        | Reverse FLIP                        | —                                | Fade                    | T-INT-04           |
| Project details tabs (§5.5)      | ANIM         | Tab activation                        | panel A → panel B           | 150 ms fade                 | Pointer, arrows                       | Tab                                    | Instant swap                        | No content → no tab              | Instant                 | T-A11Y-02          |
| Patent record (§5.6)             | ANIM         | Row activation                        | register → dossier          | 220 ms                      | All                                   | Dossier heading                        | Reverse                             | No official URL → control absent | Fade                    | T-CNT-05           |
| Credentials (§8.15)              | ANIM         | Item activation                       | list → certificate sheet    | 220 ms                      | All                                   | Sheet heading                          | Reverse                             | Image unsafe → no image          | Fade                    | T-CNT-06           |
| Laptop open/close (§8.12)        | KIN+SIM      | Click, drag lid, Enter/Space          | closed → panel open         | Hinge ≈0.41 s + wake 0.4 s  | All                                   | Panel heading ↔ laptop                | Reverse from current φ              | Résumé absent → link-only        | Fade                    | T-PHY-05, T-INT-12 |
| Résumé access (§8.12)            | —            | Panel buttons                         | — → PDF view/download       | —                           | All                                   | —                                      | —                                   | Not approved → absent            | —                       | T-INT-12, T-SEC-02 |
| Original portfolio (§8.12)       | —            | Panel link                            | — → new tab                 | —                           | All                                   | —                                      | —                                   | Always present                   | —                       | T-SEC-03           |
| Globe (§8.3)                     | KIN+SIM      | Drag, arrows, Enter/Space             | rest → rotating → rest      | Coast ≤ 4 s                 | All                                   | Slider keeps focus                     | Catch                               | No WebGL → static                | No inertia              | T-PHY-01–03        |
| Lamp switch (§8.13)              | ANIM+FX      | Click, Enter/Space                    | on ↔ off                   | 160–240 ms                  | All                                   | Stays                                  | Reverse                             | Layers missing → glow only       | Instant                 | T-PHY-09           |
| Plants (§8.4)                    | SIM          | Pointer movement                      | rest → sway → rest          | ≤ 1.5 s                     | Pointer                               | —                                      | —                                   | —                                | None                    | T-PHY-11           |
| Pen (§8.14)                      | ANIM         | Click, tap, Enter                     | closed → contact composer   | 220 ms fade                 | All                                   | Heading ↔ pen                         | Latest state wins                   | Mail-app/copy fallback           | Functional, ≤120ms fade | T-PHY-07           |
| Books / spines (§8.2)            | KIN+ANIM     | Click, drag-pull, Enter/Space         | shelved → pulled → booklet  | 180 ms + booklet            | All                                   | Booklet heading ↔ spine               | Reverse                             | —                                | No pull                 | T-INT-01           |
| Rubik's cube (§8.6)              | KIN+SIM+ANIM | Drag, click, Enter/Space              | solved → sequence → solved  | ≤ 2.1 s                     | All (sequence); pointer (orientation) | Stays                                  | Ignored mid-sequence                | —                                | Hidden                  | T-PHY-06           |
| Coffee mug (§8.5)                | FX           | Hover                                 | steam once                  | 1.2 s                       | Pointer                               | —                                      | —                                   | —                                | None                    | —                  |
| Article booklet (§8.7)           | ANIM         | Spine activation                      | closed → open booklet       | `--motion-drawer`           | All                                   | Booklet heading ↔ spine               | Reverse                             | No entries → spine absent        | Fade                    | T-INT-01           |
| Pinned links (§8.10)             | ANIM         | Click, Enter                          | — → external tab            | 150 ms lift                 | All                                   | —                                      | —                                   | Unverified → absent              | No lift                 | T-SEC-03           |
| Currently Building (§8.9)        | ANIM         | Click, Enter                          | note → drawer               | 320 ms                      | All                                   | Drawer heading ↔ note                 | §3.3                                | No content → hidden              | Fade                    | T-DES-04           |
| Images/videos (§7, §8.16)        | ANIM         | Play, lightbox                        | poster → player             | —                           | All                                   | Player / dialog                        | Close releases the source           | Inline error slip                | Same; no autoplay       | T-MED-02, T-INT-07 |

## Current drawer and book authority

D-34 supersedes earlier crown-spine entry and drawer-category examples. Render exactly About Me, Projects, Patents, Experience, Education, Achievements, Skills & Toolbox, Certifications. The open desk book is the sole collection entry for approved writing/notes/articles/albums. Use the existing booklet region/sheet focus, Escape, Back and reduced-motion contracts; album thumbnails have dimensions, lazy loading, supplied ordering and captions, and optional keyboard/touch lightbox with restored focus. No album assets means no album category.
