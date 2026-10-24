# SEO Specification — The Shelf

**Derived from:** `context/seo-optimization.md`. Phase 1 additions: the canonical host decision and duplicate-content strategy against the live `www.urayushjain.tech`, Astro mechanics, a fixed heading model, a per-page metadata table, per-page-type structured data, video metadata, the redirect plan, and validation steps with failure conditions.

Companion: [ai-optimization.md](ai-optimization.md) covers entity identity, AI crawlers, and answer engines. This file covers classic search.

---

## 1. Goal and honest expectations

Help search engines and people correctly identify Ayush Jain as the person behind The Shelf, connect the site to his verified profiles and work, and make projects, patent records, and experience discoverable.

No implementation can guarantee indexing, a rich result, or a first-place ranking for any query. Rankings depend on competition, intent, independent references, quality, and time. **This document never promises a position**, and no deliverable may claim "SEO optimized" without listing the checks performed (see §13).

## 2. Current state (old site, for reference)

From `portfolio/` (see [workspace-audit.md](workspace-audit.md) §3.12): canonical host `https://www.urayushjain.tech`; 4 sitemap URLs (`/`, `/patents`, `/projects`, `/about`); `/resume` 302-redirects to the PDF; JSON-LD `Person`/`ProfilePage`/`WebSite` plus patents as `CreativeWork`; `robots.txt` allows all crawlers and contains two stale disallow rules (C-16); `llms.txt` present.

Reuse the factual content. Do **not** copy stale rules, unverified claims (C-17), location over-disclosure (D-15), or the old site's **two wrong patent application numbers** (C-18, C-19). The old site's `/resume` serves a PDF containing the phone number (S-15).

### 2.1 Search intent and content strategy _(Phase 1.1)_

Build pages around **verified** professional information. Each intent maps to a page that answers it with evidence:

| Intent (what a searcher wants)   | Page that answers it             | Evidence on the page                                                    |
| -------------------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| Who is Ayush Jain (urayushjain)? | `/` and `/about/`                | Identity statement, photo, verified profiles                            |
| What has he built?               | `/projects/` and project records | Repos, screenshots, videos, deployment state                            |
| His patent applications          | `/patents/` and dossiers         | Official record links, status with check date, "named inventor" wording |
| Education and experience         | Education and Experience drawers | Institution, programme, roles, dates                                    |
| Technical writing                | `/writing/`                      | Links to the canonical articles                                         |
| Skills                           | `/toolbox/`                      | Each skill linked to evidencing records                                 |
| Hiring or freelance contact      | `/work-with-me/` (D-13) or About | Services tied to evidence; contact method                               |

No keyword lists, no doorway pages, no expertise claims without an evidencing record ([ai-optimization.md](ai-optimization.md) §7–§9).

## 3. Canonical host and duplicate-content strategy (D-02)

| Option                                    | Canonical                                         | Main site                                                                                                                                                            | Duplicate risk                                                  | Required actions                                                                                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **(b) Replace and archive (recommended)** | `https://www.urayushjain.tech/`                   | Becomes The Shelf. The original moves to an archive host (e.g. `classic.urayushjain.tech`), sent with `X-Robots-Tag: noindex`, and is linked from the laptop (D-23). | None                                                            | 301 every old route to its new equivalent (§9). Same Search Console property. The archive host is excluded from all sitemaps.                                                                         |
| (a) Side by side                          | `https://shelf.urayushjain.tech/` for Shelf pages | Stays at `www` as the original portfolio                                                                                                                             | High: the old site already has `/projects` and `/patents` pages | Correct the old site's patent numbers first (C-18, C-19). The old site keeps summaries only and links to Shelf records for details. Each site self-canonicalizes. Never cross-canonical a whole site. |
| (c) Subdomain now, migrate later          | Shelf subdomain, then the apex                    | Temporary                                                                                                                                                            | Medium                                                          | Plan the 301 migration in advance. Keep slugs identical so the move is a host swap.                                                                                                                   |

Rules that hold for every option:

