# Physics & Interactions — Physical World Specification

**Status:** new in Phase 1.1. This is the authoritative document for simulated motion, lighting, contact, and the physics architecture.
**Related:** [micro-interactions.md](micro-interactions.md) owns the interaction contract: states, focus, history, tokens, and CSS transitions. Where an interaction is simulated, micro-interactions.md links here for the motion model. [design.md](design.md) owns appearance. [responsive-design.md](responsive-design.md) owns layout.
**Phase boundary:** this is a specification only. No physics code or library is installed or written in Phase 1.1.

---

## 0. Goal and honesty rule

The Shelf should feel like a **convincing physical workspace**: things have weight, stop where friction says they stop, rest on surfaces, and are lit by one consistent light. It must **not** run a full physics simulation of every object all the time.

Every interactive motion is labelled with exactly one technique. Documentation, code comments, and release notes must use these labels honestly:

| Label    | Meaning                                                                                                                 | Claims allowed                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **SIM**  | Numerically integrated dynamics (velocity, damping, constraints) stepped per frame                                      | "Simulated"                                                  |
| **KIN**  | Pointer-driven kinematics: the object follows the input directly, under constraints, with a simulated settle on release | "Follows your drag", "settles"                               |
| **ANIM** | A predefined CSS or WAAPI transition or keyframe animation                                                              | "Animated". Never "physics".                                 |
| **FX**   | Visual effect only (light pools, glow, steam, pre-authored shadows)                                                     | "Lighting effect". Never "dynamic lighting" unless computed. |

Accuracy statement for the site and docs: _"Motion uses simplified, stable physical models tuned for feel. It is not an exact physical simulation."_

---

## 1. Object classification

Each object is classified on five axes, as required by [design.md](design.md) §4.4.

| Object                      | Decorative | Interactive | Functional (reveals content or links) | Physics-driven              | Environment-responsive (lamp) | Technique                       |
| --------------------------- | ---------- | ----------- | ------------------------------------- | --------------------------- | ----------------------------- | ------------------------------- |
| Drawers (8)                 | —          | ✓           | ✓ (open drawers)                      | ✓ (1-DOF track)             | Shadows                       | KIN + SIM settle; ANIM fallback |
| Folders, files              | —          | ✓           | ✓                                     | —                           | —                             | ANIM (FLIP)                     |
| Laptop                      | —          | ✓           | ✓ (résumé, original portfolio)        | ✓ (hinge)                   | ✓ (screen spill)              | KIN + SIM hinge                 |
| Desk lamp                   | —          | ✓           | —                                     | —                           | Is the light source           | ANIM + FX                       |
| Globe                       | —          | ✓           | —                                     | ✓ (1-DOF spin)              | ✓ (shading)                   | KIN + SIM inertia; WebGL render |
| Book spines (Writing)       | —          | ✓           | ✓ (Writing booklet)                   | —                           | Shadows                       | KIN pull + ANIM                 |
| Writing booklet             | —          | ✓           | ✓                                     | —                           | —                             | ANIM                            |
| Rubik's cube                | —          | ✓           | —                                     | ✓ (yaw spin; lift-and-turn) | Shadows                       | KIN + SIM; ANIM face turns      |
| Pen                         | —          | ✓           | ✓ (contact)                           | —                           | Shadows                       | ANIM                            |
| Plants (hanging; on books)  | ✓          | Hover only  | —                                     | ✓ (damped leaf springs)     | ✓ (shadows)                   | SIM (small)                     |
| Coffee mug                  | ✓          | Hover only  | —                                     | — (static, heavy)           | Shadows                       | FX (steam)                      |
| Desk speaker (D-40)         | ✓          | —           | —                                     | — (static)                  | Contact shadow                | —                               |
| Stacked books under plant   | ✓          | —           | —                                     | —                           | Shadows                       | —                               |
| Identity frame              | —          | ✓           | ✓ (About)                             | —                           | Shadows                       | ANIM                            |
| Pinned note and social pins | —          | ✓           | ✓                                     | —                           | Shadows                       | ANIM                            |

