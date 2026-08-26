// 3. Handwerker Marktplatz – verifizierter Pool & Profile (mit Datenbank)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenHeader, Card, Badge, Button, ImagePlaceholder } from '../components/UI';
import { InfoModal } from '../components/Modals';
import { useStore } from '../store/store';
import { colors, spacing, radius, font } from '../theme';

export default function CraftsmenScreen() {
  const { state, actions } = useStore();
  const [tab, setTab] = useState('premium'); // Kategorie-Filter
  const [profile, setProfile] = useState(null); // ausgewähltes Profil

  const list = state.craftsmen.filter((c) => c.category === tab);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Marktplatz"
        titleAr="سوق الحرفيين"
        subtitle="Verifizierter Pool & detaillierte Profile"
      />

      {/* Kategorie-Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tab} activeOpacity={0.8} onPress={() => setTab('premium')}>
          <Text style={[styles.tabText, tab === 'premium' && styles.tabTextActive]}>Hochwertig 💎</Text>
          {tab === 'premium' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} activeOpacity={0.8} onPress={() => setTab('budget')}>
          <Text style={[styles.tabText, tab === 'budget' && styles.tabTextActive]}>Günstig 💰</Text>
          {tab === 'budget' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {list.map((c) => (
        <Card key={c.id}>
          <View style={styles.rowCard}>
            <View style={styles.avatar}><Text style={{ fontSize: 22 }}>👷</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={styles.sub}>{c.specialty} · {c.city}</Text>
            </View>
            <Badge label={`★ ${c.rating}`} tone="gold" />
          </View>
          <View style={styles.galleryRow}>
            <ImagePlaceholder style={{ height: 64 }} />
            <ImagePlaceholder style={{ height: 64 }} />
          </View>
          <Button label="Profil ansehen" tone="blue" onPress={() => setProfile(c)} />
        </Card>
      ))}

      <View style={{ height: spacing.xl }} />

      {/* Profil-Detail */}
      <InfoModal visible={!!profile} title={profile?.name} onClose={() => setProfile(null)}>
        {profile && (
          <View style={{ alignItems: 'center' }}>
            <View style={styles.avatarBig}><Text style={{ fontSize: 34 }}>👷</Text></View>
            <Badge label="✓ Verifiziert (موثّق)" tone="green" />
            <Text style={styles.category}>
              Kategorie: {profile.category === 'premium' ? 'Premium (Hochwertig)' : 'Budget (Günstig)'}
            </Text>
            <Text style={styles.desc}>
              Spezialisiert auf {profile.specialty} in {profile.city}. Bewertung ★ {profile.rating}.
            </Text>

            <Text style={styles.worksLabel}>Letzte Arbeiten:</Text>
            <View style={styles.worksGrid}>
              <ImagePlaceholder style={styles.workCell} />
              <ImagePlaceholder style={styles.workCell} />
              <ImagePlaceholder style={styles.workCell} />
              <ImagePlaceholder style={styles.workCell} />
            </View>

            <View style={{ width: '100%', marginTop: spacing.lg }}>
              <Button
                label={profile.requested ? '✓ Anfrage gesendet' : 'Auftrag anfragen'}
                tone={profile.requested ? 'green' : 'gold'}
                onPress={() => { actions.requestCraftsman(profile.id); setProfile({ ...profile, requested: !profile.requested }); }}
              />
            </View>
          </View>
        )}
      </InfoModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },

  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.md },
  tab: { flex: 1, alignItems: 'center', paddingBottom: spacing.sm },
  tabText: { color: colors.textFaint, fontSize: font.body, fontWeight: '700' },
  tabTextActive: { color: colors.blueSoft },
  tabUnderline: { height: 2, backgroundColor: colors.blue, width: '80%', marginTop: spacing.sm, borderRadius: 2 },

  rowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  sub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  galleryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },

  avatarBig: { width: 76, height: 76, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  category: { color: colors.text, fontSize: font.body, fontWeight: '700', marginTop: spacing.lg, alignSelf: 'flex-start' },
  desc: { color: colors.textMuted, fontSize: font.small, lineHeight: 19, marginTop: spacing.sm, alignSelf: 'flex-start' },
  worksLabel: { color: colors.text, fontSize: font.body, fontWeight: '700', marginTop: spacing.lg, alignSelf: 'flex-start' },
  worksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  workCell: { width: '47%', height: 72 },
});
