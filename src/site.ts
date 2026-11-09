// Dane firmy i kontakt - do uzupełnienia przed publikacją. Wartość `null`
// jest widoczna na stronie jako wyróżnione pole do uzupełnienia.
export const company = {
  name: null as string | null,
  address: null as string | null,
  taxId: null as string | null,
  email: null as string | null,
};

export type Lang = 'pl' | 'en';

export const routes = {
  home: { pl: '/', en: '/en' },
  help: { pl: '/pomoc', en: '/en/help' },
  privacy: { pl: '/prywatnosc', en: '/en/privacy' },
  licenses: { pl: '/licencje', en: '/en/licenses' },
} as const;
export type Route = keyof typeof routes;

export const ui = {
  pl: {
    features: 'Funkcje', premium: 'Premium', help: 'Pomoc', privacy: 'Prywatność', licenses: 'Licencje',
    theme: 'Zmień motyw', menu: 'Nawigacja', skip: 'Przejdź do treści', other: 'English', otherShort: 'EN',
    tagline: 'Licznik rowerowy na telefon. Bez konta.',
    legal: 'Strava, Google Play, Health Connect, App Store i Spotify są znakami towarowymi ich właścicieli. Rydee nie jest z nimi powiązane.',
    credits: 'Dane map © OpenStreetMap. Mapy: OpenFreeMap, Stadia Maps, OpenMapTiles. Trasy: openrouteservice.org / HeiGIT. Wyszukiwanie: Photon. Pogoda: MET Norway.',
    fill: 'do uzupełnienia',
  },
  en: {
    features: 'Features', premium: 'Premium', help: 'Help', privacy: 'Privacy', licenses: 'Licenses',
    theme: 'Change theme', menu: 'Navigation', skip: 'Skip to content', other: 'Polski', otherShort: 'PL',
    tagline: 'A bike computer on your phone. No account.',
    legal: 'Strava, Google Play, Health Connect, App Store and Spotify are trademarks of their respective owners. Rydee is not affiliated with them.',
    credits: 'Map data © OpenStreetMap. Maps: OpenFreeMap, Stadia Maps, OpenMapTiles. Routing: openrouteservice.org / HeiGIT. Search: Photon. Weather: MET Norway.',
    fill: 'to be completed',
  },
} as const;
