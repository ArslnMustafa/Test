// 1. Basis & Datenpool – Homefeed & KI-gestützte Finanzübersicht
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader, Card, Badge, SmallButton, ProgressBar } from '../components/UI';
import { colors, spacing, radius, font } from '../theme';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Darna Dashboard"
        titleAr="لوحة دارنا"
        subtitle="Homefeed & KI-gestützte Finanzübersicht"
      />

      {/* Portfolio-Wert */}
      <Card>
        <Text style={styles.cardLabel}>Portfolio Wert</Text>
        <Text style={styles.bigValue}>€ 245.000</Text>
        <View style={styles.rentPill}>
          <Text style={styles.rentPillText}>Jahresmiete: € 14.500</Text>
        </View>
      </Card>

      {/* KI-Standortanalyse */}
      <Card style={{ backgroundColor: colors.purpleDark, borderColor: '#3b2d63' }}>
        <Text style={styles.kiTitle}>✨ KI-Standortanalyse</Text>
        <Text style={styles.kiBody}>
          Ihre Immobilie in „Al-Malki“ qualifiziert sich für <Text style={styles.bold}>Airbnb</Text>.
          Geschätztes Potenzial: <Text style={{ color: colors.purple, fontWeight: '700' }}>+45% Einnahmen</Text>.
        </Text>
      </Card>

      {/* Meine Immobilien */}
      <Text style={styles.sectionTitle}>Meine Immobilien</Text>

      <Card style={styles.rowCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>Villa Dummar</Text>
          <Text style={styles.itemSub}>Langzeitmiete</Text>
        </View>
        <SmallButton label="Details ›" tone="blue" />
      </Card>

      <Card style={styles.rowCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>Apt. Al-Malki ☀️</Text>
          <Text style={styles.itemSub}>Leerstehend</Text>
        </View>
        <SmallButton label="Setup ›" tone="gold" />
      </Card>

      {/* Finanzübersicht */}
      <Text style={styles.sectionTitle}>Finanzübersicht</Text>

      <Card>
        <Text style={styles.centerValue}>€ 1.850 / Monat</Text>

        <View style={styles.compareBox}>
          <Text style={styles.compareTitle}>🏷️ KI Mietpreis-Vergleich</Text>
          <Text style={styles.compareBody}>
            Ihre Miete in Aleppo liegt <Text style={styles.bold}>12% unter dem Marktdurchschnitt</Text>.
            Empfohlene Anpassung: +€40/Monat.
          </Text>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Gesammelte Mieten 2026</Text>
            <Text style={styles.progressValue}>€ 14.500</Text>
          </View>
          <ProgressBar progress={0.62} tone="green" />
        </View>
      </Card>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },

  cardLabel: { color: colors.textMuted, fontSize: font.small, textAlign: 'center' },
  bigValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  rentPill: {
    backgroundColor: colors.greenDark,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  rentPillText: { color: colors.greenText, fontSize: font.small, fontWeight: '700' },

  kiTitle: { color: colors.purple, fontSize: font.h3, fontWeight: '700', marginBottom: spacing.sm },
  kiBody: { color: colors.textMuted, fontSize: font.body, lineHeight: 20 },

  sectionTitle: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '700',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },

  rowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  itemSub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },

  centerValue: { color: colors.text, fontSize: font.h1, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md },

  compareBox: {
    backgroundColor: '#2a1f08',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#4a380f',
    padding: spacing.md,
  },
  compareTitle: { color: colors.goldSoft, fontSize: font.body, fontWeight: '700', marginBottom: spacing.xs },
  compareBody: { color: colors.textMuted, fontSize: font.small, lineHeight: 18 },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { color: colors.textMuted, fontSize: font.small, fontWeight: '600' },
  progressValue: { color: colors.text, fontSize: font.small, fontWeight: '700' },

  bold: { fontWeight: '700', color: colors.text },
});