- **One host per URL.** HTTP→HTTPS and non-canonical host → canonical host via a single 301 hop (e.g. `urayushjain.tech` → `https://www.urayushjain.tech`).
- **Trailing slash:** pick one policy (recommended: always a trailing slash, matching Astro `trailingSlash: 'always'` and `build.format: 'directory'`). The non-preferred form 301s.
- Every indexable page has `<link rel="canonical">` pointing at its own absolute canonical URL.
- One `Person` entity `@id` across all owned sites (see [ai-optimization.md](ai-optimization.md) §2).
- Preview and staging deployments send `X-Robots-Tag: noindex` (or meta robots) and are never in a sitemap.
- Articles stay canonical on Medium unless republished with a canonical pointing back to Medium (D-11).

## 4. Crawlable architecture

The shelf is a single visual experience, but every meaningful state is a **real, prerendered URL** ([design.md](design.md) §10.3, INV-09).

| Route                                                                                          | Indexable                                   | Contents (server-rendered HTML)                                                                                          |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/`                                                                                            | Yes                                         | Wordmark and name (h1), tagline, shelf, drawer links, Writing spine links, social links                                  |
| `/projects/`                                                                                   | Yes                                         | Shelf plus Projects tray with **all** public folders as links (every group in the HTML; filter chips filter client-side) |
| `/projects/<slug>/`                                                                            | Yes, unless `indexable: false` (early work) | Shelf plus record                                                                                                        |
| `/patents/`, `/patents/<slug>/`                                                                | Yes                                         | Register / dossier                                                                                                       |
| `/experience/`, `/experience/<slug>/`                                                          | Yes, if public-safe                         |                                                                                                                          |
| `/writing/`                                                                                    | Yes                                         | Open booklet with entries linking to canonical sources                                                                   |
| `/clubs-and-leadership/`, `/education/`, `/toolbox/`, `/achievements/`, `/currently-building/` | Yes, if the drawer renders (D-03)           | Drawer contents                                                                                                          |
| `/about/`, `/work-with-me/`                                                                    | Yes, if approved                            |                                                                                                                          |
| `/?group=…&q=…` and `/projects/?group=…`                                                       | **No**                                      | Canonical points to the unfiltered URL                                                                                   |
| `/404`                                                                                         | No                                          | Status 404, shelf identity, links to drawers                                                                             |

- Every record is reachable within **two links** of `/` (home → drawer page → record).
- Filtered or search URLs canonicalize to the clean URL and are excluded from the sitemap.
- No content exists only after a client-side interaction. Closed-drawer contents are not hidden keyword blocks: the home page links to drawer pages and does not embed every record.
- Do not block CSS, JS, fonts, or images in `robots.txt`.

## 5. Titles, descriptions, headings

### 5.1 Heading model (fixed)

Heading levels stay the same whether a state is loaded directly or reached in place by the controller:

- `h1`: the wordmark and byline together, "THE SHELF. A personal archive by Ayush Jain." ([design.md](design.md) §4.2), on every page. The owner's name is always inside the h1.
- `h2`: the open drawer's title (tray heading).
- `h2`: the open record's title (record sheet; a sibling region to the tray). Record sections use `h3`.
- Page uniqueness comes from `<title>`, the meta description, the canonical URL, and the record content. Heading levels are **not** swapped dynamically.

### 5.2 Metadata patterns

| Page         | `<title>`                                                                                                           | Meta description                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Home         | `Ayush Jain — The Shelf` (optionally `· Projects, Patent Applications & Writing`, but only categories with content) | One factual sentence about the person and what the shelf contains. No counts. |
| Drawer       | `Projects — Ayush Jain`                                                                                             | What the drawer contains, factually                                           |
| Project      | `<Project> — Project by Ayush Jain`                                                                                 | The record summary (≤ 160 chars)                                              |
| Patent       | `<Display title> — Patent Application · Ayush Jain` (use "Patent" only if granted)                                  | Status-accurate summary                                                       |
| Experience   | `<Role> at <Organization> — Ayush Jain`                                                                             | Public-safe summary                                                           |
| About        | `About Ayush Jain`                                                                                                  | Bio summary                                                                   |
| Work with me | `Work with Ayush Jain`                                                                                              | Evidence-based services sentence                                              |
| 404          | `Not found — Ayush Jain`                                                                                            | —                                                                             |

Rules: unique per page; no keyword lists; descriptions summarize the actual page; no counts in titles or descriptions (counts appear only inside opened drawers, design.md INV-03); build fails on duplicate titles or descriptions among indexable pages (T-SEO-02).

## 6. robots.txt and sitemap

- `robots.txt`: allow all. Reference the sitemap at its absolute canonical URL. AI crawler rules per D-10 ([ai-optimization.md](ai-optimization.md) §6). No disallow rules for paths that do not exist.
- Sitemap: generated at build from the same route list used to render pages. It includes only indexable, canonical, 200-status URLs. `<lastmod>` comes from real content change dates (git commit date of the record file), never the build time. Omit `changefreq` and `priority` (search engines largely ignore them).
- Image sitemap entries are optional, and only for real project screenshots.
- Use the official Astro sitemap integration or a small build-time endpoint. Either must filter `indexable: false` and query URLs.

## 7. Social sharing metadata

On every indexable page: `og:title`, `og:description`, `og:url` (canonical), `og:type` (`profile` on home/about, `website` elsewhere, `article` only for republished articles), `og:image` (absolute, 1200×630, under 1 MB), `og:image:alt`, `twitter:card=summary_large_image`.

- Default OG image: a monochrome render of the shelf with the name. Project pages may use a 1200×630 crop of the real cover screenshot.
- Never put counts or unverified claims in OG images.

## 8. Structured data (JSON-LD)

Use JSON-LD only for content that is **visible on the same page** and verified. Check the current Schema.org definitions and search-engine structured-data guidelines at implementation time. Structured data does not guarantee a rich result or a ranking boost.

| Page                       | Types                                                                                                                                                                                           | Key properties (verified values only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home                       | `WebSite`; `Person` (full entity, canonical `@id`)                                                                                                                                              | `Person`: `name`, `url`, `image`, `sameAs` (verified, D-10/[ai-optimization.md](ai-optimization.md) §3), `jobTitle` (owner-approved), `alumniOf` / `affiliation` (verified), `knowsAbout` (evidenced skills only), `address` country only (D-15)                                                                                                                                                                                                                                                        |
| About                      | `ProfilePage` with `mainEntity` → Person `@id`                                                                                                                                                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Drawer pages               | `CollectionPage` + `BreadcrumbList`                                                                                                                                                             | `hasPart` → record URLs (optional)                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Project                    | `CreativeWork` (or `SoftwareSourceCode` when the page centres on a public repo) + `BreadcrumbList`                                                                                              | `name`, `description`, `creator` → Person `@id`, `codeRepository` (public repos only), `url`, `image`, `dateCreated` only if sourced. **No** `SoftwareApplication` with fabricated `offers`/`aggregateRating`.                                                                                                                                                                                                                                                                                          |
| Project with video         | add `VideoObject`                                                                                                                                                                               | `name`, `description`, `thumbnailUrl`, `contentUrl`, `duration` (ISO 8601), `uploadDate` (**real** first-publication date, else omit the whole `VideoObject`)                                                                                                                                                                                                                                                                                                                                           |
| Patent                     | `CreativeWork` + `BreadcrumbList` (check whether Schema.org has gained a dedicated patent type; use it only if its definition fits)                                                             | `name` (official title), `identifier` as `PropertyValue` (`propertyID`: e.g. "Indian patent application number", `value`), `creator` → Person (as a named inventor, alongside the other official inventors if D-30 shows them), `sourceOrganization` or `publisher` only if it truly fits the applicant (ABES Engineering College) under current Schema.org definitions, `dateCreated` = filing date if verified. **Never** encode an unverified status. Description must use the exact status wording. |
| Experience                 | `BreadcrumbList` only (an `OrganizationRole` inside `Person.worksFor` is allowed on home if verified and public)                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Writing                    | `CollectionPage` with `ItemList` of external `url`s                                                                                                                                             | No `Article` markup for content hosted elsewhere                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Achievements → Credentials | Optional: `Person.hasCredential` → `EducationalOccupationalCredential` (`name`, `credentialCategory` such as "course certificate", `recognizedBy` = issuer `Organization`, `url` = verify page) | Only for credentials shown on the page and verified live. Never `credentialCategory: "certification"` for course completions.                                                                                                                                                                                                                                                                                                                                                                           |
| Laptop panel               | None (a utility dialog, not a page)                                                                                                                                                             | The résumé PDF is not marked up and not in the sitemap                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Forbidden: ratings, reviews, testimonials, `award` values without evidence, counts ("8 patents"), `worksFor` without verification, a granted status for applications, `PostalAddress` with locality unless D-15 allows it.

Implementation: build JSON-LD from the same content objects that render the page (`src/lib/seo/jsonld.ts`), so markup cannot drift from visible content. Serialize with `JSON.stringify` and escape `<` as `\u003c` to prevent script injection.

### 8.1 Prepared Phase 2 data and eligibility

Actual page titles and descriptions are in [../content/inventory/seo-metadata.yaml](../content/inventory/seo-metadata.yaml); homepage and sharing wording are in [../content.md](internal/content.md). These are internal preparation data. `canonicalOrigin` is deliberately unset until D-02; never output a guessed or preview canonical. Every row has a release gate separate from its proposed route eligibility.

The following is a data example for the identity wording, **not application code or an emitted script**. Its profile URLs still follow publication review. Add the canonical `@id` only after the production origin is selected.

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ayush Jain",
  "alternateName": "urayushjain",
  "description": "Ayush Jain builds full-stack web applications and AI-assisted tools.",
  "sameAs": ["https://github.com/URAYUSHJAIN", "https://x.com/urayushjain"]
}
```

