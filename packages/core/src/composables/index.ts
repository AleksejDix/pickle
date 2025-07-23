import { registerComposable } from "../core/timeUnitFactory";
import {
  periods,
  useYear,
  useMonth,
  useWeek,
  useDay,
  useHour,
  useQuarter,
  useMinute,
  useSecond,
} from "./periods";

// Register all composables with the factory
registerComposable("year", useYear);
registerComposable("month", useMonth);
registerComposable("week", useWeek);
registerComposable("day", useDay);
registerComposable("hour", useHour);
registerComposable("quarter", useQuarter);
registerComposable("minute", useMinute);
registerComposable("second", useSecond);

// Export the periods object for direct access
export { periods };

// Export individual composables for backward compatibility
export { useYear, useMonth, useWeek, useDay, useHour, useQuarter, useMinute, useSecond };