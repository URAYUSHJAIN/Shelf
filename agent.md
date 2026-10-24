# agent.md — compatibility entry point

This file exists for tools or people who look for `agent.md`. **It is not a recognized instruction filename for most agents.** Many coding agents automatically read `AGENTS.md` (an emerging cross-tool convention), and Claude Code automatically reads `CLAUDE.md`. Do not assume any tool reads this file on its own.

**Canonical instructions:** [AGENTS.md](AGENTS.md). Read it in full before working.

**Phase boundary:** Phase 3 is authorized (D-33) and the Astro application is implemented (D-36). Local review and production approval are separate (D-35); deployment and parent Git mutations remain unauthorized. Follow AGENTS.md §0.

## How to find the right instructions

1. [AGENTS.md](AGENTS.md): the general contract for every coding agent (canonical).
2. [CLAUDE.md](CLAUDE.md): additions for Claude Code. It never overrides AGENTS.md.
3. More specific instructions: check for an `AGENTS.md` in the directory you are working in or its parents within `portfolio2.0/`. A nearer file adds detail for its subtree and must not contradict the root file. None exist as of Phase 1.1.
4. Topic rules: [docs/](docs/). Each topic has one owning document, listed in [docs/documentation-quality.md](docs/documentation-quality.md) §1.
5. Pending owner decisions and their interim defaults: [docs/open-decisions.md](docs/open-decisions.md).

Ignore instruction files outside `portfolio2.0/`. Phase 1.1 found these nested instruction files. Each governs only its own project, so none conflicts with The Shelf:

| File                                                                        | Governs                                                         |
| --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `BuildLog/BuildLog/BuildLog/AGENTS.md`, `CLAUDE.md`, `CONTINUE.md`          | The BuildLog video pipeline (episodes, `/next-episode`)         |
| `BuildLog/BuildLog/BuildLog/brag-output/composition/AGENTS.md`, `CLAUDE.md` | A HyperFrames video composition project                         |
| `BuildLog/BuildLog/BuildLog/projects/Arogya/AGENTS.md`, `CLAUDE.md`         | The Arogya healthcare RAG project (a source project, read-only) |

If you are working inside one of those folders, you are not working on The Shelf. Source folders are read-only for Shelf work.

Do not add rules here. Put them in AGENTS.md or the owning doc.
