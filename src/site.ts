// Dane firmy i kontakt - do uzupełnienia przed publikacją. Wartość `null`
// jest widoczna na stronie jako wyróżnione pole do uzupełnienia.
export const company = {
  name: null as string | null,
  address: null as string | null,
  taxId: null as string | null,
  email: 'support@rydee.app' as string | null,
};

/** Języki strony; pierwszy (EN) jest domyślny - bez przedrostka w adresie. */
export const langs = ['en', 'pl'] as const;
export type Lang = (typeof langs)[number];
export const defaultLang: Lang = 'en';
/** Języki z przedrostkiem w adresie (`/pl/...`). */
export const prefixedLangs = langs.filter((l) => l !== defaultLang);

/** Nazwa języka w tym języku (lista w przełączniku). */
export const langNames: Record<Lang, string> = { en: 'English', pl: 'Polski' };

/** Serwer Rydee (`rydee-cloud`) - formularz kontaktowy wysyła `POST {apiUrl}/feedback`.
 * Inny adres (np. emulator) przy budowaniu: `PUBLIC_RYDEE_API_URL`. */
export const apiUrl: string = import.meta.env.PUBLIC_RYDEE_API_URL ?? 'https://europe-central2-rydee-cloud.cloudfunctions.net/api';

/** Ścieżki stron, takie same we wszystkich językach. Stare adresy
 * (`/en/...`, `/pomoc`, `/prywatnosc`...) przekierowuje `firebase.json`. */
const paths = { home: '', help: '/help', privacy: '/privacy', contact: '/contact', licenses: '/licenses' } as const;
export type Route = keyof typeof paths;

/** Adres strony w danym języku: EN bez przedrostka, pozostałe `/<język>`. */
export function href(route: Route, lang: Lang): string {
  return (lang === defaultLang ? '' : `/${lang}`) + paths[route] || '/';
}
