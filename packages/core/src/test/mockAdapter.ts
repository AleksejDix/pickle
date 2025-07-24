import type { DateAdapter } from "../types/core";

/**
 * Mock date adapter for testing
 * Returns predictable results for all operations
 */
export class MockDateAdapter implements DateAdapter {
  name = "mock";

  startOf(
    date: Date,
    unit: "year" | "month" | "week" | "day" | "hour" | "minute" | "second",
    options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
  ): Date {
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
      case "week": {
        const day = result.getDay();
        const weekStartsOn = options?.weekStartsOn ?? 1;
        const diff = (day - weekStartsOn + 7) % 7;
        result.setDate(result.getDate() - diff);
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

  endOf(
    date: Date,
    unit: "year" | "month" | "week" | "day" | "hour" | "minute" | "second",
    options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
  ): Date {
    const result = new Date(date);

    switch (unit) {
      case "year":
        result.setMonth(11, 31);
        result.setHours(23, 59, 59, 999);
        break;
      case "month":
        result.setMonth(result.getMonth() + 1, 0);
        result.setHours(23, 59, 59, 999);
        break;
      case "week": {
        const day = result.getDay();
        const weekStartsOn = options?.weekStartsOn ?? 1;
        const diff = (day - weekStartsOn + 7) % 7;
        result.setDate(result.getDate() - diff + 6);
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

  add(
    date: Date,
    duration: {
      years?: number;
      months?: number;
      weeks?: number;
      days?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
    }
  ): Date {
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

    return result;
  }

  subtract(
    date: Date,
    duration: {
      years?: number;
      months?: number;
      weeks?: number;
      days?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
    }
  ): Date {
    return this.add(date, {
      years: duration.years ? -duration.years : undefined,
      months: duration.months ? -duration.months : undefined,
      weeks: duration.weeks ? -duration.weeks : undefined,
      days: duration.days ? -duration.days : undefined,
      hours: duration.hours ? -duration.hours : undefined,
      minutes: duration.minutes ? -duration.minutes : undefined,
      seconds: duration.seconds ? -duration.seconds : undefined,
    });
  }

  isSame(
    a: Date,
    b: Date,
    unit: "year" | "month" | "week" | "day" | "hour" | "minute" | "second"
  ): boolean {
    switch (unit) {
      case "year":
        return a.getFullYear() === b.getFullYear();
      case "month":
        return (
          a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
        );
      case "week": {
        const startA = this.startOf(a, "week");
        const startB = this.startOf(b, "week");
        return startA.getTime() === startB.getTime();
      }
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
    }
  }

  isBefore(
    a: Date,
    b: Date,
    unit?: "year" | "month" | "week" | "day" | "hour" | "minute" | "second"
  ): boolean {
    if (!unit) return a < b;

    const startA = this.startOf(a, unit);
    const startB = this.startOf(b, unit);
    return startA < startB;
  }

  isAfter(
    a: Date,
    b: Date,
    unit?: "year" | "month" | "week" | "day" | "hour" | "minute" | "second"
  ): boolean {
    if (!unit) return a > b;

    const startA = this.startOf(a, unit);
    const startB = this.startOf(b, unit);
    return startA > startB;
  }

  diff(
    a: Date,
    b: Date,
    unit:
      | "years"
      | "months"
      | "weeks"
      | "days"
      | "hours"
      | "minutes"
      | "seconds"
  ): number {
    const diffMs = a.getTime() - b.getTime();

    switch (unit) {
      case "years":
        return a.getFullYear() - b.getFullYear();
      case "months":
        return (
          (a.getFullYear() - b.getFullYear()) * 12 +
          (a.getMonth() - b.getMonth())
        );
      case "weeks":
        return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
      case "days":
        return Math.floor(diffMs / (24 * 60 * 60 * 1000));
      case "hours":
        return Math.floor(diffMs / (60 * 60 * 1000));
      case "minutes":
        return Math.floor(diffMs / (60 * 1000));
      case "seconds":
        return Math.floor(diffMs / 1000);
    }
  }

  now(): Date {
    // Always return the same date for consistent testing
    return new Date(2024, 0, 15, 10, 30, 0); // Jan 15, 2024 10:30:00
  }

  eachInterval(
    start: Date,
    end: Date,
    unit: "year" | "month" | "week" | "day" | "hour" | "minute" | "second"
  ): Date[] {
    const intervals: Date[] = [];
    let current = new Date(start);

    while (current <= end) {
      intervals.push(new Date(current));

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
        case "second":
          current = this.add(current, { seconds: 1 });
          break;
      }
    }

    return intervals;
  }
}

// Export a singleton instance
export const mockAdapter = new MockDateAdapter();
