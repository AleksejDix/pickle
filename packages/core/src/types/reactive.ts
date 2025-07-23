import type { Ref, ComputedRef } from "@vue/reactivity";
import type { TimeSpan, Event, TimeUnitType } from "./core";
import type { DateAdapter } from "./core";

// Framework-agnostic reactive Time Unit Interface
// Uses @vue/reactivity which works in any JavaScript framework
export interface TimeUnit {
  // Core properties - available in all time units
  raw: ComputedRef<Date>;
  start: ComputedRef<Date>;
  end: ComputedRef<Date>;
  timespan: ComputedRef<TimeSpan>;
  isNow: ComputedRef<boolean>;
  number: ComputedRef<number>;
  name: ComputedRef<string>;
  browsing: Ref<Date>;
  
  // Methods - available in all time units
  future: () => void;
  past: () => void;
  format: (date: Date) => number | string;
  isSame: (a: Date | null, b: Date | null) => boolean;
  
  // Optional properties - only in specific time units
  weekDay?: ComputedRef<number>;     // Available in: year, month, week, day, hour
  we?: ComputedRef<boolean>;          // Available in: day only (weekend indicator)
}

// Framework-agnostic reactive Composable Options
export interface ReactiveCreateTemporalOptions {
  date?: Date | Ref<Date>;
  now?: Date | Ref<Date>;
  locale?: string | Ref<string>;
  dateAdapter?: DateAdapter;
}

export interface UseTimeUnitOptions {
  now: Date | Ref<Date>;
  browsing: Date | Ref<Date>;
  weekStartsOn?: number | Ref<number>;
  events?: Event[] | Ref<Event[]>;
  adapter?: DateAdapter;
}

// Reactive Temporal Core Interface
export interface TemporalCore {
  browsing: Ref<Date>;
  picked: Ref<Date>;
  now: Ref<Date>;
  adapter: DateAdapter;
  divide: (interval: TimeUnit, unit: TimeUnitType) => TimeUnit[];
  f: (date: Date, options: Intl.DateTimeFormatOptions) => string;
}

// Utility Types
export type DateOrRef = Date | Ref<Date>;
export type StringOrRef = string | Ref<string>;
export type NumberOrRef = number | Ref<number>;

// Function Type Definitions
export type TimeUnitComposable = (options: UseTimeUnitOptions) => TimeUnit;
export type TimeUnitDivider = (
  interval: TimeUnit,
  unit: TimeUnitType
) => TimeUnit[];
