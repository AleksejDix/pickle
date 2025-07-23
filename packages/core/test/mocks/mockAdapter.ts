import type {
  DateAdapter,
  DateAdapterOptions,
  DateDuration,
  TimeUnitKind,
} from "../../src/types/core";

export class MockDateAdapter implements DateAdapter {
  name = "mock";

  add(date: Date, duration: DateDuration): Date {
    const result = new Date(date);

    if (duration.years)
      result.setFullYear(result.getFullYear() + duration.years);
    if (duration.months) result.setMonth(result.getMonth() + duration.months);
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
    const result = new Date(date);

    if (duration.years)
      result.setFullYear(result.getFullYear() - duration.years);
    if (duration.months) result.setMonth(result.getMonth() - duration.months);
    if (duration.weeks) result.setDate(result.getDate() - duration.weeks * 7);
    if (duration.days) result.setDate(result.getDate() - duration.days);
    if (duration.hours) result.setHours(result.getHours() - duration.hours);
    if (duration.minutes)
      result.setMinutes(result.getMinutes() - duration.minutes);
    if (duration.seconds)
      result.setSeconds(result.getSeconds() - duration.seconds);
    if (duration.milliseconds)
      result.setMilliseconds(result.getMilliseconds() - duration.milliseconds);

    return result;
  }

  startOf(date: Date, unit: TimeUnitKind, options?: DateAdapterOptions): Date {
    const result = new Date(date);

    switch (unit) {
      case "stableMonth":
        // Get first day of the month
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        // Find the start of the week containing the 1st
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        const dayOfWeek = result.getDay();
        const daysToSubtract = (dayOfWeek - weekStartsOn + 7) % 7;
        result.setDate(result.getDate() - daysToSubtract);
        break;
      case "year":
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      case "month":
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case "week": {
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        const dayOfWeek = result.getDay();
        const daysToSubtract = (dayOfWeek - weekStartsOn + 7) % 7;
        result.setDate(result.getDate() - daysToSubtract);
        result.setHours(0, 0, 0, 0);
        break;
      }
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
    }

    return result;
  }

  endOf(date: Date, unit: TimeUnitKind, options?: DateAdapterOptions): Date {
    const result = new Date(date);

    switch (unit) {
      case "stableMonth":
        // Start from the first of the month to calculate properly
        const tempDate = new Date(date);
        tempDate.setDate(1);
        tempDate.setHours(0, 0, 0, 0);
        // Find the start of the week containing the 1st
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        const dayOfWeek = tempDate.getDay();
        const daysToSubtract = (dayOfWeek - weekStartsOn + 7) % 7;
        tempDate.setDate(tempDate.getDate() - daysToSubtract);
        // Now add 41 days (6 weeks - 1) to get to the last day
        result.setTime(tempDate.getTime());
        result.setDate(result.getDate() + 41);
        result.setHours(23, 59, 59, 999);
        break;
      case "year":
        result.setMonth(11, 31);
        result.setHours(23, 59, 59, 999);
        break;
      case "month":
        result.setMonth(result.getMonth() + 1, 0);
        result.setHours(23, 59, 59, 999);
        break;
      case "week": {
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        const dayOfWeek = result.getDay();
        const daysToAdd = (weekStartsOn + 6 - dayOfWeek + 7) % 7;
        result.setDate(result.getDate() + daysToAdd);
        result.setHours(23, 59, 59, 999);
        break;
      }
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
    }

    return result;
  }

  isSame(a: Date, b: Date, unit: TimeUnitKind): boolean {
    switch (unit) {
      case "stableMonth":
        // StableMonth comparison is same as month
        return (
          a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
        );
      case "year":
        return a.getFullYear() === b.getFullYear();
      case "month":
        return (
          a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
        );
      case "week":
        const startA = this.startOf(a, "week");
        const startB = this.startOf(b, "week");
        return startA.getTime() === startB.getTime();
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

    // Special handling for stableMonth
    if (unit === "stableMonth") {
      throw new Error(
        "Cannot use stableMonth in eachInterval. Use 'day' or 'week' to divide a stableMonth."
      );
    }

    while (current.getTime() <= end.getTime()) {
      result.push(new Date(current));

      switch (unit) {
        case "year":
          current = this.add(current, { years: 1 });
          break;
        case "month":
          current = this.add(current, { months: 1 });
          break;
        case "day":
          current = this.add(current, { days: 1 });
          break;
        default:
          // Prevent infinite loop
          return result;
      }
    }

    return result;
  }
}
