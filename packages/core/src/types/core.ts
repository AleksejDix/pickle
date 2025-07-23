// Core Time Interfaces - Framework Agnostic
export interface TimeSpan {
  start: Date;
  end: Date;
}

export interface Event {
  title: string;
  timespan: TimeSpan;
  data?: any;
}

// Composable Options - Framework Agnostic
export interface CreateTemporalOptions {
  date: Date;
  now?: Date;
  locale?: string;
}

// Time Unit Types
export type TimeUnitType =
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
  | "second";

// Function Type Definitions - Framework Agnostic
export type DateFormatter = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
) => string;

// Locale Interface
export interface LocaleOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

// Date Adapter Types
export type AdapterName = "native" | "date-fns" | "luxon" | "temporal";

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

export type TimeUnitName =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond"
  | "decade"
  | "century"
  | "millennium";



export interface AdapterConfig {
  name: AdapterName;
  adapter: DateAdapter;
  available: boolean;
}

export interface DateAdapter {
  name: string;
  add(date: Date, duration: DateDuration): Date;
  subtract(date: Date, duration: DateDuration): Date;
  startOf(date: Date, unit: TimeUnitName): Date;
  endOf(date: Date, unit: TimeUnitName): Date;
  isSame(date1: Date, date2: Date, unit: TimeUnitName): boolean;
  isBefore(date1: Date, date2: Date): boolean;
  isAfter(date1: Date, date2: Date): boolean;
  eachInterval(start: Date, end: Date, unit: TimeUnitName): Date[];
}
