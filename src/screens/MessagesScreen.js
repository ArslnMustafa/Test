// Nachrichten – Verwaltung/Eigentümer sendet an Bewohner; alle sehen ihren Posteingang
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenHeader, Card, MessageCard, Button, Badge } from '../components/UI';
import { useStore } from '../store/store';
import { when, roleLabel, roleIcon, eur, jobIcon } from '../utils';
import { colors, spacing, radius, font } from '../theme';

const JOB_STATUS = {
  open: { label: 'Offen', tone: 'gold' },
  assigned: { label: 'Vergeben', tone: 'green' },
  done: { label: 'Erledigt', tone: 'green' },
  cancelled: { label: 'Storniert', tone: 'red' },
};
const OFFER_STATUS = {
  pending: { label: 'Ausstehend', tone: 'gold' },
  accepted: { label: 'Angenommen', tone: 'green' },
  rejected: { label: 'Abgelehnt', tone: 'red' },
};

export default function MessagesScreen() {
  const { state, actions, currentUser } = useStore();
  const [tab, setTab] = useState('compose'); // compose | inbox | sent
  const [toId, setToId] = useState(null);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const nameFor = (id) => (state.users.find((u) => u.id === id)?.name) || 'Unbekannt';

  // Mögliche Empfänger je Rolle
  const recipients = state.users.filter((u) => {
    if (currentUser.role === 'admin') return u.role === 'owner' || u.role === 'tenant';
    if (currentUser.role === 'owner') return u.role === 'tenant';
    return false;
  });

  const inbox = (state.messages || []).filter((m) => m.toUserId === currentUser.id).sort((a, b) => b.at - a.at);
  const outbox = (state.messages || []).filter((m) => m.fromUserId === currentUser.id).sort((a, b) => b.at - a.at);

  // Mängel: Verwalter sieht alle, Eigentümer nur seine
  const isAdmin = currentUser.role === 'admin';
  const jobs = (state.jobs || [])
    .filter((j) => isAdmin || j.ownerId === currentUser.id)
    .sort((a, b) => b.at - a.at);
  const craftName = (id) => (state.craftsmen.find((c) => c.id === id)?.name) || 'Handwerker';
  const openMaengel = jobs.filter((j) => j.status === 'open').length;

  const send = () => {
    if (actions.sendMessage(toId, text)) {
      setText('');
      setToId(null);
      setSent(true);
      setTimeout(() => setSent(false), 2500);
      setTab('sent');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Nachrichten" titleAr="الرسائل" subtitle="Verwaltung ↔ Bewohner" />

        {/* Umschalter */}
        <View style={styles.tabs}>
          <Tab label="Senden" active={tab === 'compose'} onPress={() => setTab('compose')} />
          <Tab label={`Eingang${inbox.length ? ` (${inbox.length})` : ''}`} active={tab === 'inbox'} onPress={() => setTab('inbox')} />
          <Tab label={`Mängel${openMaengel ? ` (${openMaengel})` : ''}`} active={tab === 'maengel'} onPress={() => setTab('maengel')} />
        </View>

        {/* --- Senden --- */}
        {tab === 'compose' && (
          <>
            <Card>
              <Text style={styles.label}>Empfänger</Text>
              <View style={styles.chips}>
                {recipients.map((u) => {
                  const on = toId === u.id;
                  return (
                    <TouchableOpacity key={u.id} activeOpacity={0.8} onPress={() => setToId(u.id)}
                      style={[styles.chip, on && styles.chipOn]}>
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{roleIcon(u.role)} {u.name}</Text>
                      <Text style={[styles.chipSub, on && styles.chipTextOn]}>{roleLabel(u.role)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.label, { marginTop: spacing.md }]}>Nachricht</Text>
              <TextInput
                style={styles.input}
                placeholder="Ihre Nachricht an den Bewohner…"
                placeholderTextColor={colors.textFaint}
                multiline
                value={text}
                onChangeText={setText}
              />

              <View style={{ marginTop: spacing.md }}>
                <Button
                  label={sent ? '✓ Gesendet' : 'Nachricht senden'}
                  tone={sent ? 'green' : 'blue'}
                  onPress={send}
                />
              </View>
              {!toId && <Text style={styles.hint}>Bitte zuerst einen Empfänger wählen.</Text>}
            </Card>
          </>
        )}

        {/* --- Posteingang --- */}
        {tab === 'inbox' && (
          <View style={{ marginTop: spacing.sm }}>
            {inbox.length === 0
              ? <Card><Text style={styles.muted}>Keine Nachrichten im Posteingang.</Text></Card>
              : inbox.map((m) => (
                  <MessageCard key={m.id} date={when(m.at)} party={nameFor(m.fromUserId)} partyLabel="Absender" text={m.text} />
                ))}
          </View>
        )}

        {/* --- Mängel / Reparaturen --- */}
        {tab === 'maengel' && (
          <View style={{ marginTop: spacing.sm }}>
            {jobs.length === 0 ? (
              <Card><Text style={styles.muted}>Keine Mängelmeldungen.</Text></Card>
            ) : jobs.map((j) => {
              const js = JOB_STATUS[j.status] || JOB_STATUS.open;
              return (
                <Card key={j.id}>
                  <View style={styles.between}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text style={{ fontSize: 20 }}>{jobIcon(j.category)}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jTitle}>{j.title}</Text>
                        <Text style={styles.jSub}>{j.propertyName}{j.source === 'tenant' ? ' · vom Mieter gemeldet' : ''}</Text>
                      </View>
                    </View>
                    <Badge label={js.label} tone={js.tone} />
                  </View>
                  {!!j.description && <Text style={styles.jDesc}>{j.description}</Text>}
                  {!!j.photo && <Image source={{ uri: j.photo }} style={styles.jobPhoto} />}

                  {/* Angebote der Handwerker */}
                  {(j.offers || []).length === 0 ? (
                    <Text style={styles.noOffer}>Noch keine Angebote von Handwerkern.</Text>
                  ) : (
                    (j.offers || []).map((o) => {
                      const os = OFFER_STATUS[o.status] || OFFER_STATUS.pending;
                      return (
                        <View key={o.id} style={styles.offerBox}>
                          <View style={styles.between}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.offerName}>{craftName(o.craftsmanId)}</Text>
                              {!!o.note && <Text style={styles.offerNote}>{o.note}</Text>}
                            </View>
                            <Text style={styles.offerPrice}>{eur(o.priceEur)}</Text>
                          </View>
                          {/* Nur der Eigentümer entscheidet, solange offen */}
                          {!isAdmin && j.status === 'open' && o.status === 'pending' ? (
                            <View style={styles.decideRow}>
                              <View style={{ flex: 1 }}><Button label="Annehmen" tone="green" onPress={() => actions.acceptOffer(j.id, o.id)} /></View>
                              <View style={{ flex: 1 }}><Button label="Ablehnen" tone="red" outline onPress={() => actions.rejectOffer(j.id, o.id)} /></View>
                            </View>
                          ) : (
                            <Badge label={os.label} tone={os.tone} />
                          )}
                        </View>
                      );
                    })
                  )}
                  {isAdmin && j.status === 'open' && (
                    <Text style={styles.adminNote}>Wartet auf Entscheidung des Eigentümers.</Text>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Tab({ label, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabOn]} activeOpacity={0.8} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  muted: { color: colors.textMuted, fontSize: font.body },

  tabs: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, alignItems: 'center' },
  tabOn: { backgroundColor: colors.blue },
  tabText: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700' },
  tabTextOn: { color: '#fff' },

  label: { color: colors.textMuted, fontSize: font.small, fontWeight: '700', marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceDark },
  chipOn: { borderColor: colors.blue, backgroundColor: '#12233f' },
  chipText: { color: colors.text, fontSize: font.small, fontWeight: '700' },
  chipSub: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1 },
  chipTextOn: { color: colors.blueSoft },

  input: {
    backgroundColor: colors.surfaceDark, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: font.body,
    minHeight: 96, textAlignVertical: 'top',
  },
  hint: { color: colors.textFaint, fontSize: font.small, marginTop: spacing.sm, textAlign: 'center' },

  between: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  jTitle: { color: colors.text, fontSize: font.body, fontWeight: '800' },
  jSub: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1 },
  jDesc: { color: colors.textMuted, fontSize: font.small, lineHeight: 18, marginBottom: spacing.sm },
  jobPhoto: { width: '100%', height: 160, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, marginBottom: spacing.sm },
  noOffer: { color: colors.textFaint, fontSize: font.small, fontStyle: 'italic' },
  offerBox: { backgroundColor: colors.surfaceDark, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.sm },
  offerName: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  offerNote: { color: colors.textMuted, fontSize: font.small, marginTop: 1 },
  offerPrice: { color: colors.goldSoft, fontSize: font.h3, fontWeight: '800', fontVariant: ['tabular-nums'] },
  decideRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  adminNote: { color: colors.textFaint, fontSize: font.small, marginTop: spacing.sm, fontStyle: 'italic' },
});
