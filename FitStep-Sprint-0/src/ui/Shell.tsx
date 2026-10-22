import React, { ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from './Icon';
import { colors } from './theme';

export type TabId = 'dashboard' | 'pedometer' | 'settings';
const tabs: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'pedometer', label: 'Pedometer', icon: 'steps' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export function Shell({ activeTab, onTabChange, children }: {
  activeTab: TabId; onTabChange: (tab: TabId) => void; children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.frame}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>{activeTab.toUpperCase()}</Text>
          </View>
          <ScrollView
            key={activeTab}
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          <View style={styles.tabBar} accessibilityRole="tablist" accessibilityLabel="Hauptnavigation">
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  accessibilityRole="tab"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: active }}
                  aria-selected={active}
                  testID={`tab-${tab.id}`}
                  onPress={() => { Keyboard.dismiss(); onTabChange(tab.id); }}
                  style={({ pressed }) => [styles.tab, active && styles.activeTab, pressed && styles.pressed]}
                >
                  <Icon name={tab.icon} color={active ? colors.text : colors.muted} size={27} />
                  <Text style={[styles.tabLabel, active && styles.activeLabel]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  frame: { flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' },
  flex: { flex: 1 },
  header: { minHeight: 82, paddingHorizontal: 20, paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: colors.border, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 29, lineHeight: 36, fontWeight: '900', letterSpacing: 0.4 },
  content: { padding: 16, paddingTop: 24, paddingBottom: 30, gap: 16, flexGrow: 1 },
  tabBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  tab: { flex: 1, minHeight: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, paddingVertical: 8, gap: 5 },
  activeTab: { backgroundColor: colors.orange, shadowColor: colors.orange, shadowOpacity: 0.15, shadowOffset: { width: 0, height: 4 }, shadowRadius: 14, elevation: 3 },
  tabLabel: { color: colors.muted, fontWeight: '800', fontSize: 13 },
  activeLabel: { color: colors.text },
  pressed: { opacity: 0.8 },
});
