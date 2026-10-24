import type { APIRoute } from 'astro';
import { REVIEW_MODE, site } from '../data/site';

// No sitemap line until the owner sets a canonical origin (no guessed host).
export const GET: APIRoute = () => {
  const body = REVIEW_MODE
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /laptop/\nDisallow: /contact/\n${site.origin ? `Sitemap: ${new URL('/sitemap.xml', site.origin).href}\n` : ''}`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
