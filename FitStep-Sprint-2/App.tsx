import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FitStepProvider } from './src/state/FitStepProvider';
import FitStepApp from './src/ui/FitStepApp';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <FitStepProvider>
        <FitStepApp />
      </FitStepProvider>
    </SafeAreaProvider>
  );
}
