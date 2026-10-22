import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { calendarDaysInclusive, localDateKey } from '../domain/dates';
import { appReducer, createInitialState, restoreState, selectTotalSteps, selectWeek, type DataMode, type Settings, type WeekDay } from '../domain/model';
import { calculateProgress } from '../domain/progress';
import { usePedometer, type PedometerController } from '../hooks/usePedometer';
import { appRepository } from '../services/storage';

interface FitStepContextValue {
  hydrated: boolean;
  storageError: string | null;
  today: string;
  mode: DataMode;
  settings: Settings;
  todaySteps: number;
  totalSteps: number;
  activeDays: number;
  week: WeekDay[];
  progress: { percent: number; remaining: number };
  sensor: PedometerController;
  setMode(mode: DataMode): void;
  addDemoSteps(steps: number): void;
  resetDemo(): void;
  saveSettings(values: Settings): void;
  retryStorage(): Promise<void>;
}

const FitStepContext = createContext<FitStepContextValue | null>(null);

export function FitStepProvider({ children }: PropsWithChildren) {
  const [today, setToday] = useState(() => localDateKey());
  const [state, dispatch] = useReducer(appReducer, today, createInitialState);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [canPersist, setCanPersist] = useState(false);
  const loadFailed = useRef(false);
  const liveEnabled = useRef(false);
  liveEnabled.current = hydrated && state.mode === 'live';

  useEffect(() => {
    let mounted = true;
    appRepository.load().then(raw => {
      const restored = restoreState(raw, localDateKey());
      if (!mounted) return;
      dispatch({ type: 'hydrate', value: restored });
      setCanPersist(true);
    }).catch(() => {
      if (!mounted) return;
      loadFailed.current = true;
      setStorageError('Gespeicherte Daten konnten nicht geladen werden. Änderungen sind vorübergehend. Erneutes Laden stellt den gespeicherten Stand wieder her.');
    }).finally(() => {
      if (mounted) setHydrated(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!hydrated || !canPersist) return;
    let current = true;
    appRepository.save(state).then(() => {
      if (current) setStorageError(null);
    }).catch(() => {
      if (current) setStorageError('Änderungen konnten nicht gespeichert werden. Bitte erneut versuchen.');
    });
    return () => { current = false; };
  }, [state, hydrated, canPersist]);

  useEffect(() => {
    const updateDay = () => setToday(localDateKey());
    const interval = setInterval(updateDay, 1000);
    const listener = AppState.addEventListener('change', value => { if (value === 'active') updateDay(); });
    return () => { clearInterval(interval); listener.remove(); };
  }, []);

  const onDelta = useCallback((day: string, steps: number) => {
    if (liveEnabled.current) dispatch({ type: 'live-delta', day, steps });
  }, []);
  const onDailyTotal = useCallback((day: string, steps: number) => {
    if (liveEnabled.current) dispatch({ type: 'live-total', day, steps });
  }, []);
  const sensor = usePedometer({ enabled: hydrated && state.mode === 'live', onDelta, onDailyTotal });

  const setMode = useCallback((mode: DataMode) => {
    if (mode === 'demo') liveEnabled.current = false;
    dispatch({ type: 'set-mode', mode });
  }, []);
  const addDemoSteps = useCallback((steps: number) => dispatch({ type: 'demo-add', day: localDateKey(), steps }), []);
  const resetDemo = useCallback(() => dispatch({ type: 'demo-reset', today: localDateKey() }), []);
  const saveSettings = useCallback((settings: Settings) => dispatch({ type: 'save-settings', settings }), []);

  const retryStorage = useCallback(async () => {
    try {
      if (loadFailed.current) {
        const restored = restoreState(await appRepository.load(), localDateKey());
        dispatch({ type: 'hydrate', value: restored });
        loadFailed.current = false;
        setCanPersist(true);
      } else {
        await appRepository.save(state);
      }
      setStorageError(null);
    } catch {
      setStorageError('Speicher weiterhin nicht verfügbar. Deine aktuellen Änderungen bleiben bis zum Schliessen in der App.');
    }
  }, [state]);

  const value = useMemo<FitStepContextValue>(() => {
    const tracking = state[state.mode];
    const todaySteps = tracking.stepsByDay[today] ?? 0;
    return {
      hydrated, storageError, today, mode: state.mode, settings: state.settings,
      todaySteps, totalSteps: selectTotalSteps(tracking, today),
      activeDays: calendarDaysInclusive(tracking.firstUseDate, today),
      week: selectWeek(tracking, today), progress: calculateProgress(todaySteps, state.settings.dailyGoal),
      sensor, setMode, addDemoSteps, resetDemo, saveSettings, retryStorage,
    };
  }, [state, today, hydrated, storageError, sensor, setMode, addDemoSteps, resetDemo, saveSettings, retryStorage]);

  return <FitStepContext.Provider value={value}>{children}</FitStepContext.Provider>;
}

export function useFitStep(): FitStepContextValue {
  const value = useContext(FitStepContext);
  if (!value) throw new Error('FitStepProvider fehlt.');
  return value;
}
