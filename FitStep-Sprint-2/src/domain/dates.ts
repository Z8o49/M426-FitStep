const DAY_MS = 86_400_000;

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseLocalDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isDateKey(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && localDateKey(parseLocalDate(value)) === value;
}

export function shiftDateKey(dateKey: string, days: number): string {
  const date = parseLocalDate(dateKey);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function lastSevenDays(today: string): string[] {
  return Array.from({ length: 7 }, (_, index) => shiftDateKey(today, index - 6));
}

export function calendarDaysInclusive(first: string, last: string): number {
  const asUtc = (key: string) => {
    const [year, month, day] = key.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.max(1, Math.round((asUtc(last) - asUtc(first)) / DAY_MS) + 1);
}

export function shortDayName(dateKey: string): string {
  return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][parseLocalDate(dateKey).getDay()];
}
