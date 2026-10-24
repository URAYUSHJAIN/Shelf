# Documentation Quality & Release Gates

**Status:** new in Phase 1.
**Purpose:** keep the documentation complete, consistent, truthful, and in sync with the implementation, and link every critical requirement to at least one verification method.

---

## 1. Required documentation

Checked by the doc gate (§3, DQ-1). A missing file fails the gate.

| File                                                                       | Owner of truth for                                         |
| -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `README.md`                                                                | Entry point, reading order, workflow                       |
| `AGENTS.md`                                                                | General coding-agent contract                              |
| `CLAUDE.md`                                                                | Claude Code–specific workflow (extends AGENTS.md)          |
| `agent.md`                                                                 | Compatibility pointer                                      |
| `docs/design.md`                                                           | Visual contract and invariants                             |
| `docs/micro-interactions.md`                                               | Interaction and motion behaviour                           |
| `docs/physics-and-interactions.md`                                         | Simulated motion, lighting, physics architecture and tests |
| `docs/responsive-design.md`                                                | Layout modes, viewports, responsive tests                  |
| `docs/contest.md`                                                          | Extraction and reconciliation brief                        |
| `docs/content-inventory-template.md`                                       | Data contract                                              |
| `docs/asset-organization.md`                                               | Folder, asset, and schema structure                        |
| `docs/seo-optimization.md`                                                 | Search                                                     |
| `docs/ai-optimization.md`                                                  | Entity identity, AI discovery                              |
| `docs/security.md`                                                         | Security, privacy, release blockers                        |
| `docs/implementation-and-validation.md`                                    | Phases and test catalogue                                  |
| `docs/documentation-quality.md`                                            | This file                                                  |
| `docs/open-decisions.md`                                                   | Owner decisions                                            |
| `docs/reference/the-shelf-concept-board.png`                               | Visual reference (private, D-16)                           |
| `docs/workspace-audit.md`                                                  | Phase 1 discovery (internal, D-16)                         |
| `docs/phase-1-completion-report.md`, `docs/phase-1.1-completion-report.md` | Phase records (historical; not updated after the fact)     |

**Single source of truth rule:** each topic has one owning file (table above). Other files link to it and do not restate its rules. Agent instruction files summarize and link; they never introduce a rule that the owning file lacks.

## 2. Checks