Rule: an object that is **functional** must never depend on physics to be usable. Every functional object has a non-physics activation: click/tap or Enter for anchors, Enter/Space for buttons.

---

## 2. World model

### 2.1 Coordinates and units

- **Scene space** is a 2.5D front-elevation space authored on a reference artboard of **1440 × 900 scene units (su)**. At scene scale `s = 1`, 1 su = 1 CSS px. The runtime scale `s` comes from [responsive-design.md](responsive-design.md) §3.
- Axes: **+x right, +y down, +z toward the viewer**. The desk surface plane is y = `y_desk` (per object footprint).
- Angles are in radians in code and degrees in this doc where clearer. Positive rotation about an axis follows the right-hand rule.
- Time is in seconds. Velocities are in su/s or rad/s.
- **Physical scale (for plausibility only):** the desk is about 1.2 m wide, so 1 su ≈ 0.8 mm. True gravity therefore ≈ **11,800 su/s²**. Gravity is used only where noted (the pen's rocking settle and the cube's set-down). Nothing free-falls during normal browsing (§5.7).
- All physical constants scale with `s` in screen space automatically, because simulation runs in su and the result is transformed to pixels.

### 2.2 Integrator

- **Semi-implicit (symplectic) Euler**, fixed timestep **h = 1/120 s**, with an accumulator. At most **4 substeps per frame**. Leftover time is carried.
- **Clamp frame dt to 1/30 s** (after a tab switch or a long task) so nothing teleports or explodes.
- NaN or Infinity guard: if any state becomes non-finite, snap the body to its rest state, put it to sleep, and log once (development builds only).

### 2.3 Standard models

| Model                                      | Equation                                                                                                      | Parameters                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Spring to target (drawers, hinge, returns) | `a = −k(x − x*) − c·v`                                                                                        | `k = (2πf)²`, `c = 2ζ(2πf)`. Specify by frequency `f` (Hz) and damping ratio `ζ`. |
| Viscous plus Coulomb friction (spin, roll) | `a = −c·v − μ·sign(v)`                                                                                        | `c` (s⁻¹), `μ` (units/s²)                                                         |
| Rocking to stable orientation (pen clip)   | `α'' = −κ·sin(α − α₀) − c·α'`                                                                                 | `κ` (s⁻²), `c`                                                                    |
| Velocity estimate on release               | Least-squares slope of position over the last **100 ms** of pointer samples (at least 3 samples, otherwise 0) | —                                                                                 |

Reference settle times. Critically damped (ζ = 1) settles within 1% at `t ≈ 6.64 / (2πf)`:

- f = 3.0 Hz → 0.35 s (matches `--motion-drawer` 320 ms in [micro-interactions.md](micro-interactions.md) §2)
- f = 2.6 Hz → 0.41 s

### 2.4 Sleep and stability

- A body **sleeps** when `|v| < ε_v` and `|x − x_rest| < ε_x` for 100 ms. It then snaps exactly to its rest or target value.
- For free-coasting spin/roll, clamp velocity to zero when friction would cross zero in a substep; never let Coulomb friction reverse a resting body. Free rotation sleeps by velocity alone; the position-to-rest criterion applies only to targeted springs.
- Every velocity is clamped to a per-body maximum. Every position is clamped to its constraint range. Constraints are applied **after** integration in each substep.
- Inputs always override simulation. A pointerdown on a moving body sets its velocity to 0 and hands control to the pointer ("catching").

---

## 3. Lighting model

### 3.1 Light sources

| Source                    | Position                                                                                                                        | Character                                                   | States                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| **Desk lamp (key light)** | The lamp head, upper right of the cabinet ([design.md](design.md) §2). Scene coordinates are taken from the final illustration. | Warm, directional cone down-left onto the crown and desk    | Permanently on (D-27)                                     |
| **Ambient (room)**        | Diffuse, from the upper left (a notional window)                                                                                | Neutral-warm, soft                                          | Always on                                    |
| **Laptop screen**         | Laptop screen plane                                                                                                             | Faint cool-neutral spill on the desk in front of the laptop | Proportional to screen brightness `b` (§4.3) |

