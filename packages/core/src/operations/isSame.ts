import type { Period, PeriodType, TemporalContext, DivideUnit } from "../types";

/**
 * Check if two periods are the same for a given unit
 *
 * Uses the Period-centric API pattern where operations work with Period objects.
 * To compare dates directly, wrap them in periods or use period.date.
 *
 * @example
 * // Compare two periods
 * isSame(temporal, yearPeriod, otherYearPeriod, 'year')
 *
 * // Compare periods by their reference dates
 * const sameDayPeriod = createPeriod(temporal, 'day', period)
 * isSame(temporal, period, sameDayPeriod, 'day')
 */
export function isSame(
  context: TemporalContext,
  a: Period | null | undefined,
  b: Period | null | undefined,
  unit: PeriodType | DivideUnit
): boolean {
  if (!a || !b) return false;

  const dateA = a.date;
  const dateB = b.date;

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
