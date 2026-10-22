import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { localDateKey } from '../domain/dates';
import { dayRanges, millisecondsUntilTomorrow, readStepCounter } from './pedometerMath';

export interface PedometerController {
  status: 'idle' | 'checking' | 'permission-needed' | 'active' | 'denied' | 'unavailable' | 'error';
  permission: 'unknown' | 'undetermined' | 'granted' | 'denied';
  available: boolean | null;
  message: string;
  requestPermission(): Promise<void>;
  refresh(): Promise<void>;
}

interface UsePedometerOptions {
  enabled: boolean;
  onDelta(dateKey: string, steps: number): void;
  onDailyTotal(dateKey: string, steps: number): void;
}

type SensorState = Omit<PedometerController, 'requestPermission' | 'refresh'>;
type SensorCommands = Pick<PedometerController, 'requestPermission' | 'refresh'>;
type PermissionResponse = Awaited<ReturnType<typeof Pedometer.getPermissionsAsync>>;

const initialState: SensorState = {
  status: 'idle',
  permission: 'unknown',
  available: null,
  message: 'Die Live-Messung ist pausiert.',
};

const inactiveCommands: SensorCommands = {
  async requestPermission() {},
  async refresh() {},
};

function permissionState(permission: PermissionResponse): SensorState['permission'] {
  if (permission.granted) return 'granted';
  return permission.status === 'denied' ? 'denied' : 'undetermined';
}

function permissionMessage(permission: PermissionResponse): string {
  if (permission.status === 'undetermined') {
    return 'Erlaube den Zugriff auf Bewegung und Fitness, um deine Schritte zu zählen.';
  }

  return permission.canAskAgain
    ? 'Der Zugriff wurde nicht erlaubt. Du kannst die Berechtigung erneut anfragen.'
    : 'Erlaube Bewegung und Fitness in den Systemeinstellungen für Expo Go bzw. FitStep.';
}

const activeMessage = Platform.OS === 'ios'
  ? 'Die Schritte kommen vom iPhone-Bewegungssensor. Tageswerte werden beim Öffnen aktualisiert.'
  : 'Es werden Schritte gezählt, während FitStep im Vordergrund geöffnet ist.';

