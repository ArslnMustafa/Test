// Darna – ImmoScout-ähnliche App für syrischstämmige Eigentümer in Deutschland
// Einfache, eigene Bottom-Tab-Navigation (ohne externe Navigations-Bibliothek).
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import RentScreen from './src/screens/RentScreen';
import MarketScreen from './src/screens/MarketScreen';
import CraftsmenScreen from './src/screens/CraftsmenScreen';
import FundScreen from './src/screens/FundScreen';
import { colors, spacing, font } from './src/theme';

const TABS = [
  { key: 'home', label: 'Home', icon: '🏠', screen: HomeScreen },
  { key: 'rent', label: 'Miete', icon: '📋', screen: RentScreen },
  { key: 'market', label: 'Markt', icon: '🏢', screen: MarketScreen },
  { key: 'crafts', label: 'Handwerker', icon: '👷', screen: CraftsmenScreen },
  { key: 'fund', label: 'Fonds', icon: '📈', screen: FundScreen },
];

export default function App() {
  const [active, setActive] = useState('home');
  const ActiveScreen = TABS.find((t) => t.key === active).screen;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Aktueller Bildschirm */}
      <View style={styles.body}>
        <ActiveScreen />
      </View>

      {/* Untere Navigationsleiste */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => setActive(tab.key)}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              {isActive && <View style={styles.tabDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  body: { flex: 1 },

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
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginTop: 2,
  },
});
