import type { Ref } from "@vue/reactivity";

/**
 * Core data structure for representing time periods
 * This is a plain data structure - no methods, just data
 */
export interface Period {
  /** Start date of the period (inclusive) */
  start: Date;

  /** End date of the period (inclusive) */
  end: Date;

  /** Type of time unit this period represents */
  type: Unit;

  /** The reference date used to create this period */
  date: Date;
}

/**
 * Unified type for all time units
 * Simplified from multiple overlapping types (TimeUnitKind, PeriodType, DivideUnit)
 */
export type Unit =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "quarter"
  | "stableMonth"
  | "custom";

// Keep PeriodType as alias for backward compatibility (will remove later)
export type PeriodType = Unit;

// Keep TimeUnitKind as alias for backward compatibility (will remove later)
export type TimeUnitKind = Exclude<Unit, "custom">;

// Keep DivideUnit as alias for backward compatibility (will remove later)
export type DivideUnit = Exclude<Unit, "custom">;

/**
 * Minimal temporal context needed for operations
 */
export interface TemporalContext {
  adapter: Adapter;
  weekStartsOn: number;
}

/**
 * The temporal instance that holds reactive state
 */
export interface Temporal extends TemporalContext {
  browsing: Ref<Period>;
  now: Ref<Period>;
}

// Adapter Types
export interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export interface AdapterOptions {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface Adapter {
  name: string;
  add(date: Date, duration: Duration): Date;
  subtract(date: Date, duration: Duration): Date;
  startOf(date: Date, unit: TimeUnitKind, options?: AdapterOptions): Date;
  endOf(date: Date, unit: TimeUnitKind, options?: AdapterOptions): Date;
  isSame(date1: Date, date2: Date, unit: TimeUnitKind): boolean;
  isBefore(date1: Date, date2: Date): boolean;
  isAfter(date1: Date, date2: Date): boolean;
  eachInterval(start: Date, end: Date, unit: TimeUnitKind): Date[];
}

// Split operation options
export interface SplitOptions {
  by?: Unit; // Split by unit type
  count?: number; // Split into N equal parts
  duration?: {
    // Split by duration
    days?: number;
    hours?: number;
    weeks?: number;
  };
}

// Utility Types
export type DateOrRef = Date | Ref<Date>;
