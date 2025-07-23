import { registerComposable } from "../core/timeUnitFactory";
import { periods } from "./periods";

// Register all composables with the factory
registerComposable("year", periods.year);
registerComposable("month", periods.month);
registerComposable("week", periods.week);
registerComposable("day", periods.day);
registerComposable("hour", periods.hour);
registerComposable("quarter", periods.quarter);
registerComposable("minute", periods.minute);
registerComposable("second", periods.second);

// Export the periods object
export { periods };