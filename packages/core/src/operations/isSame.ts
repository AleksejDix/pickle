import type { PeriodType, TemporalContext } from "../types/period";
import type { DivideUnit } from "../types/reactive";

/**
 * Check if two dates are the same for a given unit
 */
export function isSame(
  context: TemporalContext,
  a: Date | null | undefined,
  b: Date | null | undefined,
  unit: PeriodType | DivideUnit
): boolean {
  if (!a || !b) return false;

  // Handle quarter comparison specially
  if (unit === "quarter") {
    const monthA = a.getMonth();
    const monthB = b.getMonth();
    const yearA = a.getFullYear();
    const yearB = b.getFullYear();

    // Calculate quarters (Q1 = Jan-Mar, Q2 = Apr-Jun, etc)
    const quarterA = Math.floor(monthA / 3);
    const quarterB = Math.floor(monthB / 3);

    return yearA === yearB && quarterA === quarterB;
  }

  return context.adapter.isSame(a, b, unit as any);
}
