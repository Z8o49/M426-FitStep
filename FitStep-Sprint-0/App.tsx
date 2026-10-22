import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FitStepApp from './src/ui/FitStepApp';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <FitStepApp />
    </SafeAreaProvider>
  );
}
