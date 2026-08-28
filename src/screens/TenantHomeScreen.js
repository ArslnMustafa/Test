// Mieter-Startseite (Anasayfa) – Überblick über Forderungen, Kontakte, Zahlungen
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Badge } from '../components/UI';
import { useStore } from '../store/store';
import { eur2, dmy, debtIcon } from '../utils';
import { colors, spacing, radius, font } from '../theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export default function TenantHomeScreen() {
  const { state, currentUser } = useStore();
  const tid = currentUser?.tenantId;
  const tenant = state.tenants.find((t) => t.id === tid) || null;
  const info = state.siteInfo || {};

  const debts = (state.debtItems || []).filter((d) => d.tenantId === tid);
  const total = debts.reduce((a, d) => a + d.amountEur + d.surchargeEur, 0);
  // frühestes Fälligkeitsdatum
  const nextDue = debts.length ? Math.min(...debts.map((d) => d.dueDate)) : null;

  const payments = (state.payments || []).filter((p) => p.tenantId === tid).sort((a, b) => b.at - a.at).slice(0, 4);
  const ads = state.announcements || [];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Begrüßung */}
      <View style={styles.hero}>
        <Text style={styles.heroHi}>{greeting()},</Text>
        <Text style={styles.heroName}>{currentUser?.name}</Text>
        <Text style={styles.heroAddr}>{info.name || 'Darna'}{tenant ? ` · ${tenant.propertyName}` : ''}</Text>
      </View>

      {/* Güncel dönem borçları */}
      <Text style={styles.section}>Aktuelle Forderungen</Text>
      <Card>
        {debts.length === 0 ? (
          <Text style={styles.ok}>✓ Keine offenen Forderungen.</Text>
        ) : (
          <>
            {debts.map((d) => (
              <View key={d.id} style={styles.debtRow}>
                <Text style={styles.debtIcon}>{debtIcon(d.category)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.debtInfo}>{d.info}</Text>
                  <Text style={styles.debtDue}>Fällig: {dmy(d.dueDate)}</Text>
                </View>
                <Text style={styles.debtAmt}>{eur2(d.amountEur + d.surchargeEur)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Gesamt fällig</Text>
                {nextDue && <Text style={styles.totalDue}>bis {dmy(nextDue)}</Text>}
              </View>
              <Text style={styles.totalValue}>{eur2(total)}</Text>
            </View>
          </>
        )}
      </Card>

      {/* Müşteri temsilcisi */}
      {info.rep && (
        <>
          <Text style={styles.section}>Kundenbetreuer</Text>
          <Card>
            <ContactRow icon="👤" label="Name" value={info.rep.name} />
            <ContactRow icon="✉️" label="E-Mail" value={info.rep.email} />
            <ContactRow icon="📞" label="Telefon" value={info.rep.phone} last />
          </Card>
        </>
      )}

      {/* Banka bilgileri */}
      {info.bank && (
        <>
          <Text style={styles.section}>Bankverbindung</Text>
          <Card>
            <ContactRow icon="🏦" label="Bank" value={info.bank.bankName} />
            <ContactRow icon="👤" label="Inhaber" value={info.bank.holder} />
            <ContactRow icon="🔢" label="IBAN" value={info.bank.iban} last />
          </Card>
        </>
      )}

      {/* Son ödemelerim */}
      <Text style={styles.section}>Letzte Zahlungen</Text>
      <Card>
        {payments.length === 0 ? (
          <Text style={styles.muted}>Noch keine Zahlungen.</Text>
        ) : (
          payments.map((p, i) => (
            <View key={p.id} style={[styles.payRow, i === payments.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.payDate}>{dmy(p.at)}</Text>
                <Text style={styles.payReceipt}>Beleg: {p.receiptNo}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.payAmt}>{eur2(p.amountEur)}</Text>
                <Text style={styles.payRest}>Rest: {eur2(p.remainingEur || 0)}</Text>
              </View>
            </View>
          ))
        )}
      </Card>

      {/* Bina yöneticisi */}
      {info.manager && (
        <>
          <Text style={styles.section}>Hausverwaltung</Text>
          <Card>
            <ContactRow icon="👤" label="Name" value={info.manager.name} />
            <ContactRow icon="📞" label="Telefon" value={info.manager.phone} last />
          </Card>
        </>
      )}

      {/* Duyuru & Reklam */}
      <Text style={styles.section}>Ankündigungen & Angebote</Text>
      {ads.map((a) => (
        <Card key={a.id} style={a.kind === 'ad' ? styles.adCard : null}>
          <View style={styles.annHead}>
            <Text style={styles.annTitle}>{a.title}</Text>
            <Badge
              label={a.kind === 'ad' ? 'Werbung' : a.kind === 'warning' ? 'Wichtig' : 'Info'}
              tone={a.kind === 'ad' ? 'gold' : a.kind === 'warning' ? 'red' : 'blue'}
            />
          </View>
          <Text style={styles.annText}>{a.text}</Text>
          <Text style={styles.annDate}>{dmy(a.at)}</Text>
        </Card>
      ))}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

function ContactRow({ icon, label, value, last }) {
  return (
    <View style={[styles.cRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.cIcon}>{icon}</Text>
      <Text style={styles.cLabel}>{label}</Text>
      <Text style={styles.cValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },

  hero: { backgroundColor: colors.blue, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  heroHi: { color: 'rgba(255,255,255,0.85)', fontSize: font.body },
  heroName: { color: '#fff', fontSize: font.h1, fontWeight: '900', marginTop: 2 },
  heroAddr: { color: 'rgba(255,255,255,0.8)', fontSize: font.small, marginTop: spacing.xs },

  section: { color: colors.textMuted, fontSize: font.small, fontWeight: '800', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm, textTransform: 'uppercase' },
  ok: { color: colors.greenText, fontSize: font.body, fontWeight: '600' },
  muted: { color: colors.textMuted, fontSize: font.body },

  debtRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  debtIcon: { fontSize: 20, width: 26, textAlign: 'center' },
  debtInfo: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  debtDue: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1 },
  debtAmt: { color: colors.text, fontSize: font.body, fontWeight: '800', fontVariant: ['tabular-nums'] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  totalLabel: { color: colors.textMuted, fontSize: font.small, fontWeight: '700' },
  totalDue: { color: '#f87171', fontSize: font.tiny, marginTop: 1 },
  totalValue: { color: colors.goldSoft, fontSize: font.h2, fontWeight: '900', fontVariant: ['tabular-nums'] },

  cRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  cIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  cLabel: { color: colors.textMuted, fontSize: font.small, width: 66 },
  cValue: { color: colors.text, fontSize: font.small, fontWeight: '700', flex: 1, textAlign: 'right' },

  payRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  payDate: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  payReceipt: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1, fontVariant: ['tabular-nums'] },
  payAmt: { color: colors.greenText, fontSize: font.body, fontWeight: '800', fontVariant: ['tabular-nums'] },
  payRest: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1, fontVariant: ['tabular-nums'] },

  adCard: { borderColor: '#4a380f', backgroundColor: '#2a1f08' },
  annHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  annTitle: { color: colors.text, fontSize: font.body, fontWeight: '800', flex: 1, marginRight: spacing.sm },
  annText: { color: colors.textMuted, fontSize: font.small, lineHeight: 19 },
  annDate: { color: colors.textFaint, fontSize: font.tiny, marginTop: spacing.sm },
});
