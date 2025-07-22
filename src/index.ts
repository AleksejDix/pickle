// useTemporal v2.0 - Framework-Agnostic Reactive Time Library
// Revolutionary zero-dependency reactive time management

// Core exports
export { createTemporal } from "./core/createTemporal";

// Type exports
export type * from "./types/core";
export type * from "./types/reactive";

// Composables
export { default as useYear } from "./composables/useYear";
export { default as useMonth } from "./composables/useMonth";
export { default as useWeek } from "./composables/useWeek";
export { default as useDay } from "./composables/useDay";

// Date Adapter System (RFC-001)
export {
  createAdapter,
  registerAdapter,
  getAvailableAdapters,
  nativeAdapter,
} from "./adapters";
export type {
  DateAdapter,
  AdapterName,
  AdapterConfig,
  DateDuration,
  WeekOptions,
} from "./adapters/types";

// Default export for convenience
export { createTemporal as default } from "./core/createTemporal";
