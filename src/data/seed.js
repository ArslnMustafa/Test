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

  // Mieter / Miet-Status
  tenants: [
    { id: 't1', name: 'Ahmad K.', propertyName: 'Villa Dummar', status: 'paid', overdueDays: 0, overdueEur: 0, relative: 'Onkel Samir (+963 9…)', log: [] },
    { id: 't2', name: 'Omar S.', propertyName: 'Apt. Al-Shahba', status: 'overdue', overdueDays: 12, overdueEur: 250, relative: 'Onkel Mahmoud (+963 9…)', log: [] },
    { id: 't3', name: 'Layla H.', propertyName: 'Penthouse Latakia', status: 'paid', overdueDays: 0, overdueEur: 0, relative: 'Tante Nour (+963 9…)', log: [] },
    { id: 't4', name: 'Khaled M.', propertyName: 'Studio Homs-Zentrum', status: 'overdue', overdueDays: 5, overdueEur: 400, relative: 'Bruder Ziad (+963 9…)', log: [] },
  ],

  // Handwerker-Marktplatz
  craftsmen: [
    { id: 'c1', name: 'Hassan Bau GmbH', specialty: 'Komplettsanierung', rating: 4.9, category: 'premium', verified: true, city: 'Damaskus', requested: false },
    { id: 'c2', name: 'Al-Nour Elektrik', specialty: 'Elektroinstallation', rating: 4.7, category: 'premium', verified: true, city: 'Aleppo', requested: false },
    { id: 'c3', name: 'Damaskus Fliesen', specialty: 'Fliesen & Bäder', rating: 4.5, category: 'premium', verified: true, city: 'Damaskus', requested: false },
    { id: 'c4', name: 'Abu Yusuf Maler', specialty: 'Malerarbeiten', rating: 4.2, category: 'budget', verified: true, city: 'Homs', requested: false },
    { id: 'c5', name: 'Schnell & Günstig', specialty: 'Kleinreparaturen', rating: 3.9, category: 'budget', verified: true, city: 'Latakia', requested: false },
  ],

  // Immobilienmarkt (zum Verkauf)
  listings: [
    { id: 'l1', title: 'Penthouse Al-Malki', city: 'Damaskus', sqm: 180, priceEur: 185000, verifiedTitle: true, status: 'sale' },
    { id: 'l2', title: 'Villa Dummar', city: 'Damaskus', sqm: 240, priceEur: 320000, verifiedTitle: true, status: 'sale' },
    { id: 'l3', title: 'Apartment Aleppo-Neustadt', city: 'Aleppo', sqm: 110, priceEur: 89000, verifiedTitle: false, status: 'sale' },
    { id: 'l4', title: 'Stadthaus Homs', city: 'Homs', sqm: 160, priceEur: 142000, verifiedTitle: true, status: 'sale' },
    { id: 'l5', title: 'Meerblick-Wohnung Latakia', city: 'Latakia', sqm: 95, priceEur: 128000, verifiedTitle: true, status: 'sale' },
  ],

  // Investment-Fonds
  funds: [
    { id: 'f1', title: 'Wohnkomplex Homs', subtitle: 'Suriye Wiederaufbau Fonds #1', goalEur: 500000, raisedEur: 175000, investors: 45, maxInvestors: 100, minMonthlyEur: 500, joined: false },
    { id: 'f2', title: 'Gewerbezentrum Aleppo', subtitle: 'Wiederaufbau Fonds #2', goalEur: 750000, raisedEur: 300000, investors: 60, maxInvestors: 150, minMonthlyEur: 750, joined: false },
    { id: 'f3', title: 'Solarpark Damaskus-Umland', subtitle: 'Grüne Energie Fonds #3', goalEur: 400000, raisedEur: 90000, investors: 22, maxInvestors: 80, minMonthlyEur: 300, joined: false },
  ],
};
