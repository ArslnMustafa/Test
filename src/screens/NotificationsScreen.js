// Mieter – Bildirimler (Benachrichtigungen): Nachrichten der Verwaltung
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenHeader, Card, MessageCard } from '../components/UI';
import { useStore } from '../store/store';
import { when } from '../utils';
import { colors, spacing, font } from '../theme';

export default function NotificationsScreen() {
  const { state, currentUser } = useStore();
  const nameFor = (id) => (state.users.find((u) => u.id === id)?.name) || 'Verwaltung';
  const msgs = (state.messages || [])
    .filter((m) => m.toUserId === currentUser?.id)
    .sort((a, b) => b.at - a.at);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Benachrichtigungen" titleAr="الإشعارات" subtitle="Mitteilungen der Verwaltung" />
      {msgs.length === 0 ? (
        <Card><Text style={styles.muted}>Keine neuen Benachrichtigungen.</Text></Card>
      ) : (
        msgs.map((m) => (
          <MessageCard key={m.id} date={when(m.at)} party={nameFor(m.fromUserId)} partyLabel="Absender" text={m.text} />
        ))
      )}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  muted: { color: colors.textMuted, fontSize: font.body },
});
