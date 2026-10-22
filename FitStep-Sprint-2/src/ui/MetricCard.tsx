import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './components';
import { Icon, IconName } from './Icon';
import { colors } from './theme';

export function MetricCard({ icon, label, value, description, testID }: {
  icon: IconName; label: string; value: string; description: string; testID?: string;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.icon}><Icon name={icon} size={32} /></View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} testID={testID}>{value}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 22 },
  icon: { width: 58, height: 58, backgroundColor: colors.orange, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minWidth: 0 },
  label: { fontSize: 16, fontWeight: '900', color: colors.orangeLight, letterSpacing: 0.3 },
  value: { fontSize: 32, lineHeight: 41, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginTop: 3 },
  description: { fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 3 },
});
