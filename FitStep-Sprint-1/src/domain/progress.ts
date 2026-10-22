export const MAX_DAILY_STEPS = 1_000_000;

export function isValidGoal(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0 && value <= MAX_DAILY_STEPS;
}

export function isStepCount(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= 0
    && value <= MAX_DAILY_STEPS;
}

export function calculateProgress(steps: number, dailyGoal: number) {
  if (!isStepCount(steps) || !isValidGoal(dailyGoal)) {
    return { percent: 0, remaining: 0 };
  }
  return {
    percent: steps < dailyGoal ? Math.min(99, Math.round((steps / dailyGoal) * 100)) : Math.round((steps / dailyGoal) * 100),
    remaining: Math.max(0, dailyGoal - steps),
  };
}
