import React, { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFitStep } from '../state/FitStepProvider';
import { Card, Notice, PrimaryButton, TextButton } from './components';
import { Icon } from './Icon';
import { colors, formatSteps } from './theme';

const statusTitles = {
  idle: 'Pedometer ist bereit', checking: 'Sensor wird geprüft', 'permission-needed': 'Zugriff erlauben',
  active: 'Pedometer ist aktiv', denied: 'Zugriff nicht erlaubt', unavailable: 'Kein Sensor verfügbar', error: 'Sensor nicht erreichbar',
};
const permissionLabels = { unknown: 'wird geprüft', undetermined: 'noch nicht erteilt', granted: 'erlaubt', denied: 'nicht erlaubt' };

export function PedometerScreen() {
  const { mode, setMode, todaySteps, totalSteps, activeDays, sensor, addDemoSteps, resetDemo } = useFitStep();
  const [actionError, setActionError] = useState<string | null>(null);
  const demo = mode === 'demo';
  const busy = sensor.status === 'checking';
  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try { await action(); } catch { setActionError('Das hat gerade nicht geklappt. Bitte versuche es erneut.'); }
  };
  return (
    <>
      <Card style={styles.statusCard}>
        <View style={[styles.dot, !demo && sensor.status !== 'active' && styles.inactiveDot]} />
        <Text accessibilityRole="header" style={styles.statusTitle}>{demo ? 'Demo ist aktiv' : statusTitles[sensor.status]}</Text>
        {demo ? <Text style={styles.statusMeta}>Beispieldaten · Sensor pausiert</Text> : <>
          <Text style={styles.statusMeta}>Sensor: {sensor.available === null ? 'wird geprüft' : sensor.available ? 'verfügbar' : 'nicht verfügbar'}</Text>
          <Text style={styles.statusMeta}>Berechtigung: {permissionLabels[sensor.permission]}</Text>
          {!!sensor.message && <Text style={styles.statusMessage}>{sensor.message}</Text>}
        </>}
        {!demo && sensor.status === 'permission-needed' && <View style={styles.action}><PrimaryButton label="Bewegungszugriff erlauben" onPress={() => void runAction(sensor.requestPermission)} busy={busy} testID="grant-permission" /></View>}
        {!demo && sensor.status === 'denied' && Platform.OS !== 'web' && <View style={styles.action}><PrimaryButton label="Einstellungen öffnen" onPress={() => void runAction(Linking.openSettings)} /></View>}
        {!demo && sensor.status !== 'active' && sensor.status !== 'checking' && <TextButton label="Sensor erneut prüfen" onPress={() => void runAction(sensor.refresh)} testID="refresh-sensor" />}
      </Card>
      {actionError && <Notice title="Aktion nicht möglich" error>{actionError}</Notice>}
      <Card style={styles.stepsCard}>
        <Text style={styles.sectionTitle}>Schritte heute</Text>
        <Text style={styles.steps} testID="pedometer-steps" adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.5}>{formatSteps(todaySteps)}</Text>
      </Card>
      <Card>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Seit erster Nutzung</Text>
        <View style={styles.statRow}>
          <View style={styles.statIcon}><Icon name="calendar" size={25} /></View>
          <View style={styles.statContent}><Text style={styles.statLabel}>Tage</Text><Text style={styles.statValue}>{formatSteps(activeDays)}</Text></View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statIcon}><Icon name="steps" size={25} /></View>
          <View style={styles.statContent}><Text style={styles.statLabel}>Schritte total</Text><Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{formatSteps(totalSteps)}</Text></View>
        </View>
      </Card>
      <Card>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Datenquelle</Text>
        <View style={styles.modeSwitch}>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: !demo }} {...(Platform.OS === 'web' ? { 'aria-pressed': !demo } : {})} testID="mode-live" onPress={() => setMode('live')} style={[styles.modeOption, !demo && styles.modeSelected]}><Text style={[styles.modeText, !demo && styles.selectedText]}>Echte Schritte</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: demo }} {...(Platform.OS === 'web' ? { 'aria-pressed': demo } : {})} testID="mode-demo" onPress={() => setMode('demo')} style={[styles.modeOption, demo && styles.modeSelected]}><Text style={[styles.modeText, demo && styles.selectedText]}>Demo</Text></Pressable>
        </View>
        <Text style={styles.description}>{demo ? 'Probiere Fortschritt und Wochenstatistik mit Beispieldaten aus. Über die Buttons fügst du Schritte hinzu.' : 'Nutze den Bewegungssensor deines Smartphones. Welche Schritte erfasst werden, erklärt der Sensorstatus oben.'}</Text>
        {demo && <>
          <View style={styles.demoActions}>
            <View style={styles.flex}><PrimaryButton label="+100" onPress={() => addDemoSteps(100)} testID="demo-add-100" /></View>
            <View style={styles.flex}><PrimaryButton label="+1'000" onPress={() => addDemoSteps(1000)} testID="demo-add-1000" /></View>
          </View>
          <TextButton label="Demo zurücksetzen" onPress={resetDemo} testID="demo-reset" />
        </>}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  statusCard: { alignItems: 'center', paddingVertical: 24 },
  dot: { height: 17, width: 17, borderRadius: 9, backgroundColor: colors.orange, marginBottom: 16, shadowColor: colors.orange, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 0 }, shadowRadius: 14 },
  inactiveDot: { backgroundColor: colors.muted, shadowOpacity: 0 },
  statusTitle: { color: colors.text, fontWeight: '900', fontSize: 23, textAlign: 'center', marginBottom: 14 },
  statusMeta: { color: colors.muted, fontSize: 16, lineHeight: 25, textAlign: 'center', fontWeight: '600' },
  statusMessage: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 12 },
  action: { width: '100%', marginTop: 18 },
  stepsCard: { alignItems: 'center', paddingVertical: 24 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 23, textAlign: 'center' },
  steps: { color: colors.orange, fontSize: 57, lineHeight: 73, fontWeight: '900', marginTop: 15, maxWidth: '100%' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceRaised, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 14 },
  statIcon: { backgroundColor: colors.orange, borderRadius: 15, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  statContent: { flex: 1, minWidth: 0 },
  statLabel: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  statValue: { color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 3 },
  modeSwitch: { flexDirection: 'row', backgroundColor: colors.background, padding: 5, borderRadius: 17, marginTop: 18, gap: 5 },
  modeOption: { flex: 1, paddingHorizontal: 7, minHeight: 45, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  modeSelected: { backgroundColor: colors.orange },
  modeText: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  selectedText: { color: colors.text },
  description: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 14 },
  demoActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  flex: { flex: 1 },
});
