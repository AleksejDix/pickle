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

  // Methods - available in all time units
  future: () => void;
  past: () => void;
  isSame: (a: Date | null, b: Date | null) => boolean;
}

// Framework-agnostic Composable Options
export interface CreateTemporalOptions {
  date?: Date | Ref<Date>;
  now?: Date | Ref<Date>;
  dateAdapter?: DateAdapter;
}

export interface UseTimeUnitOptions {
  now: Date | Ref<Date>;
  browsing: Date | Ref<Date>;
  adapter?: DateAdapter;
}

// Reactive Temporal Core Interface
export interface TemporalCore {
  browsing: Ref<Date>;
  picked: Ref<Date>;
  now: Ref<Date>;
  adapter: DateAdapter;
  divide: (interval: TimeUnit, unit: TimeUnitKind) => TimeUnit[];
}

// Utility Types
export type DateOrRef = Date | Ref<Date>;

// Function Type Definitions
export type TimeUnitComposable = (options: UseTimeUnitOptions) => TimeUnit;
export type TimeUnitDivider = (
  interval: TimeUnit,
  unit: TimeUnitKind
) => TimeUnit[];