| ID    | Check                                 | Type          | Method                                                                                                                                                                                               | Failure                                              |
| ----- | ------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| DQ-1  | Required docs exist                   | Auto          | Script checks the §1 list                                                                                                                                                                            | Any missing                                          |
| DQ-2  | Markdown formatting                   | Auto          | `prettier --check "**/*.md"` (installed). Recommended addition: markdownlint-cli2.                                                                                                                   | Unformatted file / lint error                        |
| DQ-3  | Local links resolve                   | Auto          | `scripts/check-links.mjs`: every relative `[text](path)` and `#anchor` in `portfolio2.0/**/*.md` resolves                                                                                            | Broken link or anchor                                |
| DQ-4  | Source-path references exist          | Auto          | Every backticked workspace path beginning with `portfolio/`, `BuildLog/`, or `context/` exists on the local machine (skipped in CI where the sources are absent)                                     | Missing path                                         |
| DQ-5  | Decision IDs consistent               | Auto          | Every `D-NN` referenced exists in `open-decisions.md` and vice versa                                                                                                                                 | Dangling or unused ID                                |
| DQ-6  | Test IDs consistent                   | Auto          | Every `T-XXX-NN` referenced exists in a test table, and every test is referenced by at least one requirement in §4                                                                                   | Dangling or orphan ID                                |
| DQ-7  | Conflict and finding IDs consistent   | Auto          | `C-NN`, `S-NN`, `L-NN` referenced exist in `workspace-audit.md` or the Phase 2 inventory conflict/scan registers                                                                                     | Dangling ID                                          |
| DQ-8  | Contradiction review                  | Manual        | Reviewer checks §6 hot spots on every docs PR                                                                                                                                                        | Two docs state incompatible rules                    |
| DQ-9  | Missing test cases                    | Auto + manual | Every row of §4 has at least one test ID                                                                                                                                                             | Untested requirement                                 |
| DQ-10 | Unverified factual claims in docs     | Manual        | Facts about the owner in docs are either marked with their source and confidence or phrased as "found in source"                                                                                     | A fact stated as verified without evidence           |
| DQ-11 | Unsupported patent status             | Auto          | Docs never use "patented"/"patent holder", and use "granted" only in rules or definitions                                                                                                            | Status claim                                         |
| DQ-12 | Asset provenance                      | Auto          | Every asset referenced in docs/content has a `media.csv` row (from Phase 3, Stage 1)                                                                                                                 | Missing row                                          |
| DQ-13 | Canonical and social URL consistency  | Auto          | All docs and config use the same canonical host constant and the same social URL forms (casing, C-06)                                                                                                | Divergent URL                                        |
| DQ-14 | Structured-data rules                 | Manual        | Any doc change to JSON-LD types is reflected in `seo-optimization.md` §8 only                                                                                                                        | Rules in two places                                  |
| DQ-15 | Secret and privacy exposure in docs   | Auto          | Secret/PII scan over `portfolio2.0/**/*.md` and `content/`                                                                                                                                           | Any phone number, secret, ID, or confidential detail |
| DQ-16 | Inaccessible interaction requirements | Manual        | Every interaction spec states keyboard, touch, and reduced-motion behaviour                                                                                                                          | A spec missing any mode                              |
| DQ-17 | Documentation drift                   | Auto + manual | §5                                                                                                                                                                                                   | Drift unresolved                                     |
| DQ-18 | Physics honesty                       | Manual + Auto | Every interaction in [micro-interactions.md](micro-interactions.md) §12 has a technique label (ANIM/KIN/SIM/FX); no doc claims "physics" for ANIM; every SIM body has limits, sleep rule, and a test | Unlabelled interaction or unbounded body             |
| DQ-19 | Responsive coverage                   | Auto          | Every viewport category in [responsive-design.md](responsive-design.md) §2 maps to a mode and at least one T-RWD test                                                                                | Uncovered viewport                                   |
| DQ-20 | Phase boundary                        | Auto          | Agent instructions and entry docs distinguish authorized Phase 2 preparation, future Phase 3 implementation, and Phase 4 deployment under D-32                                                       | Any application work attributed to Phase 2           |
| DQ-21 | Placement privacy                     | Auto          | No doc reproduces compensation figures, identity-document numbers, marks, phone numbers, third-party contacts, or redemption codes (pattern scan)                                                    | Any match                                            |

## 3. Tooling status and introduction

| Tool                             | Status                     | Introduction (requires owner approval; do not install in Phase 1)                                             |
| -------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Prettier                         | Installed globally (3.3.3) | Use now: `prettier --check "portfolio2.0/**/*.md"`                                                            |
| Node                             | Installed (20.20.0)        | `scripts/check-links.mjs` and the ID-consistency script can be written without dependencies                   |
| markdownlint-cli2                | Not installed              | Add as a devDependency in Phase 3, Stage 4, with a `.markdownlint.jsonc` (allow long lines in tables)         |
| gitleaks                         | Not installed              | Install the binary in CI or locally; add a `.gitleaks.toml` with allowlisted false positives                  |
| Playwright + axe-core            | Not installed              | Future Phase 3 development dependencies, with installation authorization                                      |
| A link checker for external URLs | Not installed              | Optional (e.g. lychee). External link checks need network access and owner approval. Run monthly post-launch. |

## 4. Requirements-to-tests matrix

Every critical requirement maps to at least one verification. Test definitions: [implementation-and-validation.md](implementation-and-validation.md) §6, [micro-interactions.md](micro-interactions.md) §11, [ai-optimization.md](ai-optimization.md) §11.