### 3.2 Deliberate approximation

Full dynamic lighting (per-pixel lights and real-time shadow maps) is **rejected**. It needs WebGL for the whole scene, conflicts with the hand-drawn style, and costs battery. Instead:

1. **Static authored lighting (D-27, D-38).** Each object combines ambient material shading, directional highlights, cast shadows and a contact shadow. The lamp has one permanently lit state.
   D-42 deepens the desk wood and adds a faint, blurred window-and-leaf shadow on the desktop wall; it does not add a light state or animation.
2. The reflector and bulb are recessed within a thick shade rim. Articulated arms connect through visible joints to a weighted foot; highlights follow the metal's curvature. Soft cone falloff stays local to the shade and crown.
3. No switching, stored state, animated filters or pointer-following light. The wall pool is below the cabinet and identity in stacking order; the globe's spherical overlay and metal stand remain separate from its existing rotation controller.
4. **Shadow direction rule** (for authoring and checking): an object's cast-shadow offset vector is `normalize(P_object − P_lamp) × h × k`, where `h` is the object's height above its contact surface and `k ≈ 0.35`. Penumbra width grows with distance from the contact point. Contact shadows stay sharp at the contact line. All cast shadows in a state must agree with this rule (T-PHY-08).
5. **Moving objects** (plant leaves, pen, cube, globe, laptop lid): their cast shadows are blurred duplicates of the moving part's silhouette, with the same transform plus the light offset. Shadow and object therefore always agree, cheaply.
6. **Globe shading** has a fixed light direction, rounded terminator and subtle specular highlight. Its intensity does not depend on a lamp state. The existing sphere projection and spin controls are retained in D-38.

### 3.3 Readability guarantee

UI layers (drawer labels, chips, buttons, trays, records, text) sit **above** environmental lighting and are never tinted or dimmed by it. Contrast is checked with the permanent lighting (T-A11Y-03); there is no second lamp state.

---

## 4. Objects

### 4.1 Globe (SIM spin with KIN drag; WebGL render)

**Geometry and rendering**

- A true sphere rendered **orthographically** in a small WebGL canvas. A full-quad fragment shader performs ray-sphere intersection per pixel, converts the hit point to latitude/longitude in the globe's body frame, and samples an **equirectangular texture**.
- Desk-globe realism: the sphere rotates only about its **polar axis** (1 DOF), and the axis is tilted **23.4°** in the image plane, mounted in a meridian ring and stand (static illustration).
- Texture: a public-domain world raster (e.g. a Natural Earth or NASA public-domain source, licence recorded in `media.csv`), processed to the muted palette. 1024 × 512 by default, 2048 × 1024 if the rendered diameter × DPR exceeds 256 px. WebP, with the size measured in Phase 3.
- **Alignment convention:** `u = (λ + π) / 2π` with λ east longitude in [−π, π]; `v = (π/2 − φ) / π` with φ latitude. North is up. The shader must not mirror the map. Check: with Africa facing the viewer, its west coast is on the viewer's left (T-PHY-02).
- Rest orientation: the central meridian faces 78° E (India) by default. The owner may change this (it is a single constant).
- Canvas pixel size = CSS size × min(devicePixelRatio, 2). Render only when the angle or lighting changed; there is no continuous render loop.

**Dynamics**

- State: central-meridian angle θ, angular velocity ω.
- Drag (KIN): `θ ← θ0 − Δx / R` (R = rendered radius in px), so the surface under the pointer's horizontal line moves with the pointer, without slip, at the centre line. Vertical drag is ignored, because a desk globe cannot pitch.
- Release: `ω0` = release velocity estimate (§2.3), clamped to **|ω| ≤ 6 rad/s** (about 1 rev/s).
- Coast (SIM): `ω' = −1.2·ω − 0.4·sign(ω)` rad/s². Sleep when `|ω| < 0.02 rad/s`. From the maximum speed it stops in ≈ 2.4 s. Hard limit: always stops within 4 s (T-PHY-01).
- No uncontrolled acceleration: the only energy input is a user gesture. ω never increases during coasting.
- Touch: `touch-action: pan-y` on the canvas, so vertical page scrolling still works and horizontal drags spin. Uses pointer capture. `pointercancel` releases with ω = 0.
- The wheel is **not** captured (no scroll hijacking).

