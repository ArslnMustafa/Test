// Anfangsdaten ("Datenbank"-Startwerte) für die Darna App.
// Werden beim ersten Start in den lokalen Speicher (AsyncStorage) geschrieben
// und danach vom Nutzer über die App bearbeitet.

export const SEED = {
  // Meine Immobilien
  properties: [
    { id: 'p1', name: 'Villa Dummar', city: 'Damaskus', mode: 'long', valueEur: 245000, yearlyRentEur: 14500, monthlyRentEur: 1850, airbnbEstEur: 2700 },
    { id: 'p2', name: 'Apt. Al-Malki', city: 'Damaskus', mode: 'vacant', valueEur: 120000, yearlyRentEur: 0, monthlyRentEur: 0, airbnbEstEur: 800 },
    { id: 'p3', name: 'Apt. Al-Shahba', city: 'Aleppo', mode: 'long', valueEur: 95000, yearlyRentEur: 6000, monthlyRentEur: 500, airbnbEstEur: 950 },
    { id: 'p4', name: 'Studio Homs-Zentrum', city: 'Homs', mode: 'airbnb', valueEur: 78000, yearlyRentEur: 9600, monthlyRentEur: 800, airbnbEstEur: 800 },
    { id: 'p5', name: 'Penthouse Latakia', city: 'Latakia', mode: 'long', valueEur: 210000, yearlyRentEur: 13200, monthlyRentEur: 1100, airbnbEstEur: 1900 },
  ],

  // Mieter / Miet-Status (ownerId = zugehöriger Eigentümer)
  tenants: [
    { id: 't1', name: 'Ahmad K.', ownerId: 'u2', propertyName: 'Villa Dummar', status: 'paid', overdueDays: 0, overdueEur: 0, relative: 'Onkel Samir (+963 9…)', log: [] },
    { id: 't2', name: 'Omar Said', ownerId: 'u2', propertyName: 'Apt. Al-Shahba', city: 'Aleppo', status: 'overdue', overdueDays: 12, overdueEur: 450, relative: 'Onkel Mahmoud (+963 9…)', log: [],
      unit: { block: 'A', floor: 8, no: 30, sqm: 95, rooms: '3+1', since: '01.01.2024', depositEur: 700, persons: 3 } },
    { id: 't3', name: 'Layla H.', ownerId: 'u2', propertyName: 'Penthouse Latakia', status: 'paid', overdueDays: 0, overdueEur: 0, relative: 'Tante Nour (+963 9…)', log: [] },
    { id: 't4', name: 'Khaled M.', ownerId: 'u2', propertyName: 'Studio Homs-Zentrum', status: 'overdue', overdueDays: 5, overdueEur: 400, relative: 'Bruder Ziad (+963 9…)', log: [] },
  ],

  // Handwerker-Marktplatz
  craftsmen: [
    { id: 'c1', name: 'Hassan Bau GmbH', specialty: 'Komplettsanierung', rating: 4.9, category: 'premium', verified: true, city: 'Damaskus', requested: false },
    { id: 'c2', name: 'Al-Nour Elektrik', specialty: 'Elektroinstallation', rating: 4.7, category: 'premium', verified: true, city: 'Aleppo', requested: false },
    { id: 'c3', name: 'Damaskus Fliesen', specialty: 'Fliesen & Bäder', rating: 4.5, category: 'premium', verified: true, city: 'Damaskus', requested: false },
    { id: 'c4', name: 'Abu Yusuf Maler', specialty: 'Malerarbeiten', rating: 4.2, category: 'budget', verified: true, city: 'Homs', requested: false },
    { id: 'c5', name: 'Schnell & Günstig', specialty: 'Kleinreparaturen', rating: 3.9, category: 'budget', verified: true, city: 'Latakia', requested: false },
  ],

  // Immobilienmarkt (zum Verkauf). approved:true = vom Verwalter freigegeben (öffentlich sichtbar)
  listings: [
    { id: 'l1', title: 'Penthouse Al-Malki', city: 'Damaskus', sqm: 180, priceEur: 185000, verifiedTitle: true, status: 'sale', approved: true, imageUrl: 'https://picsum.photos/seed/darna-penthouse/640/360' },
    { id: 'l2', title: 'Villa Dummar', city: 'Damaskus', sqm: 240, priceEur: 320000, verifiedTitle: true, status: 'sale', approved: true, imageUrl: 'https://picsum.photos/seed/darna-villa/640/360' },
    { id: 'l3', title: 'Apartment Aleppo-Neustadt', city: 'Aleppo', sqm: 110, priceEur: 89000, verifiedTitle: false, status: 'sale', approved: true, imageUrl: 'https://picsum.photos/seed/darna-aleppo/640/360' },
    { id: 'l4', title: 'Stadthaus Homs', city: 'Homs', sqm: 160, priceEur: 142000, verifiedTitle: true, status: 'sale', approved: true, imageUrl: 'https://picsum.photos/seed/darna-homs/640/360' },
    { id: 'l5', title: 'Meerblick-Wohnung Latakia', city: 'Latakia', sqm: 95, priceEur: 128000, verifiedTitle: true, status: 'sale', approved: true, imageUrl: 'https://picsum.photos/seed/darna-latakia/640/360' },
  ],

  // Investment-Fonds (exitFeeEur = Gebühr beim Austritt)
  funds: [
    { id: 'f1', title: 'Wohnkomplex Homs', subtitle: 'Suriye Wiederaufbau Fonds #1', goalEur: 500000, raisedEur: 175000, investors: 45, maxInvestors: 100, minMonthlyEur: 500, exitFeeEur: 250, joined: false },
    { id: 'f2', title: 'Gewerbezentrum Aleppo', subtitle: 'Wiederaufbau Fonds #2', goalEur: 750000, raisedEur: 300000, investors: 60, maxInvestors: 150, minMonthlyEur: 750, exitFeeEur: 400, joined: false },
    { id: 'f3', title: 'Solarpark Damaskus-Umland', subtitle: 'Grüne Energie Fonds #3', goalEur: 400000, raisedEur: 90000, investors: 22, maxInvestors: 80, minMonthlyEur: 300, exitFeeEur: 150, joined: false },
  ],

  // Benutzerkonten (Login) – je ein Beispiel pro Rolle.
  // Rollen: tenant (Mieter), owner (Eigentümer), company (Firma),
  //         worker (Handwerker), admin (Administrator/Verwalter)
  users: [
    { id: 'u1', name: 'Mustafa Arslan', email: 'admin@darna.app',  password: 'admin123',  role: 'admin' },
    { id: 'u2', name: 'Khaled Haddad',  email: 'owner@darna.app',  password: 'owner123',  role: 'owner' },
    // tenantId verknüpft den Mieter-Login mit seinem Miet-Datensatz; ownerId = sein Vermieter
    { id: 'u3', name: 'Omar Said',      email: 'tenant@darna.app', password: 'tenant123', role: 'tenant', tenantId: 't2', ownerId: 'u2' },
    // craftsmanId verknüpft Firma/Handwerker-Login mit dem Marktplatz-Profil
    { id: 'u4', name: 'Hassan Bau GmbH', email: 'firma@darna.app', password: 'firma123',  role: 'company', craftsmanId: 'c1' },
    { id: 'u5', name: 'Abu Yusuf',      email: 'worker@darna.app', password: 'worker123', role: 'worker', craftsmanId: 'c4' },
  ],

  // Mängel/Aufträge. Fluss: Mieter meldet -> offen -> Handwerker geben Angebote
  // -> Eigentümer nimmt eines an -> assigned -> done.
  // status: open | assigned | done | cancelled ; source: tenant | admin
  // offers[].status: pending | accepted | rejected
  jobs: [
    {
      id: 'j1', ownerId: 'u2', tenantId: 't2', propertyName: 'Apt. Al-Shahba', city: 'Aleppo',
      title: 'Wasserrohrbruch im Bad', description: 'Undichtes Rohr unter dem Waschbecken, Wasser tropft.',
      category: 'plumbing', source: 'tenant', at: Date.parse('2026-08-22T09:00:00'), status: 'open',
      offers: [
        { id: 'o1', craftsmanId: 'c1', priceEur: 320, note: 'Inkl. Material, 1 Tag', status: 'pending', at: Date.parse('2026-08-23T10:00:00') },
      ],
    },
    {
      id: 'j2', ownerId: 'u2', propertyName: 'Villa Dummar', city: 'Damaskus',
      title: 'Elektrik: Sicherung fällt aus', description: 'Sicherung im Wohnzimmer springt regelmäßig heraus.',
      category: 'electrical', source: 'admin', at: Date.parse('2026-08-18T14:00:00'), status: 'open',
      offers: [],
    },
    {
      id: 'j3', ownerId: 'u2', propertyName: 'Studio Homs-Zentrum', city: 'Homs',
      title: 'Malerarbeiten Wohnzimmer', description: 'Wände streichen, ca. 40 m².',
      category: 'painting', source: 'admin', at: Date.parse('2026-08-05T11:00:00'), status: 'assigned',
      offers: [
        { id: 'o2', craftsmanId: 'c4', priceEur: 900, note: 'Farbe inklusive', status: 'accepted', at: Date.parse('2026-08-06T09:00:00') },
      ],
    },
  ],

  // Offene Schuldenposten je Mieter (Borç Listesi / aktuelle Forderungen)
  // status: this_month | overdue | upcoming ; category: rent | electricity | gas | other
  debtItems: [
    { id: 'd1', tenantId: 't2', status: 'this_month', dueDate: Date.parse('2026-08-31T00:00:00'), info: 'Kaltmiete August 2026', amountEur: 350, surchargeEur: 0, category: 'rent' },
    { id: 'd4', tenantId: 't2', status: 'this_month', dueDate: Date.parse('2026-08-31T00:00:00'), info: 'Stromrechnung August 2026', amountEur: 50, surchargeEur: 0, category: 'electricity' },
    { id: 'd5', tenantId: 't2', status: 'this_month', dueDate: Date.parse('2026-08-31T00:00:00'), info: 'Gasrechnung August 2026',   amountEur: 50, surchargeEur: 0, category: 'gas' },
  ],

  // Geleistete Zahlungen je Mieter (Ödeme Listesi). method: Kasse | Bank | Online
  payments: [
    { id: 'pay0', tenantId: 't2', at: Date.parse('2026-04-05T00:00:00'), method: 'Online', receiptNo: '304551277881020', amountEur: 450, remainingEur: 0 },
    { id: 'pay1', tenantId: 't2', at: Date.parse('2026-03-16T00:00:00'), method: 'Kasse', receiptNo: '269903612200919', amountEur: 850, remainingEur: 435 },
    { id: 'pay2', tenantId: 't2', at: Date.parse('2026-02-20T00:00:00'), method: 'Kasse', receiptNo: '226224575830913', amountEur: 850, remainingEur: 610 },
    { id: 'pay3', tenantId: 't2', at: Date.parse('2026-01-26T00:00:00'), method: 'Kasse', receiptNo: '215035944994416', amountEur: 850, remainingEur: 300 },
    { id: 'pay4', tenantId: 't2', at: Date.parse('2025-12-22T00:00:00'), method: 'Bank',  receiptNo: '193260440748022', amountEur: 600, remainingEur: 0 },
    { id: 'pay5', tenantId: 't2', at: Date.parse('2025-11-04T00:00:00'), method: 'Bank',  receiptNo: '80855271285605',  amountEur: 350, remainingEur: 120 },
    { id: 'pay6', tenantId: 't2', at: Date.parse('2025-09-19T00:00:00'), method: 'Bank',  receiptNo: '72794789863419',  amountEur: 700, remainingEur: 0 },
    { id: 'pay7', tenantId: 't2', at: Date.parse('2025-06-27T00:00:00'), method: 'Bank',  receiptNo: '60547808033527',  amountEur: 250, remainingEur: 250 },
  ],

  // Angaben zur Anlage / Verwaltung (für die Mieter-Startseite)
  siteInfo: {
    name: 'Darna Residenz',
    // Kundenbetreuer (Müşteri temsilcisi)
    rep: { name: 'Fatma Yıldız', email: 'betreuung@darna.app', phone: '+49 152 123 45 67' },
    // Hausverwalter / Bina yöneticisi
    manager: { name: 'Ahmet Demir', phone: '+49 160 765 43 21' },
    // Bankverbindung
    bank: { bankName: 'Sparkasse', holder: 'Darna Bina ve Site Yönetimi', iban: 'DE59 0010 0271 9096 6953 50' },
  },

  // Duyuru & Reklam
  announcements: [
    { id: 'an1', at: Date.parse('2026-08-24T09:00:00'), kind: 'info', title: 'Feuerlöscher-Wartung', text: 'Am 30.08.2026 wird die jährliche Feuerlöscher-Wartung durchgeführt. Bitte ermöglichen Sie den Zugang.' },
    { id: 'an2', at: Date.parse('2026-08-10T12:00:00'), kind: 'warning', title: 'Wasserabstellung', text: 'Am 15.08. zwischen 10–13 Uhr ist das Wasser wegen Reparaturarbeiten abgestellt.' },
    { id: 'an3', at: Date.parse('2026-08-01T08:00:00'), kind: 'ad', title: 'Umzugsservice Move24', text: '20% Rabatt für Bewohner der Darna Residenz. Code: DARNA20.' },
  ],

  // Nachrichten (Verwaltung -> Bewohner). toUserId = Empfänger, fromUserId = Absender
  messages: [
    { id: 'm1', toUserId: 'u3', fromUserId: 'u1', at: Date.parse('2026-08-24T15:18:00'),
      text: 'Sehr geehrte(r) Omar Said, der aktuelle Saldo Ihrer Wohnung (Apt. Al-Shahba) beträgt € 250. Bitte beachten Sie die Zahlungsfristen. Mit freundlichen Grüßen, die Verwaltung.' },
    { id: 'm2', toUserId: 'u3', fromUserId: 'u1', at: Date.parse('2026-08-11T17:28:00'),
      text: 'Sehr geehrte Bewohner, für die Feuerlöscher-Wartung wird je Wohnung eine Gebühr von € 20 erhoben. Zahlungsfrist: 30.08.2026.' },
    { id: 'm3', toUserId: 'u3', fromUserId: 'u1', at: Date.parse('2026-06-08T17:59:00'),
      text: 'Ihr Zahlungsrückstand beträgt heute € 946,41. Bei Nichtzahlung bis 11.06.2026 wird eine Mahnung durch unseren Anwalt versendet (Gebühr € 35). Der Betrag wird Ihrem Saldo hinzugefügt.' },
    { id: 'm4', toUserId: 'u2', fromUserId: 'u1', at: Date.parse('2026-08-20T10:25:00'),
      text: 'Sehr geehrter Herr Haddad, die Nebenkostenabrechnung für Ihre Immobilien liegt bereit. Bitte prüfen Sie den Bereich „Einnahmen / Ausgaben".' },
  ],

  // Banküberweisungen des Mieters (Banka Havalelerim)
  transfers: [
    { id: 'tr1', tenantId: 't2', at: Date.parse('2026-03-16T00:00:00'), amountEur: 850, iban: 'DE59 0010 0271 9096 6953 50', ref: 'Miete März 2026' },
    { id: 'tr2', tenantId: 't2', at: Date.parse('2026-02-20T00:00:00'), amountEur: 850, iban: 'DE59 0010 0271 9096 6953 50', ref: 'Miete Februar 2026' },
    { id: 'tr3', tenantId: 't2', at: Date.parse('2025-12-22T00:00:00'), amountEur: 600, iban: 'DE59 0010 0271 9096 6953 50', ref: 'Nebenkosten Q4' },
  ],

  // Inkasso-/Vollstreckungsakten (İcra Dosyaları)
  inkassoFiles: [
    { id: 'ik1', tenantId: 't2', at: Date.parse('2026-06-11T00:00:00'), caseNo: '2026/1487', amountEur: 946.41, status: 'closed', office: 'Kanzlei Al-Ameen', note: 'Rückstand beglichen, Akte geschlossen.' },
  ],

  // Gebäude-Finanzbericht (Gelir / Gider)
  buildingFinance: {
    period: 'August 2026',
    income: [
      { label: 'Mieteinnahmen', amountEur: 6400 },
      { label: 'Nebenkosten', amountEur: 1850 },
      { label: 'Sonstige', amountEur: 300 },
    ],
    expense: [
      { label: 'Reinigung', amountEur: 900 },
      { label: 'Strom (Allgemein)', amountEur: 420 },
      { label: 'Wartung/Reparatur', amountEur: 1100 },
      { label: 'Versicherung', amountEur: 260 },
    ],
  },

  // Forderungsliste des Gebäudes (Alacak Listesi) – wer schuldet wie viel
  receivables: [
    { id: 'rc1', unit: 'A / 30', name: 'Omar Said',  amountEur: 450 },
    { id: 'rc2', unit: 'A / 12', name: 'Yusuf Kaya',  amountEur: 120 },
    { id: 'rc3', unit: 'B / 03', name: 'Nour Haddad', amountEur: 0 },
    { id: 'rc4', unit: 'B / 21', name: 'Sami Berri',  amountEur: 300 },
  ],

  // Aktuell angemeldeter Benutzer (null = ausgeloggt, zeigt Login-Screen)
  currentUserId: null,
};
