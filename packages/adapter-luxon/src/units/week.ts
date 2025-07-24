import type { UnitHandler } from "@usetemporal/core";
import { DateTime } from "luxon";

export function createWeekHandler(weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): UnitHandler {
  // Luxon uses ISO week days (1-7, Monday-Sunday)
  // JavaScript uses 0-6 (Sunday-Saturday)
  // Convert JavaScript weekday to ISO weekday
  const isoWeekday = weekStartsOn === 0 ? 7 : weekStartsOn;
  
  return {
    startOf(date: Date): Date {
      const dt = DateTime.fromJSDate(date);
      const startOfWeek = dt.startOf("week");
      
      // Adjust if week doesn't start on the configured day
      if (isoWeekday !== 1) {
        const currentWeekday = startOfWeek.weekday;
        const daysToSubtract = (currentWeekday - isoWeekday + 7) % 7;
        return startOfWeek.minus({ days: daysToSubtract }).toJSDate();
      }
      
      return startOfWeek.toJSDate();
    },
    
    endOf(date: Date): Date {
      const dt = DateTime.fromJSDate(date);
      const endOfWeek = dt.endOf("week");
      
      // Adjust if week doesn't start on Monday
      if (isoWeekday !== 1) {
        const startOfWeek = this.startOf(date);
        return DateTime.fromJSDate(startOfWeek).plus({ days: 6 }).endOf("day").toJSDate();
      }
      
      return endOfWeek.toJSDate();
    },
    
    add(date: Date, amount: number): Date {
      return DateTime.fromJSDate(date).plus({ weeks: amount }).toJSDate();
    },
    
    diff(from: Date, to: Date): number {
      const start = DateTime.fromJSDate(from);
      const end = DateTime.fromJSDate(to);
      return Math.floor(end.diff(start, "weeks").weeks);
    },
  };
}