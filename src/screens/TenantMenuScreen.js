// Mieter-Modul – Menü/Hub mit Wohnungs- und Gebäudeberichten.
// Struktur wie in der Referenz-App; Inhalte werden nach und nach gefüllt.
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Badge, Button, MessageCard } from '../components/UI';
import { ConfirmModal, FormModal } from '../components/Modals';
import { useStore } from '../store/store';
import { eur, eur2, dmy, when, jobIcon } from '../utils';
import { colors, spacing, radius, font } from '../theme';

// freie Texteingabe -> Kategorie
function toCategory(txt) {
  const t = String(txt || '').toLowerCase();
  if (/sanit|wasser|rohr|abfluss/.test(t)) return 'plumbing';
  if (/elektr|strom|sicherung/.test(t)) return 'electrical';
  if (/mal|streich|farbe/.test(t)) return 'painting';
  if (/heiz|gas|therme/.test(t)) return 'heating';
  return 'other';
}

const JOB_STATUS = {
  open: { label: 'Offen', tone: 'gold' },
  assigned: { label: 'Vergeben', tone: 'green' },
  done: { label: 'Erledigt', tone: 'green' },
  cancelled: { label: 'Storniert', tone: 'red' },
};

// Menügruppen (deutsches Label + türkischer Referenzname als Untertitel)
const GROUPS = [
  {
    title: 'Wohnungsberichte',
    hint: 'Mesken Raporları',
    icon: '🪪',
    items: [
      { key: 'maengel',     icon: '🛠️', label: 'Schaden melden',     hint: 'Arıza / Mängel' },
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
  const [maengelOpen, setMaengelOpen] = useState(false);

  // eigene Mängelmeldungen
  const myJobs = (state.jobs || []).filter((j) => j.tenantId === currentUser?.tenantId).sort((a, b) => b.at - a.at);

  const tenant = state.tenants.find((t) => t.id === currentUser?.tenantId) || null;
  const allItems = GROUPS.flatMap((g) => g.items);
  const activeItem = allItems.find((i) => i.key === view);

  // Eigene Nachrichten (Posteingang)
  const myMessages = (state.messages || [])
    .filter((m) => m.toUserId === currentUser?.id)
    .sort((a, b) => b.at - a.at);
  const nameFor = (id) => (state.users.find((u) => u.id === id)?.name) || 'Verwaltung';

  // Eigene Schulden & Zahlungen (nach Datum)
  const tid = currentUser?.tenantId;
  const myDebts = (state.debtItems || []).filter((d) => d.tenantId === tid).sort((a, b) => a.dueDate - b.dueDate);
  const myPayments = (state.payments || []).filter((p) => p.tenantId === tid).sort((a, b) => b.at - a.at);

  // ---- Untermenü-Ansicht ----
  if (activeItem) {
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} activeOpacity={0.7} onPress={() => setView('menu')}>
          <Text style={styles.backText}>‹ Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>{activeItem.icon}  {activeItem.label}</Text>

        {renderDetail(view, { tenant, setPayOpen, myMessages, nameFor, myDebts, myPayments, myJobs, setMaengelOpen })}

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

        {/* Neuen Mangel melden */}
        <FormModal
          visible={maengelOpen}
          title="Schaden / Mangel melden"
          submitLabel="An Verwaltung senden"
          fields={[
            { key: 'title', label: 'Kurzbeschreibung', placeholder: 'z. B. Wasserrohrbruch im Bad' },
            { key: 'area', label: 'Bereich', placeholder: 'z. B. Sanitär, Elektrik, Heizung' },
            { key: 'description', label: 'Details', placeholder: 'Was ist genau das Problem?' },
          ]}
          onSubmit={(v) => actions.reportDefect({ title: v.title, description: v.description, category: toCategory(v.area || v.title) })}
          onClose={() => setMaengelOpen(false)}
        />
      </ScrollView>
    );
  }

  // ---- Hauptmenü ----
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Kopf */}
      <View style={styles.hero}>
        <Text style={styles.heroName}>Menü</Text>
        <Text style={styles.heroAddr}>{currentUser?.name}{tenant ? ` · ${tenant.propertyName}` : ''}</Text>
      </View>

      {GROUPS.map((g) => (
        <View key={g.title}>
          <Text style={styles.groupTitle}>{g.icon}  {g.title.toUpperCase()}</Text>
          {g.items.map((it) => {
            const badge = itemBadge(it.key, tenant, { msgCount: myMessages.length, debtCount: myDebts.length, payCount: myPayments.length, maengelCount: myJobs.filter((j) => j.status !== 'done').length });
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
function itemBadge(key, tenant, { msgCount, debtCount, payCount, maengelCount } = {}) {
  if (key === 'maengel' && maengelCount > 0) return <Badge label={String(maengelCount)} tone="gold" />;
  if (key === 'messages' && msgCount > 0) return <Badge label={String(msgCount)} tone="blue" />;
  if (key === 'debtlist' && debtCount > 0) return <Badge label={String(debtCount)} tone="gold" />;
  if (key === 'payments' && payCount > 0) return <Badge label={String(payCount)} tone="blue" />;
  if (!tenant) return null;
  if (key === 'debts' && tenant.status === 'overdue') return <Badge label={eur(tenant.overdueEur)} tone="red" />;
  if (key === 'debts' && tenant.status === 'paid') return <Badge label="0 €" tone="green" />;
  return null;
}

const STATUS_LABEL = {
  this_month: { label: 'Diesen Monat', color: colors.blueSoft },
  overdue: { label: 'Überfällig', color: '#f87171' },
  upcoming: { label: 'Bevorstehend', color: colors.textMuted },
};

// Inhalt je Menüpunkt (mit Daten gefüllt oder Platzhalter)
function renderDetail(key, { tenant, setPayOpen, myMessages, nameFor, myDebts, myPayments, myJobs, setMaengelOpen }) {
  // Schaden melden + Status der eigenen Meldungen
  if (key === 'maengel') {
    return (
      <View>
        <Button label="＋ Neuen Schaden melden" tone="gold" onPress={() => setMaengelOpen(true)} />
        <View style={{ height: spacing.md }} />
        {(!myJobs || myJobs.length === 0) ? (
          <ComingSoon note="Sie haben noch keine Schäden gemeldet." />
        ) : (
          myJobs.map((j) => {
            const js = JOB_STATUS[j.status] || JOB_STATUS.open;
            const accepted = (j.offers || []).find((o) => o.status === 'accepted');
            return (
              <Card key={j.id}>
                <View style={styles.between}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text style={{ fontSize: 20 }}>{jobIcon(j.category)}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{j.title}</Text>
                      <Text style={styles.jSub}>{dmy(j.at)}</Text>
                    </View>
                  </View>
                  <Badge label={js.label} tone={js.tone} />
                </View>
                {!!j.description && <Text style={styles.jDesc}>{j.description}</Text>}
                <Text style={styles.jStatus}>
                  {j.status === 'open' && `${(j.offers || []).length} Angebot(e) · wartet auf Freigabe des Eigentümers`}
                  {j.status === 'assigned' && accepted && `Vergeben · ${eur(accepted.priceEur)}`}
                  {j.status === 'done' && 'Reparatur abgeschlossen ✓'}
                </Text>
              </Card>
            );
          })
        )}
      </View>
    );
  }


  // Borç Listesi – detaillierte Schuldenposten mit Summen
  if (key === 'debtlist') {
    if (!myDebts || myDebts.length === 0) return <ComingSoon note="Keine offenen Schuldenposten." />;
    const sum = myDebts.reduce((a, d) => a + d.amountEur, 0);
    const sur = myDebts.reduce((a, d) => a + d.surchargeEur, 0);
    const st = STATUS_LABEL;
    return (
      <View>
        {myDebts.map((d) => {
          const s = st[d.status] || st.this_month;
          return (
            <Card key={d.id}>
              <View style={styles.between}>
                <View>
                  <Text style={styles.hLabel}>STATUS</Text>
                  <Text style={[styles.hValue, { color: s.color }]}>{s.label}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.hLabel}>FÄLLIG AM</Text>
                  <Text style={styles.hValue}>{dmy(d.dueDate)}</Text>
                </View>
              </View>
              <View style={styles.dashed} />
              <Text style={styles.hLabel}>INFO</Text>
              <Text style={styles.infoText}>{d.info}</Text>
              <View style={styles.dashed} />
              <View style={styles.threeCol}>
                <View><Text style={styles.hLabel}>BETRAG</Text><Text style={styles.colVal}>{eur2(d.amountEur)}</Text></View>
                <View style={{ alignItems: 'center' }}><Text style={styles.hLabel}>ZUSCHLAG</Text><Text style={styles.colVal}>{eur2(d.surchargeEur)}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={styles.hLabel}>ZU ZAHLEN</Text><Text style={styles.colVal}>{eur2(d.amountEur + d.surchargeEur)}</Text></View>
              </View>
            </Card>
          );
        })}
        <Card>
          <TotalRow label="Gesamtbetrag" value={eur2(sum)} />
          <TotalRow label="Gesamt-Zuschlag" value={eur2(sur)} />
          <TotalRow label="Gesamt zu zahlen" value={eur2(sum + sur)} strong />
        </Card>
      </View>
    );
  }

  // Ödeme Listesi – geleistete Zahlungen mit Summe
  if (key === 'payments') {
    if (!myPayments || myPayments.length === 0) return <ComingSoon note="Noch keine Zahlungen erfasst." />;
    const total = myPayments.reduce((a, p) => a + p.amountEur, 0);
    return (
      <View>
        {myPayments.map((p) => (
          <Card key={p.id}>
            <View style={styles.between}>
              <View><Text style={styles.hLabel}>DATUM</Text><Text style={styles.hValue}>{dmy(p.at)}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={styles.hLabel}>ZAHLART</Text><Text style={styles.hValue}>{p.method === 'Bank' ? 'Bank' : 'Kasse'}</Text></View>
            </View>
            <View style={styles.dashed} />
            <View style={styles.between}>
              <View style={{ flex: 1 }}><Text style={styles.hLabel}>BELEG-NR.</Text><Text style={styles.receipt}>{p.receiptNo}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={styles.hLabel}>BEZAHLT</Text><Text style={styles.paidVal}>{eur2(p.amountEur)}</Text></View>
            </View>
          </Card>
        ))}
        <Card>
          <TotalRow label="Gesamt bezahlt" value={eur2(total)} strong />
        </Card>
      </View>
    );
  }

  if (key === 'messages') {
    if (!myMessages || myMessages.length === 0) return <ComingSoon note="Sie haben noch keine Nachrichten." />;
    return (
      <View style={{ marginHorizontal: -spacing.lg }}>
        {myMessages.map((m) => (
          <MessageCard
            key={m.id}
            date={when(m.at)}
            party={nameFor(m.fromUserId)}
            partyLabel="Absender"
            text={m.text}
          />
        ))}
      </View>
    );
  }

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

function TotalRow({ label, value, strong }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, strong && { color: colors.text }]}>{label}</Text>
      <Text style={[styles.totalValue, strong && { color: colors.goldSoft, fontSize: font.h3 }]}>{value}</Text>
    </View>
  );
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
  jSub: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1 },
  jDesc: { color: colors.textMuted, fontSize: font.small, lineHeight: 18, marginBottom: spacing.sm },
  jStatus: { color: colors.blueSoft, fontSize: font.small, fontWeight: '600' },
  debtLine: { color: '#f87171', fontSize: font.h3, fontWeight: '800' },
  debtSub: { color: colors.textMuted, fontSize: font.small, marginBottom: spacing.md },
  ok: { color: colors.greenText, fontSize: font.body, fontWeight: '600' },

  logRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  logText: { color: colors.text, fontSize: font.body },
  logDate: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },

  soonTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700' },
  soonSub: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.xs, textAlign: 'center' },

  // Borç / Ödeme Listesi
  hLabel: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '700', letterSpacing: 0.5 },
  hValue: { color: colors.text, fontSize: font.body, fontWeight: '700', marginTop: 1 },
  dashed: { height: 1, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: colors.border, marginVertical: spacing.sm },
  infoText: { color: colors.text, fontSize: font.body, marginTop: 2, lineHeight: 20 },
  threeCol: { flexDirection: 'row', justifyContent: 'space-between' },
  colVal: { color: colors.text, fontSize: font.body, fontWeight: '800', marginTop: 2, fontVariant: ['tabular-nums'] },
  receipt: { color: colors.textMuted, fontSize: font.body, marginTop: 2, fontVariant: ['tabular-nums'] },
  paidVal: { color: colors.greenText, fontSize: font.h3, fontWeight: '800', marginTop: 2, fontVariant: ['tabular-nums'] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  totalLabel: { color: colors.textMuted, fontSize: font.body, fontWeight: '600' },
  totalValue: { color: colors.text, fontSize: font.body, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
