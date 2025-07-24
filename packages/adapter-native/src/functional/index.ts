// Functional adapter exports
export { createNativeAdapter, nativeFunctionalAdapter } from "./adapter";
export { createCompatibilityAdapter } from "./compatibility";

// Export individual unit handlers for tree-shaking
export { yearHandler } from "./units/year";
export { monthHandler } from "./units/month";
export { createWeekHandler } from "./units/week";
export { dayHandler } from "./units/day";
export { hourHandler } from "./units/hour";
export { minuteHandler } from "./units/minute";
export { secondHandler } from "./units/second";
export { quarterHandler } from "./units/quarter";