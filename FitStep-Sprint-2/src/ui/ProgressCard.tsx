import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Card } from './components';
import { colors, formatSteps } from './theme';

export function ProgressCard({ percent, steps, goal, remaining }: { percent: number; steps: number; goal: number; remaining: number }) {
  const fill = Math.max(0, Math.min(100, percent));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  return (
    <Card style={styles.card}>
      <View style={styles.ring} accessible accessibilityLabel={`${Math.round(percent)} Prozent des Tagesziels erreicht`}>
        <Svg width={108} height={108} viewBox="0 0 108 108">
          <Circle cx={54} cy={54} r={radius} fill="none" stroke={colors.border} strokeWidth={11} />
          {fill > 0 && <Circle cx={54} cy={54} r={radius} fill="none" stroke={colors.orange} strokeWidth={11} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - fill / 100)} rotation={-90} origin="54,54" />}
        </Svg>
        <View style={styles.ringLabel}><Text testID="progress-percent" style={styles.percent} adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={1}>{Math.round(percent)}%</Text></View>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>FORTSCHRITT</Text>
        <Text style={styles.value}>{formatSteps(steps)} / {formatSteps(goal)}</Text>
        <Text style={styles.description}>{remaining > 0 ? `Noch ${formatSteps(remaining)} Schritte bis zum Ziel` : 'Tagesziel erreicht. Weiter so!'}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 22 },
  ring: { width: 108, height: 108 },
  ringLabel: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13 },
  percent: { color: colors.orangeLight, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  content: { flex: 1, minWidth: 0 },
  label: { color: colors.orangeLight, fontSize: 15, fontWeight: '900' },
  value: { color: colors.text, fontSize: 21, fontWeight: '900', marginTop: 6 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 7 },
});
