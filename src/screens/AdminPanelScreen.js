// Verwaltung – Inhalte erstellen: Ankündigung, Forderung, Benutzer
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenHeader, Card, Button } from '../components/UI';
import { useStore } from '../store/store';
import { roleLabel, roleIcon, eur } from '../utils';
import { colors, spacing, radius, font } from '../theme';

export default function AdminPanelScreen() {
  const { state, actions } = useStore();
  const [tab, setTab] = useState('ann');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Verwaltung" titleAr="الإدارة" subtitle="Inhalte erstellen & verwalten" />

        <View style={styles.tabs}>
          <Tab label="Ankündigung" active={tab === 'ann'} onPress={() => setTab('ann')} />
          <Tab label="Forderung" active={tab === 'debt'} onPress={() => setTab('debt')} />
          <Tab label="Benutzer" active={tab === 'user'} onPress={() => setTab('user')} />
        </View>

        {tab === 'ann' && <AnnouncementForm actions={actions} />}
        {tab === 'debt' && <DebtForm actions={actions} tenants={state.tenants} />}
        {tab === 'user' && <UserForm actions={actions} />}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Ankündigung ---
function AnnouncementForm({ actions }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [kind, setKind] = useState('info');
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!title.trim()) return;
    actions.addAnnouncement({ title, text, kind });
    setTitle(''); setText(''); setKind('info'); setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <Card>
      <Field label="Titel" value={title} onChangeText={setTitle} placeholder="z. B. Wasserabstellung" />
      <Text style={styles.label}>Art</Text>
      <View style={styles.chips}>
        {[['info', 'Info'], ['warning', 'Wichtig'], ['ad', 'Werbung']].map(([k, l]) => (
          <Chip key={k} label={l} on={kind === k} onPress={() => setKind(k)} />
        ))}
      </View>
      <Field label="Text" value={text} onChangeText={setText} placeholder="Details der Ankündigung…" multiline />
      <Button label={done ? '✓ Veröffentlicht' : 'Veröffentlichen'} tone={done ? 'green' : 'blue'} onPress={submit} />
    </Card>
  );
}

// --- Forderung ---
function DebtForm({ actions, tenants }) {
  const [tenantId, setTenantId] = useState(null);
  const [info, setInfo] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!tenantId || !info.trim() || !amount) return;
    actions.addDebt(tenantId, { info, amountEur: amount, category });
    setInfo(''); setAmount(''); setTenantId(null); setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <Card>
      <Text style={styles.label}>Mieter</Text>
      <View style={styles.chips}>
        {tenants.map((t) => (
          <Chip key={t.id} label={t.name} on={tenantId === t.id} onPress={() => setTenantId(t.id)} />
        ))}
      </View>
      <Field label="Beschreibung" value={info} onChangeText={setInfo} placeholder="z. B. Kaltmiete September" />
      <Field label="Betrag (€)" value={amount} onChangeText={setAmount} placeholder="z. B. 350" numeric />
      <Text style={styles.label}>Kategorie</Text>
      <View style={styles.chips}>
        {[['rent', 'Miete'], ['electricity', 'Strom'], ['gas', 'Gas'], ['other', 'Sonstige']].map(([k, l]) => (
          <Chip key={k} label={l} on={category === k} onPress={() => setCategory(k)} />
        ))}
      </View>
      <Button label={done ? '✓ Hinzugefügt' : 'Forderung anlegen'} tone={done ? 'green' : 'blue'} onPress={submit} />
      {!!amount && <Text style={styles.hint}>Wird dem Mieter als offene Forderung von {eur(Number(amount) || 0)} angezeigt.</Text>}
    </Card>
  );
}

// --- Benutzer ---
function UserForm({ actions }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tenant');
  const [msg, setMsg] = useState('');

  const submit = () => {
    if (!name.trim() || !email.trim() || !password.trim()) { setMsg('Bitte alle Felder ausfüllen.'); return; }
    const ok = actions.addUser({ name, email, password, role });
    if (ok) { setName(''); setEmail(''); setPassword(''); setRole('tenant'); setMsg('✓ Benutzer angelegt.'); }
    else setMsg('E-Mail bereits vergeben.');
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <Card>
      <Field label="Name" value={name} onChangeText={setName} placeholder="Vor- und Nachname" />
      <Field label="E-Mail" value={email} onChangeText={setEmail} placeholder="name@darna.app" />
      <Field label="Passwort" value={password} onChangeText={setPassword} placeholder="mind. 6 Zeichen" />
      <Text style={styles.label}>Rolle</Text>
      <View style={styles.chips}>
        {['tenant', 'owner', 'company', 'worker', 'admin'].map((r) => (
          <Chip key={r} label={`${roleIcon(r)} ${roleLabel(r)}`} on={role === r} onPress={() => setRole(r)} />
        ))}
      </View>
      <Button label="Benutzer anlegen" tone="blue" onPress={submit} />
      {!!msg && <Text style={styles.hint}>{msg}</Text>}
    </Card>
  );
}

function Field({ label, multiline, numeric, ...rest }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        placeholderTextColor={colors.textFaint}
        keyboardType={numeric ? 'numeric' : 'default'}
        autoCapitalize={label === 'E-Mail' ? 'none' : 'sentences'}
        multiline={multiline}
        {...rest}
      />
    </View>
  );
}

function Chip({ label, on, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
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
  tabs: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, alignItems: 'center' },
  tabOn: { backgroundColor: colors.blue },
  tabText: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700' },
  tabTextOn: { color: '#fff' },

  label: { color: colors.textMuted, fontSize: font.small, fontWeight: '700', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surfaceDark, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: font.body,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceDark },
  chipOn: { borderColor: colors.blue, backgroundColor: '#12233f' },
  chipText: { color: colors.text, fontSize: font.small, fontWeight: '700' },
  chipTextOn: { color: colors.blueSoft },
  hint: { color: colors.textFaint, fontSize: font.small, marginTop: spacing.sm, textAlign: 'center' },
});
