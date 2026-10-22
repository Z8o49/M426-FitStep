import React, { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFitStep } from '../state/FitStepProvider';
import { Card, PrimaryButton } from './components';
import { Icon } from './Icon';
import { colors } from './theme';

export function PersonalGoalsCard() {
  const { goals, addGoal, toggleGoal, deleteGoal } = useFitStep();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const completed = goals.filter(goal => goal.completed).length;

  const add = () => {
    const value = text.trim();
    if (value.length < 1 || value.length > 120) {
      setError('Beschreibe dein Ziel mit 1 bis 120 Zeichen.');
      return;
    }
    addGoal(value);
    setText('');
    setError(null);
    Keyboard.dismiss();
  };

  return (
    <Card>
      <Text accessibilityRole="header" style={styles.title}>Eigene Ziele</Text>
      <Text style={styles.description}>Erstelle weitere Ziele und hake sie ab, wenn du sie erreicht hast.</Text>
      <TextInput
        value={text} onChangeText={value => { setText(value); setError(null); }}
        accessibilityLabel="Eigenes Ziel" testID="personal-goal-input"
        placeholder="z.B. 1.5 Liter Wasser trinken" placeholderTextColor={colors.muted}
        maxLength={120} returnKeyType="done" onSubmitEditing={add} selectionColor={colors.orange}
        style={[styles.input, error && styles.invalidInput]}
      />
      {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <View style={styles.addButton}><PrimaryButton label="ZIEL HINZUFÜGEN" onPress={add} testID="add-personal-goal" /></View>
      <View style={styles.list}>
        {goals.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>Dein nächstes Ziel beginnt hier.</Text><Text style={styles.emptyText}>Füge etwas hinzu, das du heute erreichen möchtest.</Text></View> : goals.map(goal => (
          <View key={goal.id} style={styles.row}>
            <Pressable
              accessibilityRole="checkbox" accessibilityState={{ checked: goal.completed }}
              aria-checked={goal.completed}
              accessibilityLabel={goal.text} testID={`goal-toggle-${goal.id}`} onPress={() => toggleGoal(goal.id)}
              style={({ pressed }) => [styles.goalButton, pressed && styles.pressed]}
            >
              <View style={[styles.checkbox, goal.completed && styles.checked]}>{goal.completed && <Icon name="check" size={17} color={colors.background} />}</View>
              <Text style={[styles.goalText, goal.completed && styles.completedText]}>{goal.text}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button" accessibilityLabel={`Ziel löschen: ${goal.text}`} testID={`goal-delete-${goal.id}`}
              onPress={() => deleteGoal(goal.id)} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
            ><Icon name="trash" size={23} color={colors.orangeLight} /></Pressable>
          </View>
        ))}
      </View>
      {goals.length > 0 && <Text style={styles.summary} accessibilityLiveRegion="polite">{completed} von {goals.length} {goals.length === 1 ? 'Ziel' : 'Zielen'} erledigt</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 14 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, minHeight: 58, paddingHorizontal: 13, paddingVertical: 13, borderRadius: 20, color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 22 },
  invalidInput: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19, marginTop: 10, textAlign: 'center' },
  addButton: { marginTop: 12 },
  list: { gap: 10, marginTop: 20 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, paddingHorizontal: 8, paddingVertical: 5 },
  goalButton: { minHeight: 48, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 7, paddingVertical: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderColor: colors.muted, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checked: { borderColor: colors.orange, backgroundColor: colors.orange },
  goalText: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  completedText: { color: colors.muted, textDecorationLine: 'line-through' },
  deleteButton: { height: 44, width: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
  empty: { paddingVertical: 17, paddingHorizontal: 8, alignItems: 'center' },
  emptyTitle: { color: colors.text, fontWeight: '700', fontSize: 14, textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 7 },
  summary: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 16 },
});
