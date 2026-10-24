import { z } from 'astro/zod';

/**
 * Public schemas for src/data/records.json (asset-organization.md §3).
 * Every object is strict: an unexpected key such as `provenance`,
 * `openQuestions` or `reviewNotes` fails the build instead of leaking.
 */

const visibility = z.enum(['needs-owner-review', 'public-approved', 'public-source-verified']);
const https = z.string().regex(/^https:\/\//, 'external links must use https');
const mediaSrc = z.string().regex(/^\/(review-media|media)\//, 'media must come from /media/ or loopback /review-media/');
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoMonth = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/);
const text = z.string().min(1);

const base = { id: text, slug: z.string().regex(/^[a-z0-9-]+$/), visibility };

const size = z.strictObject({
  src: mediaSrc,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  originalWidth: z.number().int().positive(),
  originalHeight: z.number().int().positive(),
});

const project = z.strictObject({
  ...base,
  title: text,
  summary: text,
  kind: text,
  deploymentState: text,
  group: text,
  technologies: z.array(text).optional(),
  problem: text.optional(),
  body: text.optional(),
  features: z.array(text).optional(),
  architecture: text.optional(),
  displayOrder: z.number().int(),
  featuredOrder: z.number().int().optional(),
  repo: https.optional(),
  demo: https.optional(),
  images: z.array(
    z.strictObject({ media: text, alt: text, full: size, thumb: size.nullable(), approved: z.boolean() }),
  ),
  videos: z.array(
    z.strictObject({
      src: mediaSrc,
      start: z.number().nullable(),
      duration: z.number().nullable(),
      shared: z.boolean(),
      approved: z.boolean(),
    }),
  ),
  hasConflict: z.boolean(),
});

const patent = z.strictObject({
  ...base,
  title: text,
  summary: text,
  body: text.optional(),
  officialSearchUrl: https.optional(),
  office: text.optional(),
  applicants: z.array(text).optional(),
  status: z.enum(['application-published', 'unverified']),
  grantClaim: z.literal(false),
  officialTitle: text.nullable().optional(),
  applicationNumber: z.string().regex(/^\d{12}$/).nullable().optional(),
  filingDate: isoDay.nullable().optional(),
  publicationDate: isoDay.nullable().optional(),
  journalIssue: text.nullable().optional(),
  statusCopy: text.nullable().optional(),
  role: z.literal('Named inventor').nullable().optional(),
});

const experience = z.strictObject({
  ...base,
  organization: text,
  role: text,
  type: text,
  programme: text.optional(),
  summary: text,
  body: text.optional(),
  technologies: z.array(text).optional(),
  startDate: isoMonth.optional(),
  endDate: isoMonth.optional(),
  datesWithheld: z.literal(true).optional(),
  section: z.enum(['work', 'leadership']),
});

const education = z.strictObject({
  ...base,
  institution: text,
  program: text,
  discipline: text.optional(),
  startYear: z.number().int().optional(),
  endYear: z.number().int().optional(),
  endYearKind: text.optional(),
  institutionUrl: https.optional(),
  summary: text,
});

const achievement = z.strictObject({
  ...base,
  title: text,
  kind: text,
  event: text.optional(),
  issuer: text.optional(),
  date: isoDay.optional(),
  result: text.optional(),
  teamContext: text.optional(),
  credentialUrl: https.optional(),
  summary: text,
});

const credential = z.strictObject({
  ...base,
  title: text,
  issuer: text,
  platform: text.optional(),
  kind: z.enum(['course-certificate', 'training-badge', 'statement-of-achievement', 'participation', 'badge']),
  issueDate: isoDay.optional(),
  hours: z.number().positive().optional(),
  verifyUrl: https.optional(),
  summary: text,
  badge: z.string().regex(/^\/media\/certifications\/[a-z0-9-]+\/badge\.png$/).optional(),
});

const skill = z.strictObject({ ...base, name: text, category: z.enum(['language', 'tools']), evidence: z.array(text).optional() });

const article = z.strictObject({
  ...base,
  title: text,
  type: text,
  category: text,
  platform: text,
  canonicalUrl: https.optional(),
  publishedAt: isoDay.optional(),
  summary: text,
});

const social = z.strictObject({ ...base, platform: z.enum(['github', 'linkedin', 'x']), url: https, handle: text });

export const RecordsSchema = z.strictObject({
  identity: z.strictObject({
    copy: z.strictObject({
      wordmark: text,
      byline: text,
      role: text,
      statement: text,
      intro: text,
      about: text,
      shelfHint: text,
      photoAlt: text,
      contact: text,
      publicEmail: z.email(),
    }),
    portrait: z.strictObject({
      src: mediaSrc,
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      visibility,
      id: text,
    }),
    groups: z.record(z.string(), text),
    drawerDescriptions: z.record(z.string(), text),
    statusLabels: z.record(z.string(), text),
    originalPortfolio: https.nullable(),
  }),
  projects: z.array(project),
  patents: z.array(patent),
  experience: z.array(experience),
  education: z.array(education),
  achievements: z.array(achievement),
  credentials: z.array(credential),
  skills: z.array(skill),
  articles: z.array(article),
  social: z.array(social),
});

export type Records = z.infer<typeof RecordsSchema>;
