import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const base = 'ee9c00174598728293aa26cffbc346892d900faa';
const files = execFileSync(
  'git',
  ['ls-tree', '-r', '--name-only', base, '--', 'src/apps/customer', 'src/apps/staff'],
  { encoding: 'utf8' },
).trim().split('\n').filter(Boolean);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const rows = files.map((file) => {
  const before = execFileSync('git', ['show', `${base}:${file}`]);
  return `${hash(before)}  ${hash(readFileSync(file))}  ${file}`;
});

writeFileSync('docs/consegne/evidenze/GH-94/ui-invariants.sha256', `${rows.join('\n')}\n`);
