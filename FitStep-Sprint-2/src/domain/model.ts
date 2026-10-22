import { isDateKey, lastSevenDays, shortDayName } from './dates';
import { isStepCount, isValidGoal, MAX_DAILY_STEPS } from './progress';

export type DataMode = 'live' | 'demo';

export interface Settings {
  dailyGoal: number;
  username: string;
}

export interface PersonalGoal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface TrackingData {
  firstUseDate: string;
  stepsByDay: Record<string, number>;
}

export interface AppData {
  schemaVersion: number;
  settings: Settings;
  mode: DataMode;
  live: TrackingData;
  demo: TrackingData;
  goals: PersonalGoal[];
}

export interface WeekDay {
  dateKey: string;
  shortLabel: string;
  steps: number;
  isToday: boolean;
}

export type AppAction =
  | { type: 'hydrate'; value: AppData }
  | { type: 'set-mode'; mode: DataMode }
  | { type: 'save-settings'; settings: Settings }
  | { type: 'live-delta'; day: string; steps: number }
  | { type: 'live-total'; day: string; steps: number }
  | { type: 'demo-add'; day: string; steps: number }
  | { type: 'demo-reset'; today: string }
  | { type: 'goal-add'; goal: PersonalGoal }
  | { type: 'goal-toggle'; id: string }
  | { type: 'goal-delete'; id: string };

export function createDemoData(today: string): TrackingData {
  const sampleSteps = [9650, 12724, 13069, 6819, 4382, 11590, 3655];
  return {
    firstUseDate: today,
    stepsByDay: Object.fromEntries(lastSevenDays(today).map((day, index) => [day, sampleSteps[index]])),
  };
}

export function createInitialState(today: string): AppData {
  return {
    schemaVersion: 2,
    settings: { dailyGoal: 8000, username: 'Nikos' },
    mode: 'live',
    live: { firstUseDate: today, stepsByDay: {} },
    demo: createDemoData(today),
    goals: [],
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function restoreTracking(value: unknown, fallback: TrackingData): TrackingData {
  const candidate = asObject(value);
  const counts = asObject(candidate.stepsByDay);
  return {
    firstUseDate: isDateKey(candidate.firstUseDate) ? candidate.firstUseDate : fallback.firstUseDate,
    stepsByDay: Object.fromEntries(Object.entries(counts).filter(([day, steps]) => isDateKey(day) && isStepCount(steps))) as Record<string, number>,
  };
}

export function restoreState(value: unknown, today: string): AppData {
  if (value === null || value === undefined) return createInitialState(today);
  const source = asObject(value);
  if (source.schemaVersion !== 1 && source.schemaVersion !== 2) throw new Error('Unbekanntes Speicherformat.');
  const defaults = createInitialState(today);
  const settings = asObject(source.settings);
  return {
    schemaVersion: 2,
    settings: {
      dailyGoal: typeof settings.dailyGoal === 'number' && isValidGoal(settings.dailyGoal) ? settings.dailyGoal : defaults.settings.dailyGoal,
      username: isValidUsername(settings.username) ? settings.username.trim() : defaults.settings.username,
    },
    mode: source.mode === 'demo' ? 'demo' : 'live',
    live: restoreTracking(source.live, defaults.live),
    demo: restoreTracking(source.demo, defaults.demo),
    goals: restoreGoals(source.goals),
  };
}

function updateSteps(state: AppData, bucket: DataMode, day: string, steps: number, absolute: boolean): AppData {
  if (!isDateKey(day) || !isStepCount(steps)) return state;
  const previous = state[bucket].stepsByDay[day] ?? 0;
  const next = absolute ? Math.max(previous, steps) : Math.min(MAX_DAILY_STEPS, previous + steps);
  if (next === previous && day in state[bucket].stepsByDay) return state;
  return { ...state, [bucket]: { ...state[bucket], stepsByDay: { ...state[bucket].stepsByDay, [day]: next } } };
}

export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'hydrate':
      return action.value;
    case 'set-mode':
      return action.mode === 'live' || action.mode === 'demo' ? { ...state, mode: action.mode } : state;
    case 'save-settings':
      return isValidGoal(action.settings.dailyGoal) && isValidUsername(action.settings.username)
        ? { ...state, settings: { dailyGoal: action.settings.dailyGoal, username: action.settings.username.trim() } }
        : state;
    case 'live-delta':
      return updateSteps(state, 'live', action.day, action.steps, false);
    case 'live-total':
      return updateSteps(state, 'live', action.day, action.steps, true);
    case 'demo-add':
      return state.mode === 'demo' ? updateSteps(state, 'demo', action.day, action.steps, false) : state;
    case 'demo-reset':
      return { ...state, demo: createDemoData(action.today) };
    case 'goal-add':
      if (!isValidGoalText(action.goal.text) || state.goals.some(goal => goal.id === action.goal.id)) return state;
      return { ...state, goals: [...state.goals, { ...action.goal, text: action.goal.text.trim(), completed: false }] };
    case 'goal-toggle':
      return { ...state, goals: state.goals.map(goal => goal.id === action.id ? { ...goal, completed: !goal.completed } : goal) };
    case 'goal-delete':
      return { ...state, goals: state.goals.filter(goal => goal.id !== action.id) };
  }
}

export function selectWeek(data: TrackingData, today: string): WeekDay[] {
  return lastSevenDays(today).map(dateKey => ({
    dateKey,
    shortLabel: shortDayName(dateKey),
    steps: data.stepsByDay[dateKey] ?? 0,
    isToday: dateKey === today,
  }));
}

export function selectTotalSteps(data: TrackingData, today: string): number {
  return Object.entries(data.stepsByDay)
    .filter(([day]) => day >= data.firstUseDate && day <= today)
    .reduce((total, [, steps]) => total + steps, 0);
}

export function isValidUsername(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 40;
}

export function isValidGoalText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 120;
}

function restoreGoals(value: unknown): PersonalGoal[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  const goals: PersonalGoal[] = [];
  for (const entry of value) {
    const goal = asObject(entry);
    if (typeof goal.id !== 'string' || !goal.id || ids.has(goal.id) || !isValidGoalText(goal.text)) continue;
    ids.add(goal.id);
    goals.push({
      id: goal.id,
      text: goal.text.trim(),
      completed: goal.completed === true,
      createdAt: typeof goal.createdAt === 'string' ? goal.createdAt : '',
    });
  }
  return goals;
}
