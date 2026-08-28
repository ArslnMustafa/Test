// Mieter-Ansicht – nur die eigene Miete
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader, Card, Badge, Button } from '../components/UI';
import { ConfirmModal } from '../components/Modals';
import { useStore } from '../store/store';
import { eur, when } from '../utils';
import { colors, spacing, radius, font, useTheme, darkColors } from '../theme';

export default function MyRentScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { state, actions, currentUser } = useStore();
  const [payOpen, setPayOpen] = useState(false);

  // Der zum Login gehörende Miet-Datensatz
  const tenant = state.tenants.find((t) => t.id === currentUser?.tenantId) || null;

  if (!tenant) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Meine Miete" titleAr="إيجاري" subtitle="Ihr persönlicher Miet-Status" />
        <Card><Text style={styles.muted}>Kein Miet-Datensatz mit Ihrem Konto verknüpft.</Text></Card>
      </ScrollView>
    );
  }

  const overdue = tenant.status === 'overdue';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Meine Miete" titleAr="إيجاري" subtitle="Ihr persönlicher Miet-Status" />

      {/* Status-Karte */}
      <Card style={overdue ? { borderColor: colors.redBorder, backgroundColor: '#1a1013' } : null}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{tenant.name}</Text>
            <Text style={styles.sub}>{tenant.propertyName}</Text>
          </View>
          <Badge label={overdue ? 'Überfällig' : 'Bezahlt'} tone={overdue ? 'red' : 'green'} />
        </View>

        {overdue ? (
          <>
            <Text style={styles.overdue}>
              Offener Betrag: {eur(tenant.overdueEur)} · seit {tenant.overdueDays} Tagen
            </Text>
            <Button label="Miete jetzt bezahlen" tone="green" onPress={() => setPayOpen(true)} />
          </>
        ) : (
          <Text style={styles.ok}>✓ Ihre Miete ist beglichen. Vielen Dank!</Text>
        )}
      </Card>

      {/* Verlauf */}
      {tenant.log.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Verlauf</Text>
          <Card>
            {tenant.log.map((entry, i) => (
              <View key={i} style={styles.logRow}>
                <Text style={styles.logText}>{entry.text}</Text>
                <Text style={styles.logDate}>{when(entry.at)}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      <View style={{ height: spacing.xl }} />

      <ConfirmModal
        visible={payOpen}
        title="Miete bezahlen?"
        message={`Möchten Sie den offenen Betrag von ${eur(tenant.overdueEur)} jetzt als bezahlt markieren?`}
        confirmLabel="Ja, bezahlen"
        onConfirm={() => actions.markPaid(tenant.id)}
        onClose={() => setPayOpen(false)}
      />
    </ScrollView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  muted: { color: colors.textMuted, fontSize: font.body },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  name: { color: colors.text, fontSize: font.h3, fontWeight: '800' },
  sub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  overdue: { color: '#f87171', fontSize: font.body, fontWeight: '600', marginBottom: spacing.md },
  ok: { color: colors.greenText, fontSize: font.body, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  logRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  logText: { color: colors.text, fontSize: font.body },
  logDate: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },
});

const styles = makeStyles(darkColors);
