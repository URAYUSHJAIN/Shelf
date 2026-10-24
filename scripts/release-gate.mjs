// Prebuild release gate (D-35). Fails closed.
// - Review/preview mode can never produce a static build.
// - Every allowlisted id must exist and carry an approved visibility.
// - Allowlisted media must be approved; quarantined review paths are rejected.
// Run with --selftest to prove that review-only fixtures are rejected.
import { readFileSync } from 'node:fs';

const APPROVED = new Set(['public-approved', 'public-source-verified']);

export function gate(records, allow, env) {
  const errors = [];
  if (env.SHELF_PREVIEW || env.SHELF_REVIEW || env.CI_PREVIEW) {
    errors.push('Review mode cannot produce a static build (D-35). Unset SHELF_PREVIEW/SHELF_REVIEW.');
  }
  const byId = new Map();
  for (const [key, list] of Object.entries(records)) {
    if (Array.isArray(list)) for (const r of list) byId.set(r.id, { ...r, collection: key });
  }
  byId.set(records.identity.portrait.id, records.identity.portrait);
  for (const id of allow.records) {
    const r = byId.get(id);
    if (!r) {
      errors.push(`Allowlisted id ${id} does not exist.`);
      continue;
    }
    if (!APPROVED.has(r.visibility)) errors.push(`${id} is ${r.visibility}; release needs public-approved or public-source-verified.`);
    if (r.collection === 'patents' && r.status !== 'application-published') {
      errors.push(`${id}: unresolved patent claim cannot be released.`);
    }
    if (r.collection === 'patents' && r.grantClaim) errors.push(`${id}: grant claims are forbidden.`);
    for (const m of [...(r.images ?? []), ...(r.videos ?? [])]) {
      if (m.approved && JSON.stringify(m).includes('/review-media/')) {
        errors.push(`${id}: approved media still points at quarantined review storage.`);
      }
    }
  }
  return errors;
}

function selftest(records) {
  const someProject = records.projects[0];
  const cases = [
    ['review mode env', { records: [] }, { SHELF_PREVIEW: '1' }],
    ['unapproved record', { records: [someProject.id] }, {}],
    ['unknown id', { records: ['proj-9999'] }, {}],
    ['unreviewed portrait', { records: [records.identity.portrait.id] }, {}],
  ];
  let ok = true;
  for (const [name, allow, env] of cases) {
    const errs = gate(records, allow, env);
    console.log(`${errs.length ? 'PASS' : 'FAIL'} rejects ${name}${errs.length ? ` — ${errs[0]}` : ''}`);
    if (!errs.length) ok = false;
  }
  const clean = gate(records, { records: [] }, {});
  console.log(`${clean.length ? 'FAIL' : 'PASS'} accepts empty approved allowlist`);
  if (clean.length) ok = false;
  return ok;
}

const records = JSON.parse(readFileSync(new URL('../src/data/records.json', import.meta.url), 'utf8'));
const allow = JSON.parse(readFileSync(new URL('../src/data/release-allowlist.json', import.meta.url), 'utf8'));

if (process.argv.includes('--selftest')) {
  process.exit(selftest(records) ? 0 : 1);
}
const errors = gate(records, allow, process.env);
if (errors.length) {
  console.error('Release gate FAILED:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`Release gate passed: ${allow.records.length} approved record(s) allowlisted; review records excluded.`);
