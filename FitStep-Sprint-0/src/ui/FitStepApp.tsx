import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton } from './components';
import { Icon, IconName } from './Icon';
import { Shell, TabId } from './Shell';
import { colors } from './theme';

const pages: Record<TabId, { icon: IconName; title: string; description: string; button: string; next: TabId }> = {
  dashboard: { icon: 'home', title: 'Dein erster Schritt.', description: 'Hier entsteht deine persönliche Übersicht für Schritte, Tagesziele und Fortschritt.', button: 'Pedometer öffnen', next: 'pedometer' },
  pedometer: { icon: 'steps', title: 'Jeder Schritt zählt.', description: 'Hier kannst du bald deine Schritte und den Status deines Bewegungssensors sehen.', button: 'Settings öffnen', next: 'settings' },
  settings: { icon: 'settings', title: 'Dein Tempo. Dein Ziel.', description: 'Hier erhältst du bald die Einstellungen für dein persönliches Schrittziel.', button: 'Zum Dashboard', next: 'dashboard' },
};

export default function FitStepApp() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const page = pages[activeTab];
  return (
      <Shell activeTab={activeTab} onTabChange={setActiveTab}>
        <Text style={styles.wordmark}>FITSTEP</Text>
        <Card style={styles.card}>
          <View style={styles.icon}><Icon name={page.icon} size={44} /></View>
          <Text style={styles.heading}>{page.title}</Text>
          <Text style={styles.description}>{page.description}</Text>
          <View style={styles.button}><PrimaryButton label={page.button} onPress={() => setActiveTab(page.next)} /></View>
        </Card>
        <Text style={styles.footer}>Kleine Schritte. Grosse Ziele.</Text>
      </Shell>
  );
}

const styles = StyleSheet.create({
  wordmark: { color: colors.orangeLight, fontSize: 13, fontWeight: '800', letterSpacing: 3, paddingHorizontal: 4 },
  card: { alignItems: 'center', paddingVertical: 36 },
  icon: { width: 88, height: 88, borderRadius: 28, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  heading: { color: colors.text, fontSize: 29, lineHeight: 36, fontWeight: '900', textAlign: 'center' },
  description: { color: colors.muted, fontSize: 16, lineHeight: 25, textAlign: 'center', marginTop: 14, maxWidth: 390 },
  button: { width: '100%', marginTop: 30 },
  footer: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 6 },
});
