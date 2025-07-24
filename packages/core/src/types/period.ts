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
  value: Date;

  /** The numeric value of this period (e.g., 2024 for year, 12 for December) */
  number: number;
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
  adapter: DateAdapter;
  weekStartsOn: number;
}

/**
 * The temporal instance that holds reactive state
 */
export interface Temporal extends TemporalContext {
  browsing: Ref<Date>;
  now: Ref<Date>;
}

// Re-export needed types
import type { Ref } from "@vue/reactivity";
import type { DateAdapter } from "./core";
export type { DateAdapter };