Home uses Person, WebSite and ProfilePage; drawer indexes use CollectionPage with visible entries; record breadcrumbs use BreadcrumbList. Prototype case studies default to CreativeWork. Use SoftwareApplication only when describing a verified application rather than treating a mock interface as a complete service. Creator claims require confirmed contribution scope; collaborative work may use contributor where supported. Do not automatically call Ayush the sole creator of every repository. Patents remain CreativeWork descriptions of applications, never grants without official grant evidence. Do not emit Article for external link cards or VideoObject for unlicensed/non-playable media. VideoObject additionally needs a real public upload date, duration, thumbnail and playable URL; filesystem modification time is insufficient.

No ratings, counters, worksFor, awards, alumniOf for current studies, or location properties are added to this prepared example. Search-engine submission, canonical/header validation and social-preview fetch testing belong to Phase 4. The original-portfolio archive is excluded from the sitemap if the replace-and-archive option is chosen.

## 9. Redirects and status codes

If D-02 = replace (b):

| Old URL                    | New URL                                                          | Code                                                                                                        |
| -------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `/projects`                | `/projects/`                                                     | 301                                                                                                         |
| `/patents`                 | `/patents/`                                                      | 301                                                                                                         |
| `/about`                   | `/about/` (or `/` if no About page)                              | 301                                                                                                         |
| `/resume`                  | The approved public résumé PDF (D-24), or `/` if withheld (S-15) | 302 (the file may change). The PDF itself sends `X-Robots-Tag: noindex` ([security.md](security.md) §11.1). |
| `/blog/*` (if any existed) | `/writing/`                                                      | 301                                                                                                         |

