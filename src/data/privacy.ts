// Treść polityki prywatności. Fakty według kodu aplikacji i `rydee-cloud`
// (2026-11-08); przy zmianie przepływu danych zaktualizować także datę.
import type { Lang } from '../site';

export interface PrivacySection { id: string; title: string; body: string; }
export interface Privacy {
  meta: string; desc: string; h: string; lead: string; updated: string; mapTitle: string; legalTitle: string;
  head: [string, string, string]; map: [string, string, string][];
  sections: PrivacySection[];
}

const pl: Privacy = {
  meta: 'Polityka prywatności: Rydee',
  desc: 'Jakie dane przetwarza aplikacja Rydee, gdzie trafiają i jakie masz prawa.',
  h: 'Prywatność bez drobnego druku',
  lead: 'Rydee działa bez konta. Twoje przejazdy nie trafiają na serwery Rydee. Część funkcji wymaga jednak internetu, więc poniżej opisujemy dokładnie, co i komu jest wtedy przekazywane.',
  updated: 'Obowiązuje od 8 listopada 2026 r.',
  mapTitle: 'Mapa danych',
  legalTitle: 'Pełna treść',
  head: ['Funkcja', 'Co opuszcza telefon', 'Dokąd'],
  map: [
    ['Przejazdy, profil, ustawienia', 'Nic, poza systemową kopią zapasową, jeśli jest włączona', 'Twoje konto Google lub Apple'],
    ['Start aplikacji', 'Adres IP, zapytanie o wymaganą wersję', 'Firebase Hosting (Google)'],
    ['Pomoc w aplikacji', 'Adres IP, zapytanie o aktualną treść', 'Firebase Hosting (Google)'],
    ['Mapa', 'Adres IP, oglądany obszar mapy', 'OpenFreeMap albo Stadia Maps'],
    ['Pogoda', 'Adres IP, pozycja zaokrąglona do około 1 km', 'MET Norway'],
    ['Szukanie celu', 'Adres IP, wpisany tekst, pozycja', 'Photon (komoot)'],
    ['Wyznaczanie trasy', 'Adres IP, start, punkty pośrednie, cel', 'Serwer Rydee, a dalej HeiGIT'],
    ['Strava, jeśli połączysz', 'Tokeny, przejazdy, które wyślesz', 'Serwer Rydee (tokeny), Strava'],
    ['Health Connect, jeśli połączysz', 'Tylko zapis na tym telefonie', 'Health Connect na urządzeniu'],
    ['Czujniki Bluetooth', 'Nic, odczyt odbywa się na telefonie', 'Nikt'],
  ],
  sections: [
    { id: 'administrator', title: 'Administrator danych', body: `<p>Administratorem danych jest {{name}}, {{address}}, NIP {{taxId}}. Kontakt w sprawach prywatności: {{email}}.</p>` },
    { id: 'na-telefonie', title: 'Dane na Twoim telefonie', body: `<p>Aplikacja zapisuje na urządzeniu przejazdy (pozycja GPS, czas, prędkość, wysokość oraz tętno, kadencja i moc z czujników), profil (na przykład wiek, płeć, waga, tętno maksymalne, FTP), rowery, sparowane czujniki, ulubione miejsca i ustawienia. Nie mamy do tych danych dostępu.</p><p>Na Androidzie przejazdy i ustawienia mogą trafić do systemowej kopii zapasowej Google i do przenoszenia danych na nowy telefon, jeśli masz to włączone. Na iOS analogicznie działa kopia iCloud. Tokeny Stravy są z kopii wykluczone. Kopią zarządzasz w ustawieniach telefonu.</p>` },
    { id: 'lokalizacja', title: 'Lokalizacja', body: `<p>Rydee używa GPS, gdy aplikacja działa na ekranie: do prędkości, mapy, nagrywania, nawigacji i pogody. Aplikacja nie prosi o dostęp do lokalizacji w tle.</p>` },
    { id: 'uslugi', title: 'Usługi zewnętrzne', body: `<ul><li><b>Mapy:</b> OpenFreeMap (wersja darmowa) lub Stadia Maps (Premium) dostarczają obraz mapy dla oglądanego obszaru.</li><li><b>Pogoda:</b> MET Norway otrzymuje współrzędne zaokrąglone do dwóch miejsc po przecinku.</li><li><b>Wyszukiwanie:</b> publiczny serwis Photon prowadzony przez komoot otrzymuje wpisany tekst i pozycję, aby pokazać najbliższe wyniki, a przy wyborze punktu na mapie jego współrzędne.</li><li><b>Trasy:</b> punkty trasy przechodzą przez serwer Rydee do OpenRouteService (HeiGIT). Serwer nie zapisuje współrzędnych ani tras, a w logach ma tylko dane techniczne, takie jak profil roweru, liczba punktów, status i czas.</li></ul><p>Te podmioty przetwarzają adres IP i przekazane dane na własnych zasadach, opisanych w ich politykach prywatności.</p>` },
    { id: 'strava', title: 'Strava', body: `<p>Połączenie ze Stravą jest dobrowolne i przebiega przez OAuth. Serwer Rydee pośredniczy tylko przy wymianie, odświeżaniu i unieważnianiu tokenów, ponieważ przechowuje klucz aplikacji. Tokenów ani treści odpowiedzi nie zapisuje i nie loguje.</p><p>Tokeny są przechowywane na telefonie w bezpiecznym magazynie systemu. Przejazdy są wysyłane bezpośrednio do Stravy, gdy o to poprosisz. Ulubione segmenty są przechowywane w pamięci podręcznej najwyżej 7 dni. Rozłączenie konta unieważnia tokeny i usuwa te dane z telefonu. Przetwarzanie danych po stronie Stravy opisuje polityka prywatności Stravy.</p>` },
    { id: 'health-connect', title: 'Health Connect', body: `<p>Za Twoją wyraźną zgodą Rydee zapisuje przejazdy w Health Connect na Androidzie jako treningi rowerowe: czas, pauzy, trasę, dystans, kalorie, przewyższenie, tętno, prędkość, kadencję i moc. Zapisywane są tylko typy danych, na które się zgodzisz.</p><p><b>Rydee niczego z Health Connect nie odczytuje.</b> Dane te nie są przesyłane na serwery Rydee ani udostępniane innym podmiotom, a Rydee nie używa ich do reklam. Zgody zmienisz lub cofniesz w ustawieniach Health Connect. Usunięcie przejazdu w Rydee nie usuwa go z Health Connect.</p>` },
    { id: 'uprawnienia', title: 'Pozostałe uprawnienia', body: `<ul><li><b>Bluetooth:</b> wyszukiwanie czujników i odczyt ich danych.</li><li><b>Dostęp do powiadomień (Android, opcjonalnie):</b> widget Muzyka pokazuje tytuł, wykonawcę i okładkę aktualnie odtwarzanego utworu. Rydee nie czyta treści powiadomień ani wiadomości.</li><li><b>Kamera USB (Android, opcjonalnie):</b> podgląd na żywo z podłączonej kamery. Obraz nie jest wysyłany. Wbudowane aparaty telefonu nie są używane.</li></ul>` },
    { id: 'premium', title: 'Zakup Premium', body: `<p>Zakup obsługują Google Play lub App Store. Nie otrzymujemy danych karty. Sklep przekazuje aplikacji jedynie informację o zakupie.</p>` },
    { id: 'podstawy', title: 'Cele i podstawy prawne', body: `<ul><li>Świadczenie funkcji, z których korzystasz: art. 6 ust. 1 lit. b RODO.</li><li>Bezpieczeństwo i działanie serwera (adres IP, logi techniczne): prawnie uzasadniony interes, art. 6 ust. 1 lit. f RODO.</li><li>Zapis danych o zdrowiu w Health Connect: wyraźna zgoda, art. 6 ust. 1 lit. a i art. 9 ust. 2 lit. a RODO. Zgodę możesz w każdej chwili cofnąć.</li></ul><p>Nie stosujemy profilowania ani reklam.</p>` },
    { id: 'odbiorcy', title: 'Odbiorcy i przekazywanie poza EOG', body: `<p>Naszym podmiotem przetwarzającym jest Google (Firebase, region Warszawa dla funkcji serwera). Strava oraz niektórzy dostawcy mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym, w tym w USA, na podstawie decyzji stwierdzających odpowiedni stopień ochrony lub standardowych klauzul umownych.</p>` },
    { id: 'okresy', title: 'Jak długo przechowujemy dane', body: `<p>Dane na telefonie są tam, dopóki ich nie usuniesz lub nie odinstalujesz aplikacji. Logi techniczne serwera i hostingu są przechowywane zgodnie z ustawieniami dostawcy, standardowo do 30 dni.</p>` },
    { id: 'prawa', title: 'Twoje prawa', body: `<p>Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, sprzeciwu oraz cofnięcia zgody. Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).</p><p>Ponieważ nie prowadzimy kont, zwykle nie jesteśmy w stanie powiązać logów technicznych z konkretną osobą. Przejazdy usuniesz w aplikacji, a eksport GPX daje Ci ich kopię.</p>` },
    { id: 'strona', title: 'Ta strona', body: `<p>Strona nie używa plików cookies ani analityki i nie ładuje zasobów z zewnętrznych serwisów. Wybrany motyw jest zapamiętywany wyłącznie w Twojej przeglądarce. Hosting przetwarza adres IP w celu dostarczenia strony.</p>` },
    { id: 'dzieci', title: 'Dzieci', body: `<p>Aplikacja nie jest skierowana do dzieci poniżej 16 lat.</p>` },
    { id: 'zmiany', title: 'Zmiany', body: `<p>O istotnych zmianach poinformujemy w tym miejscu i, jeśli będzie to potrzebne, w aplikacji. Data na górze wskazuje ostatnią aktualizację.</p>` },
  ],
};

