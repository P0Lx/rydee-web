// Kopiuje pomoc i licencje natywne do aplikacji (wbudowana kopia, działa offline).
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { native } from './native.mjs';

const assets = resolve(import.meta.dirname, '../../rydee-app/assets');
const web = resolve(import.meta.dirname, '../content/help');
mkdirSync(resolve(assets, 'help'), { recursive: true });
mkdirSync(resolve(assets, 'licenses'), { recursive: true });
for (const lang of ['pl', 'en', 'de', 'fr', 'es', 'it', 'nl']) copyFileSync(resolve(web, `${lang}.json`), resolve(assets, `help/${lang}.json`));
writeFileSync(resolve(assets, 'licenses/native.json'), JSON.stringify(native.map(({ name, text }) => ({ name, text }))));
console.log('OK');
