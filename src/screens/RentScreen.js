// 2. Mietkontrolle & Sanktionierung – Eskalationsstufen (mit Datenbank)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenHeader, Card, Badge, Button } from '../components/UI';
import { ActionSheet, InfoModal } from '../components/Modals';
import { useStore } from '../store/store';
import { eur, when } from '../utils';
import { colors, spacing, radius, font } from '../theme';

export default function RentScreen() {
  const { state, actions } = useStore();
  const [actionFor, setActionFor] = useState(null); // Mieter für Aktions-Menü
  const [logFor, setLogFor] = useState(null); // Mieter für Verlaufs-Anzeige

  const buildOptions = (t) => [
    {
      key: 'mail', icon: '✉️', title: 'Mahnung per Mail', subtitle: 'Offizielle Warnung senden',
      onPress: () => actions.rentAction(t.id, 'Mahnung per Mail gesendet'),
    },
    {
      key: 'rel', icon: '📞', title: 'Verwandten kontaktieren', subtitle: `Kontakt: ${t.relative}`,
      onPress: () => actions.rentAction(t.id, `Verwandten kontaktiert: ${t.relative}`),
    },
    {
      key: 'inkasso', icon: '⚖️', title: 'Inkasso beauftragen', subtitle: 'Lokalen Anwalt einschalten', danger: true,
      onPress: () => actions.rentAction(t.id, 'Inkasso/Anwalt beauftragt'),
    },
    {
      key: 'paid', icon: '✅', title: 'Als bezahlt markieren', subtitle: 'Rückstand ausgleichen',
      onPress: () => actions.markPaid(t.id),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Miet-Status"
        titleAr="مراقبة الإيجار"
        subtitle="Eskalationsstufen für ausstehende Zahlungen"
      />

      {state.tenants.map((t) => {
        const overdue = t.status === 'overdue';
        return (
          <Card key={t.id} style={overdue ? { borderColor: colors.redBorder, backgroundColor: '#1a1013' } : null}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{t.name}</Text>
                <Text style={styles.sub}>{t.propertyName}</Text>
              </View>
              <Badge label={overdue ? 'Überfällig' : 'Bezahlt'} tone={overdue ? 'red' : 'green'} />
            </View>

            {overdue && (
              <Text style={styles.overdue}>
                Seit {t.overdueDays} Tagen im Rückstand ({eur(t.overdueEur)})
              </Text>
            )}

            {/* Verlaufshinweis, wenn Aktionen protokolliert wurden */}
            {t.log.length > 0 && (
              <TouchableOpacity onPress={() => setLogFor(t)} activeOpacity={0.8}>
                <Text style={styles.logHint}>
                  🗒️ {t.log.length} Aktion(en) · zuletzt: {t.log[0].text} ›
                </Text>
              </TouchableOpacity>
            )}

            {overdue ? (
              <Button label="Aktion wählen" tone="red" outline onPress={() => setActionFor(t)} />
            ) : (
              <Button label="Aktion wählen" tone="ghost" onPress={() => setActionFor(t)} />
            )}
          </Card>
        );
      })}

      <View style={{ height: spacing.xl }} />

      {/* Aktions-Menü (Eskalation) */}
      <ActionSheet
        visible={!!actionFor}
        title={actionFor ? `Maßnahme wählen (${actionFor.name})` : ''}
        options={actionFor ? buildOptions(actionFor) : []}
        onClose={() => setActionFor(null)}
      />

      {/* Verlaufs-Anzeige */}
      <InfoModal
        visible={!!logFor}
        title={logFor ? `Verlauf – ${logFor.name}` : ''}
        onClose={() => setLogFor(null)}
      >
        {logFor && logFor.log.map((entry, i) => (
          <View key={i} style={styles.logRow}>
            <Text style={styles.logText}>{entry.text}</Text>
            <Text style={styles.logDate}>{when(entry.at)}</Text>
          </View>
        ))}
      </InfoModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  sub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  overdue: { color: '#f87171', fontSize: font.small, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  logHint: { color: colors.textMuted, fontSize: font.small, marginVertical: spacing.sm },

  logRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  logText: { color: colors.text, fontSize: font.body },
  logDate: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },
});
