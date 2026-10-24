// DQ-3 (docs/documentation-quality.md): every relative Markdown link in the
// project resolves to an existing file. External links are not fetched.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SKIP = new Set(['node_modules', 'dist', '.astro', '.tools', 'assets', '__pycache__', '.git']);
const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(join(d, e.name));
    } else if (e.name.endsWith('.md')) files.push(join(d, e.name));
  }
})(root);

const LINK = /\]\((<[^>]+>|[^)\s]+)/g;
let checked = 0;
const broken = [];
for (const f of files) {
  const text = readFileSync(f, 'utf8').replace(/`[^`\n]*`/g, '');
  for (const m of text.matchAll(LINK)) {
    const target = m[1].replace(/^<|>$/g, '');
    if (/^[a-z]+:/i.test(target) || target.startsWith('#') || target.startsWith('/')) continue;
    const path = decodeURIComponent(target.split('#')[0]);
    if (!path) continue;
    checked++;
    if (!existsSync(normalize(join(dirname(f), path)))) broken.push(`${relative(root, f)} → ${target}`);
  }
}
if (broken.length) {
  console.error(`Link check FAILED (${broken.length} of ${checked}):\n- ` + broken.join('\n- '));
  process.exit(1);
}
console.log(`Link check passed: ${checked} relative links in ${files.length} Markdown files resolve.`);
