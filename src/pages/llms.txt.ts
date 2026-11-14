import type { APIRoute } from 'astro';
import { DRAWERS, SURFACE_TITLES, articles, copy, education, experience, patents, projects, site, social } from '../data/site';

// llms.txt is a community convention, not a standard, and no provider promises
// to read it (ai-optimization.md §5.2). It is generated from the same released
// records as the pages, lists public pages only, and gives no ranking advice.
export const GET: APIRoute = () => {
  const url = (path: string) => (site.origin ? new URL(path, site.origin).href : path);
  const NAME: Record<string, string> = { github: 'GitHub', linkedin: 'LinkedIn', x: 'X' };
  const out: string[] = ['# Ayush Jain — The Shelf', '', `> ${copy.statement}`, ''];
  out.push('The Shelf is the personal portfolio of Ayush Jain. Every drawer and project has its own page; the facts below are generated from the same records those pages show.', '');

  const study = education.find((e) => e.endYearKind === 'expected');
  out.push('## Identity', '', '- Name: Ayush Jain', '- Handle: urayushjain');
  if (study) out.push(`- Education: ${study.summary}`);
  if (site.origin) out.push(`- Website: ${url('/')}`);
  for (const s of social) out.push(`- ${NAME[s.platform] ?? s.platform}: ${s.url}`);
  out.push(`- Contact: ${site.email}`, '');

  out.push('## Sections', '');
  const BLURB: Record<string, string> = {
    about: 'Profile, key facts and frequently asked questions',
    projects: 'Project records with problem, solution, technologies and links',
    patents: 'Patent application records with numbers, dates and documented status',
    experience: 'Internships, a trainee programme and student leadership roles',
    education: 'Education and study timeline',
    achievements: 'Hackathon results and open-source activity, with sources',
    toolbox: 'Languages, frameworks and tools, linked to the projects that use them',
    certifications: 'Course certificates, training badges and participation records',
  };
  for (const d of DRAWERS) out.push(`- [${d.label}](${url(`/${d.id}/`)}): ${BLURB[d.id]}`);
  out.push(`- [${SURFACE_TITLES.writing}](${url('/writing/')}): Articles and build walkthroughs`, '');

  if (projects.length) {
    out.push('## Projects', '');
    for (const p of projects) out.push(`- [${p.title}](${url(`/projects/${p.slug}/`)}): ${p.summary}`);
    out.push('');
  }

  if (patents.length) {
    out.push('## Patent applications', '');
    out.push('Ayush Jain is a named inventor on these applications. They are application records; none is presented as a grant, and current legal status has not been verified.', '');
    for (const p of patents) {
      const facts = [
        p.applicationNumber ? `application no. ${p.applicationNumber}` : null,
        p.filingDate ? `filed ${p.filingDate}` : null,
        p.publicationDate ? `published ${p.publicationDate}` : null,
        (p.applicants ?? []).length ? `applicant ${(p.applicants ?? []).join(', ')}` : null,
      ].filter(Boolean);
      out.push(`- [${p.title}](${url(`/patents/#patent-${p.slug}`)})${facts.length ? ` (${facts.join('; ')})` : ''}: ${p.summary}`);
    }
    out.push('');
  }

  const work = experience.filter((e) => e.section === 'work');
  if (work.length) {
    out.push('## Experience', '');
    for (const e of work) out.push(`- ${e.role}, ${e.organization}: ${e.summary}`);
    out.push('');
  }

  const posts = articles.filter((a) => a.canonicalUrl);
  if (posts.length) {
    out.push('## Writing', '');
    for (const a of posts) out.push(`- [${a.title}](${a.canonicalUrl})${a.publishedAt ? ` (${a.publishedAt})` : ''}: ${a.summary}`);
    out.push('');
  }
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
