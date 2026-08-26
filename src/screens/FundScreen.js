// 5. Rendite & Investment-Fonds – Airbnb-Upselling & EminEvim-Style Fonds
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader, Card, Badge, Button, ProgressBar } from '../components/UI';
import { colors, spacing, radius, font } from '../theme';

export default function FundScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Yield Optimizer"
        titleAr="العوائد والصناديق"
        subtitle="Airbnb-Upselling & Investment-Fonds"
      />

      {/* Yield Optimizer */}
      <Card style={{ borderColor: colors.gold }}>
        <View style={styles.premiumTag}>
          <Text style={styles.premiumTagText}>☀️ Premium Standort</Text>
        </View>

        <Text style={styles.title}>Apt. Al-Malki</Text>
        <Text style={styles.sub}>Perfekt für Kurzzeitvermietung (Airbnb).</Text>

        <View style={styles.compareLine}>
          <Text style={styles.compareLabel}>Langzeitmiete (Est.)</Text>
          <Text style={styles.compareValue}>€ 350 / Mo</Text>
        </View>
        <View style={styles.compareLine}>
          <Text style={[styles.compareLabel, { color: colors.goldSoft }]}>Airbnb (65% Auslastung)</Text>
          <Text style={[styles.compareValue, { color: colors.goldSoft }]}>€ 800 / Mo</Text>
        </View>

        <View style={styles.turnkeyBox}>
          <Text style={styles.turnkeyTitle}>Turnkey Setup Paket:</Text>
          <Text style={styles.turnkeyItem}>✓ Komplettmöblierung</Text>
          <Text style={styles.turnkeyItem}>✓ Reinigungsservice</Text>
          <Text style={styles.turnkeyItem}>✓ Booking Management</Text>
        </View>

        <Button label="Zu Airbnb wechseln" tone="gold" />
      </Card>

      {/* Global Invest Fund */}
      <Text style={styles.sectionTitle}>Global Invest Fund</Text>
      <Card>
        <Badge label="Suriye Wiederaufbau Fonds #1" tone="blue" />
        <Text style={[styles.title, { marginTop: spacing.md }]}>Wohnkomplex Homs</Text>
        <Text style={styles.sub}>
          Gemeinschafts-Investment (Elbirliği Sistemi) mit EUR/USD Absicherung.
        </Text>

        <Text style={styles.goal}>Finanzierungsziel: € 500.000</Text>
        <ProgressBar progress={0.35} tone="green" />

        <View style={styles.investRow}>
          <Text style={styles.investLabel}>Investoren:</Text>
          <Text style={styles.investValue}>45 / 100</Text>
        </View>
        <View style={styles.investRow}>
          <Text style={styles.investLabel}>Monatliche Beteiligung:</Text>
          <Text style={styles.investValue}>ab € 500</Text>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Button label="Am Fonds teilnehmen" tone="blue" />
        </View>
      </Card>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },

  premiumTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#3a2a0d',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#5c4212',
    marginBottom: spacing.md,
  },
  premiumTagText: { color: colors.goldSoft, fontSize: font.tiny, fontWeight: '700' },

  title: { color: colors.text, fontSize: font.h2, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.xs, lineHeight: 18 },

  compareLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  compareLabel: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  compareValue: { color: colors.text, fontSize: font.body, fontWeight: '800' },

  turnkeyBox: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.lg,
  },
  turnkeyTitle: { color: colors.text, fontSize: font.small, fontWeight: '700', marginBottom: spacing.sm },
  turnkeyItem: { color: colors.textMuted, fontSize: font.small, lineHeight: 20 },

  sectionTitle: {
    color: colors.text, fontSize: font.h3, fontWeight: '700',
    marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm,
  },

  goal: { color: colors.text, fontSize: font.body, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  investRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  investLabel: { color: colors.textMuted, fontSize: font.small },
  investValue: { color: colors.text, fontSize: font.small, fontWeight: '800' },
});
