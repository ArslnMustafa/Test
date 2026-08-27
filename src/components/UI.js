// Wiederverwendbare UI-Bausteine (Karten, Buttons, Badges ...)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, font } from '../theme';

// Kopfbereich einer Seite: großer Titel + arabischer Untertitel
export function ScreenHeader({ title, titleAr, subtitle }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerBar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {!!titleAr && <Text style={styles.headerTitleAr}>{titleAr}</Text>}
    </View>
  );
}

// Standard-Karte
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// Farbiges Statusabzeichen (z. B. Bezahlt / Überfällig)
export function Badge({ label, tone = 'neutral' }) {
  const toneStyle = badgeTones[tone] || badgeTones.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.bg, borderColor: toneStyle.border }]}>
      <Text style={[styles.badgeText, { color: toneStyle.text }]}>{label}</Text>
    </View>
  );
}

// Button – rein visuell, ohne Funktion (wie gewünscht)
export function Button({ label, tone = 'blue', outline = false, onPress }) {
  const t = buttonTones[tone] || buttonTones.blue;
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.button,
        outline
          ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.bg }
          : { backgroundColor: t.bg },
      ]}
    >
      <Text style={[styles.buttonText, { color: outline ? t.bg : t.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Kleiner "Chip"-Button für Listeneinträge
export function SmallButton({ label, tone = 'blue' }) {
  const t = buttonTones[tone] || buttonTones.blue;
  return (
    <View style={[styles.smallButton, { backgroundColor: t.bg }]}>
      <Text style={[styles.smallButtonText, { color: t.text }]}>{label}</Text>
    </View>
  );
}

// Fortschrittsbalken
export function ProgressBar({ progress = 0.5, tone = 'green' }) {
  const t = buttonTones[tone] || buttonTones.green;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: t.bg }]} />
    </View>
  );
}

// Grauer Platzhalter für Bilder / Galerien
export function ImagePlaceholder({ style }) {
  return <View style={[styles.imagePlaceholder, style]} />;
}

// Nachrichten-Karte (Datum / Absender + Inhalt) – Layout wie in der Referenz
export function MessageCard({ date, party, partyLabel = 'Von', text }) {
  return (
    <View style={styles.msgCard}>
      <View style={styles.msgHead}>
        <View>
          <Text style={styles.msgHeadLabel}>DATUM</Text>
          <Text style={styles.msgHeadValue}>{date}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.msgHeadLabel}>{partyLabel.toUpperCase()}</Text>
          <Text style={styles.msgHeadValue}>{party}</Text>
        </View>
      </View>
      <View style={styles.msgDivider} />
      <Text style={styles.msgHeadLabel}>INHALT</Text>
      <Text style={styles.msgText}>{text}</Text>
    </View>
  );
}

const badgeTones = {
  neutral: { bg: colors.surfaceAlt, border: colors.border, text: colors.textMuted },
  green: { bg: colors.greenDark, border: '#1f5130', text: colors.greenText },
  red: { bg: colors.redDark, border: colors.redBorder, text: '#f87171' },
  blue: { bg: '#12233f', border: '#1e3a63', text: colors.blueSoft },
  gold: { bg: '#3a2a0d', border: '#5c4212', text: colors.goldSoft },
};

const buttonTones = {
  blue: { bg: colors.blue, text: '#ffffff' },
  gold: { bg: colors.gold, text: '#1a1300' },
  green: { bg: colors.green, text: '#04210f' },
  red: { bg: colors.red, text: '#2a0708' },
  ghost: { bg: colors.surfaceAlt, text: colors.text },
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerBar: {
    width: 4,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  headerTitle: { color: colors.text, fontSize: font.h1, fontWeight: '800' },
  headerSubtitle: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  headerTitleAr: { color: colors.text, fontSize: font.h2, fontWeight: '700', writingDirection: 'rtl' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: font.tiny, fontWeight: '700' },

  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: font.body, fontWeight: '700' },

  smallButton: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  smallButtonText: { fontSize: font.small, fontWeight: '700' },

  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceDark,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill },

  imagePlaceholder: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    flex: 1,
    minHeight: 64,
  },

  msgCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  msgHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  msgHeadLabel: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '700', letterSpacing: 0.5 },
  msgHeadValue: { color: colors.text, fontSize: font.small, fontWeight: '700', marginTop: 1 },
  msgDivider: { height: 1, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: colors.border, marginVertical: spacing.sm },
  msgText: { color: colors.textMuted, fontSize: font.small, lineHeight: 19, marginTop: spacing.xs },
});
