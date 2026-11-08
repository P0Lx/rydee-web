// Pomoc dla aplikacji: /help/pl.json, /help/en.json (to samo źródło co strona).
import type { APIRoute } from 'astro';
import pl from '../../../content/help/pl.json';
import en from '../../../content/help/en.json';

const help = { pl, en };

export function getStaticPaths() {
  return [{ params: { lang: 'pl' } }, { params: { lang: 'en' } }];
}

export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(help[params.lang as keyof typeof help]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
