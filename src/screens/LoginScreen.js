// Startbildschirm – Anmeldung (Authentifizierung)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useStore } from '../store/store';
import { useLang } from '../i18n';
import { roleIcon } from '../utils';
import { colors, spacing, radius, font } from '../theme';

export default function LoginScreen() {
  const { state, actions } = useStore();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!email || !password) {
      setError(t('login.errEmpty'));
      return;
    }
    const ok = actions.login(email, password);
    if (!ok) setError(t('login.errWrong'));
  };

  // Schnell-Login: füllt die Felder eines Demo-Kontos aus
  const quickFill = (u) => {
    setEmail(u.email);
    setPassword(u.password);
    setError('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Marke */}
        <View style={styles.brand}>
          <View style={styles.logo}><Text style={styles.logoText}>د</Text></View>
          <Text style={styles.title}>Darna</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
        </View>

        {/* Anmeldeformular */}
        <View style={styles.card}>
          <Text style={styles.label}>{t('login.email')}</Text>
          <TextInput
            style={styles.input}
            placeholder="name@darna.app"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
          />

          <Text style={[styles.label, { marginTop: spacing.md }]}>{t('login.password')}</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textFaint}
            secureTextEntry
            value={password}
            onChangeText={(v) => { setPassword(v); setError(''); }}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={submit}>
            <Text style={styles.buttonText}>{t('login.signIn')}</Text>
          </TouchableOpacity>
        </View>

        {/* Demo-Konten (zum schnellen Testen) */}
        <Text style={styles.demoTitle}>{t('login.demo')}</Text>
        {state.users.map((u) => (
          <TouchableOpacity key={u.id} style={styles.demoRow} activeOpacity={0.8} onPress={() => quickFill(u)}>
            <View style={styles.demoIcon}><Text style={{ fontSize: 18 }}>{roleIcon(u.role)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.demoName}>{u.name} · {t('role.' + u.role)}</Text>
              <Text style={styles.demoCred}>{u.email} · {u.password}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingTop: spacing.xxl },

  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 72, height: 72, borderRadius: radius.xl,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: { fontSize: 38, fontWeight: '900', color: '#1a1300' },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.xs },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  label: { color: colors.textMuted, fontSize: font.small, fontWeight: '600', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.body,
  },
  error: { color: '#f87171', fontSize: font.small, marginTop: spacing.md },
  button: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: { color: '#1a1300', fontSize: font.h3, fontWeight: '800' },

  demoTitle: { color: colors.textMuted, fontSize: font.small, fontWeight: '700', marginBottom: spacing.sm },
  demoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  demoIcon: {
    width: 40, height: 40, borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  demoName: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  demoCred: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
});
