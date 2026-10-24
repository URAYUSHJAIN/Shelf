# Phase 2 Validation Results

Executed 2026-10-24. These are preparation checks, not runtime site tests.

| Check                                                              | Result | Evidence / scope                                                                                           |
| ------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------- |
| Record IDs unique                                                  | passed | 150 records                                                                                                |
| Shared record contract and provenance paths                        | passed | 222 local provenance references checked; no fabricated owner approval                                      |
| Project copy and honest deployment state                           | passed | 39 drafted, 7 excluded; no untested project promoted to live                                               |
| Skill-to-project evidence references                               | passed | 54 evidenced skills                                                                                        |
| Patent identifier/lifecycle safety                                 | passed | 5 dated official snapshots; 3 later candidates; 0 current official status claims                           |
| Metadata uniqueness, description length, canonical gates           | passed | 60 prepared route rows; titles can exceed the 60-character editorial target where exact identities need it |
| Copy placeholder and unsupported phrase scan                       | passed | 269 public-copy strings checked; internal omitted fields remain explicit nulls                             |
| New workspace secret/PII pattern scan                              | passed | 74 text files; public email allowlisted; findings show locations/categories only                           |
| Prepared image integrity, dimensions, EXIF and source hashes       | passed | 9 prepared assets                                                                                          |
| Media paths, associations, final decode ledger and copy exclusions | passed | 757 sources, 17 full decode passes; no video or placement file copied                                      |
| Original source metadata preservation                              | passed | 2778 baseline paths; size and mtime_ns                                                                     |
| Phase boundary: no application or package files                    | passed | Audit Python utilities are internal offline preparation tools only                                         |
| Local Markdown links and heading anchors                           | passed | 344 links checked                                                                                          |
| Decision reference IDs                                             | passed | 32 defined decisions                                                                                       |
| Conflict reference IDs                                             | passed | 34 conflict IDs including historical gaps                                                                  |
| Test reference IDs                                                 | passed | 94 defined future tests; definitions are not execution evidence                                            |
| Audit utility Python syntax                                        | passed | Static parse only; no source-project code executed                                                         |

## Offline contrast calculation

| Foreground |   Paper |  Canvas | Muted paper |  Manila |
| ---------- | ------: | ------: | ----------: | ------: |
| Ink        | 16.38:1 | 15.04:1 |     14.02:1 | 12.50:1 |
| Graphite   |  6.72:1 |  6.17:1 |      5.76:1 |  5.13:1 |
| Edge       |  3.52:1 |  3.23:1 |      3.01:1 |  2.69:1 |
| Focus      |  6.39:1 |  5.87:1 |      5.47:1 |  4.88:1 |

The edge token fails the 3:1 meaningful-boundary target on manila. The specification now uses graphite for that combination. This is a token calculation; opacity, overlays, actual focus rings and rendered contrast still require browser verification.

## Separate media and network evidence

ffprobe inspected all 65 local candidate videos. ffmpeg fully decoded all 17 final episodes with no error output and exit status 0. Representative frames were reviewed from each. These are not full visual/privacy/audio reviews. Direct public GET results are in link-checks.json; blocked requests, title mismatches and ambiguous pages remain explicit. Official patent search requires CAPTCHA; no current individual status result was obtained.

## Commands actually run

- Existing py/PyPDF2/Pillow/OpenCV and standard-library XML/ZIP extraction; no dependency installation.
- git log and shortlog against local read-only repositories; no commits or writes.
- research.py discover, patents, credentials, media, sheets, review-more and online.
- prepare_content.py, prepare_assets.py, render_handoff.py, reconcile_docs.py, resolve_remaining_specs.py, finish_audit.py, validate_preparation.py.
- ffprobe JSON container inspection; ffmpeg full decode to null; 8-second review-frame extraction into private inventory/review.
- Read-only public API/HTML requests and official documentation browsing; no uploads.

## Failures and corrections encountered

Initial console output hit Windows encoding errors; UTF-8 mode fixed the extraction. A large recursive public Git tree exceeded the initial response-size cap; the fetch limit and fork review scope were corrected. One temporary audit-script syntax error was fixed before successful execution. A guessed Arogya retrieval filename did not exist; the actual retriever.py path was located and inspected. GitHub connector argument binding failed; the read-only public API was used. Network sandbox refusal was resolved through the required escalation flow. None of these is reported as a successful first attempt.

## Not run

Astro build, unit/e2e app tests, live demo feature workflows, browser accessibility audits, runtime responsive checks, Lighthouse, real-device performance, deployed headers/CSP, schema/rich-results output validation, DNS/redirect tests, Search Console/Bing submission and indexation. No application exists and deployment is Phase 4. Full source Git-history secret scanning and frame-by-frame video review were not performed. Markdown formatting results are added after the actual Prettier run.

## Markdown formatting

Prettier check over all portfolio2.0 Markdown files passed after formatting, with exit status 0. The validation report is formatted again after each regeneration.

Initial check found 30 files needing formatting. The first array-based PowerShell wrapper call did not expand its arguments correctly and changed no files. The corrected glob-based Prettier write succeeded. Historical completion reports were reported unchanged.
