import type { Period } from "../../types";
import { isWeekend } from "./isWeekend";

/**
 * Checks if a period falls on a weekday (Monday through Friday)
 * @param period - The period to check
 * @returns true if the period's date is not Saturday or Sunday
 */
export function isWeekday(period: Period): boolean {
  return !isWeekend(period);
}