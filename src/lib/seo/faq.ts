// Plain questions and direct answers for the About drawer. Every answer is
// assembled from released records, so it changes when the records change and
// never states anything the site cannot show.
import { copy, education, featured, groups, patents, projects, site, skills, social } from '../../data/site';

export interface Faq {
  question: string;
  answer: string;
  /** Where on the site the evidence for the answer lives. */
  href?: string;
  linkLabel?: string;
  /** Answers that state a number stay out of structured data (no counts in markup). */
  counted?: boolean;
}

const list = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export function faq(): Faq[] {
  const out: Faq[] = [];
  const current = education.find((e) => e.endYearKind === 'expected');
  const study = current
    ? ` He is studying ${current.discipline ?? current.program} at ${current.institution} (${current.program}${current.startYear ? `, ${current.startYear}–${current.endYear} expected` : ''}).`
    : '';
  out.push({ question: 'Who is Ayush Jain?', answer: `${copy.statement}${study}`, href: '/about/', linkLabel: 'About Ayush Jain' });

  const areas = ['ai', 'full-stack', 'web3', 'healthcare', 'tools'].filter((g) => projects.some((p) => p.group === g)).map((g) => groups[g]);
  if (areas.length) {
    out.push({
      question: 'What does Ayush Jain do?',
      answer: `He designs and builds software projects and documents how they work. The projects on this site fall into these areas: ${list(areas)}.`,
      href: '/projects/',
      linkLabel: 'Projects',
    });
  }

  const top = skills
    .filter((s) => (s.evidence ?? []).length > 0)
    .sort((a, b) => (b.evidence ?? []).length - (a.evidence ?? []).length)
    .slice(0, 10)
    .map((s) => s.name);
  if (top.length) {
    out.push({
      question: 'What technologies does Ayush Jain use?',
      answer: `The tools that appear most often in the projects here are ${list(top)}. The toolbox lists every tool with the projects that use it.`,
      href: '/toolbox/',
      linkLabel: 'Skills & Toolbox',
    });
  }

  if (featured.length) {
    out.push({
      question: 'What projects has Ayush Jain built?',
      answer: `Featured projects include ${list(featured.map((p) => p.title))}. Each project has its own page describing the problem, what was built and the technologies used.`,
      href: '/projects/',
      linkLabel: 'All projects',
    });
  }

  if (education.length) {
    out.push({
      question: "What is Ayush Jain's educational background?",
      answer: education.map((e) => e.summary).join(' '),
      href: '/education/',
      linkLabel: 'Education',
    });
  }

  if (patents.length) {
    const published = patents.filter((p) => p.status === 'application-published').length;
    const applicants = [...new Set(patents.flatMap((p) => p.applicants ?? []))];
    out.push({
      question: 'How many patents has Ayush Jain filed?',
      answer:
        `Ayush Jain is a named inventor on ${patents.length} Indian patent ${patents.length === 1 ? 'application' : 'applications'} listed on this site` +
        (applicants.length ? `; the applicant is ${list(applicants)}` : '') +
        `. ${published === patents.length ? 'Each' : `${published} of them`} is recorded as a published application. ` +
        'Current legal status has not been verified, and no application is presented as a grant.',
      href: '/patents/',
      linkLabel: 'Patent application records',
      counted: true,
    });
  }

  const github = social.find((s) => s.platform === 'github');
  if (github) {
    out.push({
      question: "Where can I find Ayush Jain's GitHub?",
      answer: `His GitHub profile is ${github.url} (@${github.handle}).`,
      href: github.url,
      linkLabel: 'GitHub profile',
    });
  }

  out.push({
    question: 'How can I contact Ayush Jain?',
    answer: `Email ${site.email}, or use the notebook on the desk to prepare a message in your own email app.`,
    href: '/contact/',
    linkLabel: 'Write a message',
  });
  return out;
}
