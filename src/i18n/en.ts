// Teksty strony po angielsku - wzór dla pozostałych języków (typ `Texts`).
// Nowy tekst: klucz tutaj i tłumaczenie we wszystkich plikach `src/i18n/<język>.ts`.

const en = {
  ui: {
    features: 'Features', premium: 'Premium', help: 'Help', contact: 'Contact', privacy: 'Privacy',
    theme: 'Change theme', menu: 'Navigation', skip: 'Skip to content', language: 'Language',
    tagline: 'A bike computer on your phone. No account.',
    legal: 'Strava, Google Play, Health Connect, Apple Health, App Store, intervals.icu, Ride with GPS and Spotify are trademarks of their respective owners. Rydee is not affiliated with them.',
    credits: 'Map data © OpenStreetMap. Maps: OpenFreeMap, Stadia Maps, OpenMapTiles. Routing: openrouteservice.org / HeiGIT. Search: Photon. Weather: MET Norway.',
    fill: 'to be completed',
  },
  home: {
    title: 'Rydee: a bike computer on your phone',
    desc: 'Rydee turns your phone into a bike computer: configurable tiles and widgets, Bluetooth sensors, radar, navigation and ride analysis. No account.',
    phone: { aria: 'Preview of the Rydee main screen', time: 'Time', dist: 'Distance', hr: 'Heart rate', cad: 'Cadence', ele: 'Elevation', grade: 'Gradient', map: 'Map', hrw: 'Heart rate', climb: 'Climb', rides: 'Rides', moving: 'Moving time', local: 'Saved only on this phone' },
    soon: 'Coming soon to Google Play and the App Store',
    scroll: 'Scroll to ride',
    chapters: [
      { k: 'km 0, start', h: 'Phone on the bars. Everything else your way.', p: 'Rydee is a GPS bike computer you shape around your riding. No account and no ads.' },
      { k: 'Screen', h: 'Only what you actually look at', p: 'Pick your tiles, widgets and speed gauge. Drag to change the proportions. Five styles, light and dark.' },
      { k: 'Sensors', h: 'Heart rate, cadence, power and what’s coming from behind', p: 'Rydee connects to Bluetooth sensors. A bike radar shows vehicles on a bar at the screen edge and warns you with a sound.' },
      { k: 'Climb', h: 'Climbs count themselves', p: 'Gradient, VAM and profile. On a climb you know, see how you compare to your own record.' },
      { k: 'Descent, above 50 km/h', h: 'Then, hyperspeed', p: 'At high speed the screen moves with you. There is no reason for this effect except that it’s fun.' },
      { k: 'After the ride', h: 'The whole ride in one place', p: 'Map, charts, zones and best efforts. Drag along a chart and the spot appears on the map. GPX and FIT export, Strava, Health Connect.' },
      { k: 'Finish', h: 'Your rides are your business', p: 'Rides stay on your phone and in its backup. There is no Rydee account. We spell out exactly what leaves the device, and when.' },
    ],
    fEyebrow: 'Features', fTitle: 'Built for riding, not for looking at',
    features: [
      ['Crash-proof recording', 'Your ride is written to a file as you go. Auto-pause stops recording when you stop and resumes when you ride on.'],
      ['Cycling navigation', 'Search, pick a point on the map, or follow a GPX route. Turn guidance and sound alerts.'],
      ['Wind relative to you', 'Red for headwind, green for tailwind. Forecast by MET Norway.'],
      ['Laps', 'Every 1, 2, 3, 5 or 10 km, with the difference to the previous one.'],
      ['Strava', 'Upload rides with full data and see starred segments.'],
      ['Music on screen', 'Title and cover from another app. Controls in Premium. Android.'],
      ['Multiple bikes', 'A profile for each bike and its route type.'],
    ],
    pEyebrow: 'Editions', pTitle: 'Start with Free. Go Premium when you want.', pLead: 'Get Premium as a subscription or as a one-time purchase. We’ll announce prices before launch.',
    planFree: ['Computer, recording and auto-pause', 'Rides, GPX export and import', 'Strava', 'Heart rate and cadence', 'Terrain, Heart rate and Laps widgets'],
    planPremium: ['Navigation and GPX routes', 'Bike radar and power meter', 'Climbs and records', 'Zones and full analysis', 'All styles and gauges'],
    waysT: 'Choose how you prefer', ways: [['Subscription', 'Recurring payment. Cancel anytime in Google Play or the App Store.'], ['One-time purchase', 'Pay once and Premium stays with you.']], waysNote: 'Both options unlock the same features.', compare: 'Compare editions',
    free: 'Free', premium: 'Premium', yes: 'yes', no: 'no',
    rows: [
      'Computer, recording, auto-pause', 'Ride list, GPX export, GPX import', 'Strava: uploads and starred segments', 'Heart rate and cadence sensors', 'Terrain, Heart rate and Laps widgets',
      'App styles', 'Speed gauges', 'Tile pages', 'Bikes', 'Music', 'Map',
      'Navigation and GPX routes', 'Power meter, Power widget', 'Bike radar', 'Climbs and records', 'Heart rate and power zones, full analysis', 'Wind relative to your direction', 'FIT export, Health Connect',
    ],
    many: 'many', musicFree: 'preview', musicPremium: 'controls',
    helpT: 'Something unclear?', helpP: 'Help answers the most common questions. The same content is in the app, even without internet.', helpB: 'Open help', privB: 'Privacy policy',
  },
  studio: {
    eyebrow: 'Try it', title: 'Your screen, your rules', lead: 'Change the style, gauge and mode, then hit the road.',
    style: 'Style', styles: { alrydee: 'Alrydee', minimal: 'Minimal', material: 'Material', ios: 'Cupertino', sport: 'Sport' },
    mode: 'Mode', dark: 'Night', light: 'Day',
    def: 'Default',
    gauge: 'Speed gauge', gauges: { segments: 'Bar', arc: 'Arc', dial: 'Dial', ring: 'Ring', scale: 'Scale', history: 'History' },
    aria: 'Preview of the Rydee main screen', free: 'This setup: Free edition', premium: 'This setup requires Premium', see: 'See editions',
    go: 'Ride', pause: 'Pause', road: 'Position on the route, drag to change speed', km: 'km', ele: 'm elevation', grade: 'gradient',
    time: 'Time', dist: 'Distance', hr: 'Heart rate', cad: 'Cadence',
  },
  help: {
    title: 'Help: Rydee', desc: 'Answers about the Rydee app: recording, widgets, sensors, navigation and your data.', h: 'How can we help?',
    ph: 'Search, e.g. auto-pause, radar, GPX', label: 'Search help', all: 'All',
    hint: (n: number) => `${n} answers. Press / to search.`, found: (n: number) => `Found: ${n}`,
    none: 'Nothing found.', contactT: 'Question not here?', contactP: 'Write to us and we’ll add an answer.',
    bannerT: 'Got a question or a suggestion?', bannerP: 'Questions, suggestions, feedback - we reply by email.', write: 'Write to us', android: 'Android',
  },
  contact: {
    title: 'Contact: Rydee', desc: 'Write to the makers of the Rydee app: questions, suggestions and feedback.',
    h: 'Got a question or a suggestion?', lead: 'Questions, suggestions, feedback - we reply by email.',
    cat: 'Type of message', cats: { problem: 'Problem', suggestion: 'Suggestion', question: 'Question', opinion: 'Opinion', other: 'Other' },
    subj: 'Subject', subjPh: 'In a few words, what is it about',
    msg: 'Message', ph: 'Your message', email: 'Email for reply', emailHint: 'Optional - without an address we cannot reply.',
    info: 'Along with the message we send the website language.', privacy: 'Privacy policy', send: 'Send', sending: 'Sending…',
    errCat: 'Choose the type of message.', errSubj: 'The subject is too short.', errMsg: 'The message is too short.', errEmail: 'Invalid email address.',
    errNet: 'No connection to the server. Please try again.', errLimit: 'Too many messages. Please try again in an hour.', errOther: 'The message could not be sent.',
    thanks: 'Thank you!', sent: 'Message sent. If you gave an address, we will reply by email.', again: 'Write another',
    direct: 'You can also write directly:',
  },
};

export type Texts = typeof en;
export default en;
