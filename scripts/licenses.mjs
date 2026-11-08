// Generuje src/data/licenses.json z zależności aplikacji uruchomieniowych
// (bez dev_dependencies). Wymaga `flutter pub get` w ../rydee-app.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { native, fonts } from './native.mjs';

const app = resolve(import.meta.dirname, '../../rydee-app');
const deps = JSON.parse(execSync('flutter pub deps --json', { cwd: app, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'], shell: true }).replace(/^[^{]*/, ''));
const byName = new Map(deps.packages.map((p) => [p.name, p]));
const root = deps.packages.find((p) => p.kind === 'root');
const seen = new Set();
const visit = (name) => {
  if (seen.has(name) || !byName.has(name)) return;
  seen.add(name);
  byName.get(name).dependencies.forEach(visit);
};
const devRoots = new Set(root.directDependencies?.filter((d) => byName.get(d)?.kind === 'dev') ?? []);
(root.dependencies ?? []).filter((d) => !devRoots.has(d) && byName.get(d)?.kind !== 'dev').forEach(visit);
seen.delete(root.name);

const config = JSON.parse(readFileSync(join(app, '.dart_tool/package_config.json'), 'utf8'));
const pathOf = new Map(config.packages.map((p) => [p.name, p.rootUri.startsWith('file:') ? fileURLToPath(p.rootUri) : resolve(app, '.dart_tool', p.rootUri)]));

const kind = (t) =>
  /Permission is hereby granted, free of charge/.test(t) ? 'MIT'
  : /Redistribution and use in source and binary/.test(t) ? 'BSD'
  : /Apache License/.test(t) ? 'Apache-2.0'
  : /Mozilla Public License/.test(t) ? 'MPL-2.0'
  : 'Other';

const MAX = 30000;
const packages = [...seen].sort().flatMap((name) => {
  const dir = pathOf.get(name);
  if (!dir) return [];
  const file = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license'].map((f) => join(dir, f)).find(existsSync);
  const text = file ? readFileSync(file, 'utf8').trim() : '';
  return [{ name, version: byName.get(name).version, license: text ? kind(text) : 'Flutter SDK', text: text.length > MAX ? null : text }];
});

const out = resolve(import.meta.dirname, '../src/data/licenses.json');
writeFileSync(out, JSON.stringify({ packages, native, fonts }, null, 0));
const count = {};
packages.forEach((p) => { count[p.license] = (count[p.license] ?? 0) + 1; });
console.log(packages.length, count);