const en: Privacy = {
  meta: 'Privacy policy: Rydee',
  desc: 'What data the Rydee app processes, where it goes and what rights you have.',
  h: 'Privacy without the small print',
  lead: 'Rydee works without an account. Your rides don’t go to Rydee servers. Some features do need the internet, so here is exactly what is shared, and with whom.',
  updated: 'Effective 8 November 2026.',
  mapTitle: 'Data map',
  legalTitle: 'Full text',
  head: ['Feature', 'What leaves the phone', 'Where it goes'],
  map: [
    ['Rides, profile, settings', 'Nothing, except system backup if enabled', 'Your Google or Apple account'],
    ['App start', 'IP address, request for the required version', 'Firebase Hosting (Google)'],
    ['In-app help', 'IP address, request for current content', 'Firebase Hosting (Google)'],
    ['Map', 'IP address, the map area you view', 'OpenFreeMap or Stadia Maps'],
    ['Weather', 'IP address, position rounded to about 1 km', 'MET Norway'],
    ['Destination search', 'IP address, the text you type, position', 'Photon (komoot)'],
    ['Routing', 'IP address, start, waypoints, destination', 'Rydee server, then HeiGIT'],
    ['Strava, if you connect', 'Tokens, rides you upload', 'Rydee server (tokens), Strava'],
    ['Health Connect, if you connect', 'Write-only, on this phone', 'Health Connect on the device'],
    ['Bluetooth sensors', 'Nothing, read on the phone', 'No one'],
  ],
  sections: [
    { id: 'controller', title: 'Data controller', body: `<p>The data controller is {{name}}, {{address}}, tax ID {{taxId}}. Privacy contact: {{email}}.</p>` },
    { id: 'on-your-phone', title: 'Data on your phone', body: `<p>The app stores on your device your rides (GPS position, time, speed, elevation, plus heart rate, cadence and power from sensors), your profile (such as age, sex, weight, maximum heart rate and FTP), bikes, paired sensors, favorite places and settings. We have no access to this data.</p><p>On Android, rides and settings may be included in Google system backup and device-to-device transfer, if enabled. On iOS, iCloud backup works in a similar way. Strava tokens are excluded from backups. You control backups in your phone settings.</p>` },
    { id: 'location', title: 'Location', body: `<p>Rydee uses GPS while the app is on screen: for speed, the map, recording, navigation and weather. The app does not request background location access.</p>` },
    { id: 'services', title: 'External services', body: `<ul><li><b>Maps:</b> OpenFreeMap (free edition) or Stadia Maps (Premium) provide map imagery for the area you view.</li><li><b>Weather:</b> MET Norway receives coordinates rounded to two decimal places.</li><li><b>Search:</b> the public Photon service run by komoot receives the text you type and your position to show nearby results, and the coordinates of a point when you pick one on the map.</li><li><b>Routing:</b> route points pass through the Rydee server to OpenRouteService (HeiGIT). The server does not store coordinates or routes; its logs contain only technical data such as bike profile, number of points, status and time.</li></ul><p>These providers process your IP address and the data they receive under their own privacy policies.</p>` },
    { id: 'strava', title: 'Strava', body: `<p>Connecting Strava is optional and uses OAuth. The Rydee server is involved only in exchanging, refreshing and revoking tokens, because it holds the app secret. It neither stores nor logs tokens or response content.</p><p>Tokens are kept on your phone in the system’s secure storage. Rides are sent directly to Strava when you ask. Starred segments are cached for at most 7 days. Disconnecting revokes the tokens and deletes this data from your phone. Strava’s own processing is described in its privacy policy.</p>` },
    { id: 'health-connect', title: 'Health Connect', body: `<p>With your explicit permission, Rydee writes rides to Health Connect on Android as cycling workouts: time, pauses, route, distance, calories, elevation gain, heart rate, speed, cadence and power. Only the data types you allow are written.</p><p><b>Rydee reads nothing from Health Connect.</b> This data is not sent to Rydee servers or shared with third parties, and Rydee does not use it for advertising. You can change or withdraw permissions in Health Connect settings. Deleting a ride in Rydee does not delete it from Health Connect.</p>` },
    { id: 'permissions', title: 'Other permissions', body: `<ul><li><b>Bluetooth:</b> finding sensors and reading their data.</li><li><b>Notification access (Android, optional):</b> the Music widget shows the title, artist and cover of what’s playing. Rydee does not read the content of notifications or messages.</li><li><b>USB camera (Android, optional):</b> live preview from a connected camera. The image is not uploaded. The phone’s built-in cameras are not used.</li></ul>` },
    { id: 'premium', title: 'Premium purchase', body: `<p>Purchases are handled by Google Play or the App Store. We never receive your card details. The store only tells the app that a purchase was made.</p>` },
    { id: 'legal-bases', title: 'Purposes and legal bases', body: `<ul><li>Providing the features you use: Art. 6(1)(b) GDPR.</li><li>Server security and operation (IP address, technical logs): legitimate interests, Art. 6(1)(f) GDPR.</li><li>Writing health data to Health Connect: explicit consent, Art. 6(1)(a) and Art. 9(2)(a) GDPR. You can withdraw consent at any time.</li></ul><p>We do not use profiling or advertising.</p>` },
    { id: 'recipients', title: 'Recipients and transfers outside the EEA', body: `<p>Our processor is Google (Firebase, Warsaw region for server functions). Strava and some providers may process data outside the European Economic Area, including in the USA, based on adequacy decisions or standard contractual clauses.</p>` },
    { id: 'retention', title: 'How long we keep data', body: `<p>Data on your phone stays there until you delete it or uninstall the app. Technical server and hosting logs are kept according to the provider’s settings, by default for up to 30 days.</p>` },
    { id: 'rights', title: 'Your rights', body: `<p>You have the right to access, rectify and erase your data, restrict processing, data portability, to object and to withdraw consent. You can also lodge a complaint with a supervisory authority; in Poland this is the President of the Personal Data Protection Office (ul. Stawki 2, 00-193 Warsaw).</p><p>Because we don’t run accounts, we usually cannot link technical logs to a specific person. You can delete rides in the app, and GPX export gives you a copy of them.</p>` },
    { id: 'website', title: 'This website', body: `<p>This website uses no cookies or analytics and loads no resources from external services. Your theme choice is remembered only in your browser. The hosting provider processes your IP address to deliver the site.</p>` },
    { id: 'children', title: 'Children', body: `<p>The app is not directed at children under 16.</p>` },
    { id: 'changes', title: 'Changes', body: `<p>We will announce significant changes here and, where necessary, in the app. The date at the top shows the latest update.</p>` },
  ],
};

export const privacy: Record<Lang, Privacy> = { pl, en };
