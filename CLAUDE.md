# CLAUDE.md — The Shelf

**Read [AGENTS.md](AGENTS.md) first.** It is the canonical contract and applies in full. This file only adds Claude Code–specific workflow. If anything here appears to conflict with AGENTS.md, AGENTS.md wins; report the conflict.

## Phase boundary

Phase 3 is authorized (D-33) and the Astro application is implemented (D-36). Require compatible Node 22 >=22.23.4 or Node 24 LTS. Do not change system Node. Loopback development may show safe needs-owner-review records; release builds reject them (D-35). Follow the exact eight drawers and open desk book in D-34. No parent-repository git add, commits, pushes or deployment. Source folders remain read-only. Read AGENTS.md §0 and docs/phase-3-handoff.md.

## Project in one line

An Astro portfolio for Ayush Jain where an illustrated shelf is the navigation (drawers → folders → records, each record at a stable URL), with physical desk objects: a laptop for the résumé and the original portfolio, a lamp that lights the scene, and a spinnable globe. Contracts: [docs/design.md](docs/design.md), [docs/micro-interactions.md](docs/micro-interactions.md), [docs/physics-and-interactions.md](docs/physics-and-interactions.md), [docs/responsive-design.md](docs/responsive-design.md).

## Non-negotiables (summary; full list in AGENTS.md §2)

No navbar · no home-scene counters (computed counts only inside opened drawers) · cabinet always visible · warm-neutral monochrome UI with other colour only from real media · one surface open at a time · HTML-first with stable URLs · no autoplay or looping motion · keyboard, touch, and reduced-motion parity · physics is an enhancement, never a requirement · **never fabricate**, never copy the concept board's sample text, never call a patent application "granted", and use "named inventor" · never display age, identity data, compensation, or signatures.

To view the concept board, Read `docs/reference/refrance2.0.png` (Claude Code can read images). Compare UI work against it, using the resolutions in [docs/design.md](docs/design.md) §0.2.

## Directory roles (summary; full table in AGENTS.md §3)

`portfolio/`, `BuildLog/`, `context/`: read-only sources. `placement/`: read-only **and restricted**. Open only the files listed as relevant in [docs/workspace-audit.md](docs/workspace-audit.md) §3.9. Never open `placement/ID'S/**`, `placement/doc/**` (except the résumé), signature images, offer letters, or registration screenshots. `portfolio2.0/`: the only writable folder.

## Session workflow in Claude Code

1. **Orient.** Read [README.md](README.md) and [docs/open-decisions.md](docs/open-decisions.md), then the docs that own the area of the task ([docs/documentation-quality.md](docs/documentation-quality.md) §1). Use Grep, Glob, and Read for discovery rather than shell `grep`, `find`, or `cat`.
2. **Inspect before editing.** Read every file before you Edit or Write it. For source folders, only Read. Never Edit, Write, move, or delete there.
3. **Plan briefly** when a change spans several files or a stage gate. State the relevant requirement IDs, tests, decisions, and current phase.
4. **Change minimally.** Match the surrounding code's style. No new dependencies, design changes, or speculative features without the owner's approval. Ask with a concrete recommendation when blocked on a decision that belongs to the owner.
5. **Verify.** Run `npm run build` and `npm test`, and check `npm run dev` in a browser when UI changes. Report actual output, including failures.
6. **Report** using AGENTS.md §10.

## Claude Code specifics

- **Permissions:** expect prompts for package installs, network access, and Git operations. Read-only public-source checks are authorized by D-32; required local Astro dependencies are authorized for Phase 3 implementation; Git mutations remain out of scope. Do not work around a denied action.
- **Shell:** this workspace is on Windows with Git Bash and PowerShell available. Use forward-slash paths in Bash. Quote paths with spaces and apostrophes (e.g. `placement/ID'S/`, which you should not open anyway). Prefer writing helper scripts with the Write tool over shell heredocs: heredocs have mangled backslashes in this environment.
- **PDFs:** the Read tool can read whole PDFs, but page ranges need `pdftoppm`, which is not installed. Do not install it without approval.
- **Large sources:** `BuildLog/` holds about 6,400 files including videos. Do not Read binaries. Scope searches to `BuildLog/BuildLog/BuildLog/projects/<name>/` or `context/`. Skip `node_modules`, `.git`, `.venv`, `__MACOSX`.
- **Secrets and privacy:** never Read the `.env` files listed in [docs/security.md](docs/security.md) §2 (S-01). Never echo secret-looking values, compensation, IDs, or phone numbers in output.
- **Subagents:** only when the owner asks. If used for extraction, give the agent [docs/contest.md](docs/contest.md), the read-only rule, and the `placement/` restrictions explicitly.
- **Memory:** project rules belong in these docs, not in personal memory. If the owner states a durable preference, record it in the owning doc or in `open-decisions.md`.
- **Browser checks (Phase 3):** use available browser tooling on a local preview. Phase 2 read-only checks of public source URLs are authorized by D-32; do not submit forms or modify accounts.

## Definition of done

- The owning docs are still accurate (or updated in the same change).
- Relevant tests or doc checks ran, with results stated, and untested areas named.
- No file under `portfolio/`, `BuildLog/`, `placement/`, or `context/` changed.
- No fabricated content, secrets, or personal data introduced.
- No out-of-phase work (AGENTS.md §0).
- The AGENTS.md §10 report is delivered.
