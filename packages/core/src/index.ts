// useTemporal v2.0 - Framework-Agnostic Reactive Time Library
// Revolutionary zero-dependency reactive time management

// Import composables to register them with the factory
import "./composables";

// Core exports
export { createTemporal } from "./core/createTemporal";

// Type exports
export type * from "./types/core";
export type * from "./types/reactive";

// Periods - export the consolidated periods object
export { periods } from "./composables/periods";

// Type exports for adapters
export type { DateAdapter, AdapterName, DateDuration } from "./types";

// Default export for convenience
export { createTemporal as default } from "./core/createTemporal";
