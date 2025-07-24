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
  type: PeriodType;

  /** The reference date used to create this period */
  date: Date;
}

export type PeriodType =
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

// Extended type for divide function to support special units
export type DivideUnit = TimeUnitKind | "stableMonth";

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
  by?: DivideUnit; // Split by unit type
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