- Unknown URLs return **404** with the shelf identity, not a soft-200.
- Removed records: 410 if intentionally retired, or 301 to the closest equivalent.
- Redirects are configured in the host's config and tested against the deployed site (T-SEO-07).

## 10. Images and video

- Descriptive kebab-case filenames for copies (originals untouched).
- Alt text describes what the screenshot shows ("ArogyaPlus report-analysis screen showing extracted lab values"), not keywords. Decorative art: `alt=""` / `aria-hidden`.
- Explicit dimensions, responsive `srcset`, modern formats via `astro:assets`, lazy loading below the fold. The identity photo is **eager** (it may be the LCP element).
- Video: a written summary always accompanies it. Poster image plus `VideoObject` only with a real `uploadDate`. Captions when they are real. No autoplay. Never private URLs.

## 11. Performance and Core Web Vitals

Targets (verify the current thresholds in official documentation at implementation): LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile, mobile and desktop.

Levers: static HTML; minimal JS (design.md §17 budget); preload only the primary font; reserve media dimensions; lazy media; no third-party scripts at launch (D-09); CDN caching with long-lived immutable caching for hashed assets.

Measure the deployed production build. Lab scores (Lighthouse) and field data (Search Console CWV report or CrUX, once there is enough traffic) are reported separately. Never claim scores before measuring.

