// 5. Rendite & Investment-Fonds – Airbnb-Upselling & Fonds (mit Datenbank)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader, Card, Badge, Button, ProgressBar } from '../components/UI';
import { ConfirmModal } from '../components/Modals';
import { useStore } from '../store/store';
import { eur } from '../utils';
import { colors, spacing, radius, font } from '../theme';

export default function FundScreen() {
  const { state, actions } = useStore();
  const [leaveFor, setLeaveFor] = useState(null); // Fonds, den man verlassen möchte
  const [joinFor, setJoinFor] = useState(null); // Fonds, dem man beitreten möchte

  // Beste Airbnb-Kandidatin: nicht bereits Airbnb, höchstes Potenzial
  const candidate =
    state.properties
      .filter((p) => p.mode !== 'airbnb')
      .sort((a, b) => b.airbnbEstEur - a.airbnbEstEur)[0] || state.properties[0];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Yield Optimizer"
        titleAr="العوائد والصناديق"
        subtitle="Airbnb-Upselling & Investment-Fonds"
      />

      {/* Yield Optimizer */}
      {candidate && (
        <Card style={{ borderColor: colors.gold }}>
          <View style={styles.premiumTag}>
            <Text style={styles.premiumTagText}>☀️ Premium Standort</Text>
          </View>

          <Text style={styles.title}>{candidate.name}</Text>
          <Text style={styles.sub}>Perfekt für Kurzzeitvermietung (Airbnb).</Text>

          <View style={styles.compareLine}>
            <Text style={styles.compareLabel}>Langzeitmiete (Est.)</Text>
            <Text style={styles.compareValue}>{eur(candidate.monthlyRentEur || Math.round(candidate.airbnbEstEur / 1.6))} / Mo</Text>
          </View>
          <View style={styles.compareLine}>
            <Text style={[styles.compareLabel, { color: colors.goldSoft }]}>Airbnb (65% Auslastung)</Text>
            <Text style={[styles.compareValue, { color: colors.goldSoft }]}>{eur(candidate.airbnbEstEur)} / Mo</Text>
          </View>

          <View style={styles.turnkeyBox}>
            <Text style={styles.turnkeyTitle}>Turnkey Setup Paket:</Text>
            <Text style={styles.turnkeyItem}>✓ Komplettmöblierung</Text>
            <Text style={styles.turnkeyItem}>✓ Reinigungsservice</Text>
            <Text style={styles.turnkeyItem}>✓ Booking Management</Text>
          </View>

          <Button label="Zu Airbnb wechseln" tone="gold" onPress={() => actions.togglePropertyMode(candidate.id)} />
        </Card>
      )}

      {/* Investment-Fonds */}
      <Text style={styles.sectionTitle}>Global Invest Fund</Text>
      {state.funds.map((f) => {
        const progress = Math.min(f.raisedEur / f.goalEur, 1);
        return (
          <Card key={f.id}>
            <Badge label={f.subtitle} tone="blue" />
            <Text style={[styles.title, { marginTop: spacing.md }]}>{f.title}</Text>
            <Text style={styles.sub}>Gemeinschafts-Investment (Elbirliği Sistemi) mit EUR/USD Absicherung.</Text>

            <Text style={styles.goal}>Finanzierungsziel: {eur(f.goalEur)} · gesammelt: {eur(f.raisedEur)}</Text>
            <ProgressBar progress={progress} tone="green" />

            <View style={styles.investRow}>
              <Text style={styles.investLabel}>Investoren:</Text>
              <Text style={styles.investValue}>{f.investors} / {f.maxInvestors}</Text>
            </View>
            <View style={styles.investRow}>
              <Text style={styles.investLabel}>Monatliche Beteiligung:</Text>
              <Text style={styles.investValue}>ab {eur(f.minMonthlyEur)}</Text>
            </View>

            <View style={{ marginTop: spacing.md }}>
              {f.joined ? (
                <Button
                  label="Beteiligung beenden"
                  tone="red"
                  outline
                  onPress={() => setLeaveFor(f)}
                />
              ) : (
                <Button
                  label="Am Fonds teilnehmen"
                  tone="blue"
                  onPress={() => setJoinFor(f)}
                />
              )}
              {f.joined && <Text style={styles.joinedNote}>✓ Sie sind an diesem Fonds beteiligt</Text>}
            </View>
          </Card>
        );
      })}

      <View style={{ height: spacing.xl }} />

      {/* Bestätigung: Fonds beitreten (spezielle Zustimmung) */}
      <ConfirmModal
        visible={!!joinFor}
        title="Verbindliche Teilnahme"
        message={joinFor ? `Sie treten dem Fonds „${joinFor.title}" mit einem monatlichen Beitrag ab ${eur(joinFor.minMonthlyEur)} bei. Hinweis: Ein Austritt ist nur gegen eine Austrittsgebühr von ${eur(joinFor.exitFeeEur || 0)} möglich. Stimmen Sie zu?` : ''}
        confirmLabel="Ja, verbindlich teilnehmen"
        cancelLabel="Abbrechen"
        onConfirm={() => joinFor && actions.joinFund(joinFor.id)}
        onClose={() => setJoinFor(null)}
      />

      {/* Bestätigung: Fonds verlassen (mit Gebühr) */}
      <ConfirmModal
        visible={!!leaveFor}
        title="Beteiligung beenden?"
        message={leaveFor ? `Wenn Sie Ihre Beteiligung am Fonds „${leaveFor.title}" beenden, fällt eine Austrittsgebühr von ${eur(leaveFor.exitFeeEur || 0)} an und Ihr monatlicher Beitrag wird gestoppt. Fortfahren?` : ''}
        confirmLabel="Ja, gegen Gebühr beenden"
        cancelLabel="Abbrechen"
        danger
        onConfirm={() => leaveFor && actions.leaveFund(leaveFor.id)}
        onClose={() => setLeaveFor(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },

  premiumTag: { alignSelf: 'flex-start', backgroundColor: '#3a2a0d', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: '#5c4212', marginBottom: spacing.md },
  premiumTagText: { color: colors.goldSoft, fontSize: font.tiny, fontWeight: '700' },

  title: { color: colors.text, fontSize: font.h2, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.xs, lineHeight: 18 },

  compareLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  compareLabel: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  compareValue: { color: colors.text, fontSize: font.body, fontWeight: '800' },

  turnkeyBox: { backgroundColor: colors.surfaceDark, borderRadius: radius.md, padding: spacing.md, marginVertical: spacing.lg },
  turnkeyTitle: { color: colors.text, fontSize: font.small, fontWeight: '700', marginBottom: spacing.sm },
  turnkeyItem: { color: colors.textMuted, fontSize: font.small, lineHeight: 20 },

  sectionTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  goal: { color: colors.text, fontSize: font.body, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  investRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  investLabel: { color: colors.textMuted, fontSize: font.small },
  investValue: { color: colors.text, fontSize: font.small, fontWeight: '800' },
  joinedNote: { color: colors.greenText, fontSize: font.small, textAlign: 'center', marginTop: spacing.sm },
});
