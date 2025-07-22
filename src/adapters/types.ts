// Date Adapter Interface for useTemporal
// Framework-agnostic date manipulation abstraction

export interface DateAdapter {
  name: string;

  // Core date operations
  add(date: Date, duration: DateDuration): Date;
  subtract(date: Date, duration: DateDuration): Date;

  // Date boundaries
  startOf(date: Date, unit: TimeUnit, options?: DateAdapterOptions): Date;
  endOf(date: Date, unit: TimeUnit, options?: DateAdapterOptions): Date;

  // Date comparison
  isSame(
    a: Date,
    b: Date,
    unit: TimeUnit,
    options?: DateAdapterOptions
  ): boolean;
  isBefore(a: Date, b: Date): boolean;
  isAfter(a: Date, b: Date): boolean;

  // Date iteration
  eachInterval(start: Date, end: Date, unit: TimeUnit): Date[];

  // Date utilities
  getWeekday(date: Date, options?: WeekOptions): number;
  isWeekend(date: Date): boolean;

  // Formatting (basic)
  format(date: Date, pattern: string): string;
}

export interface DateDuration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export type TimeUnit =
  | "millennium"
  | "century"
  | "decade"
  | "year"
  | "quarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond";

export interface WeekOptions {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
}

export interface DateAdapterOptions extends WeekOptions {}

export type AdapterName = "native" | "date-fns" | "luxon" | "temporal" | "auto";

export interface AdapterConfig {
  adapter: AdapterName;
  options?: any;
}