| Req  | Requirement                                                                                       | Source                                    | Verification                                          |
| ---- | ------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| R-01 | Shelf is the information architecture                                                             | design INV-01                             | T-DES-06, T-DES-01                                    |
| R-02 | No conventional navbar                                                                            | design INV-02                             | T-DES-02                                              |
| R-03 | No counters                                                                                       | design INV-03                             | T-DES-02, T-CNT-04                                    |
| R-04 | Cabinet recognizable in every state                                                               | design INV-04                             | T-DES-06                                              |
| R-05 | Monochrome chrome; colour only from real assets                                                   | design INV-05, §3.2                       | T-DES-05, T-DES-03                                    |
| R-06 | Screenshots never recoloured                                                                      | design INV-06                             | T-DES-05 (manual)                                     |
| R-07 | Identity frame with approved photo                                                                | design INV-07                             | T-DES-01, owner sign-off (D-05)                       |
| R-08 | One primary surface at a time                                                                     | design INV-08                             | T-INT-03                                              |
| R-09 | All content as HTML at stable URLs                                                                | design INV-09                             | T-SEO-01, T-INT-06                                    |
| R-10 | No autoplay, no continuous motion                                                                 | design INV-10                             | T-MED-02, T-INT-07, T-INT-08                          |
| R-11 | Keyboard/touch parity; no hover-only content                                                      | design INV-11                             | T-A11Y-02, T-RWD-03, T-INT-10, T-PHY-13               |
| R-12 | Reduced-motion parity                                                                             | design INV-12                             | T-INT-05, T-PHY-14                                    |
| R-13 | No fabricated facts                                                                               | design INV-13                             | T-CNT-02, T-CNT-03, T-CNT-04                          |
| R-14 | Exact patent status                                                                               | design INV-14, §7.4                       | T-CNT-05, RB-11                                       |
| R-15 | No empty drawers                                                                                  | design INV-15                             | T-DES-04                                              |
| R-16 | 10-second comprehension                                                                           | design §1.1                               | T-DES-01                                              |
| R-17 | Projects scale via filter chips and featured order                                                | design §6.2                               | T-INT-11, manual review                               |
| R-18 | Back/Forward and Escape work exactly                                                              | micro §3                                  | T-INT-01, T-INT-02                                    |
| R-19 | Interruption: latest intent wins                                                                  | micro §3.3                                | T-INT-03                                              |
| R-20 | Focus moves in and returns                                                                        | micro §4.1                                | T-INT-01, T-INT-04, T-A11Y-02                         |
| R-21 | Scroll lock never sticks                                                                          | micro §4.3                                | T-INT-09                                              |
| R-22 | Single video playback, released on close                                                          | micro §7.1                                | T-INT-07                                              |
| R-23 | Delights finite and non-blocking                                                                  | micro §8                                  | T-INT-08, T-PERF-05                                   |
| R-24 | WCAG 2.2 AA                                                                                       | design §13                                | T-A11Y-01 to T-A11Y-10                                |
| R-25 | Visibility gate on public content                                                                 | template §1.3                             | T-CNT-02                                              |
| R-26 | Internal fields never public                                                                      | template, asset-org §3                    | T-CNT-01, T-SEC-05                                    |
| R-27 | Application/publication/grant distinct                                                            | template §3                               | T-CNT-05                                              |
| R-28 | Deployment state evidence                                                                         | template §2.1                             | T-CNT-04, validate-content rule                       |
| R-29 | Unique metadata, correct canonicals; no thin or filtered pages indexed                            | seo §3, §4, §5                            | T-SEO-02, T-SEO-03, T-SEO-08                          |
| R-30 | Sitemap/robots correctness                                                                        | seo §6                                    | T-SEO-04, T-SEO-05                                    |
| R-31 | JSON-LD matches visible content                                                                   | seo §8                                    | T-SEO-06, T-AEO-05                                    |
| R-32 | No duplicate content across hosts                                                                 | seo §3                                    | T-SEO-03, T-SEO-07                                    |
| R-33 | Previews not indexable                                                                            | seo §3                                    | T-SEO-09                                              |
| R-34 | Consistent entity identity (monitored after launch)                                               | ai §2, §11                                | T-AEO-01, T-AEO-07                                    |
| R-35 | Verified `sameAs` only                                                                            | ai §3                                     | T-AEO-02                                              |
| R-36 | Crawler policy matches the decision                                                               | ai §6                                     | T-AEO-03, T-AEO-04                                    |
| R-37 | No manipulative AI content                                                                        | ai §5.2                                   | T-AEO-06                                              |
| R-38 | No secrets in tree or output                                                                      | security §4                               | T-SEC-01, DQ-15                                       |
| R-39 | No PII in output                                                                                  | security §3                               | T-SEC-02                                              |
| R-40 | Safe external links                                                                               | security §7                               | T-SEC-03                                              |
| R-41 | No source maps or internal files shipped                                                          | security §10                              | T-SEC-04, T-SEC-05                                    |
| R-42 | Security headers and CSP                                                                          | security §8                               | T-SEC-06, T-SEC-07                                    |
| R-43 | No third-party requests                                                                           | security §13                              | T-SEC-08                                              |
| R-44 | Media licensed and owned                                                                          | security §12                              | T-MED-04                                              |
| R-45 | Media performance and stability                                                                   | asset-org §6, design §17                  | T-MED-01, T-MED-02, T-MED-03, T-MED-05, T-PERF-04     |
| R-46 | Production build succeeds; performance budgets met in lab and field                               | design §17, seo §11                       | T-PERF-01, T-PERF-02, T-PERF-03, T-PERF-05, T-PERF-06 |
| R-47 | Responsive with no overflow                                                                       | responsive §7–§8                          | T-RWD-01 to T-RWD-10                                  |
| R-48 | Browser coverage reported honestly                                                                | impl §5                                   | T-BRW-01                                              |
| R-49 | Docs complete, linked, consistent                                                                 | this file                                 | DQ-1 to DQ-7                                          |
| R-50 | Docs match implementation                                                                         | this file §5                              | T-REL-04, DQ-17                                       |
| R-51 | Deployed preview and production verified before and after go-live                                 | impl Stage 22                             | T-REL-01, T-REL-02, T-REL-03                          |
| R-52 | Visual composition matches the concept board, and no board sample text ships                      | design §0.1–§0.2                          | T-DES-07, T-DES-08                                    |
| R-53 | Globe is a true sphere with bounded inertia and a keyboard alternative                            | physics §4.1                              | T-PHY-01, T-PHY-02, T-PHY-03                          |
| R-54 | Drawer track limits; content follows logical state when interrupted                               | physics §4.9, design §0.0                 | T-PHY-04, T-PHY-12                                    |
| R-55 | Laptop hinge, résumé access (approved variant only), original portfolio as a link (no iframe)     | physics §4.3, micro §8.12, security §11.1 | T-PHY-05, T-INT-12, T-SEC-10                          |
| R-56 | Lamp switch with consistent lighting; UI contrast in both states                                  | physics §3, §4.2                          | T-PHY-08, T-PHY-09, T-A11Y-03                         |
| R-57 | Toy physics bounded and stable (pen, cube, plants); cube state consistent                         | physics §4.4–§4.7                         | T-PHY-06, T-PHY-07, T-PHY-11                          |
| R-58 | Physics performance: idle loop stops; budgets; degradation                                        | physics §5–§6                             | T-PHY-10, T-PHY-15, T-PHY-16                          |
| R-59 | Layout modes per viewport, zoom reflow, orientation                                               | responsive §1–§8                          | T-RWD-01 to T-RWD-10                                  |
| R-60 | Nothing from `placement/` ships except the approved résumé; no identity data, marks, compensation | security §3.1, §15                        | T-SEC-09, T-SEC-02                                    |
| R-61 | Credentials labelled by true kind; no unsafe images                                               | design §5.1.2, template §7a               | T-CNT-06                                              |
| R-62 | Profile links reviewed; sameAs contains only the individually eligible subset                     | design §4.4, ai §3                        | T-AEO-02, T-SEC-03                                    |
| R-63 | Patent wording "named inventor"; correct numbers; dated status                                    | design §7.4, template §3                  | T-CNT-05                                              |

