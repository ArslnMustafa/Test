// 2. Mietkontrolle & Sanktionierung – Eskalationsstufen für ausstehende Zahlungen
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader, Card, Badge, Button } from '../components/UI';
import { colors, spacing, radius, font } from '../theme';

export default function RentScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Miet-Status"
        titleAr="مراقبة الإيجار"
        subtitle="Eskalationsstufen für ausstehende Zahlungen"
      />

      {/* Bezahlt */}
      <Card style={styles.rowCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Ahmad K.</Text>
          <Text style={styles.sub}>Villa Dummar</Text>
        </View>
        <Badge label="Bezahlt" tone="green" />
      </Card>

      {/* Überfällig */}
      <Card style={{ borderColor: colors.redBorder, backgroundColor: '#1a1013' }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Omar S.</Text>
            <Text style={styles.sub}>Apt. Al-Shahba</Text>
          </View>
          <Badge label="Überfällig" tone="red" />
        </View>
        <Text style={styles.overdue}>Seit 12 Tagen im Rückstand (€ 250)</Text>
        <Button label="Aktion wählen" tone="red" outline />
      </Card>

      {/* Eskalations-Maßnahmen */}
      <Text style={styles.sectionTitle}>Maßnahme wählen (Omar S.)</Text>

      <Card style={styles.actionRow}>
        <View style={styles.iconBox}><Text style={styles.icon}>✉️</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>Mahnung per Mail</Text>
          <Text style={styles.actionSub}>Offizielle Warnung senden</Text>
        </View>
      </Card>

      <Card style={styles.actionRow}>
        <View style={styles.iconBox}><Text style={styles.icon}>📞</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>Verwandten kontaktieren</Text>
          <Text style={styles.actionSub}>Kontakt: Onkel Mahmoud (+963 9…)</Text>
        </View>
      </Card>

      <Card style={[styles.actionRow, { borderColor: colors.redBorder }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.redDark }]}><Text style={styles.icon}>⚖️</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.actionTitle, { color: '#f87171' }]}>Inkasso beauftragen</Text>
          <Text style={styles.actionSub}>Lokalen Anwalt einschalten</Text>
        </View>
      </Card>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },

  rowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  sub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  overdue: { color: '#f87171', fontSize: font.small, fontWeight: '600', marginVertical: spacing.md },

  sectionTitle: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '700',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  actionTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  actionSub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
});
