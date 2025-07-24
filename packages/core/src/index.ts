// Core function
export { createTemporal } from "./createTemporal";
export type { CreateTemporalOptions } from "./createTemporal";

// Period composables - module exports
export { usePeriod } from "./composables/usePeriods";

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
  Unit,
  Temporal,
  TemporalContext,
  Adapter,
  AdapterOptions,
  Duration,
  DateOrRef,
} from "./types";

// Unit constants
export {
  UNITS,
  YEAR,
  QUARTER,
  MONTH,
  WEEK,
  DAY,
  HOUR,
  MINUTE,
  SECOND,
  STABLE_MONTH,
  CUSTOM,
} from "./types";
