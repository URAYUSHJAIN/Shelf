import type { APIRoute } from 'astro';
import { crawlers, site } from '../data/site';

// Generated from the crawler policy in src/data/site.ts (D-10). Review mode and
// preview deployments disallow everything. No path is blocked on the released
// site: utility pages carry a noindex tag, which crawlers must be able to read.
// The sitemap line appears only once the canonical origin is configured.
export const GET: APIRoute = () => {
  const lines: string[] = [];
  if (!site.indexable) {
    lines.push('User-agent: *', 'Disallow: /');
  } else {
    for (const agent of crawlers.allowed) lines.push(`User-agent: ${agent}`);
    lines.push('User-agent: *', 'Allow: /');
    if (crawlers.blocked.length) {
      lines.push('');
      for (const agent of crawlers.blocked) lines.push(`User-agent: ${agent}`);
      lines.push('Disallow: /');
    }
    if (site.origin) lines.push('', `Sitemap: ${new URL('/sitemap.xml', site.origin).href}`);
  }
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
