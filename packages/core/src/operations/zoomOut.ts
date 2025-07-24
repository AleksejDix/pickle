import type { Period, Unit, Temporal } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Zoom out to a larger unit
 */
export function zoomOut(
  temporal: Temporal,
  period: Period,
  targetUnit: Unit
): Period {
  // Update browsing to the period's date
  temporal.browsing.value = {
    start: period.date,
    end: period.date,
    type: "day" as const,
    date: period.date,
  };

  // Create the target unit at this date
  return createPeriod(temporal, targetUnit, period);
}
