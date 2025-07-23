// Native Date Adapter - Zero Dependencies
// Pure JavaScript implementation using only built-in Date methods

import type {
  DateAdapter,
  DateDuration,
  TimeUnitKind,
} from "@usetemporal/core/types";

export class NativeDateAdapter implements DateAdapter {
  name = "native";

  add(date: Date, duration: DateDuration): Date {
    const result = new Date(date);

    if (duration.years)
      result.setFullYear(result.getFullYear() + duration.years);

    if (duration.months) {
      const originalDate = result.getDate();
      result.setMonth(result.getMonth() + duration.months);

      // Handle month overflow (e.g., Jan 31 + 1 month should be Feb 28/29, not Mar 3)
      if (result.getDate() !== originalDate) {
        result.setDate(0); // Set to last day of previous month
      }
    }

    if (duration.weeks) result.setDate(result.getDate() + duration.weeks * 7);
    if (duration.days) result.setDate(result.getDate() + duration.days);
    if (duration.hours) result.setHours(result.getHours() + duration.hours);
    if (duration.minutes)
      result.setMinutes(result.getMinutes() + duration.minutes);
    if (duration.seconds)
      result.setSeconds(result.getSeconds() + duration.seconds);
    if (duration.milliseconds)
      result.setMilliseconds(result.getMilliseconds() + duration.milliseconds);

    return result;
  }

  subtract(date: Date, duration: DateDuration): Date {
    const inverseDuration: DateDuration = {};

    if (duration.years) inverseDuration.years = -duration.years;
    if (duration.months) inverseDuration.months = -duration.months;
    if (duration.weeks) inverseDuration.weeks = -duration.weeks;
    if (duration.days) inverseDuration.days = -duration.days;
    if (duration.hours) inverseDuration.hours = -duration.hours;
    if (duration.minutes) inverseDuration.minutes = -duration.minutes;
    if (duration.seconds) inverseDuration.seconds = -duration.seconds;
    if (duration.milliseconds)
      inverseDuration.milliseconds = -duration.milliseconds;

    return this.add(date, inverseDuration);
  }

  startOf(date: Date, unit: TimeUnitKind): Date {
    const result = new Date(date);

    switch (unit) {
      case "year":
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      case "month":
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case "day":
        result.setHours(0, 0, 0, 0);
        break;
      case "hour":
        result.setMinutes(0, 0, 0);
        break;
      case "minute":
        result.setSeconds(0, 0);
        break;
      case "second":
        result.setMilliseconds(0);
        break;
      case "week":
        const dayOfWeek = result.getDay();
        result.setDate(result.getDate() - dayOfWeek);
        result.setHours(0, 0, 0, 0);
        break;
      case "decade":
        const currentYear = result.getFullYear();
        const decadeStart = Math.floor(currentYear / 10) * 10;
        result.setFullYear(decadeStart, 0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      case "century":
        const centuryYear = result.getFullYear();
        const centuryStart = Math.floor(centuryYear / 100) * 100;
        result.setFullYear(centuryStart, 0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      case "millennium":
        const millenniumYear = result.getFullYear();
        const millenniumStart = Math.floor(millenniumYear / 1000) * 1000;
        result.setFullYear(millenniumStart, 0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      default:
        // No change for unknown units
        break;
    }

    return result;
  }

  endOf(date: Date, unit: TimeUnitKind): Date {
    const result = new Date(date);

    switch (unit) {
      case "year":
        result.setMonth(11, 31);
        result.setHours(23, 59, 59, 999);
        break;
      case "month":
        result.setMonth(result.getMonth() + 1, 0); // Last day of current month
        result.setHours(23, 59, 59, 999);
        break;
      case "day":
        result.setHours(23, 59, 59, 999);
        break;
      case "hour":
        result.setMinutes(59, 59, 999);
        break;
      case "minute":
        result.setSeconds(59, 999);
        break;
      case "second":
        result.setMilliseconds(999);
        break;
      case "week":
        const dayOfWeek = result.getDay();
        result.setDate(result.getDate() + (6 - dayOfWeek));
        result.setHours(23, 59, 59, 999);
        break;
      case "decade":
        const currentYear = result.getFullYear();
        const decadeEnd = Math.floor(currentYear / 10) * 10 + 9;
        result.setFullYear(decadeEnd, 11, 31);
        result.setHours(23, 59, 59, 999);
        break;
      case "century":
        const centuryYear = result.getFullYear();
        const centuryEnd = Math.floor(centuryYear / 100) * 100 + 99;
        result.setFullYear(centuryEnd, 11, 31);
        result.setHours(23, 59, 59, 999);
        break;
      case "millennium":
        const millenniumYear = result.getFullYear();
        const millenniumEnd = Math.floor(millenniumYear / 1000) * 1000 + 999;
        result.setFullYear(millenniumEnd, 11, 31);
        result.setHours(23, 59, 59, 999);
        break;
      default:
        // No change for unknown units
        break;
    }

    return result;
  }

  isSame(a: Date, b: Date, unit: TimeUnitKind): boolean {
    switch (unit) {
      case "year":
        return a.getFullYear() === b.getFullYear();
      case "month":
        return (
          a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
        );
      case "day":
        return (
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate()
        );
      case "hour":
        return this.isSame(a, b, "day") && a.getHours() === b.getHours();
      case "minute":
        return this.isSame(a, b, "hour") && a.getMinutes() === b.getMinutes();
      case "second":
        return this.isSame(a, b, "minute") && a.getSeconds() === b.getSeconds();
      case "week":
        const startA = this.startOf(a, "week");
        const startB = this.startOf(b, "week");
        return startA.getTime() === startB.getTime();
      case "decade":
        const decadeA = Math.floor(a.getFullYear() / 10);
        const decadeB = Math.floor(b.getFullYear() / 10);
        return decadeA === decadeB;
      case "century":
        const centuryA = Math.floor(a.getFullYear() / 100);
        const centuryB = Math.floor(b.getFullYear() / 100);
        return centuryA === centuryB;
      case "millennium":
        const millenniumA = Math.floor(a.getFullYear() / 1000);
        const millenniumB = Math.floor(b.getFullYear() / 1000);
        return millenniumA === millenniumB;
      default:
        return a.getTime() === b.getTime();
    }
  }

  isBefore(a: Date, b: Date): boolean {
    return a.getTime() < b.getTime();
  }

  isAfter(a: Date, b: Date): boolean {
    return a.getTime() > b.getTime();
  }

  eachInterval(start: Date, end: Date, unit: TimeUnitKind): Date[] {
    const result: Date[] = [];
    let current = new Date(start);

    while (current.getTime() <= end.getTime()) {
      result.push(new Date(current));

      switch (unit) {
        case "year":
          current = this.add(current, { years: 1 });
          break;
        case "month":
          current = this.add(current, { months: 1 });
          break;
        case "week":
          current = this.add(current, { weeks: 1 });
          break;
        case "day":
          current = this.add(current, { days: 1 });
          break;
        case "hour":
          current = this.add(current, { hours: 1 });
          break;
        case "minute":
          current = this.add(current, { minutes: 1 });
          break;
        default:
          // Prevent infinite loop for unknown units
          return result;
      }
    }

    return result;
  }
}

// Export default instance
export const nativeAdapter = new NativeDateAdapter();
