# Rydee: strona internetowa

Statyczna strona (Astro): strona główna, pomoc, polityka prywatności, licencje. Języki PL i EN.

```bash
npm install
npm run dev
npm run build
```

- `content/help/<język>.json` - jedyne źródło pomocy. Strona buduje z `pl` i `en` strony `/pomoc` i `/en/help`, a aplikacja pobiera `/help/<język>.json` (także `de`, `fr`, `es`, `it`, `nl` - tylko dla aplikacji). Przy zmianie pytania zmień je we wszystkich językach; `id`, `icon`, `tint`, `tags`, `platforms` i parametry `figure` są takie same jak w `en` (`pl` ma własne `id`), a liczba `labels` - taka sama.
- Ilustracje w pomocy: pole `figure` pytania (`type`, `alt`, `labels` i parametry typu). Rysuje je `src/scripts/figures.ts`, a w aplikacji `lib/help_figures.dart` - oba w polu 320 × 180, nowy typ trzeba dodać w obu miejscach. Typy: `screen` (`focus`: `all` / `speed` / `tiles` / `handle` / `radar`, `gesture`: `swipe` / `drag` / `hold`), `steps`, `record` (`stage`: `start` / `end`), `autopause`, `listrow` (`mode`: `swipe` / `months`), `scrub`, `trail`, `wind`, `laps`, `climb` (`mode`: `widget` / `list` / `terrain`), `zones` (`kind`: `hr` / `power`), `map` (`mode`: `controls` / `guidance`), `editions`, `local`. Nieznany typ jest pomijany.
- `npm run sync:app` - kopiuje pomoc i licencje natywne do `../rydee-app/assets` (kopia wbudowana). Uruchom po każdej zmianie pomocy i przed wydaniem aplikacji.
- `npm run licenses` - odświeża `src/data/licenses.json` z zależności aplikacji. Biblioteki natywne dopisuje się ręcznie w `scripts/native.mjs`.
- `src/site.ts` - dane firmy i kontakt (`null` jest widoczne na stronie jako pole do uzupełnienia).
- Kontakt (`/kontakt`, `/en/contact`, `src/views/Contact.astro`): ten sam formularz co „Napisz do nas” w aplikacji. Wysyła `POST {apiUrl}/feedback` z `platform: "web"` na serwer `rydee-cloud` (kontrakt i CORS - README tamtego repozytorium); `apiUrl` w `src/site.ts`, inny adres przy budowaniu przez `PUBLIC_RYDEE_API_URL`. Adres serwera musi być w `connect-src` nagłówka CSP w `firebase.json`. Ukryte pole `website` to pułapka na boty. Baner z odnośnikiem na górze `/pomoc`.
- `src/data/privacy.ts` - polityka prywatności. Przy zmianie przepływu danych w aplikacji zaktualizuj także mapę danych i datę.
- Domena: `SITE_URL` przy budowaniu (domyślnie `https://rydee.app`, także w `public/robots.txt`).
- Publikacja: Firebase Hosting, projekt `rydee-cloud`, strona hostingu `rydee-web` (`"site"` w `firebase.json`, folder `dist`). Domyślna strona projektu (`rydee-cloud.web.app`) należy do repozytorium `rydee-cloud` i serwuje `config.json` aplikacji - publikacja bez `"site"` by ją nadpisała.
  ```bash
  npm run build
  firebase hosting:channel:deploy preview --project rydee-cloud   # podgląd na 7 dni
  firebase deploy --only hosting --project rydee-cloud            # rydee-web.web.app
  ```

Bez cookies, analityki i zewnętrznych zasobów. Jeśli to się zmieni, trzeba zmienić politykę prywatności.
