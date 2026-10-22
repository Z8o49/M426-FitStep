import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFitStep } from '../state/FitStepProvider';
import { DemoBanner, Notice } from './components';
import { Dashboard } from './Dashboard';
import { PedometerScreen } from './PedometerScreen';
import { SettingsScreen } from './SettingsScreen';
import { Shell, TabId } from './Shell';
import { colors } from './theme';

export default function FitStepApp() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { hydrated, mode, storageError, retryStorage } = useFitStep();
  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      {!hydrated ? <View style={styles.loading}><ActivityIndicator size="large" color={colors.orange} /><Text style={styles.loadingText}>Deine Daten werden geladen …</Text></View> : <>
        {mode === 'demo' && <DemoBanner />}
        {storageError && <Notice title="Lokaler Speicher nicht verfügbar" error action="Erneut versuchen" onAction={() => void retryStorage()}>{storageError}</Notice>}
        {activeTab === 'dashboard' && <Dashboard onOpenPedometer={() => setActiveTab('pedometer')} />}
        {activeTab === 'pedometer' && <PedometerScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </>}
    </Shell>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: 18 },
  loadingText: { color: colors.muted, fontSize: 14 },
});
