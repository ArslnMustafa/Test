// Wiederverwendbare Dialoge: Formular-Dialog & Aktions-Menü
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, radius, font } from '../theme';

// Halbtransparenter Hintergrund, der den Dialog zentriert
function Backdrop({ children, onClose }) {
  return (
    <View style={styles.backdrop}>
      <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>{children}</View>
    </View>
  );
}

// Formular-Dialog: erzeugt Eingabefelder aus `fields`
// fields = [{ key, label, placeholder, numeric }]
export function FormModal({ visible, title, fields = [], submitLabel = 'Speichern', onSubmit, onClose }) {
  const [values, setValues] = useState({});

  // Bei jedem Öffnen die Felder leeren
  useEffect(() => {
    if (visible) setValues({});
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Backdrop onClose={onClose}>
        <Text style={styles.title}>{title}</Text>
        <ScrollView keyboardShouldPersistTaps="handled">
          {fields.map((f) => (
            <View key={f.key} style={{ marginBottom: spacing.md }}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={colors.textFaint}
                keyboardType={f.numeric ? 'numeric' : 'default'}
                value={values[f.key] ?? ''}
                onChangeText={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.btnGhostText}>Abbrechen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            activeOpacity={0.8}
            onPress={() => { onSubmit(values); onClose(); }}
          >
            <Text style={styles.btnPrimaryText}>{submitLabel}</Text>
          </TouchableOpacity>
        </View>
      </Backdrop>
    </Modal>
  );
}

// Aktions-Menü: Liste auswählbarer Optionen
// options = [{ key, icon, title, subtitle, danger, onPress }]
export function ActionSheet({ visible, title, options = [], onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Backdrop onClose={onClose}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        {options.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[styles.action, o.danger && styles.actionDanger]}
            activeOpacity={0.8}
            onPress={() => { o.onPress && o.onPress(); onClose(); }}
          >
            <View style={styles.actionIcon}><Text style={{ fontSize: 18 }}>{o.icon}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, o.danger && { color: '#f87171' }]}>{o.title}</Text>
              {!!o.subtitle && <Text style={styles.actionSub}>{o.subtitle}</Text>}
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.btn, styles.btnGhost, { marginTop: spacing.sm }]} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.btnGhostText}>Abbrechen</Text>
        </TouchableOpacity>
      </Backdrop>
    </Modal>
  );
}

// Bestätigungs-Dialog ("Sind Sie sicher?")
export function ConfirmModal({ visible, title, message, confirmLabel = 'Bestätigen', cancelLabel = 'Abbrechen', danger = false, onConfirm, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Backdrop onClose={onClose}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        {!!message && <Text style={styles.message}>{message}</Text>}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.btnGhostText}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, danger ? styles.btnDanger : styles.btnPrimary]}
            activeOpacity={0.8}
            onPress={() => { onConfirm && onConfirm(); onClose(); }}
          >
            <Text style={danger ? styles.btnDangerText : styles.btnPrimaryText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </Backdrop>
    </Modal>
  );
}

// Einfacher Info-/Detail-Dialog mit freiem Inhalt
export function InfoModal({ visible, title, children, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Backdrop onClose={onClose}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        <ScrollView style={{ maxHeight: 360 }}>{children}</ScrollView>
        <TouchableOpacity style={[styles.btn, styles.btnGhost, { marginTop: spacing.md }]} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.btnGhostText}>Schließen</Text>
        </TouchableOpacity>
      </Backdrop>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.lg },
  backdropTouch: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  title: { color: colors.text, fontSize: font.h3, fontWeight: '800', marginBottom: spacing.md },
  message: { color: colors.textMuted, fontSize: font.body, lineHeight: 20, marginBottom: spacing.lg },

  label: { color: colors.textMuted, fontSize: font.small, marginBottom: spacing.xs, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: font.body,
  },

  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  btnGhost: { backgroundColor: colors.surfaceAlt },
  btnGhostText: { color: colors.text, fontWeight: '700', fontSize: font.body },
  btnPrimary: { backgroundColor: colors.blue },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: font.body },
  btnDanger: { backgroundColor: colors.red },
  btnDangerText: { color: '#2a0708', fontWeight: '700', fontSize: font.body },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  actionDanger: { borderColor: colors.redBorder },
  actionIcon: {
    width: 40, height: 40, borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  actionTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  actionSub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
});
