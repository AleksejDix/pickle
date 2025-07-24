// Date-fns Adapter Plugin
// Modular functional adapter using date-fns library

// Re-export the main adapter functionality
export { createDateFnsAdapter, dateFnsAdapter } from "./adapter";

// Export individual unit handlers for extensibility
export { yearHandler } from "./units/year";
export { quarterHandler } from "./units/quarter";
export { monthHandler } from "./units/month";
export { createWeekHandler } from "./units/week";
export { dayHandler } from "./units/day";
export { hourHandler } from "./units/hour";
export { minuteHandler } from "./units/minute";
export { secondHandler } from "./units/second";