// Mieter-Modul – Menü/Hub mit Wohnungs- und Gebäudeberichten.
// Struktur wie in der Referenz-App; Inhalte werden nach und nach gefüllt.
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Badge, Button } from '../components/UI';
import { ConfirmModal } from '../components/Modals';
import { useStore } from '../store/store';
import { eur, when } from '../utils';
import { colors, spacing, radius, font } from '../theme';

// Menügruppen (deutsches Label + türkischer Referenzname als Untertitel)
const GROUPS = [
  {
    title: 'Wohnungsberichte',
    hint: 'Mesken Raporları',
    icon: '🪪',
    items: [
      { key: 'messages',    icon: '💬', label: 'Nachrichten',        hint: 'Mesajlar' },
      { key: 'debts',       icon: '🧾', label: 'Meine Schulden',     hint: 'Borçlarım' },
      { key: 'payments',    icon: '💳', label: 'Meine Zahlungen',    hint: 'Ödemelerim' },
      { key: 'inkasso',     icon: '🔒', label: 'Inkasso-Akten',      hint: 'İcra Dosyaları' },
      { key: 'transfers',   icon: '↗️', label: 'Banküberweisungen',  hint: 'Banka Havalelerim' },
      { key: 'online',      icon: '🖱️', label: 'Online-Zahlungen',   hint: 'Online Ödemelerim' },
    ],
  },
  {
    title: 'Gebäudeberichte',
    hint: 'Apartman Raporları',
    icon: '🏢',
    items: [
      { key: 'infocard',    icon: 'ℹ️',  label: 'Infokarte',           hint: 'Bilgi Kartı' },
      { key: 'news',        icon: '📢', label: 'Ankündigungen',       hint: 'Duyurular' },
      { key: 'status',      icon: '🗓️', label: 'Aktueller Stand',     hint: 'Güncel Durum' },
      { key: 'incexp',      icon: '↕️', label: 'Einnahmen / Ausgaben', hint: 'Gelir / Gider' },
      { key: 'receivables', icon: '📄', label: 'Forderungsliste',     hint: 'Alacak Listesi' },
      { key: 'debtlist',    icon: '📑', label: 'Schuldenliste',       hint: 'Borç Listesi' },
    ],
  },
];

