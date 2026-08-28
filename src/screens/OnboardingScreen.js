// Onboarding – kurze Vorstellung beim ersten Start
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLang } from '../i18n';
import { colors, spacing, radius, font, useTheme, darkColors } from '../theme';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onDone }) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { t } = useLang();
  const ref = useRef(null);
  const [i, setI] = useState(0);

  const SLIDES = [
    { icon: '🏠', title: t('onb.t1'), text: t('onb.x1') },
    { icon: '💳', title: t('onb.t2'), text: t('onb.x2') },
    { icon: '🛠️', title: t('onb.t3'), text: t('onb.x3') },
  ];

  const go = (idx) => {
    ref.current?.scrollTo({ x: idx * width, animated: true });
    setI(idx);
  };
  const next = () => (i < SLIDES.length - 1 ? go(i + 1) : onDone());

  return (
    <View style={styles.root}>
      <TouchableOpacity style={styles.skip} onPress={onDone} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('onb.skip')}</Text>
      </TouchableOpacity>

      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {SLIDES.map((s, idx) => (
          <View key={idx} style={[styles.slide, { width }]}>
            <View style={styles.iconWrap}><Text style={styles.icon}>{s.icon}</Text></View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.text}>{s.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, idx) => (
          <View key={idx} style={[styles.dot, i === idx && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={next}>
          <Text style={styles.buttonText}>{i === SLIDES.length - 1 ? t('onb.start') : t('onb.next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  skip: { position: 'absolute', top: spacing.lg, right: spacing.lg, zIndex: 2, padding: spacing.sm },
  skipText: { color: colors.textMuted, fontSize: font.small, fontWeight: '700' },

  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  iconWrap: {
    width: 120, height: 120, borderRadius: radius.pill, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  icon: { fontSize: 56 },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '900', textAlign: 'center', marginBottom: spacing.md },
  text: { color: colors.textMuted, fontSize: font.body, textAlign: 'center', lineHeight: 22, maxWidth: 300 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.gold, width: 22 },

  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  button: { backgroundColor: colors.gold, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  buttonText: { color: '#1a1300', fontSize: font.h3, fontWeight: '800' },
});

const styles = makeStyles(darkColors);
