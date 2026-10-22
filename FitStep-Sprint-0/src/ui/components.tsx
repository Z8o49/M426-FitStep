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
});
