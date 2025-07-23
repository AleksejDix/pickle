import type { TimeUnit } from "../types/reactive";

/**
 * Navigate to the next time unit
 * @param unit - The time unit to navigate
 * @example
 * const month = periods.month(temporal)
 * next(month) // Go to next month
 */
export function next(unit: TimeUnit): void {
  unit.next();
}

/**
 * Navigate to the previous time unit
 * @param unit - The time unit to navigate
 * @example
 * const month = periods.month(temporal)
 * previous(month) // Go to previous month
 */
export function previous(unit: TimeUnit): void {
  unit.previous();
}

/**
 * Navigate forward or backward by a number of steps
 * @param unit - The time unit to navigate
 * @param steps - Number of steps to go (positive = forward, negative = backward)
 * @example
 * const year = periods.year(temporal)
 * go(year, 2)  // Go 2 years forward
 * go(year, -3) // Go 3 years backward
 */
export function go(unit: TimeUnit, steps: number): void {
  unit.go(steps);
}
