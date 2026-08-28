// Mieter – Ödeme (Zahlung): offene Forderungen bezahlen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader, Card, Button } from '../components/UI';
import { ConfirmModal } from '../components/Modals';
import { useStore } from '../store/store';
import { notify } from '../notify';
import { eur2, dmy, debtIcon } from '../utils';
import { colors, spacing, radius, font } from '../theme';

export default function PaymentScreen() {
  const { state, actions, currentUser } = useStore();
  const [payItem, setPayItem] = useState(null); // einzelner Posten
  const [payAll, setPayAll] = useState(false);

  const tid = currentUser?.tenantId;
  const debts = (state.debtItems || []).filter((d) => d.tenantId === tid);
  const total = debts.reduce((a, d) => a + d.amountEur + d.surchargeEur, 0);

  const doPayAll = () => { debts.forEach((d) => actions.payDebt(d.id)); notify('Zahlung erfolgreich', `${eur2(total)} wurden verbucht.`); };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Zahlung" titleAr="الدفع" subtitle="Offene Forderungen begleichen" />

      {debts.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>✅</Text>
          <Text style={styles.okTitle}>Alles bezahlt</Text>
          <Text style={styles.okSub}>Sie haben aktuell keine offenen Forderungen.</Text>
        </Card>
      ) : (
        <>
          {/* Gesamt-Karte */}
          <Card style={styles.totalCard}>
            <Text style={styles.totalLabel}>Offener Gesamtbetrag</Text>
            <Text style={styles.totalValue}>{eur2(total)}</Text>
            <Button label="Alles bezahlen" tone="green" onPress={() => setPayAll(true)} />
          </Card>

          <Text style={styles.section}>Einzelne Posten</Text>
          {debts.map((d) => (
            <Card key={d.id}>
              <View style={styles.row}>
                <Text style={styles.icon}>{debtIcon(d.category)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.info}>{d.info}</Text>
                  <Text style={styles.due}>Fällig: {dmy(d.dueDate)}{d.surchargeEur ? ` · Zuschlag ${eur2(d.surchargeEur)}` : ''}</Text>
                </View>
                <Text style={styles.amt}>{eur2(d.amountEur + d.surchargeEur)}</Text>
              </View>
              <Button label="Bezahlen" tone="blue" outline onPress={() => setPayItem(d)} />
            </Card>
          ))}
        </>
      )}

      <View style={{ height: spacing.xl }} />

      {/* Bestätigungen */}
      <ConfirmModal
        visible={!!payItem}
        title="Zahlung bestätigen?"
        message={payItem ? `„${payItem.info}" über ${eur2(payItem.amountEur + payItem.surchargeEur)} jetzt bezahlen?` : ''}
        confirmLabel="Ja, bezahlen"
        onConfirm={() => { if (payItem) { actions.payDebt(payItem.id); notify('Zahlung erfolgreich', `${eur2(payItem.amountEur + payItem.surchargeEur)} wurden verbucht.`); } }}
        onClose={() => setPayItem(null)}
      />
      <ConfirmModal
        visible={payAll}
        title="Alles bezahlen?"
        message={`Alle offenen Forderungen über insgesamt ${eur2(total)} jetzt begleichen?`}
        confirmLabel="Ja, alles bezahlen"
        onConfirm={doPayAll}
        onClose={() => setPayAll(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },

  totalCard: { alignItems: 'center', gap: spacing.sm },
  totalLabel: { color: colors.textMuted, fontSize: font.small },
  totalValue: { color: colors.goldSoft, fontSize: 32, fontWeight: '900', marginBottom: spacing.sm, fontVariant: ['tabular-nums'] },

  section: { color: colors.textMuted, fontSize: font.small, fontWeight: '800', letterSpacing: 0.5, marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  icon: { fontSize: 20, width: 26, textAlign: 'center' },
  info: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  due: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1 },
  amt: { color: colors.text, fontSize: font.h3, fontWeight: '800', fontVariant: ['tabular-nums'] },

  okTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700' },
  okSub: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.xs, textAlign: 'center' },
});
