import type { Adapter, FunctionalAdapter, Unit, Duration, AdapterOptions } from "@usetemporal/core";
import { createNativeAdapter } from "./adapter";

/**
 * Create a compatibility adapter that implements the legacy Adapter interface
 * using a functional adapter under the hood
 */
export function createCompatibilityAdapter(
  functionalAdapter?: FunctionalAdapter,
  options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
): Adapter {
  const adapter = functionalAdapter || createNativeAdapter(options);
  
  return {
    name: "native-functional",

    add(date: Date, duration: Duration): Date {
      let result = new Date(date);
      
      if (duration.years) {
        result = adapter.add(result, duration.years, "year");
      }
      if (duration.months) {
        result = adapter.add(result, duration.months, "month");
      }
      if (duration.weeks) {
        result = adapter.add(result, duration.weeks, "week");
      }
      if (duration.days) {
        result = adapter.add(result, duration.days, "day");
      }
      if (duration.hours) {
        result = adapter.add(result, duration.hours, "hour");
      }
      if (duration.minutes) {
        result = adapter.add(result, duration.minutes, "minute");
      }
      if (duration.seconds) {
        result = adapter.add(result, duration.seconds, "second");
      }
      if (duration.milliseconds) {
        // Convert milliseconds to seconds
        const ms = result.getMilliseconds() + duration.milliseconds;
        result.setMilliseconds(ms);
      }
      
      return result;
    },

    subtract(date: Date, duration: Duration): Date {
      const negativeDuration: Duration = {};
      
      if (duration.years) negativeDuration.years = -duration.years;
      if (duration.months) negativeDuration.months = -duration.months;
      if (duration.weeks) negativeDuration.weeks = -duration.weeks;
      if (duration.days) negativeDuration.days = -duration.days;
      if (duration.hours) negativeDuration.hours = -duration.hours;
      if (duration.minutes) negativeDuration.minutes = -duration.minutes;
      if (duration.seconds) negativeDuration.seconds = -duration.seconds;
      if (duration.milliseconds) negativeDuration.milliseconds = -duration.milliseconds;
      
      return this.add(date, negativeDuration);
    },

    startOf(date: Date, unit: Exclude<Unit, "custom">, options?: AdapterOptions): Date {
      // Handle stableMonth separately as it's not in FunctionalAdapter
      if (unit === "stableMonth") {
        // Get first day of the month
        const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        // Find the start of the week containing the 1st
        const weekAdapter = createNativeAdapter({ weekStartsOn: options?.weekStartsOn });
        return weekAdapter.startOf(firstOfMonth, "week");
      }
      
      return adapter.startOf(date, unit as Exclude<Unit, "custom" | "stableMonth">);
    },

    endOf(date: Date, unit: Exclude<Unit, "custom">, options?: AdapterOptions): Date {
      // Handle stableMonth separately
      if (unit === "stableMonth") {
        // Get first day of next month
        const firstOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        // Get the week containing it
        const weekAdapter = createNativeAdapter({ weekStartsOn: options?.weekStartsOn });
        const weekStart = weekAdapter.startOf(firstOfNextMonth, "week");
        // Go back 1 millisecond to get end of stable month
        return new Date(weekStart.getTime() - 1);
      }
      
      return adapter.endOf(date, unit as Exclude<Unit, "custom" | "stableMonth">);
    },

    isSame(date1: Date, date2: Date, unit: Exclude<Unit, "custom">): boolean {
      if (unit === "stableMonth") {
        // Two dates are in the same stable month if their startOf(stableMonth) are equal
        return this.startOf(date1, "stableMonth").getTime() === 
               this.startOf(date2, "stableMonth").getTime();
      }
      
      const start1 = adapter.startOf(date1, unit as Exclude<Unit, "custom" | "stableMonth">);
      const start2 = adapter.startOf(date2, unit as Exclude<Unit, "custom" | "stableMonth">);
      return start1.getTime() === start2.getTime();
    },

    isBefore(date1: Date, date2: Date): boolean {
      return date1.getTime() < date2.getTime();
    },

    isAfter(date1: Date, date2: Date): boolean {
      return date1.getTime() > date2.getTime();
    },

    eachInterval(start: Date, end: Date, unit: Exclude<Unit, "custom">): Date[] {
      const intervals: Date[] = [];
      let current = new Date(start);
      
      while (current <= end) {
        intervals.push(new Date(current));
        
        if (unit === "stableMonth") {
          // Move to next stable month
          const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
          current = this.startOf(nextMonth, "stableMonth");
        } else {
          current = adapter.add(current, 1, unit as Exclude<Unit, "custom" | "stableMonth">);
        }
      }
      
      return intervals;
    },
  };
}