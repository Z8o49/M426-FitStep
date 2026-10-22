import { localDateKey, startOfLocalDay } from '../domain/dates';

export interface StepCounterReading {
  previous: number | null;
  delta: number;
}

export interface DayRange {
  dateKey: string;
  start: Date;
  end: Date;
}

export function readStepCounter(previous: number | null, current: number): StepCounterReading {
  if (!Number.isFinite(current) || current < 0 || current > Number.MAX_SAFE_INTEGER) {
    return { previous, delta: 0 };
  }

  const next = Math.floor(current);

  if (previous === null) {
    return { previous: next, delta: 0 };
  }

  if (next <= previous) {
    return { previous, delta: 0 };
  }

  return { previous: next, delta: next - previous };
}

export function dayRanges(now: Date, includeHistory: boolean): DayRange[] {
  const today = startOfLocalDay(now);
  const count = includeHistory ? 7 : 1;

  return Array.from({ length: count }, (_, offset) => {
    const start = new Date(today);
    start.setDate(start.getDate() - offset);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return {
      dateKey: localDateKey(start),
      start,
      end: new Date(Math.min(end.getTime(), now.getTime())),
    };
  });
}

export function millisecondsUntilTomorrow(now = new Date()): number {
  const tomorrow = startOfLocalDay(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return Math.max(100, tomorrow.getTime() - now.getTime() + 25);
}
