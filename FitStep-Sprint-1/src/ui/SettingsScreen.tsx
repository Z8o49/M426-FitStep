import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFitStep } from '../state/FitStepProvider';
import { Card, PrimaryButton } from './components';
import { colors } from './theme';

export function SettingsScreen() {
  const { settings, saveSettings } = useFitStep();
  const [goal, setGoal] = useState(String(settings.dailyGoal));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setGoal(String(settings.dailyGoal)); }, [settings.dailyGoal]);

  const save = () => {
    const value = goal.trim();
    const dailyGoal = Number(value);
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(dailyGoal) || dailyGoal < 1 || dailyGoal > 1000000) {
      setError("Gib eine ganze Zahl zwischen 1 und 1'000'000 ein.");
      setSaved(false);
      return;
    }
    saveSettings({ dailyGoal });
    setError(null);
    setSaved(true);
    Keyboard.dismiss();
  };

  return (
    <>
      <Card>
        <Text accessibilityRole="header" style={styles.title}>Schrittziel</Text>
        <Text style={styles.description}>Lege fest, wie viele Schritte du pro Tag erreichen willst.</Text>
        <TextInput
          value={goal} onChangeText={text => { setGoal(text); setError(null); setSaved(false); }}
          accessibilityLabel="Tägliches Schrittziel" testID="daily-goal-input"
          keyboardType="number-pad" returnKeyType="done" onSubmitEditing={save}
          maxLength={10} selectTextOnFocus placeholder="8000" placeholderTextColor={colors.muted}
          style={[styles.input, error && styles.invalidInput]} selectionColor={colors.orange}
        />
        {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      </Card>
      <View style={styles.saveButton}><PrimaryButton label="SPEICHERN" onPress={save} testID="save-settings" /></View>
      {saved && <Text style={styles.success} accessibilityLiveRegion="polite" testID="settings-saved">Tagesziel aktualisiert.</Text>}
      <Text style={styles.footer}>Kleine Schritte bringen dich deinem Ziel näher.</Text>
    </>
  );
}

export const settingsStyles = StyleSheet.create({
  title: { color: colors.text, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 14 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, minHeight: 62, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 20, color: colors.text, fontSize: 23, fontWeight: '800', textAlign: 'center', marginTop: 22 },
  invalidInput: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19, marginTop: 10, textAlign: 'center' },
  saveButton: { width: '75%', maxWidth: 320, alignSelf: 'center', marginVertical: 2 },
  success: { color: colors.green, fontSize: 14, textAlign: 'center', fontWeight: '600' },
  footer: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
});
const styles = settingsStyles;
