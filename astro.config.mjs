// @ts-check
import { defineConfig } from 'astro/config';
import { createReadStream, statSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, sep, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const assetsDir = resolve(root, 'assets');

// D-35: review media (needs-owner-review) is served only by the dev server,
// only to loopback clients, and never copied into public/ or dist/.
const REVIEW_PREFIXES = ['review/projects/', 'review/derived/', 'profile/'];
const TYPES = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
};

/** @returns {import('vite').Plugin} */
function reviewMedia() {
  return {
    name: 'shelf-review-media',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/review-media', (req, res) => {
        const remote = req.socket.remoteAddress ?? '';
        if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote)) {
          res.statusCode = 403;
          return res.end('Review media is loopback-only.');
        }
        const rel = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '');
        const file = resolve(assetsDir, rel);
        const type = TYPES[extname(file).toLowerCase()];
        if (!file.startsWith(assetsDir + sep) || !type || !REVIEW_PREFIXES.some((p) => rel.startsWith(p))) {
          res.statusCode = 404;
          return res.end();
        }
        let size;
        try {
          size = statSync(file).size;
        } catch {
          res.statusCode = 404;
          return res.end();
        }
        res.setHeader('Content-Type', type);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Robots-Tag', 'noindex');
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
        if (range) {
          const start = range[1] ? Number(range[1]) : 0;
          const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
          if (start > end || start >= size) {
            res.statusCode = 416;
            res.setHeader('Content-Range', `bytes */${size}`);
            return res.end();
          }
          res.statusCode = 206;
          res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
          res.setHeader('Content-Length', String(end - start + 1));
          return createReadStream(file, { start, end }).pipe(res);
        }
        res.setHeader('Content-Length', String(size));
        createReadStream(file).pipe(res);
      });
    },
  };
}

// Release output keeps a media file only if a built page, stylesheet or script
// references it. Release-gated files in public/ (certificate badges of
// unapproved credentials, the OG image before an origin exists) are removed.
const MEDIA = /\.(png|jpe?g|webp|gif|mp4|webm|pdf)$/i;
/** @returns {import('astro').AstroIntegration} */
function pruneUnreferencedMedia() {
  return {
    name: 'shelf-prune-media',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const files = [];
        const walk = (d) => {
          for (const e of readdirSync(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            e.isDirectory() ? walk(p) : files.push(p);
          }
        };
        walk(out);
        const text = files
          .filter((f) => /\.(html|css|js|xml|txt|json|webmanifest)$/i.test(f))
          .map((f) => readFileSync(f, 'utf8'))
          .join('\n');
        let removed = 0;
        for (const f of files.filter((f) => MEDIA.test(f))) {
          const url = '/' + relative(out, f).split(sep).join('/');
          if (!text.includes(url)) {
            rmSync(f);
            removed++;
          }
        }
        const prune = (d) => {
          for (const e of readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) prune(join(d, e.name));
          if (d !== out && readdirSync(d).length === 0) rmSync(d, { recursive: true });
        };
        prune(out);
        logger.info(`removed ${removed} unreferenced media file(s) from the release output`);
      },
    },
  };
}

// Sitemap (seo-optimization.md §6). Written only when the canonical origin is
// configured through SITE_ORIGIN and the build is not a preview deployment.
// It lists exactly the built pages whose own robots tag allows indexing, so the
// sitemap can never disagree with the pages. <lastmod> is the commit date of
// the content records, never the build time; it is omitted when git is absent.
/** @returns {import('astro').AstroIntegration} */
function sitemap() {
  return {
    name: 'shelf-sitemap',
    hooks: {
      'astro:build:done': ({ dir, pages, logger }) => {
        const origin = (process.env.SITE_ORIGIN ?? '').trim().replace(/\/+$/, '');
        const preview = !!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
        if (!origin || preview) {
          logger.info('no sitemap written (SITE_ORIGIN is not set, or this is a preview deployment)');
          return;
        }
        const out = fileURLToPath(dir);
        let lastmod = '';
        try {
          lastmod = execFileSync('git', ['log', '-1', '--format=%cs', '--', 'src/data/records.json'], { cwd: root, encoding: 'utf8' }).trim();
        } catch {
          lastmod = '';
        }
        const urls = [];
        for (const { pathname } of pages) {
          if (pathname.startsWith('404')) continue;
          const file = join(out, pathname, 'index.html');
          let html = '';
          try {
            html = readFileSync(file, 'utf8');
          } catch {
            continue;
          }
          const robots = /<meta name="robots" content="([^"]*)"/.exec(html)?.[1] ?? '';
          if (robots.includes('noindex')) continue;
          urls.push(new URL('/' + pathname, origin).href);
        }
        urls.sort();
        const body =
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          urls.map((loc) => `  <url><loc>${loc}</loc>${/^\d{4}-\d{2}-\d{2}$/.test(lastmod) ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n') +
          '\n</urlset>\n';
        writeFileSync(join(out, 'sitemap.xml'), body);
        logger.info(`sitemap.xml written with ${urls.length} URL(s)`);
      },
    },
  };
}

// The canonical origin comes from SITE_ORIGIN (D-02/D-23); a host is never
// guessed, so without it no canonical link, sitemap or JSON-LD is emitted.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' },
  integrations: [pruneUnreferencedMedia(), sitemap()],
  vite: {
    plugins: [reviewMedia()],
    // Keep the dev server's native tooling in Node, including CommonJS deps.
    ssr: { external: ['vite', 'rolldown', 'picomatch'] },
  },
});