### 4.1 Cross-document traceability _(Phase 1.1)_

One authoritative document per topic; others link to it. Validation methods are future (Phase 3) unless marked DQ.

| Topic                     | Authoritative spec                                      | Also referenced in                      | Future validation        | Phase 3 stage |
| ------------------------- | ------------------------------------------------------- | --------------------------------------- | ------------------------ | ------------- |
| Drawer categories         | design §5.1–§5.1.2                                      | open-decisions D-03, seo §4             | T-DES-04, T-DES-07       | 6, 7          |
| Laptop behaviour          | physics §4.3 + micro §8.12                              | design §9 (Laptop panel)                | T-PHY-05, T-INT-12       | 12, 13, 15    |
| Résumé location           | security §11.1                                          | asset-org §2, template §15, D-24        | T-SEC-09, T-INT-12       | 12            |
| Original portfolio access | physics §4.3                                            | D-02, D-23, seo §3                      | T-SEC-10                 | 13, 22        |
| Social links              | workspace-audit §3.2 (evidence) + design §4.4 (display) | ai §3, micro §8.10, D-25                | T-AEO-02                 | 14            |
| Certification placement   | design §5.1.1                                           | template §7a, D-29                      | T-CNT-06                 | 11            |
| Project and patent claims | template §2–§3 + workspace-audit §3.6                   | design §6–§7, ai §7                     | T-CNT-02, T-CNT-05       | 2, 8, 9       |
| Monochrome and colour     | design §3.2                                             | D-19, D-20, D-22                        | T-DES-05, T-A11Y-03      | 5             |
| Responsive layout         | responsive-design                                       | design §11–§12 (summary)                | T-RWD-\*                 | 17            |
| Physics implementation    | physics §5                                              | design §15, §17                         | T-PHY-\*                 | 15            |
| SEO metadata              | seo §5–§8                                               | ai §5                                   | T-SEO-\*                 | 16            |
| AI crawler policy         | ai §6                                                   | seo §6, D-10                            | T-AEO-03, T-AEO-04       | 16            |
| Accessibility             | design §13                                              | micro §4, §9; physics §7; responsive §7 | T-A11Y-\*                | 18            |
| Security                  | security                                                | contest §3, AGENTS §5                   | T-SEC-\*, RB-01 to RB-14 | 19            |
| Asset migration           | asset-org §2, §6                                        | contest Phase G, security §12           | T-MED-04, T-SEC-09       | 3             |
| Phase boundaries          | AGENTS §0 + D-32                                        | CLAUDE, agent.md, README, impl header   | DQ-20                    | —             |

