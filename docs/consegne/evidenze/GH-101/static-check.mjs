import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = '/Users/luigimaisto/Desktop/grooming-hub-web/webapp';
const out = path.join(root, 'docs/consegne/evidenze/GH-101/static.json');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const digest = (content) => createHash('sha256').update(content).digest('hex');
const base = git('rev-parse', 'HEAD');

const currentHash = async (file) => digest(await readFile(path.join(root, file)));
const baseHash = (file) => digest(execFileSync('git', ['show', `${base}:${file}`], { cwd: root }));

const pageFiles = git('ls-tree', '-r', '--name-only', base, 'src/apps/staff/pages')
  .split('\n')
  .filter(Boolean)
  .filter((file) => file !== 'src/apps/staff/pages/Calendar.jsx');
const otherStaffPages = [];
for (const file of pageFiles) {
  const before = baseHash(file);
  const after = await currentHash(file);
  otherStaffPages.push({ file, before, after, unchanged: before === after });
}

const gh81Files = [
  'src/apps/staff/StaffApp.jsx',
  'src/apps/staff/components/StaffRequestAlerts.jsx',
  'src/apps/staff/components/StaffKit.jsx',
  'src/apps/staff/styles/gh15-staff.css',
  'src/shared/ui/Icon.jsx',
];
const gh81 = [];
for (const file of gh81Files) {
  const before = baseHash(file);
  const after = await currentHash(file);
  gh81.push({ file, before, after, unchanged: before === after });
}

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(entryPath));
    else if (/\.(jsx|js)$/.test(entry.name)) files.push(entryPath);
  }
  return files;
};

const modalUses = [];
const modalImports = [];
for (const absolute of await walk(path.join(root, 'src'))) {
  const relative = path.relative(root, absolute);
  const lines = (await readFile(absolute, 'utf8')).split('\n');
  lines.forEach((line, index) => {
    if (/<Modal(?:\s|>)/.test(line)) modalUses.push({ file: relative, line: index + 1, closeDisabled: /closeDisabled=/.test(line) });
    if (/import Modal from ['"].*\/Modal['"]/.test(line)) modalImports.push({ file: relative, line: index + 1 });
  });
}

const result = {
  base,
  customerDiff: git('diff', '--name-only', '--', 'src/apps/customer'),
  otherStaffPages: {
    count: otherStaffPages.length,
    changed: otherStaffPages.filter((item) => !item.unchanged),
    files: otherStaffPages,
  },
  gh81: {
    changed: gh81.filter((item) => !item.unchanged),
    files: gh81,
  },
  modal: {
    imports: modalImports,
    uses: modalUses,
    totalUses: modalUses.length,
    protectedUses: modalUses.filter((item) => item.closeDisabled).length,
    unchangedUses: modalUses.filter((item) => !item.closeDisabled).length,
  },
};

assert.equal(result.customerDiff, '');
assert.deepEqual(result.otherStaffPages.changed, []);
assert.deepEqual(result.gh81.changed, []);
assert.equal(result.modal.totalUses, 5);
assert.equal(result.modal.protectedUses, 4);
assert.equal(result.modal.unchangedUses, 1);
assert.deepEqual(result.modal.imports.map((item) => item.file), ['src/apps/staff/pages/Calendar.jsx']);

await writeFile(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  base: result.base,
  customerDiff: result.customerDiff,
  otherStaffPages: result.otherStaffPages.count,
  gh81Changed: result.gh81.changed.length,
  modal: result.modal,
}, null, 2));
