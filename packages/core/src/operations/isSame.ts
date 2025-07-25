import type { Period, Unit, Temporal, AdapterUnit } from "../types";

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
  temporal: Temporal,
  a: Period | null | undefined,
  b: Period | null | undefined,
  unit: Unit
): boolean {
  if (!a || !b) return false;

  const dateA = a.date;
  const dateB = b.date;

  // Handle custom periods - they are the same if their dates are exactly equal
  if (unit === "custom") {
    return dateA.getTime() === dateB.getTime();
  }

  // Handle stableMonth comparison
  if (unit === "stableMonth") {
    // Two dates are in same stable month if their stable month starts are equal
    const startA = temporal.adapter.startOf(
      new Date(dateA.getFullYear(), dateA.getMonth(), 1),
      "week"
    );
    const startB = temporal.adapter.startOf(
      new Date(dateB.getFullYear(), dateB.getMonth(), 1),
      "week"
    );
    return startA.getTime() === startB.getTime();
  }

  // For all other units, compare by checking if startOf values are equal
  const startA = temporal.adapter.startOf(
    dateA,
    unit as AdapterUnit
  );
  const startB = temporal.adapter.startOf(
    dateB,
    unit as AdapterUnit
  );
  return startA.getTime() === startB.getTime();
}