## 5. Documentation drift control

Drift = the code does something the docs do not say, or the docs require something the code does not do.

- **Every implementation PR** declares which docs it affects. If behaviour changes, the owning doc changes in the same PR.
- **Automatable drift checks:**
  - tokens in `tokens.css`/`motion.css` match the token tables in design.md §3 and micro-interactions.md §2 (script compares names and values)
  - the drawer list in `src/data/drawers.ts` matches the D-03 decision
  - the route list in `dist/` matches seo-optimization.md §4
  - JSON-LD types emitted match seo-optimization.md §8
  - robots policy matches D-10 (T-AEO-04)
- **Manual drift review** before each release: walk the design acceptance checklist (design.md §18) against the deployed preview.
- Any approved deviation is recorded as a decision in `open-decisions.md`, then the owning doc is updated.

## 6. Contradiction hot spots (review on every docs PR)

| Topic                                    | Owning file                          | Others that must agree                                                       |
| ---------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| Board vs text contract                   | design §0.2                          | every doc that describes visuals; open-decisions D-03, D-04, D-13, D-19–D-21 |
| Writing entry object                     | open-decisions D-04, design §4.4, §9 | micro §8.2/§8.3/§8.7, README                                                 |
| Drawer set                               | open-decisions D-03, design §5.1     | asset-org `drawers.ts`, seo §4 routes                                        |
| Canonical host                           | open-decisions D-02, seo §3          | ai §2.3, security §8, impl Stages 16, 22                                     |
| Heading levels                           | seo §5.1                             | micro §4.1, design §13                                                       |
| Motion timings                           | micro §2                             | design §5.2 (references only)                                                |
| Patent status vocabulary                 | template §3.1                        | design §7.4, seo §8, ai §2.2                                                 |
| Video policy                             | micro §7.1                           | design §6.6, asset-org §7, security §12                                      |
| Agent rules                              | AGENTS.md                            | CLAUDE.md, agent.md                                                          |
| Laptop, résumé, original portfolio       | physics §4.3, security §11.1         | design §9, micro §8.12, D-23, D-24                                           |
| Interaction techniques (ANIM/KIN/SIM/FX) | physics §0–§1                        | micro §8, §12                                                                |
| Layout modes                             | responsive §1                        | design §11–§12, micro §4                                                     |
| Placement privacy                        | security §3.1                        | contest §2.1, workspace-audit §3.9                                           |

## 7. Phase 1 verification record

The checks actually run at the end of Phase 1 are recorded in `docs/phase-1-completion-report.md`.
