import json from './records.json';
import allowlist from './release-allowlist.json';
import { RecordsSchema } from './schema';

// Strict schema: unknown (private) fields or malformed links fail the build.
const raw = RecordsSchema.parse(json);

/**
 * D-35 publication gate.
 * - `astro dev` (loopback only) is review mode: public-safe needs-owner-review
 *   records render with a visible notice and noindex.
 * - `astro build` is release mode: only records whose id is in
 *   release-allowlist.json AND whose visibility is approved are rendered.
 *   scripts/release-gate.mjs refuses to build in review mode.
 */
export const REVIEW_MODE = import.meta.env.DEV;

const APPROVED = new Set(['public-approved', 'public-source-verified']);
const released = new Set<string>(allowlist.records);

type Rec = { id: string; slug: string; visibility: string };

const isPublic = (r: Rec) => REVIEW_MODE || (released.has(r.id) && APPROVED.has(r.visibility));

export function visible<T extends Rec>(list: T[]): T[] {
  return list.filter(isPublic);
}

/** Media is review-only unless its own approval flag is set. */
function mediaOk(item: { approved?: boolean }) {
  return REVIEW_MODE || item.approved === true;
}

export const identity = raw.identity;
export const copy = raw.identity.copy;
export const groups = raw.identity.groups;
export const portrait = isPublic({ ...raw.identity.portrait, slug: 'portrait' }) ? raw.identity.portrait : null;

export const projects = visible(raw.projects).map((p) => ({
  ...p,
  images: p.images.filter(mediaOk),
  videos: p.videos.filter(mediaOk),
}));
export const patents = visible(raw.patents);
export const experience = visible(raw.experience);
export const education = visible(raw.education);
export const achievements = visible(raw.achievements);
export const credentials = visible(raw.credentials);
export const skills = visible(raw.skills);
export const articles = visible(raw.articles);
export const social = visible(raw.social);

export const site = {
  title: 'The Shelf — Ayush Jain',
  description: 'A personal archive by Ayush Jain: software projects, invention applications, experience and writing.',
  email: copy.publicEmail,
  // D-23 default: current live URL of the earlier portfolio.
  originalPortfolio: identity.originalPortfolio ?? 'https://www.urayushjain.tech',
  // D-24: no public résumé file is approved yet.
  resumeUrl: null as string | null,
  // D-12: owner-supplied "Currently Building" items. Null keeps the note on
  // verified featured projects instead of invented work-in-progress.
  currentlyBuilding: null as string[] | null,
  // canonicalOrigin is null (implementation-policy.json). No guessed host.
  origin: null as string | null,
};

export const DRAWERS = [
  { id: 'about', label: 'About Me', icon: 'person' },
  { id: 'projects', label: 'Projects', icon: 'code' },
  { id: 'patents', label: 'Patents', icon: 'doc' },
  { id: 'experience', label: 'Experience', icon: 'briefcase' },
  { id: 'education', label: 'Education', icon: 'cap' },
  { id: 'achievements', label: 'Achievements', icon: 'trophy' },
  { id: 'toolbox', label: 'Skills & Toolbox', icon: 'layers' },
  { id: 'certifications', label: 'Certifications', icon: 'badge' },
] as const;

export type DrawerId = (typeof DRAWERS)[number]['id'];
export type SurfaceId = DrawerId | 'writing' | 'laptop' | 'contact';

export const SURFACE_TITLES: Record<SurfaceId, string> = {
  about: 'About Me',
  projects: 'Projects',
  patents: 'Patents',
  experience: 'Experience',
  education: 'Education',
  achievements: 'Achievements',
  toolbox: 'Skills & Toolbox',
  certifications: 'Certifications',
  writing: 'My Writings',
  laptop: 'Laptop',
  contact: 'Write to Ayush',
};

export const featured = projects
  .filter((p) => p.featuredOrder)
  .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));

/** Home focus chips (D-21): only chips backed by real records are shown. */
export const chips = [
  { label: 'Full-Stack', icon: 'code', href: '/projects/?group=full-stack', ok: projects.some((p) => p.group === 'full-stack') },
  { label: 'AI & Data', icon: 'cube', href: '/projects/?group=ai', ok: projects.some((p) => p.group === 'ai') },
  { label: 'Web3', icon: 'gear', href: '/projects/?group=web3', ok: projects.some((p) => p.group === 'web3') },
  { label: 'Innovation', icon: 'leaf', href: '/patents/', ok: patents.length > 0 },
].filter((c) => c.ok);

export function fmtMonth(v?: string | null) {
  if (!v) return '';
  const [y, m] = String(v).split('-');
  if (!m) return y;
  const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function fmtDate(v?: string | null) {
  if (!v) return '';
  const d = new Date(v + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
