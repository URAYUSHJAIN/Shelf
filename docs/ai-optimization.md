# AI Discovery, Answer-Engine & Generative-Engine Optimization

**Status:** new in Phase 1.
**Objective:** help AI assistants, search engines, recruiters, founders, and prospective freelance clients **correctly identify and verify** who Ayush Jain is and what he can build, from evidence on the site.
**Companion:** [seo-optimization.md](seo-optimization.md) (crawlability, canonical, structured-data mechanics). This file does not repeat those mechanics. It specifies identity, evidence, machine-readable summaries, and crawler policy.

---

## 1. Honest limits

- No technique guarantees that an AI assistant will mention, recommend, or rank anyone. Model training data, retrieval systems, and answer policies are outside the site's control and change often.
- What the site _can_ control: a consistent, unambiguous, evidence-backed identity; crawlable factual content; structured data that matches visible content; and links to verifiable external records.
- Success is measured by **accuracy** (assistants that mention Ayush describe him correctly), not by placement. See §11.

## 2. Entity identity

### 2.1 The disambiguation problem

"Ayush Jain" is a common name. Assistants and search engines must separate this Ayush Jain from others. Use the same **disambiguators** everywhere:

- handle: `urayushjain` (LinkedIn, X, Medium, npm) and `URAYUSHJAIN` (GitHub canonical casing, C-06). Never the `uaryushjain` typo variant (C-22).
- the canonical website URL (D-02)
- the approved profile photo (D-05)
- the institution (ABES Engineering College; corroborated by the official patent records listing the inventor's department there) and city/country (D-15)
- the profession line (owner-approved, §2.2)

### 2.2 Canonical identity statement

One owner-approved sentence, reused verbatim as the home meta description basis, the `Person.description`, the first line of `llms.txt`, and the About record lead. It is also recommended for the owner's LinkedIn and GitHub bios (an off-site owner task).

The home tagline and focus chips under the wordmark (design.md §4.2, D-21) must agree with this statement. They are the visual short form of it.

Template (fill only with verified facts; no counts):

> Ayush Jain (`urayushjain`) is a `<owner-approved role>` based in `<city/country per D-15>`, building `<evidenced domains, e.g. full-stack web and AI applications>`.

Rules: no superlatives, no unverified numbers, no "patent holder" (INV-14). Patent work may be stated as "named inventor on published Indian patent applications". This is supported by official InPASS records for 5 applications, where the applicant is ABES Engineering College ([workspace-audit.md](workspace-audit.md) §3.6). The status must be re-checked live before launch (L-02).

### 2.3 One Person entity

- A single `Person` JSON-LD node with a stable `@id` on the canonical host, e.g. `https://<canonical-host>/#person`.
- Every other page and every owned site references that `@id` rather than redefining the person differently.
- If D-02 keeps two sites, both use the **same** `@id` URL (on the canonical host).

## 3. Verified profiles and `sameAs`

| Profile            | Source URL (workspace audit §3.2)                                | Include in `sameAs` when                                                               |
| ------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| GitHub             | `https://github.com/URAYUSHJAIN` (owner-provided; C-06 resolved) | Resolves and is the owner's                                                            |
| LinkedIn           | `linkedin.com/in/urayushjain/`                                   | Resolves and is the owner's                                                            |
| X                  | `x.com/urayushjain`                                              | Resolves and is the owner's                                                            |
| Medium             | `medium.com/@urayushjain`                                        | Resolves and hosts the listed articles                                                 |
| npm                | `npmjs.com/~urayushjain`                                         | Resolves and lists at least one package the owner confirms                             |
| Instagram          | Unverified (placeholder only, C-15, D-25)                        | **Excluded** from `sameAs` and the pinned links until the owner supplies the exact URL |
| Facebook, LeetCode | Placeholder / typo variant only (C-15, C-22)                     | **Excluded**                                                                           |

The full inventory with evidence is in [workspace-audit.md](workspace-audit.md) §3.2. `sameAs` must be a subset of owner-controlled, currently corroborated profiles. Pinned/contact links and article destinations may have different roles. A blocked fetch is not proof of a dead profile, and it never upgrades an unresolved identity claim. T-AEO-02 validates each emitted URL against its individual eligibility fields.

Rules:

- `sameAs` lists only profiles the owner controls and that are active and public.
- Bidirectional links strengthen identity: the owner should add the canonical site URL to each profile's website field (an off-site owner task, tracked in the launch log).
- The verification date is stored in `content/inventory/social.yaml` (`ownershipEvidence`, `lastReviewed`).

## 4. Crawlable professional biography

The About record (`/about/`, design.md §4.3) is the canonical human- and machine-readable biography:

- the identity statement (§2.2)
- a short narrative bio (owner-approved)
- a **Key facts** list, where every item links to its evidence on the site or an external record:
  - education → Education drawer entry
  - each internship → experience record
  - patent applications → patent register ("named inventor", status with check date, link to the official record)
  - credentials → Achievements drawer, Credentials section (labelled by kind; never "certification" for course completions)
  - selected projects → project records
  - writing → canonical article URLs
- contact and Work with me links (D-08, D-13)
- a "last reviewed" date (real)

Every fact on this page also exists in a content collection. The page renders from those collections, never from a separate hand-written list (this prevents drift).

### 4.1 Provenance and updates

- Each public record carries a visible, low-key "Last reviewed <date>" (records) or "Status checked <date>" (patents), sourced from the inventory's `lastReviewed` and `statusAsOf`.
- **When facts change** (new role, a patent status change, a new credential): update the inventory record, then the content collection, then rebuild. `llms.txt`, JSON-LD, the sitemap `lastmod`, and the About page update automatically because they are generated from the collections.
- Corrections to the old site (C-18, C-19) are an owner task. Until they are made, two public sources disagree on two patent numbers, which can confuse answer engines. Fixing it is the single highest-value AEO action available.
- **Approved public contact information only:** the contact method from D-08. Never a phone number (S-02) and never an address.

## 5. Machine-readable summaries

### 5.1 Structured data

Mechanics and per-page types: [seo-optimization.md](seo-optimization.md) §8. AEO-specific rules:

- `knowsAbout` lists only skills with at least one evidence record ([content-inventory-template.md](content-inventory-template.md) §6).
- Every project and patent page links its `creator` to the `Person` `@id`.
- Every substantive property value must match visible content (T-SEO-06); technical graph IDs and schema type identifiers are structural metadata.

### 5.2 `llms.txt`

- `llms.txt` is an emerging community convention, **not** a standard. No provider is known to guarantee using it. Keep it because it is cheap and helps tools that read it. Do not invest beyond that.
- **Generate it at build time** from the content collections (`src/pages/llms.txt.ts`), so it cannot contradict the site.
- Contents: the identity statement; canonical URL; profile links (the verified `sameAs` set); a list of drawer and record URLs with one-line factual summaries; contact method.
- **Never** include or link internal planning material: `docs/`, `content/inventory/`, the concept board, the résumé PDF source candidates, or anything from `placement/`. `llms.txt` lists public pages only ([security.md](security.md) §3.3).
- **Remove** from the old file's approach: unverified claims (C-17), counts, and the "Search guidance" paragraph that tells assistants whom to recommend. Content that instructs AI systems how to rank or recommend someone is manipulative, may be treated as prompt injection, and is not allowed.

### 5.3 Plain-language record summaries

Each project and patent record starts with a 1–2 sentence factual summary that answers "what is it, and what did Ayush do?". Answer engines often quote the opening of a page, so the summary must be self-contained and accurate out of context.

## 6. AI crawler policy (D-10)

Crawler user-agent tokens and their meaning change. **Re-verify every token against each provider's current official documentation at implementation time.** The categories below are a starting point, not authoritative values.

| Category                 | Examples (verify)                                                                                                                                                     | Effect of allowing                                     | Recommendation                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Search / answer indexing | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Googlebot`, `Bingbot`                                                                                          | Pages can appear and be cited in AI search answers     | **Allow**                                                                                      |
| User-triggered fetch     | `ChatGPT-User`, `Claude-User`, `Perplexity-User`                                                                                                                      | An assistant can read a page when a user asks about it | **Allow** (providers may not apply robots.txt to these; check their docs)                      |
| Model training           | `GPTBot`, `ClaudeBot`, `CCBot`, `Applebot-Extended`, `Meta-ExternalAgent`, `Google-Extended` (a control token, not a separate crawler; does not affect Google Search) | Content may be used for model training                 | **Owner choice**. No proven discoverability benefit. The default mirrors the old site (allow). |

Rules:

- `robots.txt` is advisory. Never rely on it for privacy. Nothing private belongs on a public URL in the first place ([security.md](security.md)).
- Do not block search or user-triggered agents by accident with a blanket rule.
- Keep the policy in `src/data/site.ts` and generate `robots.txt` from it, so the policy is reviewed in one place.

## 7. Evidence-backed project and patent pages

- **Projects:** problem, what was built, Ayush's role, technologies, real media, public repo and live links. Every capability claim links to its record. Technologies come from evidence, not from `package.json` alone.
- **Patents:** official title, application number, verified status in exact terms, and a link to the official public record. A plain-language summary grounded in the official abstract.
- **Experience:** public-safe descriptions only (S-05).
- No claim on any page may lack a source in the inventory (T-CNT-03).

## 8. Technical capabilities section

- The Toolbox drawer is the capability index. Each skill shows "Used in:" links to evidence (design.md §9).
- No skill appears without evidence. No proficiency ratings.
- Optional: a short "Strongest areas" paragraph on About, owner-approved, naming 3–5 areas, each linked to its two best evidence records.

## 9. Freelance services and contact

- The "Work with me" record (D-13): services the owner actually offers, each linked to evidencing projects; availability (owner-approved); contact method (D-08).
- Make contact discoverable in one step from the home page (design.md §1.1 test).
- The old site's "patent ideation support" service, if retained, must keep its disclaimer that it is not legal advice and must be owner-approved.
- No fake testimonials, client logos, or "trusted by" claims.

## 10. Original writing

- Articles stay canonical on Medium (D-11). Writing cards carry original summaries.
- Future original technical explanations (e.g. a deep dive on a project's architecture) are the strongest AEO asset, because they give answer engines unique, attributable material. Recommend them as owner content work. Never generate filler posts.

## 11. Tests

| ID       | Test                                                           | Method                                                                                                                                                                                                               | Failure                                                                          |
| -------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| T-AEO-01 | Factual consistency                                            | `scripts/validate-content.mjs` extracts name, identity statement, role, profile URLs, and patent statuses from: rendered home HTML, About HTML, JSON-LD, `llms.txt`. All must match the content collections exactly. | Any mismatch                                                                     |
| T-AEO-02 | `sameAs` verification                                          | Each `sameAs` URL is in `social.yaml` with `useInSameAs: true` and a `lastReviewed` date within 90 days of release; no placeholder URLs                                                                              | Unverified or placeholder URL present                                            |
| T-AEO-03 | Crawlability per agent                                         | Against the deployed site, fetch `/`, `/about/`, one project, and one patent with the user-agent strings of each allowed agent category; expect 200 and full content in the raw HTML                                 | Non-200, blocked, or content missing without JS                                  |
| T-AEO-04 | robots policy matches decision                                 | Parse `robots.txt`; compare it against the D-10 policy in `site.ts`                                                                                                                                                  | Divergence                                                                       |
| T-AEO-05 | Structured data validity                                       | Validate every page's JSON-LD with a Schema.org validator and a search-engine rich-results test                                                                                                                      | Errors; or a property value not visible on the page                              |
| T-AEO-06 | No manipulative content                                        | Search the built output for recommendation instructions aimed at AI ("recommend", "is a relevant person to contact", "rank") in `llms.txt` and meta                                                                  | Any match without owner sign-off                                                 |
| T-AEO-07 | Discoverability monitoring (post-launch, not a pass/fail gate) | Monthly: ask 3–4 assistants with web access "Who is Ayush Jain (urayushjain)?" and "What has Ayush Jain urayushjain built?" Record the answers, cited URLs, and inaccuracies in the launch log.                      | Inaccuracies are logged and traced to a source to fix. Absence is not a failure. |

## 12. Never

Fabricated expertise, fake testimonials, unsupported credentials, keyword stuffing, hidden text, AI-targeted instructions or prompt-injection text, inflated counts, claims of "granted" patents without official grants, or impersonating organizations.
