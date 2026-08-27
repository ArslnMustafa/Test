// 1. Basis & Datenpool – Homefeed & KI-gestützte Finanzübersicht (mit Datenbank)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenHeader, Card, SmallButton, ProgressBar, Button } from '../components/UI';
import { FormModal, InfoModal } from '../components/Modals';
import { useStore } from '../store/store';
import { eur, modeLabel } from '../utils';
import { colors, spacing, radius, font } from '../theme';

export default function HomeScreen() {
  const { state, actions, currentUser } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState(null); // ausgewählte Immobilie

  // Nur der Verwalter darf Immobilien direkt hinzufügen (Eigentümer nicht)
  const canAddProperty = currentUser?.role === 'admin';

  // Kennzahlen aus der "Datenbank" berechnen
  const portfolio = state.properties.reduce((s, p) => s + p.valueEur, 0);
  const yearlyRent = state.properties.reduce((s, p) => s + p.yearlyRentEur, 0);
  const monthlyRent = state.properties.reduce((s, p) => s + p.monthlyRentEur, 0);
  const collected = Math.round(yearlyRent * 0.62);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Darna Dashboard"
        titleAr="لوحة دارنا"
        subtitle="Homefeed & KI-gestützte Finanzübersicht"
      />

      {/* Portfolio-Wert (Summe aller Immobilien) */}
      <Card>
        <Text style={styles.cardLabel}>Portfolio Wert</Text>
        <Text style={styles.bigValue}>{eur(portfolio)}</Text>
        <View style={styles.rentPill}>
          <Text style={styles.rentPillText}>Jahresmiete: {eur(yearlyRent)}</Text>
        </View>
      </Card>

      {/* Einnahmen gesamt: diesen Monat & dieses Jahr */}
      <Card style={styles.incomeCard}>
        <View style={styles.incomeCol}>
          <Text style={styles.incomeLabel}>Diesen Monat</Text>
          <Text style={styles.incomeValue}>{eur(monthlyRent)}</Text>
        </View>
        <View style={styles.incomeDivider} />
        <View style={styles.incomeCol}>
          <Text style={styles.incomeLabel}>Dieses Jahr</Text>
          <Text style={styles.incomeValue}>{eur(yearlyRent)}</Text>
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

      {/* Einnahmen je Immobilie */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Meine Immobilien ({state.properties.length})</Text>
        {canAddProperty && (
          <TouchableOpacity onPress={() => setAddOpen(true)} activeOpacity={0.8}>
            <Text style={styles.addLink}>+ Hinzufügen</Text>
          </TouchableOpacity>
        )}
      </View>

      {state.properties.map((p) => (
        <Card key={p.id} style={styles.rowCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{p.name}{p.mode === 'airbnb' ? ' ☀️' : ''}</Text>
            <Text style={styles.itemSub}>{p.city} · {modeLabel(p.mode)}</Text>
            {/* Einnahmen dieser Immobilie: Monat & Jahr */}
            <Text style={styles.itemIncome}>
              {eur(p.monthlyRentEur)} / Mo · {eur(p.yearlyRentEur)} / Jahr
            </Text>
          </View>
          <TouchableOpacity onPress={() => setDetail(p)} activeOpacity={0.8}>
            <SmallButton label="Details ›" tone={p.mode === 'vacant' ? 'gold' : 'blue'} />
          </TouchableOpacity>
        </Card>
      ))}

      {/* Finanzübersicht */}
      <Text style={styles.sectionTitle}>Finanzübersicht</Text>
      <Card>
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
            <Text style={styles.progressValue}>{eur(collected)}</Text>
          </View>
          <ProgressBar progress={0.62} tone="green" />
        </View>
      </Card>

      <View style={{ height: spacing.xl }} />

      {/* Dialog: Immobilie hinzufügen */}
      <FormModal
        visible={addOpen}
        title="Immobilie hinzufügen"
        submitLabel="Hinzufügen"
        fields={[
          { key: 'name', label: 'Name', placeholder: 'z. B. Apt. Al-Malki' },
          { key: 'city', label: 'Stadt', placeholder: 'z. B. Damaskus' },
          { key: 'valueEur', label: 'Wert (€)', placeholder: 'z. B. 120000', numeric: true },
        ]}
        onSubmit={(v) => actions.addProperty(v)}
        onClose={() => setAddOpen(false)}
      />

      {/* Dialog: Immobilien-Detail */}
      <InfoModal
        visible={!!detail}
        title={detail?.name}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <View>
            <DetailRow label="Stadt" value={detail.city} />
            <DetailRow label="Status" value={modeLabel(detail.mode)} />
            <DetailRow label="Wert" value={eur(detail.valueEur)} />
            <DetailRow label="Monatsmiete" value={eur(detail.monthlyRentEur)} />
            <DetailRow label="Jahresmiete" value={eur(detail.yearlyRentEur)} />
            <DetailRow label="Airbnb-Potenzial" value={eur(detail.airbnbEstEur) + ' / Mo'} />

            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              <Button
                label={detail.mode === 'airbnb' ? 'Zu Langzeitmiete wechseln' : 'Zu Airbnb wechseln'}
                tone="gold"
                onPress={() => { actions.togglePropertyMode(detail.id); setDetail(null); }}
              />
              <Button
                label="Immobilie löschen"
                tone="red"
                outline
                onPress={() => { actions.deleteProperty(detail.id); setDetail(null); }}
              />
            </View>
          </View>
        )}
      </InfoModal>
    </ScrollView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },

  cardLabel: { color: colors.textMuted, fontSize: font.small, textAlign: 'center' },
  bigValue: { color: colors.text, fontSize: 34, fontWeight: '800', textAlign: 'center', marginVertical: spacing.sm },
  rentPill: { backgroundColor: colors.greenDark, borderRadius: radius.sm, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  rentPillText: { color: colors.greenText, fontSize: font.small, fontWeight: '700' },

  kiTitle: { color: colors.purple, fontSize: font.h3, fontWeight: '700', marginBottom: spacing.sm },
  kiBody: { color: colors.textMuted, fontSize: font.body, lineHeight: 20 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: spacing.lg, marginTop: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.sm },
  addLink: { color: colors.gold, fontSize: font.small, fontWeight: '700' },

  rowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  itemSub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  itemIncome: { color: colors.greenText, fontSize: font.small, fontWeight: '700', marginTop: spacing.xs },

  incomeCard: { flexDirection: 'row', alignItems: 'center' },
  incomeCol: { flex: 1, alignItems: 'center' },
  incomeLabel: { color: colors.textMuted, fontSize: font.small, marginBottom: spacing.xs },
  incomeValue: { color: colors.text, fontSize: font.h2, fontWeight: '800' },
  incomeDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginVertical: spacing.xs },

  centerValue: { color: colors.text, fontSize: font.h1, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md },
  compareBox: { backgroundColor: '#2a1f08', borderRadius: radius.md, borderWidth: 1, borderColor: '#4a380f', padding: spacing.md },
  compareTitle: { color: colors.goldSoft, fontSize: font.body, fontWeight: '700', marginBottom: spacing.xs },
  compareBody: { color: colors.textMuted, fontSize: font.small, lineHeight: 18 },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { color: colors.textMuted, fontSize: font.small, fontWeight: '600' },
  progressValue: { color: colors.text, fontSize: font.small, fontWeight: '700' },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.textMuted, fontSize: font.body },
  detailValue: { color: colors.text, fontSize: font.body, fontWeight: '700' },

  bold: { fontWeight: '700', color: colors.text },
});