**Accessible alternative**

- Element: the canvas sits inside a focusable wrapper with `role="slider"`, accessible name "Desk globe", `aria-valuemin="-180"`, `aria-valuemax="180"`, `aria-valuenow` = the central-meridian longitude, and `aria-valuetext` such as "Facing 78 degrees east".
- Keys: Left/Right rotate by 15° (an ANIM ease over 200 ms); Home returns to rest; Enter/Space gives a spin impulse (ω = 3 rad/s, unless reduced motion is on).
- Reduced motion: no impulse and no coasting. Arrow keys jump instantly. Drag is still direct (motion only follows the user's own input) and stops on release.
- Fallbacks: no WebGL → a 2D canvas that samples per pixel at ≤ 192 px diameter. Canvas unavailable or the frame budget is exceeded (§6) → a static illustrated globe that is decorative (`aria-hidden`, no slider).

### 4.2 Lamp and environmental lighting (ANIM + FX)

- **Decided (D-27, 2026-10-25): no switch.** The lamp is decorative (`aria-hidden`, never a hit target) and always lit: a warm bulb glow, a soft cone under the shade and a static warm pool on the scene. The "lamp on" lighting below is the only state; the "lamp off" rules are retired.
- The lamp is **not** a theme switch: there is no dark mode, and UI colours never change (§3.3).
- D-38 construction: parallel articulated arms, pivot screws, a weighted foot and cable, brushed metal shading, a thick shade rim, an elliptical reflector and a recessed warm emitter. No separate flat bulb disk outside the shade. The cone is softly blurred within the lamp SVG; the wall pool does not wash over drawer labels or the portrait.
- Failure: if lighting layers fail to load, the scene shows the base illustration with the bulb glow.

### 4.3 Laptop (KIN + SIM hinge; functional)

**Mechanics**

- Hinge axis: horizontal, along the rear edge of the base. Lid angle φ: **0° closed**, open target **105°**, mechanical stop **120°**, minimum 0°.
- Rendering: the lid is a plane rotated with CSS 3D `rotateX` about a `transform-origin` on the hinge line, perspective ≈ 900 px. The base is static.
- Click, tap, or Enter/Space → spring to the target (SIM: **f = 2.6 Hz, ζ = 1.0**, ≈ 0.41 s, no overshoot): this is "friction-hinge" resistance.
- Drag (KIN): a vertical drag on the lid edge sets `φ = clamp(φ0 − Δy·0.6°/px, 0°, 120°)`. On release: open if `φ > 45°` or the opening velocity > 150°/s; otherwise close.
- Screen brightness `b`: 0 while φ < 60°. After φ ≥ 60°, a 150 ms "wake" delay, then 0 → 1 over 250 ms. The desk spill opacity = 0.3·b (§3.1).

**Screen content (functional)**

- The desk laptop is small, so a readable screen requires this: once the lid reaches the target, the screen area **expands** (FLIP, `--motion-base`) into a **laptop panel**: a dialog styled as the laptop screen with its bezel. Closing shrinks the panel back into the screen, then the lid closes.
- Panel contents:
  1. heading "Résumé" plus a real "last updated" date
  2. preview: an image of page 1 of the **approved public résumé** (generated at build from the approved PDF; meaningful alt text and a text link)
  3. **View résumé (PDF) ↗** (new tab) and **Download résumé (PDF)** (`download` attribute, with the file size shown)
  4. **Open original portfolio ↗** (new tab; external-link indicator)
  5. **Back to shelf** (closes)
- **D-39 supersedes the preceding panel-content layout:** the original portfolio is embedded on opening, filling the existing screen. A `ResizeObserver` measures untransformed layout dimensions, sets a numeric scale against a 1024px-or-wider viewport, and derives iframe height from the available screen height. Native iframe scrolling, links and typing stay within the remote browsing context. Without JavaScript, the direct `/laptop/` route renders the iframe at the available screen size.
- A parent-owned footer retains Close and Open in tab even if the remote site fails or later blocks framing. Shelf search remains available in its own screen view. The illustrated trackpad focuses the remote frame; it does not simulate cross-origin scrolling. Letter keys operate Shelf search; Home returns to the portfolio. No changes to the physical laptop geometry or hinge.
- Fallbacks: no approved résumé → the résumé items are absent and only the original portfolio link plus a contact link remain. The preview image fails → show the text links only. The PDF is missing at build → **the build fails** (T-MED-01).

**Access and focus**

- `<button aria-expanded aria-controls="laptop-panel">` named "Open laptop: résumé and original portfolio".
- On open, focus moves to the Portfolio heading. Closed and inactive screen views are inert. Escape closes from the parent document; events inside the remote iframe cannot be captured by the parent. The visible parent Close action is always available. Focus returns to the laptop trigger.
- Mobile ([responsive-design.md](responsive-design.md) §5): the lid animation is shortened to ≤ 200 ms or skipped, and the panel opens as a full-screen sheet.
- Reduced motion: no lid animation and no expansion. The panel fades in over 120 ms. The lid is drawn open while the panel is open.

### 4.4 Rubik's cube (KIN + SIM yaw; ANIM face turns)

- **Level 1, at launch (D-26):** a manipulable _object_, not a solvable puzzle UI.
  - **Yaw spin on the desk (SIM):** a horizontal drag spins the cube about the vertical axis. Coast: `ω' = −2.5·ω − 1.0·sign(ω)`. |ω| ≤ 8 rad/s. It stops within 2 s. It stays in its footprint (no translation), so it can never collide with other objects.
  - **Lift-and-turn (KIN + ANIM):** a vertical drag past 24 px lifts the cube 4 su, rotates it 90° about the horizontal x-axis through its centre, and sets it down (280 ms, gravity-like ease-in on set-down). The contact shadow tightens on contact. The cube always rests **face-down on the desk**: its stable resting state is one of 24 orientations × any yaw.
  - **Face turns (ANIM on a real state model):** activating the cube (click, Enter, Space) plays the fixed sequence R U R′ U′ and then its exact inverse (8 quarter turns at 220 ms each, with 30 ms gaps, ≤ 2.1 s). Rendering is derived from a 54-facelet state model. Each move is a permutation of that model. The model must equal "solved" after the sequence (T-PHY-06). No impossible cube state can ever be drawn.
- **Level 2 (optional, owner decision):** user face turns by dragging on a face. It needs the same state model plus hit-testing, and is out of scope for launch.
- Keyboard: the cube is a `<button>` named "Rubik's cube: play a short turn sequence". Enter/Space plays the sequence. Pointer-only orientation manipulation is acceptable because it is decorative and carries no information.
- Reduced motion: face turns and coasting are disabled. The button is decorative (`aria-hidden`).

### 4.5 Pen — functional contact entry

The later written request supersedes the original rolling-pen toy. The pen stays in its desk footprint and opens the contact composer; it does not roll, collide or require an integrator. See [micro-interactions.md](micro-interactions.md) §8.14 and [phase-3-handoff.md](phase-3-handoff.md). Reduced motion preserves contact functionality. No sound.

### 4.6 Books

- **Writing spines (functional; KIN + ANIM).** Constrained 1-DOF pull along the shelf depth (toward the viewer), `p ∈ [0, 0.35]` of the book depth.
  - Hover/focus: p = 0.06.
  - Activation: p → 0.35 (180 ms), then the Writing booklet opens ([micro-interactions.md](micro-interactions.md) §8.7). On close, p → 0.
  - Optional drag-pull: dragging downward on the spine top pulls it. Release past 60% opens Writing; otherwise a spring returns it (f = 4 Hz, ζ = 0.9).
  - Justification: books are navigation controls, so they are deliberately **not** free bodies. Predictability beats realism here.
- **Stacked books under the plant:** static and decorative. They are a support surface for the plant pot (resting contact; the pot never moves).

### 4.7 Plants (small SIM)

- 3–5 rigid leaf groups per plant, each a damped angular spring about its stem attachment: `f = 1.6 Hz, ζ = 0.25`, settles ≤ 1.5 s.
- Excitation: pointer movement across a leaf group adds an angular impulse proportional to the pointer speed, capped at **±4°**. There is no click action unless a "Currently learning" record exists ([design.md](design.md) §4.4).
- Shadows follow §3.2 rule 5, so they stay consistent with the lamp.
- Touch: none (a tap passes through to whatever is beneath).
- Reduced motion: none.

### 4.8 Coffee mug (static; FX)

- High perceived mass: it **never moves** under any interaction, so it serves as a stable collider for the pen.
- Steam effect (FX) on pointer hover, as in [micro-interactions.md](micro-interactions.md) §8.5. Contact shadow fixed.

### 4.9 Shelf, drawers, folders, files

**D-37 implementation override (2026-10-25):** the drawer uses one layered HTML/CSS assembly animated through browser-native Web Animations. The earlier front-only displacement and optional handle-drag simulation below are superseded by [micro-interactions.md](micro-interactions.md) §5.1. Floor, walls, front and handle share the same assembly transform; only the outer clip reveals the portion emerging from the fixed cabinet slot. No free-running animation loop, physics package or 3D engine is introduced.

**Drawers (1-DOF track; KIN + SIM; ANIM fallback)**

- State: the normalized pull `p ∈ [0, 1]` (1 = the open position). Visual mapping: `translateY = p·--drawer-pull`, `scale = 1 + 0.015p`, tray reveal `clip-path` ∝ p (consistent with [micro-interactions.md](micro-interactions.md) §5.1).
- Click, tap, or Enter on the navigation anchor → spring to the target (f = 3.0 Hz, ζ = 1.0 ≈ 0.35 s, no overshoot, hard stops at 0 and 1).
- Drag on the handle (KIN) along the track: 1:1 for p < 0.8, then 0.5:1 (felt resistance near full extension), with no travel beyond the limits. Release: open if `p > 0.35` or `v > 1.5/s`, else close.
- **Logical vs visual state.** The controller's logical state (closed, open) is set by the **target**, not by p. Tray content is visible from p ≥ 0.6 and **interactive and focusable only when the logical state is open and p = 1**. An interruption therefore never leaves content half-accessible.
- Watchdog: if p has not reached the target within 2× the expected settle time, snap p to the target.
- Contact and overlap: drawers move only along their own track. An open tray sits at `--z-tray` above the lower cabinet and never intersects other drawer fronts.
- Without JS, or if the physics module fails: the CSS transition from [micro-interactions.md](micro-interactions.md) §5.1 (same end states).

**Folders and files (ANIM)**

- Folders stand on a fixed grid in the tray, aligned to the tray's inner baseline (folder bottoms rest on the drawer floor; no floating). Folders never overlap.
- File opening uses FLIP (micro-interactions.md §5.4). No simulation.

---

## 5. Architecture evaluation

### 5.1 Options

| Option                                                     | Fits                                                           | Bundle                                       | Runtime                             | Maintenance          | Accessibility                            | Testing                                    | Verdict                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------- | ----------------------------------- | -------------------- | ---------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| CSS transitions and transforms                             | Folder/file FLIP, chips, fades, lamp cross-fade, all fallbacks | ~0                                           | Compositor                          | Trivial              | Native reduced-motion via media query    | Visual                                     | **Use** for all ANIM                                                                                  |
| Pointer kinematics + tiny custom integrator (1-DOF bodies) | Drawers, laptop hinge, globe θ, pen, cube yaw, leaves          | A few KB (measure in Phase 3)                | Small; runs only while awake        | Low (pure functions) | Full control over keyboard paths         | **Deterministic unit tests**               | **Use** for SIM/KIN                                                                                   |
| Lightweight 2D physics library (rigid bodies, broad-phase) | Free collisions between many bodies                            | Tens of KB or more (measure before adopting) | Continuous stepping                 | Medium               | No benefit                               | Harder (nondeterministic)                  | **Reject**. No interaction needs free multi-body collision; every motion is a 1-DOF constrained body. |
| Full WebGL 3D scene/engine                                 | Real lighting, true 3D                                         | Large (≥ 100 KB class)                       | GPU-heavy, battery                  | High                 | DOM content would live outside the scene | Hard                                       | **Reject** for the scene (also breaks the hand-drawn style)                                           |
| Raw WebGL, single fragment shader (no engine)              | Globe sphere only                                              | A few KB of code plus the texture            | One small canvas, renders on change | Low                  | Wrapped in a slider control              | Pixel snapshot plus unit tests of the math | **Use** for the globe only, with 2D-canvas and static fallbacks                                       |
| Hybrid                                                     | —                                                              | —                                            | —                                   | —                    | —                                        | —                                          | **Chosen:** CSS ANIM + custom 1-DOF SIM/KIN + one raw-WebGL globe                                     |

This keeps [design.md](design.md) §15 ("no 3D engine, no physics library"). The raw shader is a documented, isolated exception.

### 5.2 Module layout (future)

`src/scripts/physics/`: `scheduler.ts` (the single rAF loop), `integrators.ts` (spring, friction, rocking), `bodies/{drawer,hinge,globe,cube,leaf}.ts`, `globe-renderer.ts` (WebGL with fallbacks). Each body exposes `step(h)`, `sleep()`, `toRest()`, `serialize()`, so it can be tested without a browser. Modules for the globe, pen, cube, and leaves are **lazy-loaded** (on the first pointer intent or when idle after load), so they are not in the critical path. Budget: physics modules excluding the drawer body ≤ 12 KB compressed; the drawer body is part of the shelf controller budget ([design.md](design.md) §17).

---

## 6. Performance and stability

- **One scheduler**, one rAF loop. It runs only while at least one body is awake or dragging. **Zero frames scheduled when idle** (T-PHY-10).
- **At most 3 awake bodies.** Starting a 4th puts the oldest _toy_ (pen, cube, leaves, globe) to rest immediately. Drawers and the laptop are never preempted.
- **Off-screen:** an IntersectionObserver snaps off-screen bodies to rest and sleeps them. `visibilitychange` (hidden) pauses the loop. On return, the dt clamp applies.
- **Event cleanup:** each body owns an `AbortController` for its listeners. Pointer capture is released on `pointerup`, `pointercancel`, and `lostpointercapture`. Bodies are disposed when their component unmounts or the page hides.
- **Frame-time monitoring:** a rolling 60-frame average. If it exceeds 24 ms for 2 s while bodies are awake, enter **reduced-physics mode** for the session: toys become static, the globe falls back to static, and drawers and the laptop use the CSS fallback. Never sniff the user agent or device; decide from measured frame time only.
- **Mobile:** canvas DPR is capped at 2. No physics runs during page scroll. Toys are lazy-loaded only after first interaction on coarse-pointer devices.
- **Failure safety:** a module load error, WebGL context loss, or exception → that object falls back (static or CSS). Functional objects (drawers, laptop) always keep working via the ANIM path. Media failures are covered in [micro-interactions.md](micro-interactions.md) §7.

---

## 7. Reduced motion and input parity (summary)

| Object         | Reduced motion                     | Keyboard                  | Touch                        |
| -------------- | ---------------------------------- | ------------------------- | ---------------------------- |
| Drawers        | Instant state change; 120 ms fade  | Enter, Escape             | Tap; drag optional           |
| Laptop         | No lid motion; panel fade          | Enter/Space, Escape       | Tap → sheet                  |
| Lamp           | Instant                            | Enter/Space               | Tap                          |
| Globe          | No inertia or impulse; arrows jump | Arrows, Home, Enter/Space | Horizontal drag              |
| Cube           | Decorative, hidden                 | Enter/Space (sequence)    | Drag; tap plays the sequence |
| Pen            | Decorative, hidden                 | Enter/Space               | Tap                          |
| Books (spines) | No pull motion                     | Enter                     | Tap                          |
| Plants, mug    | None                               | — (decorative)            | —                            |

---

## 8. Acceptance tests

**Auto-unit** = deterministic tests on the pure `step()` functions with injected time. **Auto-e2e** = Playwright. **Manual** = recorded human check.

| ID       | Scenario                            | Type                                                      | Pass criteria                                                                                                                                                                                      |
| -------- | ----------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ---------------- |
| T-PHY-01 | Globe damping                       | Auto-unit                                                 | From ω = 6 rad/s, ω decreases monotonically and the body sleeps within 4 s.                                                                                                                        | ω   | never exceeds 6. |
| T-PHY-02 | Globe texture orientation           | Manual + Auto-e2e snapshot                                | North up. Not mirrored (Africa's west coast on the viewer's left when Africa faces the viewer). Rest longitude = the configured constant.                                                          |
| T-PHY-03 | Globe keyboard and slider semantics | Auto-e2e                                                  | Arrows change `aria-valuenow` by ±15; Home resets; the accessible name is present.                                                                                                                 |
| T-PHY-04 | Drawer limits and interruption      | Auto-unit + Auto-e2e                                      | p ∈ [0, 1] always. Overshoot = 0. Reversing mid-motion converges to the new target. Content is focusable only in the open state with p = 1.                                                        |
| T-PHY-05 | Laptop hinge                        | Auto-unit + Auto-e2e                                      | φ ∈ [0°, 120°]. Rests at 105° when open. Screen b = 0 for φ < 60°. Focus moves into the panel and returns to the laptop button.                                                                    |
| T-PHY-06 | Cube state consistency              | Auto-unit                                                 | After the sequence plus its inverse, the 54-facelet model equals solved. Every rendered frame corresponds to a valid state.                                                                        |
| T-PHY-07 | Pen contact                         | Auto-e2e + Manual                                         | Click/tap/Enter opens one composer; Escape/Back closes and restores focus. Invalid input retains text. Mail-app/copy actions never claim delivery. Same function without motion; no fake endpoint. |
| T-PHY-08 | Shadow consistency                  | Manual                                                    | With permanent lighting, every cast shadow follows the §3.2 direction rule. Moving-object shadows track their objects.                                                                                  |
| T-PHY-09 | Permanent lamp                         | Auto-e2e + Manual                                         | Lamp is decorative and always lit. No switch, focus stop, pointer tracking or stored lamp state. UI contrast passes; bulb stays inside its reflector.                                                                                   |
| T-PHY-10 | Idle loop                           | Auto-e2e                                                  | With instrumentation counting rAF callbacks, 0 callbacks occur during 2 s after all bodies sleep.                                                                                                  |
| T-PHY-11 | Repeated interactions               | Auto-e2e                                                  | 200 random interactions across all objects: no exception, no NaN, every body ends at rest, and no layout shift outside the tray.                                                                   |
| T-PHY-12 | Interrupted animations              | Auto-e2e                                                  | Starting any interaction mid-motion of another, or navigating Back mid-motion, leaves all logical states consistent with the URL ([micro-interactions.md](micro-interactions.md) §3.3).            |
| T-PHY-13 | Touch and keyboard parity           | Auto-e2e (mobile emulation) + Manual (real device)        | Every functional object is reachable and operable by touch and keyboard. Globe drag doesn't block vertical page scroll.                                                                            |
| T-PHY-14 | Reduced motion                      | Auto-e2e (`prefers-reduced-motion: reduce`)               | No inertia or toy motion. Cube hidden from the accessibility tree; pen contact stays operable. All functional paths work.                                                                          |
| T-PHY-15 | Low-power behaviour                 | Manual (mid-range Android) + Auto-e2e (CPU throttling 4×) | Interactions stay usable. If the frame time exceeds the threshold, reduced-physics mode engages, and functional objects still work.                                                                |
| T-PHY-16 | Physics budget                      | Auto (bundle report)                                      | Lazy physics modules ≤ 12 KB compressed. None load before interaction or idle.                                                                                                                     |
