import type { Period, Unit, Temporal } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Convenience function to convert a date to a period of a specific type.
 * This is a wrapper around createPeriod that provides a more intuitive API.
 *
 * @param context - The temporal context
 * @param date - The date to convert
 * @param type - The type of period to create (defaults to "day")
 * @returns A period object of the specified type
 *
 * @example
 * const dayPeriod = toPeriod(temporal, new Date());
 * const monthPeriod = toPeriod(temporal, new Date(), "month");
 * const yearPeriod = toPeriod(temporal, new Date(), "year");
 */
export function toPeriod(
  temporal: Temporal,
  date: Date,
  type: Unit = "day"
): Period {
  // Create a temporary point-in-time period
  const tempPeriod: Period = {
    start: date,
    end: date,
    type: "second",
    date: date,
  };

  return createPeriod(temporal, type, tempPeriod);
}