// Zeitabhängige Begrüßung
function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export default function TenantMenuScreen() {
  const { state, actions, currentUser } = useStore();
  const [view, setView] = useState('menu'); // 'menu' oder Item-Key
  const [payOpen, setPayOpen] = useState(false);

  const tenant = state.tenants.find((t) => t.id === currentUser?.tenantId) || null;
  const allItems = GROUPS.flatMap((g) => g.items);
  const activeItem = allItems.find((i) => i.key === view);

  // ---- Untermenü-Ansicht ----
  if (activeItem) {
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} activeOpacity={0.7} onPress={() => setView('menu')}>
          <Text style={styles.backText}>‹ Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>{activeItem.icon}  {activeItem.label}</Text>

        {renderDetail(view, { tenant, setPayOpen })}

        <View style={{ height: spacing.xl }} />

        {tenant && (
          <ConfirmModal
            visible={payOpen}
            title="Zahlung bestätigen?"
            message={`Offenen Betrag von ${eur(tenant.overdueEur)} jetzt als bezahlt markieren?`}
            confirmLabel="Ja, bezahlen"
            onConfirm={() => actions.markPaid(tenant.id)}
            onClose={() => setPayOpen(false)}
          />
        )}
      </ScrollView>
    );
  }

  // ---- Hauptmenü ----
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Begrüßung */}
      <View style={styles.hero}>
        <Text style={styles.heroHi}>{greeting()},</Text>
        <Text style={styles.heroName}>{currentUser?.name}</Text>
        <Text style={styles.heroAddr}>{tenant ? tenant.propertyName : 'Darna'}</Text>
      </View>

      {GROUPS.map((g) => (
        <View key={g.title}>
          <Text style={styles.groupTitle}>{g.icon}  {g.title.toUpperCase()}</Text>
          {g.items.map((it) => {
            const badge = itemBadge(it.key, tenant);
            return (
              <TouchableOpacity key={it.key} activeOpacity={0.8} onPress={() => setView(it.key)}>
                <View style={styles.row}>
                  <View style={styles.rowIcon}><Text style={{ fontSize: 18 }}>{it.icon}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{it.label}</Text>
                    <Text style={styles.rowHint}>{it.hint}</Text>
                  </View>
                  {badge}
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

// Kleiner Status-Badge an bestimmten Menüpunkten
function itemBadge(key, tenant) {
  if (!tenant) return null;
  if (key === 'debts' && tenant.status === 'overdue') return <Badge label={eur(tenant.overdueEur)} tone="red" />;
  if (key === 'debts' && tenant.status === 'paid') return <Badge label="0 €" tone="green" />;
  if (key === 'payments' && tenant.log.length > 0) return <Badge label={String(tenant.log.length)} tone="blue" />;
  return null;
}

// Inhalt je Menüpunkt (mit Daten gefüllt oder Platzhalter)
function renderDetail(key, { tenant, setPayOpen }) {
  if (key === 'debts') {
    if (!tenant) return <ComingSoon note="Kein Miet-Datensatz verknüpft." />;
    const overdue = tenant.status === 'overdue';
    return (
      <Card style={overdue ? { borderColor: colors.redBorder, backgroundColor: '#1a1013' } : null}>
        <View style={styles.between}>
          <Text style={styles.cardTitle}>{tenant.propertyName}</Text>
          <Badge label={overdue ? 'Überfällig' : 'Bezahlt'} tone={overdue ? 'red' : 'green'} />
        </View>
        {overdue ? (
          <>
            <Text style={styles.debtLine}>Offener Betrag: {eur(tenant.overdueEur)}</Text>
            <Text style={styles.debtSub}>seit {tenant.overdueDays} Tagen</Text>
            <Button label="Jetzt bezahlen" tone="green" onPress={() => setPayOpen(true)} />
          </>
        ) : (
          <Text style={styles.ok}>✓ Keine offenen Schulden.</Text>
        )}
      </Card>
    );
  }

  if (key === 'payments') {
    if (!tenant || tenant.log.length === 0) return <ComingSoon note="Noch keine Zahlungen erfasst." />;
    return (
      <Card>
        {tenant.log.map((e, i) => (
          <View key={i} style={styles.logRow}>
            <Text style={styles.logText}>{e.text}</Text>
            <Text style={styles.logDate}>{when(e.at)}</Text>
          </View>
        ))}
      </Card>
    );
  }

  // Alle übrigen Bereiche: Platzhalter (Inhalt folgt)
  return <ComingSoon />;
}

function ComingSoon({ note }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
      <Text style={{ fontSize: 30, marginBottom: spacing.sm }}>🚧</Text>
      <Text style={styles.soonTitle}>Inhalt folgt in Kürze</Text>
      <Text style={styles.soonSub}>{note || 'Dieser Bereich wird als Nächstes gefüllt.'}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },

  hero: {
    backgroundColor: colors.blue,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroHi: { color: 'rgba(255,255,255,0.85)', fontSize: font.body },
  heroName: { color: '#fff', fontSize: font.h1, fontWeight: '900', marginTop: 2 },
  heroAddr: { color: 'rgba(255,255,255,0.8)', fontSize: font.small, marginTop: spacing.xs },

  groupTitle: { color: colors.textMuted, fontSize: font.small, fontWeight: '800', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  rowIcon: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  rowHint: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1 },
  chevron: { color: colors.textFaint, fontSize: font.h2, marginLeft: spacing.xs },

  back: { marginBottom: spacing.sm },
  backText: { color: colors.blueSoft, fontSize: font.body, fontWeight: '700' },
  detailTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginBottom: spacing.md },

  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  cardTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700' },
  debtLine: { color: '#f87171', fontSize: font.h3, fontWeight: '800' },
  debtSub: { color: colors.textMuted, fontSize: font.small, marginBottom: spacing.md },
  ok: { color: colors.greenText, fontSize: font.body, fontWeight: '600' },

  logRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  logText: { color: colors.text, fontSize: font.body },
  logDate: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },

  soonTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700' },
  soonSub: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.xs, textAlign: 'center' },
});
