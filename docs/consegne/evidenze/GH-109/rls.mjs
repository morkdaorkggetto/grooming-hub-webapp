import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const startedAt = new Date().toISOString();
const run = spawnSync(process.execPath, ['scripts/rls-tests/run.mjs'], { cwd: new URL('../../../../', import.meta.url), encoding: 'utf8', env: { ...process.env, GH_RLS_EXPECTED_PROJECT_REF: 'qttpinkslhenxrsbhhhg', GH_RLS_EXPECTED_PET_COUNT: '7', GH_RLS_SUITE_LABEL: 'GH-109 - suite RLS demo' } });
const result = { startedAt, endedAt: new Date().toISOString(), exitCode: run.status, stdout: run.stdout, stderr: run.stderr };
fs.writeFileSync(new URL('./rls-suite.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(run.stdout); console.error(run.stderr); process.exitCode = run.status ?? 1;
