// 4. Protokolle & Marktplatz – Immobilienmarkt (ImmoScout-ähnlich)
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader, Card, Badge, SmallButton, ImagePlaceholder } from '../components/UI';
import { colors, spacing, radius, font } from '../theme';

export default function MarketScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Markt (سوق)"
        titleAr="السوق العقاري"
        subtitle="Exklusiver & vertrauenswürdiger Immobilienmarkt"
      />

      <View style={styles.filterRow}>
        <SmallButton label="Filter ⚙︎" tone="gold" />
      </View>

      {/* Angebot 1 */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ImagePlaceholder style={{ height: 150, borderRadius: 0 }} />
        <View style={styles.badgeFloat}>
          <Badge label="Zu Verkaufen" tone="blue" />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.propTitle}>Penthouse Al-Malki</Text>
          <Text style={styles.propSub}>Damaskus • 180 m²</Text>
          <Badge label="✓ Verified Title" tone="green" />
          <Text style={styles.price}>€ 185.000</Text>
        </View>
      </Card>

      {/* Angebot 2 */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ImagePlaceholder style={{ height: 130, borderRadius: 0 }} />
        <View style={styles.cardBody}>
          <Text style={styles.propTitle}>Villa Dummar</Text>
          <Text style={styles.propSub}>Damaskus • 240 m²</Text>
          <Text style={styles.price}>€ 320.000</Text>
        </View>
      </Card>

      {/* Mängelprotokoll (Beweissicherung) */}
      <Text style={styles.sectionTitle}>Mängelprotokoll</Text>
      <Card>
        <Text style={styles.protoLabel}>Notiz Handwerker:</Text>
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>Rohrbruch im Bad repariert. Neue Fliesen verlegt.</Text>
        </View>

        <Text style={[styles.protoLabel, { marginTop: spacing.md }]}>Fotodokumentation:</Text>
        <View style={styles.photoRow}>
          <View style={styles.photoTab}><Text style={styles.photoTabText}>Vorher</Text></View>
          <View style={[styles.photoTab, styles.photoTabActive]}>
            <Text style={[styles.photoTabText, { color: '#fff' }]}>Nachher</Text>
          </View>
        </View>

        <View style={styles.signRow}>
          <Text style={styles.signLabel}>Unterschrift Handwerker</Text>
          <View style={styles.signLine} />
        </View>
        <View style={styles.signRow}>
          <Text style={styles.signLabel}>Unterschrift Mieter</Text>
          <View style={styles.signLine} />
        </View>
        <View style={styles.signRow}>
          <Text style={styles.signLabel}>Freigabe Verwandter / Bekannter</Text>
          <View style={styles.signLine} />
        </View>
      </Card>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },

  filterRow: { alignItems: 'flex-end', marginHorizontal: spacing.lg, marginBottom: spacing.sm },

  badgeFloat: { position: 'absolute', top: spacing.md, left: spacing.md },
  cardBody: { padding: spacing.lg },
  propTitle: { color: colors.text, fontSize: font.h3, fontWeight: '800' },
  propSub: { color: colors.textMuted, fontSize: font.small, marginTop: 2, marginBottom: spacing.sm },
  price: { color: colors.goldSoft, fontSize: font.h2, fontWeight: '800', marginTop: spacing.sm },

  sectionTitle: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '700',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  protoLabel: { color: colors.text, fontSize: font.small, fontWeight: '700' },
  noteBox: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  noteText: { color: colors.textMuted, fontSize: font.small },

  photoRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  photoTab: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  photoTabActive: { backgroundColor: colors.blue },
  photoTabText: { color: colors.textMuted, fontSize: font.small, fontWeight: '700' },

  signRow: { marginTop: spacing.lg },
  signLabel: { color: colors.textFaint, fontSize: font.tiny, marginBottom: spacing.sm },
  signLine: { height: 1, backgroundColor: colors.border, borderStyle: 'dashed', borderWidth: 0.5, borderColor: colors.border },
});
