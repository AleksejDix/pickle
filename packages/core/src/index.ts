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
  zoomTo,
  createPeriod,
  split,
  merge,
  createCustomPeriod,
  isSame,
  toPeriod,
} from "./operations";
export type { SplitOptions } from "./types";

// Types
export type {
  Period,
  PeriodType,
  Temporal,
  TemporalContext,
  Adapter,
  AdapterOptions,
  Duration,
  TimeUnitKind,
  DivideUnit,
  DateOrRef,
} from "./types";
