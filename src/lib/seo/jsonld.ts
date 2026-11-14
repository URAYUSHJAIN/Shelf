// JSON-LD for every prerendered page (docs/seo-optimization.md §8).
// Built from the same released records that render the page, so the markup
// cannot drift from visible content. Nothing is emitted until the canonical
// origin is configured (D-02): every identifier here is an absolute URL.
import {
  DRAWERS, SURFACE_TITLES, articles, copy, education, patents, portrait, projects, site, skills, social,
  type SurfaceId,
} from '../../data/site';
import { faq } from './faq';

type Node = Record<string, unknown>;

const abs = (path: string) => new URL(path, site.origin!).href;
const personId = () => abs('/#person');
const websiteId = () => abs('/#website');
const personRef = () => ({ '@id': personId() });

/** The one Person entity. `full` adds the facts that are visible on /about/. */
function person(full: boolean): Node {
  const node: Node = {
    '@type': 'Person',
    '@id': personId(),
    name: 'Ayush Jain',
    alternateName: 'urayushjain',
    url: abs('/'),
    description: copy.statement,
    sameAs: social.map((s) => s.url),
  };
  if (portrait) node.image = abs(portrait.src);
  if (!full) return node;
  node.jobTitle = copy.role;
  node.mainEntityOfPage = abs('/about/');
  const names = skills.filter((s) => (s.evidence ?? []).length > 0).map((s) => s.name);
  if (names.length) node.knowsAbout = names;
  const school = (e: (typeof education)[number]): Node => ({
    '@type': 'EducationalOrganization',
    name: e.institution,
    ...(e.institutionUrl ? { url: e.institutionUrl } : {}),
  });
  // A course still in progress is an affiliation; only completed study is alumniOf.
  const current = education.filter((e) => e.endYearKind === 'expected');
  const completed = education.filter((e) => e.endYearKind !== 'expected' && e.endYear);
  if (current.length) node.affiliation = current.map(school);
  if (completed.length) node.alumniOf = completed.map(school);
  return node;
}

function website(): Node {
  return {
    '@type': 'WebSite',
    '@id': websiteId(),
    url: abs('/'),
    name: 'The Shelf',
    description: site.description,
    inLanguage: 'en',
    author: personRef(),
  };
}

function breadcrumb(trail: [string, string][]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

function itemList(items: { name: string; url: string }[]): Node {
  return {
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, url: item.url })),
  };
}

function collection(surface: SurfaceId, description: string, extra: Node = {}): Node {
  return {
    '@type': 'CollectionPage',
    '@id': abs(`/${surface}/#page`),
    url: abs(`/${surface}/`),
    name: SURFACE_TITLES[surface],
    description,
    isPartOf: { '@id': websiteId() },
    about: personRef(),
    ...extra,
  };
}

// Team builds list Ayush as a contributor, never as the sole creator.
const SHARED = new Set(['group-project', 'hackathon']);

function projectNode(p: (typeof projects)[number]): Node {
  const node: Node = {
    '@type': p.repo ? 'SoftwareSourceCode' : 'CreativeWork',
    '@id': abs(`/projects/${p.slug}/#work`),
    url: abs(`/projects/${p.slug}/`),
    name: p.title,
    description: p.summary,
    [SHARED.has(p.kind) ? 'contributor' : 'creator']: personRef(),
  };
  if (p.repo) node.codeRepository = p.repo;
  if ((p.technologies ?? []).length) node.keywords = (p.technologies ?? []).join(', ');
  if (p.images[0]) node.image = abs(p.images[0].full.src);
  return node;
}

// An application record. Status is stated only in the visible description;
// nothing here asserts a grant.
function patentNode(p: (typeof patents)[number]): Node {
  const node: Node = {
    '@type': 'CreativeWork',
    '@id': abs(`/patents/#patent-${p.slug}`),
    url: abs(`/patents/#patent-${p.slug}`),
    name: p.title,
    description: p.summary,
    contributor: personRef(),
  };
  if (p.officialTitle) node.alternateName = p.officialTitle;
  if (p.applicationNumber) {
    node.identifier = { '@type': 'PropertyValue', propertyID: 'Indian patent application number', value: p.applicationNumber };
  }
  if (p.filingDate) node.dateCreated = p.filingDate;
  if (p.publicationDate) node.datePublished = p.publicationDate;
  if ((p.applicants ?? []).length) node.sourceOrganization = (p.applicants ?? []).map((name) => ({ '@type': 'Organization', name }));
  return node;
}

export type PageKind = { type: 'home' } | { type: 'surface'; surface: SurfaceId; description: string } | { type: 'project'; slug: string };

/** The page's graph, or null when no canonical origin is set or the page is a utility surface. */
export function pageGraph(page: PageKind): Node | null {
  if (!site.origin) return null;
  let nodes: Node[] = [];
  if (page.type === 'home') {
    nodes = [website(), person(false)];
  } else if (page.type === 'project') {
    const p = projects.find((x) => x.slug === page.slug);
    if (!p) return null;
    nodes = [projectNode(p), breadcrumb([['The Shelf', '/'], ['Projects', '/projects/'], [p.title, `/projects/${p.slug}/`]])];
  } else {
    const { surface, description } = page;
    if (surface === 'laptop' || surface === 'contact') return null;
    const crumb = breadcrumb([['The Shelf', '/'], [SURFACE_TITLES[surface], `/${surface}/`]]);
    if (surface === 'about') {
      const questions = faq().filter((q) => !q.counted);
      nodes = [
        {
          '@type': 'ProfilePage',
          '@id': abs('/about/#page'),
          url: abs('/about/'),
          name: 'About Ayush Jain',
          description,
          isPartOf: { '@id': websiteId() },
          mainEntity: personRef(),
        },
        person(true),
        ...(questions.length
          ? [{
              '@type': 'FAQPage',
              '@id': abs('/about/#faq'),
              mainEntity: questions.map((q) => ({ '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: q.answer } })),
            }]
          : []),
        crumb,
      ];
    } else if (surface === 'projects') {
      nodes = [collection(surface, description, { mainEntity: itemList(projects.map((p) => ({ name: p.title, url: abs(`/projects/${p.slug}/`) }))) }), crumb];
    } else if (surface === 'patents') {
      nodes = [collection(surface, description, { hasPart: patents.map(patentNode) }), crumb];
    } else if (surface === 'writing') {
      // External articles are listed by URL only; they stay canonical where they were published.
      const posts = articles.filter((a) => a.canonicalUrl).map((a) => ({ name: a.title, url: a.canonicalUrl! }));
      nodes = [collection(surface, description, posts.length ? { mainEntity: itemList(posts) } : {}), crumb];
    } else {
      nodes = [collection(surface, description), crumb];
    }
  }
  return { '@context': 'https://schema.org', '@graph': nodes };
}

/** Safe inline serialisation: `<` cannot close the script element. */
export const serialize = (graph: Node) => JSON.stringify(graph).replace(/</g, '\\u003c');

export const DRAWER_IDS = DRAWERS.map((d) => d.id);