## 12. Accessibility and mobile usability

Accessibility requirements live in [design.md](design.md) §13. For SEO purposes: `lang="en"`, valid landmark structure (`header`, `main`, `nav` for the breadcrumb only, `footer` if a plinth index exists), legible font sizes, tap targets, no horizontal scroll, and `<meta name="viewport" content="width=device-width, initial-scale=1">` with zoom allowed.

## 13. Phase 4 Search Console and post-launch validation

After DNS and the D-02 decision:

1. Verify a Search Console **domain property** (covers all subdomains). Add Bing Webmaster Tools.
2. Submit the sitemap.
3. URL-inspect home, one drawer page, two project records, one patent record. Confirm the rendered HTML contains the content, and confirm Google's chosen canonical equals the declared canonical.
4. If replacing the old site: use the Change of Address tool only for a domain change (not needed for same-host replacement). Monitor 404s for old URLs and add redirects.
5. Weekly for the first 8 weeks: coverage errors, duplicate-title warnings, CWV, manual actions.
6. Record what was done and when in `docs/launch-log.md` (create at launch).

## 14. Content quality

Every project page explains, from evidence: what it is, the problem, what Ayush built or contributed, how it works, the technologies used, real media, and public links. Every patent page uses verified official data and exact legal terms, and links to the official record. AI-assisted drafting must be grounded in source records and reviewed by the owner. Never mass-generate thin pages from repo names. Early-work records are `indexable: false` (D-06).

## 15. Ethical limits

Never: promise rankings; use hidden text or keyword stuffing; create doorway pages; fabricate backlinks, press, testimonials, awards, or employer associations; impersonate institutions; publish confidential work; present a filed or published application as a granted patent; write structured data that does not match visible content; publish unverified metrics to improve SEO.

## 16. Acceptance checklist

Each item maps to a test in [implementation-and-validation.md](implementation-and-validation.md) §6 (T-SEO-\*).

- [ ] Unique title and description on every indexable page (T-SEO-02)
- [ ] Canonical present, absolute, self-referential, and on the chosen host (T-SEO-03)
- [ ] Sitemap contains only indexable canonical 200 URLs; real `lastmod` (T-SEO-04)
- [ ] `robots.txt` valid, with no stale rules, assets not blocked, and sitemap referenced (T-SEO-05)
- [ ] Every record URL renders meaningful HTML with JS disabled (T-SEO-01)
- [ ] JSON-LD validates and every value appears visibly on the page (T-SEO-06)
- [ ] `sameAs` contains only verified profiles (T-AEO-02)
- [ ] Alt text and dimensions on all meaningful images (T-A11Y-05)
- [ ] No indexable thin or placeholder pages; filtered URLs canonicalize (T-SEO-08)
- [ ] Redirects, the 404 status, and the canonical host verified on the deployed site (T-SEO-07)
- [ ] Preview deployments are `noindex` (T-SEO-09)
- [ ] Search Console and Bing steps recorded as done or pending in the launch log
