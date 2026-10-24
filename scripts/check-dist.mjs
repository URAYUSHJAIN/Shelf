// Postbuild check: the release output must not contain review media, review
// notices, internal paths or personal-data patterns. Fails closed.
import { readdirSync, readFileSync, statSync } from 'node:fs';
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
  [/(?:\+91[\s-]?)?\b[6-9]\d{9}\b/, 'phone-number-like value'],
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
if (errors.length) {
  console.error('Release output check FAILED:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`Release output check passed (${files.length} files scanned).`);
