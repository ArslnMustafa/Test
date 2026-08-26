// 4. Protokolle & Marktplatz – Immobilienmarkt (mit Datenbank)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenHeader, Card, Badge, SmallButton, ImagePlaceholder, Button } from '../components/UI';
import { FormModal, InfoModal } from '../components/Modals';
import { useStore } from '../store/store';
import { eur } from '../utils';
import { colors, spacing, radius, font } from '../theme';

export default function MarketScreen() {
  const { state, actions } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [onlyVerified, setOnlyVerified] = useState(false); // Filter

  const listings = onlyVerified ? state.listings.filter((l) => l.verifiedTitle) : state.listings;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Markt (سوق)"
        titleAr="السوق العقاري"
        subtitle="Exklusiver & vertrauenswürdiger Immobilienmarkt"
      />

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => setOnlyVerified((v) => !v)} activeOpacity={0.8}>
          <SmallButton label={onlyVerified ? '✓ Nur verifiziert' : 'Filter ⚙︎'} tone={onlyVerified ? 'green' : 'gold'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setAddOpen(true)} activeOpacity={0.8}>
          <SmallButton label="+ Angebot" tone="blue" />
        </TouchableOpacity>
      </View>

      {listings.map((l) => (
        <Card key={l.id} style={{ padding: 0, overflow: 'hidden' }}>
          <ImagePlaceholder style={{ height: 140, borderRadius: 0 }} />
          <View style={styles.badgeFloat}>
            <Badge label="Zu Verkaufen" tone="blue" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.propTitle}>{l.title}</Text>
            <Text style={styles.propSub}>{l.city} • {l.sqm} m²</Text>
            {l.verifiedTitle && <Badge label="✓ Verified Title" tone="green" />}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{eur(l.priceEur)}</Text>
              <TouchableOpacity onPress={() => setDetail(l)} activeOpacity={0.8}>
                <SmallButton label="Details ›" tone="ghost" />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      ))}

      {listings.length === 0 && (
        <Text style={styles.empty}>Keine Angebote für diesen Filter.</Text>
      )}

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

        {['Unterschrift Handwerker', 'Unterschrift Mieter', 'Freigabe Verwandter / Bekannter'].map((s) => (
          <View key={s} style={styles.signRow}>
            <Text style={styles.signLabel}>{s}</Text>
            <View style={styles.signLine} />
          </View>
        ))}
      </Card>

      <View style={{ height: spacing.xl }} />

      {/* Dialog: Angebot hinzufügen */}
      <FormModal
        visible={addOpen}
        title="Angebot einstellen"
        submitLabel="Einstellen"
        fields={[
          { key: 'title', label: 'Titel', placeholder: 'z. B. Penthouse Al-Malki' },
          { key: 'city', label: 'Stadt', placeholder: 'z. B. Damaskus' },
          { key: 'sqm', label: 'Fläche (m²)', placeholder: 'z. B. 120', numeric: true },
          { key: 'priceEur', label: 'Preis (€)', placeholder: 'z. B. 185000', numeric: true },
        ]}
        onSubmit={(v) => actions.addListing(v)}
        onClose={() => setAddOpen(false)}
      />

      {/* Dialog: Angebot-Detail */}
      <InfoModal visible={!!detail} title={detail?.title} onClose={() => setDetail(null)}>
        {detail && (
          <View>
            <DetailRow label="Stadt" value={detail.city} />
            <DetailRow label="Fläche" value={`${detail.sqm} m²`} />
            <DetailRow label="Preis" value={eur(detail.priceEur)} />
            <DetailRow label="Titel verifiziert" value={detail.verifiedTitle ? 'Ja ✓' : 'Nein'} />
            <View style={{ marginTop: spacing.md }}>
              <Button label="Angebot löschen" tone="red" outline
                onPress={() => { actions.deleteListing(detail.id); setDetail(null); }} />
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
  toolbar: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },

  badgeFloat: { position: 'absolute', top: spacing.md, left: spacing.md },
  cardBody: { padding: spacing.lg },
  propTitle: { color: colors.text, fontSize: font.h3, fontWeight: '800' },
  propSub: { color: colors.textMuted, fontSize: font.small, marginTop: 2, marginBottom: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  price: { color: colors.goldSoft, fontSize: font.h2, fontWeight: '800' },
  empty: { color: colors.textFaint, textAlign: 'center', marginVertical: spacing.lg, fontSize: font.small },

  sectionTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  protoLabel: { color: colors.text, fontSize: font.small, fontWeight: '700' },
  noteBox: { backgroundColor: colors.surfaceDark, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.sm },
  noteText: { color: colors.textMuted, fontSize: font.small },
  photoRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  photoTab: { flex: 1, backgroundColor: colors.surfaceDark, borderRadius: radius.sm, paddingVertical: spacing.md, alignItems: 'center' },
  photoTabActive: { backgroundColor: colors.blue },
  photoTabText: { color: colors.textMuted, fontSize: font.small, fontWeight: '700' },
  signRow: { marginTop: spacing.lg },
  signLabel: { color: colors.textFaint, fontSize: font.tiny, marginBottom: spacing.sm },
  signLine: { height: 1, backgroundColor: colors.border, borderWidth: 0.5, borderColor: colors.border },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.textMuted, fontSize: font.body },
  detailValue: { color: colors.text, fontSize: font.body, fontWeight: '700' },
});
