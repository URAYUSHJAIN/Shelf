// Postbuild check: the release output must not contain review media, review
// notices, internal paths or personal-data patterns. Fails closed.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(dist);

const forbidden = [
  [/\/review-media\//, 'quarantined review media URL'],
  [/data-review-mode/, 'review-mode marker'],
  [/needs-owner-review/, 'unapproved visibility value'],
  [/content\/inventory|placement\/|BuildLog\//, 'internal source path'],
  [/provenance|openQuestions|reviewNotes|sourceReview/, 'private inventory field'],
  // A decimal point immediately before ten digits denotes a fractional
  // numeric constant (for example, colour conversion in the 3D renderer).
  [/(?<![\d.])(?:\+91[\s-]?)?[6-9]\d{9}\b/, 'phone-number-like value'],
  [/\bgranted\b|\bpatented\b/i, 'grant wording'],
];
const errors = [];
const textFiles = files.filter((f) => /\.(html|js|css|txt|xml|json)$/i.test(f));
const corpus = textFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
for (const f of files) {
  const rel = relative(dist, f).replaceAll('\\', '/');
  // Every shipped media file must be referenced by the built site.
  if (/\.(mp4|webm|png|jpe?g|webp|gif|pdf)$/i.test(rel) && !corpus.includes('/' + rel)) {
    errors.push(`${rel}: media file is not referenced by any page (release-gated or stray)`);
  }
}
for (const f of textFiles) {
  const rel = relative(dist, f).replaceAll('\\', '/');
  const text = readFileSync(f, 'utf8');
  for (const [re, label] of forbidden) if (re.test(text)) errors.push(`${rel}: ${label}`);
}
// ---- Search and security consistency (seo-optimization.md §5–§8, security.md §8) ----
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const csp = vercel.headers?.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
if (!csp) errors.push('vercel.json: Content-Security-Policy header is missing');
const titles = new Map();
const descriptions = new Map();
const indexable = [];
for (const f of files.filter((x) => x.endsWith('.html'))) {
  const rel = relative(dist, f).replaceAll('\\', '/');
  const html = readFileSync(f, 'utf8');
  // Every executable inline script must be allowed by a hash in the CSP.
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/ld\+json"/.test(m[1])) {
      try {
        const graph = JSON.parse(m[2]);
        if (graph['@context'] !== 'https://schema.org') errors.push(`${rel}: JSON-LD without the schema.org context`);
        if (/aggregateRating|"review"|"award"/.test(m[2])) errors.push(`${rel}: JSON-LD contains a rating, review or award`);
      } catch {
        errors.push(`${rel}: JSON-LD does not parse`);
      }
      continue;
    }
    const hash = 'sha256-' + createHash('sha256').update(m[2]).digest('base64');
    if (!csp.includes(`'${hash}'`)) errors.push(`${rel}: inline script ${hash} is not allowed by the CSP in vercel.json`);
  }
  // An embedded frame must be named in frame-src.
  for (const m of html.matchAll(/<iframe[^>]*\bdata-src="(https:\/\/[^"/]+)/g)) {
    if (!csp.includes(m[1])) errors.push(`${rel}: iframe origin ${m[1]} is not in the CSP frame-src`);
  }
  if (/\bhttp:\/\/(?!www\.w3\.org|www\.sitemaps\.org)/.test(html.replace(/xmlns(:\w+)?="[^"]*"/g, ''))) errors.push(`${rel}: insecure http:// reference`);
  const robots = /<meta name="robots" content="([^"]*)"/.exec(html)?.[1] ?? '';
  if (robots.includes('noindex')) continue;
  indexable.push(rel);
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
  const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
  if (!title) errors.push(`${rel}: missing <title>`);
  if (!description) errors.push(`${rel}: missing meta description`);
  if (titles.has(title)) errors.push(`${rel}: title duplicates ${titles.get(title)}`);
  if (descriptions.has(description)) errors.push(`${rel}: description duplicates ${descriptions.get(description)}`);
  titles.set(title, rel);
  descriptions.set(description, rel);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) errors.push(`${rel}: expected exactly one h1`);
}
// The sitemap, when present, lists exactly the indexable pages.
const sitemapFile = join(dist, 'sitemap.xml');
if (existsSync(sitemapFile)) {
  const locs = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (new Set(locs).size !== locs.length) errors.push('sitemap.xml: duplicate URLs');
  if (locs.some((l) => !l.startsWith('https://'))) errors.push('sitemap.xml: non-HTTPS URL');
  const paths = new Set(locs.map((l) => new URL(l).pathname.replace(/^\//, '') + 'index.html'));
  for (const rel of indexable) if (!paths.has(rel)) errors.push(`sitemap.xml: missing indexable page ${rel}`);
  for (const path of paths) if (!indexable.includes(path)) errors.push(`sitemap.xml: lists a page that is not indexable or not built: ${path}`);
}

if (errors.length) {
  console.error('Release output check FAILED:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`Release output check passed (${files.length} files scanned).`);
