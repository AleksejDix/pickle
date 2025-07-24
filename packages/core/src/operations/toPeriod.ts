import type { Period, PeriodType, TemporalContext } from "../types/period";
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
  context: TemporalContext,
  date: Date,
  type: PeriodType = "day"
): Period {
  return createPeriod(context, type, date);
}