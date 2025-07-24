import type { Period, PeriodType, Temporal, DivideUnit } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Navigate directly to a specific unit type while preserving the reference date
 */
export function zoomTo(
  temporal: Temporal,
  period: Period,
  targetUnit: DivideUnit
): Period {
  // Update browsing to the period's date
  temporal.browsing.value = {
    start: period.date,
    end: period.date,
    type: "day" as const,
    date: period.date,
  };

  // Create and return the target unit
  return createPeriod(temporal, targetUnit as PeriodType, period);
}
