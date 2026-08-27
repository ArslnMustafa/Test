// Handwerker/Firma-Ansicht – eingehende Aufträge (Job-Anfragen)
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader, Card, Badge, Button } from '../components/UI';
import { useStore } from '../store/store';
import { eur } from '../utils';
import { colors, spacing, radius, font } from '../theme';

const STATUS = {
  new: { label: 'Neu', tone: 'gold' },
  accepted: { label: 'Angenommen', tone: 'blue' },
  done: { label: 'Erledigt', tone: 'green' },
};

export default function JobsScreen() {
  const { state, actions, currentUser } = useStore();

  // Nur die Aufträge des verknüpften Profils (sonst alle – Demo)
  const cid = currentUser?.craftsmanId;
  const jobs = (state.jobs || []).filter((j) => !cid || j.craftsmanId === cid);

  const open = jobs.filter((j) => j.status !== 'done');
  const done = jobs.filter((j) => j.status === 'done');

  const earnings = jobs
    .filter((j) => j.status === 'done')
    .reduce((s, j) => s + j.budgetEur, 0);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Meine Aufträge" titleAr="طلبات العمل" subtitle="Eingehende Anfragen & laufende Arbeiten" />

      {/* Kennzahlen */}
      <Card style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{open.length}</Text>
          <Text style={styles.statLabel}>Offen</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{done.length}</Text>
          <Text style={styles.statLabel}>Erledigt</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{eur(earnings)}</Text>
          <Text style={styles.statLabel}>Verdient</Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Offene Aufträge ({open.length})</Text>
      {open.length === 0 && <Card><Text style={styles.muted}>Keine offenen Aufträge.</Text></Card>}
      {open.map((j) => (
        <Card key={j.id}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobTitle}>{j.title}</Text>
              <Text style={styles.jobSub}>{j.propertyName} · {j.city}</Text>
            </View>
            <Badge label={STATUS[j.status].label} tone={STATUS[j.status].tone} />
          </View>
          <Text style={styles.budget}>Budget: {eur(j.budgetEur)}</Text>
          {j.status === 'new' ? (
            <Button label="Auftrag annehmen" tone="blue" onPress={() => actions.acceptJob(j.id)} />
          ) : (
            <Button label="Als erledigt markieren" tone="green" onPress={() => actions.completeJob(j.id)} />
          )}
        </Card>
      ))}

      {done.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Erledigt ({done.length})</Text>
          {done.map((j) => (
            <Card key={j.id} style={styles.doneCard}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{j.title}</Text>
                  <Text style={styles.jobSub}>{j.propertyName} · {j.city}</Text>
                </View>
                <Badge label="✓ Erledigt" tone="green" />
              </View>
              <Text style={styles.budget}>{eur(j.budgetEur)}</Text>
            </Card>
          ))}
        </>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  muted: { color: colors.textMuted, fontSize: font.body },

  statsCard: { flexDirection: 'row', alignItems: 'center' },
  statCol: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: font.h3, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: font.tiny, marginTop: 2 },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginVertical: spacing.xs },

  sectionTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  jobTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  jobSub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  budget: { color: colors.goldSoft, fontSize: font.small, fontWeight: '700', marginBottom: spacing.md },
  doneCard: { opacity: 0.75 },
});
