import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './components';
import { colors, formatSteps } from './theme';

type Day = { dateKey: string; shortLabel: string; steps: number; isToday: boolean };

export function WeekChart({ days }: { days: Day[] }) {
  const maximum = Math.max(1, ...days.map(day => day.steps));
  const empty = days.every(day => day.steps === 0);
  return (
    <Card>
      <Text accessibilityRole="header" style={styles.title}>Wochenstatistik</Text>
      <Text style={styles.subtitle}>Die letzten 7 Tage</Text>
      <View style={styles.chart}>
        {days.map(day => (
          <View key={day.dateKey} style={styles.column} accessible accessibilityLabel={`${day.shortLabel}, ${day.dateKey}: ${formatSteps(day.steps)} Schritte${day.isToday ? ', heute' : ''}`}>
            <Text style={styles.number} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55}>{formatSteps(day.steps)}</Text>
            <View style={styles.track}>
              {day.steps > 0 && <View style={[styles.fill, { height: Math.max(3, day.steps / maximum * 104) }]} />}
            </View>
            <Text style={[styles.day, day.isToday && styles.today]}>{day.shortLabel}</Text>
            <View style={[styles.todayDot, !day.isToday && styles.hiddenDot]} />
          </View>
        ))}
      </View>
      {empty && <Text style={styles.empty}>Deine erfassten Schritte erscheinen hier.</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontWeight: '900', fontSize: 22 },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 22, gap: 3 },
  column: { flex: 1, minWidth: 0, alignItems: 'center' },
  number: { fontSize: 9, letterSpacing: -0.15, color: colors.muted, marginBottom: 7, width: '100%', textAlign: 'center' },
  track: { width: 19, height: 104, backgroundColor: colors.border, borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' },
  fill: { width: '100%', backgroundColor: colors.orange, borderRadius: 12 },
  day: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 8 },
  today: { color: colors.orangeLight },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.orangeLight, marginTop: 4 },
  hiddenDot: { opacity: 0 },
  empty: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 12 },
});
