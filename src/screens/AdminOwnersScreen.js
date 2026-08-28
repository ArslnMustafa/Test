// Verwalter – Eigentümer & deren Mieter
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenHeader, Card, Badge } from '../components/UI';
import { useStore } from '../store/store';
import { eur } from '../utils';
import { colors, spacing, radius, font } from '../theme';

export default function AdminOwnersScreen() {
  const { state } = useStore();
  const [ownerId, setOwnerId] = useState(null);

  const owners = state.users.filter((u) => u.role === 'owner');
  const tenantsOf = (oid) => state.tenants.filter((t) => t.ownerId === oid);

  // Detail: Mieter eines Eigentümers
  if (ownerId) {
    const owner = owners.find((o) => o.id === ownerId);
    const tenants = tenantsOf(ownerId);
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} activeOpacity={0.7} onPress={() => setOwnerId(null)}>
          <Text style={styles.backText}>‹ Eigentümer</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>🏠 {owner?.name}</Text>
        <Text style={styles.detailSub}>Beitrag: 200 € / Monat · {tenants.length} Mieter</Text>

        {tenants.length === 0 ? (
          <Card><Text style={styles.muted}>Keine Mieter hinterlegt.</Text></Card>
        ) : tenants.map((t) => {
          const overdue = t.status === 'overdue';
          return (
            <Card key={t.id} style={overdue ? { borderColor: colors.redBorder } : null}>
              <View style={styles.between}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{t.name}</Text>
                  <Text style={styles.sub}>{t.propertyName}</Text>
                </View>
                <Badge label={overdue ? 'Überfällig' : 'Bezahlt'} tone={overdue ? 'red' : 'green'} />
              </View>
              {overdue && <Text style={styles.overdue}>Rückstand: {eur(t.overdueEur)} · {t.overdueDays} Tage</Text>}
            </Card>
          );
        })}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    );
  }

  // Übersicht: Eigentümer-Liste
  const revenue = owners.length * 200;
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Eigentümer" titleAr="الملاك" subtitle="Verwaltete Eigentümer & Mieter" />

      <Card style={styles.revCard}>
        <Text style={styles.revLabel}>Monatliche Plattform-Einnahmen</Text>
        <Text style={styles.revValue}>{eur(revenue)}</Text>
        <Text style={styles.revSub}>{owners.length} Eigentümer × 200 €</Text>
      </Card>

      {owners.map((o) => {
        const n = tenantsOf(o.id).length;
        return (
          <TouchableOpacity key={o.id} activeOpacity={0.8} onPress={() => setOwnerId(o.id)}>
            <Card style={styles.row}>
              <View style={styles.avatar}><Text style={{ fontSize: 20 }}>🏠</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{o.name}</Text>
                <Text style={styles.sub}>{o.email}</Text>
              </View>
              <Badge label={`${n} Mieter`} tone="blue" />
              <Text style={styles.chevron}>›</Text>
            </Card>
          </TouchableOpacity>
        );
      })}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  muted: { color: colors.textMuted, fontSize: font.body },

  revCard: { alignItems: 'center' },
  revLabel: { color: colors.textMuted, fontSize: font.small },
  revValue: { color: colors.goldSoft, fontSize: 30, fontWeight: '900', marginVertical: 2, fontVariant: ['tabular-nums'] },
  revSub: { color: colors.textFaint, fontSize: font.tiny },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  sub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  chevron: { color: colors.textFaint, fontSize: font.h2, marginLeft: spacing.xs },

  back: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  backText: { color: colors.blueSoft, fontSize: font.body, fontWeight: '700' },
  detailTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginHorizontal: spacing.lg },
  detailSub: { color: colors.textMuted, fontSize: font.small, marginHorizontal: spacing.lg, marginBottom: spacing.md },
  between: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  overdue: { color: '#f87171', fontSize: font.small, marginTop: spacing.sm },
});
