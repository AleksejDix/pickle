import type { Ref, ComputedRef } from "vue";

// Core Time Interfaces
export interface TimeSpan {
  start: Date;
  end: Date;
}

export interface Event {
  title: string;
  timespan: TimeSpan;
  data?: any;
}

// Time Unit Interface - consistent across all scales
export interface TimeUnit {
  raw: ComputedRef<Date>;
  timespan: ComputedRef<TimeSpan>;
  isNow: ComputedRef<boolean>;
  number: ComputedRef<number>;
  name: ComputedRef<string>;
  browsing: Ref<Date>;
  future: () => void;
  past: () => void;
  isSame: (a: Date, b: Date) => boolean;
}

// Extended Time Unit with additional properties
export interface ExtendedTimeUnit extends TimeUnit {
  weekDay?: ComputedRef<number>;
  format?: (date: Date) => number | string;
  we?: ComputedRef<boolean>; // weekend indicator
}

// Composable Options
export interface CreateTemporalOptions {
  date: Date | Ref<Date>;
  now?: Date | Ref<Date>;
  locale?: string | Ref<string>;
}

// Backward compatibility - deprecated
/** @deprecated Use CreateTemporalOptions instead */
export interface UsePickleOptions extends CreateTemporalOptions {}

export interface UseTimeUnitOptions {
  now: Date | Ref<Date>;
  browsing: Date | Ref<Date>;
  weekStartsOn?: number | Ref<number>;
  events?: Event[] | Ref<Event[]>;
}

export interface UseDatePickerOptions {
  selected: Date | Ref<Date>;
  weekStartsOn?: number;
  events?: Event[];
}

// Pickle Core Interface
export interface PickleCore {
  browsing: Ref<Date>;
  picked: Ref<Date>;
  now: Ref<Date>;
  divide: (interval: TimeUnit, unit: TimeUnitType) => TimeUnit[];
  f: (date: Date, options: Intl.DateTimeFormatOptions) => string;
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

// Component Props
export interface DatePickerProps {
  date: Date;
  events?: Event[];
}

export interface PickleGridProps {
  columns: number;
  gap?: number;
  offset?: number;
  timeunit: TimeUnit | TimeUnit[];
}

export interface PickleCellProps {
  unit: TimeUnit;
}

export interface PickleUnitProps {
  timeunit: TimeUnit;
}

// Event Emits
export interface DatePickerEmits {
  "update:date": [date: Date];
}

export interface PickleGridEmits {
  "update:picked": [date: Date];
}

export interface PickleUnitEmits {
  "update:picked": [date: Date];
}

// Utility Types
export type DateOrRef = Date | Ref<Date>;
export type StringOrRef = string | Ref<string>;
export type NumberOrRef = number | Ref<number>;

// Time Box Interface (for complex calendar functionality)
export interface TimeBoxOptions {
  now: DateOrRef;
  locale?: StringOrRef;
}

export interface TimeBoxUnit {
  raw: Date;
  weekend: boolean;
  isToday: boolean;
  weekOffset: number;
  events: Event[];
}

export interface TimeBoxWeek {
  raw: Date;
  start: Date;
  end: Date;
  day: TimeBoxUnit[];
}

export interface TimeBox {
  raw: Date;
  stablemonth: TimeBoxUnit[];
  month: TimeBoxMonth[];
  week: TimeBoxWeek[];
  weekday: TimeBoxUnit[];
}

export interface TimeBoxMonth {
  raw: Date;
  day: TimeBoxUnit[];
}

// Function Type Definitions
export type TimeUnitComposable = (options: UseTimeUnitOptions) => TimeUnit;
export type DateFormatter = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
) => string;
export type TimeUnitDivider = (
  interval: TimeUnit,
  unit: TimeUnitType
) => TimeUnit[];

// Locale Interface
export interface LocaleOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}
