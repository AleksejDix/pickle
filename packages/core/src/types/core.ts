// Core Time Interfaces - Framework Agnostic
export interface Period {
  start: Date;
  end: Date;
}

// Time Unit Types - unified type for all time units
export type TimeUnitKind =
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
  | "millisecond"
  | "stableMonth";

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

export interface DateAdapterOptions {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface DateAdapter {
  name: string;
  add(date: Date, duration: DateDuration): Date;
  subtract(date: Date, duration: DateDuration): Date;
  startOf(date: Date, unit: TimeUnitKind, options?: DateAdapterOptions): Date;
  endOf(date: Date, unit: TimeUnitKind, options?: DateAdapterOptions): Date;
  isSame(date1: Date, date2: Date, unit: TimeUnitKind): boolean;
  isBefore(date1: Date, date2: Date): boolean;
  isAfter(date1: Date, date2: Date): boolean;
  eachInterval(start: Date, end: Date, unit: TimeUnitKind): Date[];
}
