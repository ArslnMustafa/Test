// Zentrales Design-System für die Darna App – mit Hell/Dunkel-Theme.
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'darna:theme:v1';

// Dunkles Palette (Standard / Fallback)
export const darkColors = {
  bg: '#0a0e1a',
  bgGradientTop: '#111a2e',
  surface: '#161e30',
  surfaceAlt: '#1c2740',
  surfaceDark: '#10151f',
  border: '#243049',

  text: '#e7ecf5',
  textMuted: '#9aa7bd',
  textFaint: '#5f6c85',

  gold: '#f5a623',
  goldSoft: '#f5b942',
  blue: '#3b82f6',
  blueSoft: '#60a5fa',
  green: '#22c55e',
  greenDark: '#14351f',
  greenText: '#4ade80',
  red: '#ef4444',
  redDark: '#3a1418',
  redBorder: '#5b2026',
  purple: '#8b5cf6',
  purpleDark: '#221a3d',

  overlay: 'rgba(0,0,0,0.55)',
};

// Helles Palette
export const lightColors = {
  bg: '#eef2f8',
  bgGradientTop: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#eaeef6',
  surfaceDark: '#e6ebf3',
  border: '#dbe2ee',

  text: '#141a26',
  textMuted: '#586074',
  textFaint: '#8b95a8',

  gold: '#dd8600',
  goldSoft: '#9a6500',
  blue: '#2563eb',
  blueSoft: '#1d4ed8',
  green: '#16a34a',
  greenDark: '#d9f7e3',
  greenText: '#15803d',
  red: '#dc2626',
  redDark: '#fdeaea',
  redBorder: '#f3b4b4',
  purple: '#7c3aed',
  purpleDark: '#ece7fb',

  overlay: 'rgba(15,23,42,0.35)',
};

// Rückwärtskompatibler Export (Dunkel) – Fallback für nicht umgestellte Stellen
export const colors = darkColors;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };
export const font = { h1: 26, h2: 20, h3: 16, body: 14, small: 12, tiny: 11 };

// ---- Theme-Context ----
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => { if (v === 'light' || v === 'dark') setMode(v); }).catch(() => {});
  }, []);

  const setThemeMode = (m) => { setMode(m); AsyncStorage.setItem(THEME_KEY, m).catch(() => {}); };
  const toggle = () => setThemeMode(mode === 'dark' ? 'light' : 'dark');

  const value = { mode, colors: mode === 'light' ? lightColors : darkColors, toggle, setThemeMode };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { mode: 'dark', colors: darkColors, toggle: () => {}, setThemeMode: () => {} };
  return ctx;
}
