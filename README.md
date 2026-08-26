# Darna 🏠

Eine **ImmoScout-ähnliche mobile App** für syrischstämmige Eigentümer in Deutschland –
zur Verwaltung von Immobilien, Mieten, Handwerkern und Investment-Fonds in Syrien.

Zweisprachige Oberfläche (Deutsch / Arabisch), dunkles Design, mit unterer
Navigationsleiste für den Seitenwechsel.

> Prototyp: Die Buttons sind aktuell rein visuell und haben noch keine Funktion.

## Tech Stack

- **React Native** (via **Expo**) — JavaScript
- Eigene Bottom-Tab-Navigation (keine externe Navigations-Bibliothek nötig)

## Bildschirme / Sekmeler

| Tab | Bildschirm | Inhalt |
|-----|-----------|--------|
| 🏠 Home | Darna Dashboard | Portfolio-Wert, KI-Standortanalyse, Meine Immobilien, Finanzübersicht |
| 📋 Miete | Miet-Status | Mietkontrolle & Eskalationsstufen (Mahnung → Verwandter → Inkasso) |
| 🏢 Markt | Immobilienmarkt | Angebote + digitales Mängelprotokoll |
| 👷 Handwerker | Marktplatz | Verifizierte Handwerker (Hochwertig/Günstig) + Profile |
| 📈 Fonds | Yield Optimizer | Airbnb-Upselling + Wiederaufbau-Investment-Fonds |

## Installation & Start

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Entwicklungsserver starten
npm start
```

Danach:

- **Android-Emulator:** Taste `a` drücken (oder `npm run android`)
- **iOS-Simulator (nur macOS):** Taste `i` drücken (oder `npm run ios`)
- **Echtes Handy:** App **Expo Go** installieren und den QR-Code scannen
- **Browser (schneller Test):** Taste `w` drücken (oder `npm run web`)

### Android-Emulator vorbereiten

1. **Android Studio** installieren
2. Über den *Device Manager* ein virtuelles Gerät (AVD) erstellen und starten
3. Im Projektordner `npm start` ausführen und `a` drücken
