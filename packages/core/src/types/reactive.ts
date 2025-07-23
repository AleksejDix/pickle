import type { Ref, ComputedRef } from "@vue/reactivity";
import type { Period, TimeUnitKind } from "./core";
import type { DateAdapter } from "./core";

// Framework-agnostic reactive Time Unit Interface
// Uses @vue/reactivity which works in any JavaScript framework
export interface TimeUnit {
  // Core properties - available in all time units
  raw: ComputedRef<Date>;
  start: ComputedRef<Date>;
  end: ComputedRef<Date>;
  period: ComputedRef<Period>;
  isNow: ComputedRef<boolean>;
  number: ComputedRef<number>;
  browsing: Ref<Date>;

  // Navigation methods
  next: () => void;
  previous: () => void;
  go: (steps: number) => void;

  // Comparison methods
  isSame: (a: Date | null, b: Date | null) => boolean;

  // Optional type identifier for special units
  _type?: string;

  // Contains method - check if a date or time unit is within this time unit
  contains: (target: Date | TimeUnit) => boolean;
}

// Framework-agnostic Composable Options
export interface CreateTemporalOptions {
  date?: Date | Ref<Date>;
  now?: Date | Ref<Date>;
  dateAdapter?: DateAdapter;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
}

export interface UseTimeUnitOptions {
  now: Date | Ref<Date>;
  browsing: Date | Ref<Date>;
  adapter?: DateAdapter;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

// Extended type for divide function to support special units
export type DivideUnit = TimeUnitKind | "stableMonth";

// Reactive Temporal Core Interface
export interface TemporalCore {
  browsing: Ref<Date>;
  picked: Ref<Date>;
  now: Ref<Date>;
  adapter: DateAdapter;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  divide: (interval: TimeUnit, unit: DivideUnit) => TimeUnit[];
}

// Utility Types
export type DateOrRef = Date | Ref<Date>;

// Function Type Definitions
export type TimeUnitComposable = (options: UseTimeUnitOptions) => TimeUnit;
export type TimeUnitDivider = (
  interval: TimeUnit,
  unit: TimeUnitKind
) => TimeUnit[];
