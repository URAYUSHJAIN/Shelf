# Self-Containment Audit

Audited 2026-10-24, after the pre-edit snapshot of 122 files / 12,061,185 bytes. The complete baseline, hashes, dimensions and duplicate comparison are in `content/inventory/phase-2.1-baseline.json`. There were no byte-identical duplicates inside that baseline. No file was deleted, moved or renamed during Phase 2.1; recovery remains the original files and the hash baseline. Generated review comparisons are intentional private audit artifacts.

**Verdict: implementation inputs are locally available for the conservative shell and reviewed candidate subset. Full public-content readiness is blocked by publication approval; there is no approved public résumé or album. This is not an unconditional self-containment pass for the requested final portfolio.**

## Dependency disposition

| Requirement | Exact local input or intentional external destination | Classification / absence behaviour |
| --- | --- | --- |
| UI and About copy | `content/inventory/ui-copy.yaml`, `content.md` | Complete draft, needs owner approval. Never serve either internal file directly. |
| Project, education, work, credential and writing copy | Ten named YAML collections in `content/inventory/`; `content-inventory.csv` is a review projection | Draft text is local. Provenance paths are citations, not build inputs. Omit unresolved fields and all unapproved records. |
| Shelf category order | `content/inventory/shelf-map.yaml`; design §5.1 | Local reserved slots with visibility conditions; no source-folder lookup. |
| Portrait | `assets/profile/ayush-jain.webp` | 480 × 549 local candidate, D-05 pending. No dependency on the old portfolio image at runtime. Omit image until approved; retain identity text. |
| Six selected screenshots | `assets/projects/{fusion-2048,cyberkey,tacwin,listomo,calendar-dashboard,taskflow}/` | Existing candidates local. Full-resolution lossless review candidates listed individually in `phase-2.1-image-comparison.json`, under `content/inventory/image-comparison/`. Approval is not inferred. |
| Globe map | `assets/objects/world-equirect.webp` | Public-domain source verified; local texture usable without fetching remote data. Original vector source frozen in `content/inventory/natural-earth-land.geojson`. |
| Sharing preview | `assets/social/the-shelf-preview.png` | Local candidate. Typographic fallback, not finished shelf artwork. Review before public export. |
| Cabinet, lamp, lid, frame, mug, plants, cube, folder art and icons | Geometry and authoring measurements in design, responsive and physics docs | To be authored as application HTML/CSS/SVG in Phase 3. No external source art is required. No finished production art exists and none is claimed inspected. |
| Font files | None | Georgia/Arial system stacks; zero font payload, no missing font download. |
| Project videos | `media.csv` contains source evidence; no production video dependency selected | Optional and withheld. Rights, full visual/audio review, captions and posters must clear before adding video. Never resolve source paths in the app. |
| Public résumé | Safe text review draft at `content/inventory/public-resume-draft.md`; no approved PDF | Missing approved public file. Laptop shows original portfolio and contact; no dead download button. |
| Memories | Empty optional collection contract in micro-interactions §13 | User-supplied images and captions missing. Reserve last slot in data; omit control, route and album media until approved items exist. |
| Private records | Local safe evidence summaries only | Original PDFs, letters, certificates, workbook, IDs and private notes remain outside public assets; no build dependency. |
| References | All three images under `docs/reference/` | Private inspiration only; local for implementation review, excluded from release. |
| Original website | `https://www.urayushjain.tech/` | Existing destination re-opened in this audit. After a main-domain migration it would point to The Shelf; disable the original-site action until an actual archive URL is verified. Never guess one. |
| Repositories / social / Medium | Exact URLs in record YAML and link evidence JSON | Intentional public links. GitHub corroborated; some platform requests blocked. Medium article links remain withheld until confirmed, not described as live-verified. |

## Portable Phase 3 procedure

Work from `portfolio2.0/` only. Run `py -X utf8 content/inventory/phase21_audit.py validate`. This command resolves all inputs against its own project directory; it deliberately does not open the parent workspace. It checks local Markdown/image paths, content, metadata, decisions, test IDs, prepared media and scope. It is not a build command.

The older `research.py`, `prepare_content.py`, `prepare_assets.py`, `render_handoff.py`, `reconcile_docs.py`, `resolve_remaining_specs.py`, `finish_audit.py`, and `validate_preparation.py` are historical preparation utilities. Some depend on parent evidence and overwrite generated files. **Do not run them as Phase 3 prerequisites or regenerate the manuscript blindly.** Their external paths are research provenance, not website requirements. Retain them for reproducibility; they are not redundant application dependencies.

Phase 3 exports an explicitly reviewed field allowlist into public collections. It must never import `content/inventory/` or dynamically traverse provenance. Promote selected local assets only after their individual release decision; the chosen screenshot masters are already local private review candidates. No new production copy of unapproved external material was made in this phase.

## Repository and release boundary

`.gitignore` covers inventory, reference boards, staging assets and internal review files before a future repository is initialized. The Phase 2.1 reports are also internal audit documents. A public repository should be created from a reviewed application allowlist; do not run `git add .` over this preparation tree. Ignore rules do not remove previously tracked files. No Git initialization or visibility change occurred.

`docs/`, audit Python, baselines, manifests, reference imagery, review crops and source paths must be absent from `dist/`. Static output must have no parent-path, machine-path or filesystem lookup. The final public distribution scan is NOT RUN because there is no application. The portable local check proves file resolution, not future export safety or approval.
