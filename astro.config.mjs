import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Adres produkcyjny: SITE_URL przy budowaniu (domena do potwierdzenia).
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://rydee.app',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
});
