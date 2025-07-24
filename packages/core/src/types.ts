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
 * Comprehensive type for all time units, including custom periods
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

/**
 * Type-safe unit constants for better developer experience
 */
export const UNITS = {
  year: "year",
  quarter: "quarter",
  month: "month",
  week: "week",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  stableMonth: "stableMonth",
  custom: "custom",
} as const;

// Individual exports for convenience
export const YEAR = "year" as const;
export const QUARTER = "quarter" as const;
export const MONTH = "month" as const;
export const WEEK = "week" as const;
export const DAY = "day" as const;
export const HOUR = "hour" as const;
export const MINUTE = "minute" as const;
export const SECOND = "second" as const;
export const STABLE_MONTH = "stableMonth" as const;
export const CUSTOM = "custom" as const;

/**
 * Minimal temporal context needed for operations
 */
export interface TemporalContext {
  adapter: FunctionalAdapter;
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
  startOf(
    date: Date,
    unit: Exclude<Unit, "custom">,
    options?: AdapterOptions
  ): Date;
  endOf(
    date: Date,
    unit: Exclude<Unit, "custom">,
    options?: AdapterOptions
  ): Date;
  isSame(date1: Date, date2: Date, unit: Exclude<Unit, "custom">): boolean;
  isBefore(date1: Date, date2: Date): boolean;
  isAfter(date1: Date, date2: Date): boolean;
  eachInterval(start: Date, end: Date, unit: Exclude<Unit, "custom">): Date[];
}

/**
 * Simplified functional adapter interface (RFC 015)
 * Only 4 core operations needed for date manipulation
 */
export interface FunctionalAdapter {
  startOf(date: Date, unit: Exclude<Unit, "custom" | "stableMonth">): Date;
  endOf(date: Date, unit: Exclude<Unit, "custom" | "stableMonth">): Date;
  add(
    date: Date,
    amount: number,
    unit: Exclude<Unit, "custom" | "stableMonth">
  ): Date;
  diff(
    from: Date,
    to: Date,
    unit: Exclude<Unit, "custom" | "stableMonth">
  ): number;
}

/**
 * Unit handler for functional adapters
 * Each unit has its own implementation
 */
export interface UnitHandler {
  startOf(date: Date): Date;
  endOf(date: Date): Date;
  add(date: Date, amount: number): Date;
  diff(from: Date, to: Date): number;
}

// Split operation options
export interface SplitOptions {
  by?: Exclude<Unit, "custom">; // Split by unit type
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
