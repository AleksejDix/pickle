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
  | "yearQuarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "hourQuarter"
  | "minute";

// Function Type Definitions - Framework Agnostic
export type DateFormatter = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
) => string;

// Locale Interface
export interface LocaleOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}
