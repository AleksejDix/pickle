// Core function
export { createTemporal } from "./createTemporal";
export type { CreateTemporalOptions } from "./createTemporal";

// Period composables - module exports
export {
  useYear,
  useMonth,
  useWeek,
  useDay,
  useHour,
  useMinute,
  useSecond,
  useQuarter,
  useStableMonth,
} from "./composables/usePeriods";

// Operations - functional API
export {
  divide,
  next,
  previous,
  go,
  contains,
  zoomIn,
  zoomOut,
  createPeriod,
  split,
  merge,
  createCustomPeriod,
  isSame,
} from "./operations";
export type { SplitOptions } from "./operations";

// Types
export type {
  Period,
  PeriodType,
  Temporal,
  TemporalContext,
} from "./types/period";

// Re-export adapter types for convenience
export type {
  DateAdapter,
  DateAdapterOptions,
  DateDuration,
  TimeUnitKind,
} from "./types/core";
