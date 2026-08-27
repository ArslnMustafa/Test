// Nachrichten – Verwaltung/Eigentümer sendet an Bewohner; alle sehen ihren Posteingang
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenHeader, Card, MessageCard, Button } from '../components/UI';
import { useStore } from '../store/store';
import { when, roleLabel, roleIcon } from '../utils';
import { colors, spacing, radius, font } from '../theme';

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
          <Tab label={`Posteingang${inbox.length ? ` (${inbox.length})` : ''}`} active={tab === 'inbox'} onPress={() => setTab('inbox')} />
          <Tab label="Gesendet" active={tab === 'sent'} onPress={() => setTab('sent')} />
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

        {/* --- Gesendet --- */}
        {tab === 'sent' && (
          <View style={{ marginTop: spacing.sm }}>
            {outbox.length === 0
              ? <Card><Text style={styles.muted}>Noch keine Nachrichten gesendet.</Text></Card>
              : outbox.map((m) => (
                  <MessageCard key={m.id} date={when(m.at)} party={nameFor(m.toUserId)} partyLabel="An" text={m.text} />
                ))}
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
});
