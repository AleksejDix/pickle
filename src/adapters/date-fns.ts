// Date-fns Adapter Plugin
// Full-featured adapter using date-fns library

import type {
  DateAdapter,
  DateDuration,
  TimeUnit,
  WeekOptions,
  DateAdapterOptions,
} from "./types";

export class DateFnsAdapter implements DateAdapter {
  name = "date-fns";

  // Lazy import date-fns functions to avoid bundling if not used
  private get dateFns() {
    try {
      return require("date-fns");
    } catch (_error) {
      throw new Error(
        "date-fns is required when using DateFnsAdapter. Install it with: npm install date-fns"
      );
    }
  }

  add(date: Date, duration: DateDuration): Date {
    const { add } = this.dateFns;
    return add(date, duration);
  }

  subtract(date: Date, duration: DateDuration): Date {
    const { sub } = this.dateFns;
    return sub(date, duration);
  }

  startOf(date: Date, unit: TimeUnit, _options?: DateAdapterOptions): Date {
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
      case "year":
        return startOfYear(date);
      case "month":
        return startOfMonth(date);
      case "week":
        return startOfWeek(date);
      case "day":
        return startOfDay(date);
      case "hour":
        return startOfHour(date);
      case "minute":
        return startOfMinute(date);
      case "second":
        return startOfSecond(date);
      case "decade":
        const currentYear = date.getFullYear();
        const decadeStart = Math.floor(currentYear / 10) * 10;
        return new Date(decadeStart, 0, 1);
      case "century":
        const centuryYear = date.getFullYear();
        const centuryStart = Math.floor(centuryYear / 100) * 100;
        return new Date(centuryStart, 0, 1);
      case "millennium":
        const millenniumYear = date.getFullYear();
        const millenniumStart = Math.floor(millenniumYear / 1000) * 1000;
        return new Date(millenniumStart, 0, 1);
      default:
        return new Date(date);
    }
  }

  endOf(date: Date, unit: TimeUnit, _options?: DateAdapterOptions): Date {
    const {
      endOfYear,
      endOfMonth,
      endOfWeek,
      endOfDay,
      endOfHour,
      endOfMinute,
      endOfSecond,
    } = this.dateFns;

    switch (unit) {
      case "year":
        return endOfYear(date);
      case "month":
        return endOfMonth(date);
      case "week":
        return endOfWeek(date);
      case "day":
        return endOfDay(date);
      case "hour":
        return endOfHour(date);
      case "minute":
        return endOfMinute(date);
      case "second":
        return endOfSecond(date);
      case "decade":
        const currentYear = date.getFullYear();
        const decadeEnd = Math.floor(currentYear / 10) * 10 + 9;
        return new Date(decadeEnd, 11, 31, 23, 59, 59, 999);
      case "century":
        const centuryYear = date.getFullYear();
        const centuryEnd = Math.floor(centuryYear / 100) * 100 + 99;
        return new Date(centuryEnd, 11, 31, 23, 59, 59, 999);
      case "millennium":
        const millenniumYear = date.getFullYear();
        const millenniumEnd = Math.floor(millenniumYear / 1000) * 1000 + 999;
        return new Date(millenniumEnd, 11, 31, 23, 59, 59, 999);
      default:
        return new Date(date);
    }
  }

  isSame(
    a: Date,
    b: Date,
    unit: TimeUnit,
    _options?: DateAdapterOptions
  ): boolean {
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

  eachInterval(start: Date, end: Date, unit: TimeUnit): Date[] {
    const {
      eachYearOfInterval,
      eachMonthOfInterval,
      eachWeekOfInterval,
      eachDayOfInterval,
      eachHourOfInterval,
      eachMinuteOfInterval,
    } = this.dateFns;

    const interval = { start, end };

    switch (unit) {
      case "year":
      case "decade":
      case "century":
      case "millennium":
        return eachYearOfInterval(interval);
      case "month":
      case "quarter":
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

  getWeekday(date: Date, options?: WeekOptions): number {
    const { getDay } = this.dateFns;
    const dayOfWeek = getDay(date);
    const weekStartsOn = options?.weekStartsOn ?? 0;

    return (dayOfWeek - weekStartsOn + 7) % 7;
  }

  isWeekend(date: Date): boolean {
    const { isWeekend } = this.dateFns;
    return isWeekend(date);
  }

}

// Factory function to create adapter instance
export function createDateFnsAdapter(): DateFnsAdapter {
  return new DateFnsAdapter();
}
