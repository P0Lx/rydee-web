// Pomoc dla aplikacji: /help/<język>.json. pl i en to samo źródło co strona;
// de, fr, es, it, nl tylko dla aplikacji (strona jest po polsku i angielsku).
import type { APIRoute } from 'astro';
import pl from '../../../content/help/pl.json';
import en from '../../../content/help/en.json';
import de from '../../../content/help/de.json';
import fr from '../../../content/help/fr.json';
import es from '../../../content/help/es.json';
import it from '../../../content/help/it.json';
import nl from '../../../content/help/nl.json';

const help = { pl, en, de, fr, es, it, nl };

export function getStaticPaths() {
  return Object.keys(help).map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(help[params.lang as keyof typeof help]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