export function usePedometer(options: UsePedometerOptions): PedometerController {
  const { enabled } = options;
  const callbacks = useRef(options);
  callbacks.current = options;
  const commands = useRef<SensorCommands>(inactiveCommands);
  const permissionRequest = useRef<Promise<PermissionResponse> | null>(null);
  const [state, setState] = useState<SensorState>(initialState);

  useEffect(() => {
    let disposed = false;
    let foreground = AppState.currentState === 'active' || AppState.currentState == null;
    let generation = 0;
    let requestingPermission = false;
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let dayTimer: ReturnType<typeof setTimeout> | undefined;

    const publish = (changes: Partial<SensorState>) => {
      if (!disposed) setState(previous => ({ ...previous, ...changes }));
    };

    const isCurrent = (token: number) => (
      !disposed && enabled && callbacks.current.enabled && foreground && token === generation
    );

    const stop = () => {
      generation += 1;
      subscription?.remove();
      subscription = undefined;
      if (pollTimer !== undefined) clearInterval(pollTimer);
      if (dayTimer !== undefined) clearTimeout(dayTimer);
      pollTimer = undefined;
      dayTimer = undefined;
    };

    const restart = async (): Promise<void> => {
      if (disposed || !enabled || !callbacks.current.enabled || !foreground || requestingPermission) return;

      stop();
      const token = generation;

      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        publish({
          status: 'unavailable',
          available: false,
          permission: 'unknown',
          message: 'Im Browser ist kein Schrittsensor verfügbar. Nutze den Demo-Modus oder ein Smartphone.',
        });
        return;
      }

      publish({ status: 'checking', message: 'Schrittsensor wird geprüft.' });

      try {
        const available = await Pedometer.isAvailableAsync();
        if (!isCurrent(token)) return;
        publish({ available });

        if (!available) {
          publish({
            status: 'unavailable',
            permission: 'unknown',
            message: 'Auf diesem Gerät ist kein Schrittsensor verfügbar. Für die Vorführung kannst du den Demo-Modus nutzen.',
          });
          return;
        }

        if (permissionRequest.current) {
          await permissionRequest.current.catch(() => undefined);
          if (!isCurrent(token)) return;
        }

        const permission = await Pedometer.getPermissionsAsync();
        if (!isCurrent(token)) return;
        publish({ permission: permissionState(permission) });

        if (!permission.granted) {
          publish({
            status: permission.status === 'denied' ? 'denied' : 'permission-needed',
            message: permissionMessage(permission),
          });
          return;
        }

        const sessionDate = localDateKey();
        let lastCount: number | null = null;
        let reading: Promise<void> | null = null;
        let readQueued = false;
        let historyQueued = false;

        const readIOS = (includeHistory: boolean): Promise<void> => {
          readQueued = true;
          historyQueued ||= includeHistory;
          if (reading) return reading;

          reading = (async () => {
            while (readQueued && isCurrent(token)) {
              readQueued = false;
              const withHistory = historyQueued;
              historyQueued = false;

              try {
                for (const range of dayRanges(new Date(), withHistory)) {
                  if (!isCurrent(token)) return;
                  const result = range.end.getTime() > range.start.getTime()
                    ? await Pedometer.getStepCountAsync(range.start, range.end)
                    : { steps: 0 };
                  if (!isCurrent(token)) return;

                  if (Number.isFinite(result.steps) && result.steps >= 0) {
                    callbacks.current.onDailyTotal(range.dateKey, Math.floor(result.steps));
                  }
                }

                if (isCurrent(token)) publish({ status: 'active', message: activeMessage });
              } catch {
                if (isCurrent(token)) {
                  publish({
                    status: 'error',
                    message: 'Die Schrittdaten konnten nicht gelesen werden. Prüfe die Bewegungsberechtigung oder versuche es erneut.',
                  });
                }
                readQueued = false;
              }
            }
          })().finally(() => {
            reading = null;
          });

          return reading;
        };

        subscription = Pedometer.watchStepCount(result => {
          if (!isCurrent(token)) return;

          if (localDateKey() !== sessionDate) {
            void restart();
            return;
          }

          if (Platform.OS === 'ios') {
            void readIOS(false);
          } else {
            const reading = readStepCounter(lastCount, result.steps);
            lastCount = reading.previous;
            if (reading.delta > 0) {
              callbacks.current.onDelta(sessionDate, reading.delta);
            }
          }
        });

        if (!isCurrent(token)) {
          subscription.remove();
          subscription = undefined;
          return;
        }

        publish({ status: 'active', message: activeMessage });

        pollTimer = setInterval(() => {
          if (!isCurrent(token)) return;
          if (localDateKey() !== sessionDate) {
            void restart();
          } else if (Platform.OS === 'ios') {
            void readIOS(false);
          }
        }, 5000);

        dayTimer = setTimeout(() => {
          if (isCurrent(token)) void restart();
        }, millisecondsUntilTomorrow());

        if (Platform.OS === 'ios') await readIOS(true);
      } catch {
        if (isCurrent(token)) {
          stop();
          publish({
            status: 'error',
            message: 'Der Schrittzähler konnte nicht gestartet werden. Prüfe die Berechtigung und versuche es erneut.',
          });
        }
      }
    };

    const requestPermission = async (): Promise<void> => {
      if (disposed || !enabled || !callbacks.current.enabled || !foreground || requestingPermission) return;
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        await restart();
        return;
      }

      requestingPermission = true;
      stop();
      publish({ status: 'checking', message: 'Bewegungsberechtigung wird angefragt.' });

      try {
        const available = await Pedometer.isAvailableAsync();
        if (disposed || !foreground || !callbacks.current.enabled) return;
        publish({ available });

        if (available) {
          const pending = permissionRequest.current ?? Pedometer.requestPermissionsAsync();
          permissionRequest.current = pending;
          let permission: PermissionResponse;
          try {
            permission = await pending;
          } finally {
            if (permissionRequest.current === pending) permissionRequest.current = null;
          }
          if (disposed) return;
          publish({ permission: permissionState(permission) });
        }
      } catch {
        if (!disposed) {
          publish({
            status: 'error',
            message: 'Die Berechtigung konnte nicht angefragt werden. Prüfe die Systemeinstellungen.',
          });
        }
      } finally {
        requestingPermission = false;
        if (!disposed && foreground) await restart();
      }
    };

    commands.current = { requestPermission, refresh: restart };

    if (!enabled) {
      publish({ status: 'idle', message: 'Die Live-Messung ist pausiert.' });
      return () => {
        disposed = true;
        stop();
        commands.current = inactiveCommands;
      };
    }

    const appStateSubscription = AppState.addEventListener('change', nextState => {
      const nextForeground = nextState === 'active';
      if (foreground === nextForeground) return;
      foreground = nextForeground;

      if (!foreground) {
        stop();
        publish({ status: 'idle', message: 'Die Live-Messung pausiert, solange die App im Hintergrund ist.' });
      } else if (!requestingPermission) {
        void restart();
      }
    });

    void restart();

    return () => {
      disposed = true;
      stop();
      appStateSubscription.remove();
      commands.current = inactiveCommands;
    };
  }, [enabled]);

  const requestPermission = useCallback(() => commands.current.requestPermission(), []);
  const refresh = useCallback(() => commands.current.refresh(), []);

  return { ...state, requestPermission, refresh };
}
