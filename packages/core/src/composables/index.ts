import { registerComposable } from "../core/timeUnitFactory";
import useYear from "./useYear";
import useMonth from "./useMonth";
import useWeek from "./useWeek";
import useDay from "./useDay";
import useHour from "./useHour";

// Register all composables with the factory
registerComposable("year", useYear);
registerComposable("month", useMonth);
registerComposable("week", useWeek);
registerComposable("day", useDay);
registerComposable("hour", useHour);

// Core time unit composables
export { default as useYear } from "./useYear";
export { default as useMonth } from "./useMonth";
export { default as useWeek } from "./useWeek";
export { default as useDay } from "./useDay";
export { default as useHour } from "./useHour";
