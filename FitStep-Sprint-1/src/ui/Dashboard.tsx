import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useFitStep } from '../state/FitStepProvider';
import { Notice } from './components';
import { MetricCard } from './MetricCard';
import { ProgressCard } from './ProgressCard';
import { WeekChart } from './WeekChart';
import { colors, formatSteps } from './theme';

export function Dashboard({ onOpenPedometer }: { onOpenPedometer: () => void }) {
  const { mode, todaySteps, settings, progress, week, sensor } = useFitStep();
  return (
    <>
      <Text accessibilityRole="header" style={styles.greeting}>Willkommen!</Text>
      <MetricCard icon="steps" label="SCHRITTE" value={formatSteps(todaySteps)} description="Heute erfasste Schritte" testID="dashboard-steps" />
      <MetricCard icon="flag" label="TAGESZIEL" value={formatSteps(settings.dailyGoal)} description="Dein gesetztes Schrittziel" testID="dashboard-goal" />
      <ProgressCard percent={progress.percent} steps={todaySteps} goal={settings.dailyGoal} remaining={progress.remaining} />
      <WeekChart days={week} />
      {mode === 'live' && sensor.status !== 'active' && <Notice title="Bereit für deine ersten Schritte?" action="Pedometer öffnen" onAction={onOpenPedometer}>Prüfe deinen Bewegungssensor oder probiere die App mit klar gekennzeichneten Demodaten aus.</Notice>}
    </>
  );
}

const styles = StyleSheet.create({ greeting: { color: colors.text, fontSize: 29, lineHeight: 37, fontWeight: '900', marginBottom: 5, paddingHorizontal: 1 } });
