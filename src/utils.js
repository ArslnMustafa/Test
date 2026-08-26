// Kleine Hilfsfunktionen

// Zahl als Euro formatieren, z. B. 245000 -> "€ 245.000"
export function eur(n) {
  const v = Math.round(Number(n) || 0);
  return '€ ' + v.toLocaleString('de-DE');
}

// Menschlich lesbares Datum, z. B. "26.08.2026, 10:45"
export function when(ts) {
  try {
    return new Date(ts).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch (e) {
    return '';
  }
}

// Label für den Vermietungs-Modus einer Immobilie
export function modeLabel(mode) {
  if (mode === 'airbnb') return 'Airbnb ☀️';
  if (mode === 'vacant') return 'Leerstehend';
  return 'Langzeitmiete';
}
