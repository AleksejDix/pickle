import type { Period, PeriodType, TemporalContext } from "../types/period";
import type { DivideUnit } from "../types/reactive";

/**
 * Check if two periods are the same for a given unit
 * 
 * Uses the Period-centric API pattern where operations work with Period objects.
 * To compare dates directly, wrap them in periods or use period.value.
 * 
 * @example
 * // Compare two periods
 * isSame(temporal, yearPeriod, otherYearPeriod, 'year')
 * 
 * // Compare periods by their value dates
 * const sameDayPeriod = createPeriod(temporal, 'day', period.value)
 * isSame(temporal, period, sameDayPeriod, 'day')
 */
export function isSame(
  context: TemporalContext,
  a: Period | null | undefined,
  b: Period | null | undefined,
  unit: PeriodType | DivideUnit
): boolean {
  if (!a || !b) return false;

  const dateA = a.value;
  const dateB = b.value;

  // Handle quarter comparison specially
  if (unit === "quarter") {
    const monthA = dateA.getMonth();
    const monthB = dateB.getMonth();
    const yearA = dateA.getFullYear();
    const yearB = dateB.getFullYear();

    // Calculate quarters (Q1 = Jan-Mar, Q2 = Apr-Jun, etc)
    const quarterA = Math.floor(monthA / 3);
    const quarterB = Math.floor(monthB / 3);

    return yearA === yearB && quarterA === quarterB;
  }

  return context.adapter.isSame(dateA, dateB, unit as any);
}
