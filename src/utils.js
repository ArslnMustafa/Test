// Kleine Hilfsfunktionen

// Zahl als Euro formatieren, z. B. 245000 -> "€ 245.000"
export function eur(n) {
  const v = Math.round(Number(n) || 0);
  return '€ ' + v.toLocaleString('de-DE');
}

// Euro mit zwei Nachkommastellen, z. B. "€ 200,00"
export function eur2(n) {
  const v = Number(n) || 0;
  return '€ ' + v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Nur Datum, z. B. "31.08.2026"
export function dmy(ts) {
  try {
    return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return '';
  }
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

// Deutsches Label für eine Benutzerrolle
export function roleLabel(role) {
  return ({
    tenant: 'Mieter',
    owner: 'Eigentümer',
    company: 'Firma',
    worker: 'Handwerker',
    admin: 'Administrator',
  })[role] || role;
}

// Passendes Icon je Rolle
export function roleIcon(role) {
  return ({
    tenant: '🔑',
    owner: '🏠',
    company: '🏢',
    worker: '👷',
    admin: '🛡️',
  })[role] || '👤';
}
