// Polityka prywatności: `src/data/privacy/<język>.ts`. Wiążąca jest wersja polska
// (`pl.ts`), pozostałe to tłumaczenia (pole `note`). Fakty według kodu aplikacji
// i `rydee-cloud` (2026-11-17: lokalizacja w tle przy nagrywaniu, Apple Zdrowie,
// intervals.icu, Ride with GPS, wysyłka automatyczna, strefy Stravy, barometr).
// Przy zmianie przepływu danych zmień wszystkie języki i datę wejścia w życie.

export interface PrivacySection { id: string; title: string; body: string; }
export interface Privacy {
  meta: string; desc: string; h: string; lead: string; updated: string; legalTitle: string;
  /** Tłumaczenie: w razie rozbieżności wiąże wersja polska. */
  note?: string;
  /** Nazwy pól danych firmy, gdy jeszcze nie są uzupełnione (`{{name}}` itd.). */
  fields: { name: string; address: string; taxId: string; email: string };
  sections: PrivacySection[];
}
