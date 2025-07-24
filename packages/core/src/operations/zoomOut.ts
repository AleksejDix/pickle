import type { Period, PeriodType, Temporal } from "../types/period";
import type { DivideUnit } from "../types/reactive";
import { createPeriod } from "./createPeriod";

/**
 * Zoom out to a larger unit
 */
export function zoomOut(
  temporal: Temporal,
  period: Period,
  targetUnit: DivideUnit
): Period {
  // Update browsing to the period's value
  temporal.browsing.value = period.value;

  // Create the target unit at this date
  return createPeriod(temporal, targetUnit as PeriodType, period.value);
}
