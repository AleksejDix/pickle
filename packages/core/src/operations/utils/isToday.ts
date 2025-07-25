import type { Period, Temporal } from "../../types";
import { isSame } from "../isSame";

/**
 * Checks if a period represents today
 * @param period - The period to check
 * @param temporal - The temporal instance for accessing current time
 * @returns true if the period is on the same day as now
 */
export function isToday(period: Period, temporal: Temporal): boolean {
  return isSame(temporal, period, temporal.now.value, "day");
}