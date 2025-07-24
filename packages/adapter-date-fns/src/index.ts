// Date-fns Adapter Plugin
// Full-featured adapter using date-fns library

import type {
  Adapter,
  AdapterOptions,
  Duration,
  TimeUnitKind,
} from "@usetemporal/core";

// Import date-fns functions - these will be tree-shaken if adapter is not used
import * as dateFnsImport from "date-fns";

export class DateFnsAdapter implements Adapter {
  name = "date-fns";
  private dateFns = dateFnsImport;

  add(date: Date, duration: Duration): Date {
    const { add } = this.dateFns;
    return add(date, duration);
  }

  subtract(date: Date, duration: Duration): Date {
    const { sub } = this.dateFns;
    return sub(date, duration);
  }

  startOf(date: Date, unit: TimeUnitKind, options?: AdapterOptions): Date {
    const {
      startOfYear,
      startOfMonth,
      startOfWeek,
      startOfDay,
      startOfHour,
      startOfMinute,
      startOfSecond,
    } = this.dateFns;

    switch (unit) {
      case "stableMonth":
        // Get first day of the month
        const firstOfMonth = startOfMonth(date);
        // Find the start of the week containing the 1st
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        return startOfWeek(firstOfMonth, { weekStartsOn });
      case "year":
        return startOfYear(date);
      case "month":
        return startOfMonth(date);
      case "week": {
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        return startOfWeek(date, { weekStartsOn });
      }
      case "day":
        return startOfDay(date);
      case "hour":
        return startOfHour(date);
      case "minute":
        return startOfMinute(date);
      case "second":
        return startOfSecond(date);
      default:
        return new Date(date);
    }
  }

  endOf(date: Date, unit: TimeUnitKind, options?: AdapterOptions): Date {
    const {
      endOfYear,
      endOfMonth,
      endOfWeek,
      endOfDay,
      endOfHour,
      endOfMinute,
      endOfSecond,
      startOfMonth,
      startOfWeek,
    } = this.dateFns;

    switch (unit) {
      case "stableMonth": {
        // Get first day of the month
        const firstOfMonth = startOfMonth(date);
        // Find the start of the week containing the 1st
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        const weekStart = startOfWeek(firstOfMonth, { weekStartsOn });
        // Add 41 days (6 weeks - 1) and get end of that day
        const { add } = this.dateFns;
        const lastDay = add(weekStart, { days: 41 });
        return endOfDay(lastDay);
      }
      case "year":
        return endOfYear(date);
      case "month":
        return endOfMonth(date);
      case "week": {
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        return endOfWeek(date, { weekStartsOn });
      }
      case "day":
        return endOfDay(date);
      case "hour":
        return endOfHour(date);
      case "minute":
        return endOfMinute(date);
      case "second":
        return endOfSecond(date);
      default:
        return new Date(date);
    }
  }

  isSame(a: Date, b: Date, unit: TimeUnitKind): boolean {
    const {
      isSameYear,
      isSameMonth,
      isSameWeek,
      isSameDay,
      isSameHour,
      isSameMinute,
      isSameSecond,
    } = this.dateFns;

    switch (unit) {
      case "stableMonth":
        // StableMonth comparison is same as month
        return isSameMonth(a, b);
      case "year":
        return isSameYear(a, b);
      case "month":
        return isSameMonth(a, b);
      case "week":
        return isSameWeek(a, b);
      case "day":
        return isSameDay(a, b);
      case "hour":
        return isSameHour(a, b);
      case "minute":
        return isSameMinute(a, b);
      case "second":
        return isSameSecond(a, b);
      default:
        return a.getTime() === b.getTime();
    }
  }

  isBefore(a: Date, b: Date): boolean {
    const { isBefore } = this.dateFns;
    return isBefore(a, b);
  }

  isAfter(a: Date, b: Date): boolean {
    const { isAfter } = this.dateFns;
    return isAfter(a, b);
  }

  eachInterval(start: Date, end: Date, unit: TimeUnitKind): Date[] {
    const {
      eachYearOfInterval,
      eachMonthOfInterval,
      eachWeekOfInterval,
      eachDayOfInterval,
      eachHourOfInterval,
      eachMinuteOfInterval,
    } = this.dateFns;

    const interval = { start, end };

    // Special handling for stableMonth
    if (unit === "stableMonth") {
      throw new Error(
        "Cannot use stableMonth in eachInterval. Use 'day' or 'week' to divide a stableMonth."
      );
    }

    switch (unit) {
      case "year":
        return eachYearOfInterval(interval);
      case "month":
        return eachMonthOfInterval(interval);
      case "week":
        return eachWeekOfInterval(interval);
      case "day":
        return eachDayOfInterval(interval);
      case "hour":
        return eachHourOfInterval(interval);
      case "minute":
        return eachMinuteOfInterval(interval);
      default:
        return [start];
    }
  }
}

// Factory function to create adapter instance
export function createDateFnsAdapter(): DateFnsAdapter {
  // Check if date-fns is available
  if (!dateFnsImport || !dateFnsImport.add) {
    throw new Error(
      "date-fns is required when using DateFnsAdapter. Install it with: npm install date-fns"
    );
  }
  return new DateFnsAdapter();
}
