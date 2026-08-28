// Darna – ImmoScout-ähnliche App für syrischstämmige Eigentümer in Deutschland
// Eigene Bottom-Tab-Navigation + lokale Datenbank (Store).
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import RentScreen from './src/screens/RentScreen';
import MyRentScreen from './src/screens/MyRentScreen';
import TenantHomeScreen from './src/screens/TenantHomeScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import TenantMenuScreen from './src/screens/TenantMenuScreen';
import MarketScreen from './src/screens/MarketScreen';
import CraftsmenScreen from './src/screens/CraftsmenScreen';
import AdminOwnersScreen from './src/screens/AdminOwnersScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';
import JobsScreen from './src/screens/JobsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import FundScreen from './src/screens/FundScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { StoreProvider, useStore } from './src/store/store';
import { InfoModal } from './src/components/Modals';
import { Button } from './src/components/UI';
import { notify } from './src/notify';
import { roleLabel, roleIcon } from './src/utils';
import { colors, spacing, font, radius } from './src/theme';

const ONBOARD_KEY = 'darna:onboarded:v1';

// Alle verfügbaren Tabs
const TAB_DEFS = {
  home:    { key: 'home',    label: 'Home',        icon: '🏠', screen: HomeScreen },
  rent:    { key: 'rent',    label: 'Miete',       icon: '📋', screen: RentScreen },
  verwaltung: { key: 'verwaltung', label: 'Verwaltung', icon: '⚙️', screen: AdminPanelScreen },
  // Mieter-Modul (Wohnungsverwaltung)
  start:   { key: 'start',   label: 'Startseite',  icon: '🏠', screen: TenantHomeScreen },
  bildirim:{ key: 'bildirim',label: 'Mitteilungen', icon: '🔔', screen: NotificationsScreen },
  odeme:   { key: 'odeme',   label: 'Zahlung',     icon: '💳', screen: PaymentScreen },
  menu:    { key: 'menu',    label: 'Menü',        icon: '☰', screen: TenantMenuScreen },
  market:  { key: 'market',  label: 'Markt',       icon: '🏢', screen: MarketScreen },
  crafts:  { key: 'crafts',  label: 'Handwerker',  icon: '👷', screen: CraftsmenScreen },
  owners:  { key: 'owners',  label: 'Eigentümer',  icon: '🏘️', screen: AdminOwnersScreen },
  jobs:    { key: 'jobs',    label: 'Aufträge',    icon: '🛠️', screen: JobsScreen },
  posta:   { key: 'posta',   label: 'Post',        icon: '✉️', screen: MessagesScreen },
  fund:    { key: 'fund',    label: 'Fonds',       icon: '📈', screen: FundScreen },
};

// Welche Tabs sieht welche Rolle
const ROLE_TABS = {
  admin:   ['home', 'owners', 'verwaltung', 'posta', 'market'],
  owner:   ['home', 'rent', 'posta', 'market', 'fund'],
  tenant:  ['start', 'bildirim', 'odeme', 'menu'],
  worker:  ['jobs', 'market'],
  company: ['jobs', 'market'],
};

function Shell() {
  const { state, actions, currentUser } = useStore();
  const [active, setActive] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  // Kurzer Ladezustand, bis die Datenbank aus dem Speicher gelesen ist
  if (!state.loaded) {
    return (
      <View style={[styles.body, styles.center]}>
        <ActivityIndicator color={colors.gold} size="large" />
        <Text style={styles.loadingText}>Darna wird geladen…</Text>
      </View>
    );
  }

  // Nicht angemeldet → Startbildschirm (Login)
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Tabs je nach Rolle; aktiver Tab fällt auf den ersten gültigen zurück
  const tabs = (ROLE_TABS[currentUser.role] || ROLE_TABS.admin).map((k) => TAB_DEFS[k]);
  const activeKey = tabs.find((t) => t.key === active) ? active : tabs[0].key;
  const ActiveScreen = tabs.find((t) => t.key === activeKey).screen;

  return (
    <>
      {/* Kopfzeile: angemeldeter Benutzer + Abmelden */}
      <View style={styles.topBar}>
        <View style={styles.userChip}>
          <Text style={styles.userIcon}>{roleIcon(currentUser.role)}</Text>
          <View>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.userRole}>{roleLabel(currentUser.role)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <TouchableOpacity style={styles.gearBtn} activeOpacity={0.8} onPress={() => setSettingsOpen(true)}>
            <Text style={styles.gearText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={actions.logout}>
            <Text style={styles.logoutText}>Abmelden</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Einstellungen */}
      <InfoModal visible={settingsOpen} title="Einstellungen" onClose={() => setSettingsOpen(false)}>
        <Text style={styles.setLabel}>Benachrichtigungen</Text>
        <Text style={styles.setText}>Erhalten Sie Hinweise zu Zahlungen, Mängeln und Nachrichten.</Text>
        <Button
          label={testMsg || 'Test-Benachrichtigung senden'}
          tone="blue"
          onPress={async () => { const ok = await notify('Darna', 'Test-Benachrichtigung ✓'); setTestMsg(ok ? '✓ Gesendet' : 'Nicht verfügbar auf diesem Gerät'); setTimeout(() => setTestMsg(''), 2500); }}
        />
        <Text style={[styles.setText, { marginTop: spacing.lg }]}>Weitere Optionen (Sprache, Design) folgen in Kürze.</Text>
      </InfoModal>

      <View style={styles.body}>
        <ActiveScreen />
      </View>

      {/* Untere Navigationsleiste (je nach Rolle) */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <TouchableOpacity key={tab.key} style={styles.tabItem} activeOpacity={0.7} onPress={() => setActive(tab.key)}>
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              {isActive && <View style={styles.tabDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

export default function App() {
  // Onboarding-Status: null = wird geladen, false = zeigen, true = fertig
  const [onboarded, setOnboarded] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARD_KEY)
      .then((v) => setOnboarded(v === '1'))
      .catch(() => setOnboarded(true));
  }, []);

  const finishOnboarding = () => {
    setOnboarded(true);
    AsyncStorage.setItem(ONBOARD_KEY, '1').catch(() => {});
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {onboarded === false ? (
        <OnboardingScreen onDone={finishOnboarding} />
      ) : onboarded === null ? (
        <View style={[styles.body, styles.center]}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <StoreProvider>
          <Shell />
        </StoreProvider>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  body: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: colors.textMuted, fontSize: font.body },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  userChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  userIcon: { fontSize: 22 },
  userName: { color: colors.text, fontSize: font.small, fontWeight: '700' },
  userRole: { color: colors.gold, fontSize: font.tiny, fontWeight: '600' },
  gearBtn: {
    width: 34, height: 34, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  gearText: { fontSize: 16 },
  logoutBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  logoutText: { color: colors.textMuted, fontSize: font.small, fontWeight: '700' },
  setLabel: { color: colors.text, fontSize: font.body, fontWeight: '800', marginBottom: spacing.xs },
  setText: { color: colors.textMuted, fontSize: font.small, lineHeight: 18, marginBottom: spacing.md },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 20, opacity: 0.55 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: font.tiny, color: colors.textFaint, fontWeight: '600' },
  tabLabelActive: { color: colors.gold },
  tabDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.gold, marginTop: 2 },
});
