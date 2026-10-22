import React, { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from './theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ label, onPress, disabled = false, busy = false, testID }: {
  label: string; onPress: () => void; disabled?: boolean; busy?: boolean; testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      aria-disabled={disabled || busy}
      aria-busy={busy}
      disabled={disabled || busy}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, (disabled || busy) && styles.disabled]}
    >
      {busy && <ActivityIndicator color={colors.text} />}
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

export function TextButton({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  return <Pressable accessibilityRole="button" testID={testID} onPress={onPress} style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}><Text style={styles.textButtonLabel}>{label}</Text></Pressable>;
}

export function Notice({ title, children, action, onAction, error = false }: {
  title: string; children: ReactNode; action?: string; onAction?: () => void; error?: boolean;
}) {
  return (
    <View style={[styles.notice, error && styles.errorNotice]} accessibilityLiveRegion={error ? 'polite' : 'none'}>
      <Text style={[styles.noticeTitle, error && styles.errorText]}>{title}</Text>
      <Text style={styles.noticeText}>{children}</Text>
      {action && onAction && <TextButton label={action} onPress={onAction} />}
    </View>
  );
}

export function DemoBanner() {
  return <View style={styles.demoBanner}><View style={styles.demoDot} /><Text style={styles.demoLabel}>DEMO</Text><Text style={styles.demoText}>Beispieldaten zum Ausprobieren</Text></View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: 24, padding: 20, shadowColor: '#000000', shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 2,
  },
  button: {
    minHeight: 54, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 20,
    backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10,
  },
  buttonLabel: { color: colors.text, fontWeight: '800', fontSize: 17, textAlign: 'center' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  textButton: { minHeight: 44, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  textButtonLabel: { color: colors.orangeLight, fontWeight: '700', fontSize: 14, textAlign: 'center' },
  notice: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  errorNotice: { borderColor: '#765049' },
  noticeTitle: { color: colors.text, fontWeight: '800', fontSize: 15, marginBottom: 5 },
  noticeText: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  errorText: { color: colors.danger },
  demoBanner: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.orangeTint, borderWidth: 1, borderColor: '#61402D' },
  demoDot: { height: 6, width: 6, borderRadius: 3, backgroundColor: colors.orangeLight },
  demoLabel: { color: colors.orangeLight, fontSize: 11, letterSpacing: 1, fontWeight: '900' },
  demoText: { color: '#E5B9A8', fontSize: 11, flexShrink: 1 },
});
