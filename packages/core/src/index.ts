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
  createPeriod,
  split,
  merge,
  createCustomPeriod,
  isSame,
  toPeriod,
} from "./operations";
export type { SplitOptions } from "./types";

// Utility functions
export { isWeekend, isWeekday, isToday } from "./operations/utils";

// Types
export type {
  Period,
  Unit,
  UnitRegistry,
  AdapterUnit,
  Temporal,
  TemporalContext,
  Adapter,
  UnitHandler,
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

// Unit registry functionality
export { 
  defineUnit, 
  getUnitDefinition, 
  hasUnit, 
  getRegisteredUnits,
  type UnitDefinition 
} from "./unit-registry";

// Initialize core unit definitions
import "./units/definitions";
