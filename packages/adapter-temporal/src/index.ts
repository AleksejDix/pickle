// Temporal API Adapter Plugin
// Future-proof adapter using the native JavaScript Temporal API

import type {
  Adapter,
  AdapterOptions,
  Duration,
  Unit,
} from "@usetemporal/core";

export class TemporalAdapter implements Adapter {
  name = "temporal";

  // Check if Temporal API is available
  private get temporal() {
    if (typeof (globalThis as any).Temporal === "undefined") {
      throw new Error(
        "Temporal API is not available in this environment. Please use a polyfill or different adapter."
      );
    }
    return (globalThis as any).Temporal;
  }

  add(date: Date, duration: Duration): Date {
    const { Instant, Now } = this.temporal;

    const instant = Instant.fromEpochMilliseconds(date.getTime());
    const zonedDateTime = instant.toZonedDateTimeISO(Now.timeZone());

    let result = zonedDateTime;
    if (duration.years) result = result.add({ years: duration.years });
    if (duration.months) result = result.add({ months: duration.months });
    if (duration.weeks) result = result.add({ weeks: duration.weeks });
    if (duration.days) result = result.add({ days: duration.days });
    if (duration.hours) result = result.add({ hours: duration.hours });
    if (duration.minutes) result = result.add({ minutes: duration.minutes });
    if (duration.seconds) result = result.add({ seconds: duration.seconds });
    if (duration.milliseconds)
      result = result.add({ milliseconds: duration.milliseconds });

    return new Date(result.epochMilliseconds);
  }

  subtract(date: Date, duration: Duration): Date {
    const { Instant, Now } = this.temporal;

    const instant = Instant.fromEpochMilliseconds(date.getTime());
    const zonedDateTime = instant.toZonedDateTimeISO(Now.timeZone());

    let result = zonedDateTime;
    if (duration.years) result = result.subtract({ years: duration.years });
    if (duration.months) result = result.subtract({ months: duration.months });
    if (duration.weeks) result = result.subtract({ weeks: duration.weeks });
    if (duration.days) result = result.subtract({ days: duration.days });
    if (duration.hours) result = result.subtract({ hours: duration.hours });
    if (duration.minutes)
      result = result.subtract({ minutes: duration.minutes });
    if (duration.seconds)
      result = result.subtract({ seconds: duration.seconds });
    if (duration.milliseconds)
      result = result.subtract({ milliseconds: duration.milliseconds });

    return new Date(result.epochMilliseconds);
  }

  startOf(
    date: Date,
    unit: Exclude<Unit, "custom">,
    options?: AdapterOptions
  ): Date {
    const { Instant, Now } = this.temporal;

    const instant = Instant.fromEpochMilliseconds(date.getTime());
    const zonedDateTime = instant.toZonedDateTimeISO(Now.timeZone());
    const plainDate = zonedDateTime.toPlainDate();

    switch (unit) {
      case "stableMonth": {
        // Get first day of the month
        const startOfMonthZoned = zonedDateTime.with({
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        const firstOfMonthDate = startOfMonthZoned.toPlainDate();

        // Find the start of the week containing the 1st
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        const temporalWeekStart = weekStartsOn === 0 ? 7 : weekStartsOn;
        const dayOfWeek = firstOfMonthDate.dayOfWeek;

        // Calculate days to subtract to get to start of week
        let daysToSubtract = dayOfWeek - temporalWeekStart;
        if (daysToSubtract < 0) daysToSubtract += 7;

        const startOfWeekZoned = startOfMonthZoned
          .subtract({ days: daysToSubtract })
          .with({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
        return new Date(startOfWeekZoned.epochMilliseconds);
      }
      case "year":
        const startOfYearZoned = zonedDateTime.with({
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        return new Date(startOfYearZoned.epochMilliseconds);
      case "month":
        const startOfMonthZoned = zonedDateTime.with({
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        return new Date(startOfMonthZoned.epochMilliseconds);
      case "week":
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        // Temporal API: 1 = Monday, 7 = Sunday
        // Our weekStartsOn: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const dayOfWeek = plainDate.dayOfWeek;

        // Convert our weekStartsOn to Temporal format
        const temporalWeekStart = weekStartsOn === 0 ? 7 : weekStartsOn;

        // Calculate days to subtract to get to start of week
        let daysToSubtract = dayOfWeek - temporalWeekStart;
        if (daysToSubtract < 0) daysToSubtract += 7;

        const startOfWeekZoned = zonedDateTime
          .subtract({ days: daysToSubtract })
          .with({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
        return new Date(startOfWeekZoned.epochMilliseconds);
      default:
        return new Date(date);
    }
  }

  endOf(
    date: Date,
    unit: Exclude<Unit, "custom">,
    options?: AdapterOptions
  ): Date {
    const { Instant, Now } = this.temporal;

    const instant = Instant.fromEpochMilliseconds(date.getTime());
    const zonedDateTime = instant.toZonedDateTimeISO(Now.timeZone());
    const plainDate = zonedDateTime.toPlainDate();

    switch (unit) {
      case "stableMonth": {
        // Get first day of the month
        const startOfMonthZoned = zonedDateTime.with({
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        const firstOfMonthDate = startOfMonthZoned.toPlainDate();

        // Find the start of the week containing the 1st
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        const temporalWeekStart = weekStartsOn === 0 ? 7 : weekStartsOn;
        const dayOfWeek = firstOfMonthDate.dayOfWeek;

        // Calculate days to subtract to get to start of week
        let daysToSubtract = dayOfWeek - temporalWeekStart;
        if (daysToSubtract < 0) daysToSubtract += 7;

        const startOfWeekZoned = startOfMonthZoned.subtract({
          days: daysToSubtract,
        });
        // Add 41 days (6 weeks - 1) and get end of that day
        const endZoned = startOfWeekZoned.add({ days: 41 }).with({
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
        });
        return new Date(endZoned.epochMilliseconds);
      }
      case "year":
        const endOfYearZoned = zonedDateTime.with({
          month: 12,
          day: 31,
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
        });
        return new Date(endOfYearZoned.epochMilliseconds);
      case "month":
        const endOfMonthPlain = plainDate.with({ day: plainDate.daysInMonth });
        const endOfMonthZoned = zonedDateTime
          .with({ day: endOfMonthPlain.day })
          .with({
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999,
          });
        return new Date(endOfMonthZoned.epochMilliseconds);
      case "week":
        const weekStartsOn = options?.weekStartsOn ?? 1; // Default to Monday
        // Temporal API: 1 = Monday, 7 = Sunday
        // Our weekStartsOn: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const dayOfWeek = plainDate.dayOfWeek;

        // Convert our weekStartsOn to Temporal format
        const temporalWeekStart = weekStartsOn === 0 ? 7 : weekStartsOn;

        // Calculate days to add to get to end of week
        let daysToAdd = (temporalWeekStart + 6 - dayOfWeek + 7) % 7;

        const endOfWeekZoned = zonedDateTime.add({ days: daysToAdd }).with({
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
        });
        return new Date(endOfWeekZoned.epochMilliseconds);
      default:
        return new Date(date);
    }
  }

  isSame(a: Date, b: Date, unit: Exclude<Unit, "custom">): boolean {
    const { Instant, Now } = this.temporal;

    const instantA = Instant.fromEpochMilliseconds(a.getTime());
    const instantB = Instant.fromEpochMilliseconds(b.getTime());
    const zonedA = instantA.toZonedDateTimeISO(Now.timeZone());
    const zonedB = instantB.toZonedDateTimeISO(Now.timeZone());
    const plainA = zonedA.toPlainDate();
    const plainB = zonedB.toPlainDate();

    switch (unit) {
      case "stableMonth":
        // StableMonth comparison is same as month
        return zonedA.year === zonedB.year && zonedA.month === zonedB.month;
      case "year":
        return zonedA.year === zonedB.year;
      case "month":
        return zonedA.year === zonedB.year && zonedA.month === zonedB.month;
      case "day":
        return plainA.equals(plainB);
      default:
        return a.getTime() === b.getTime();
    }
  }

  isBefore(a: Date, b: Date): boolean {
    const temporal = this.temporal;
    const instantA = temporal.Instant.fromEpochMilliseconds(a.getTime());
    const instantB = temporal.Instant.fromEpochMilliseconds(b.getTime());
    return temporal.Instant.compare(instantA, instantB) < 0;
  }

  isAfter(a: Date, b: Date): boolean {
    const temporal = this.temporal;
    const instantA = temporal.Instant.fromEpochMilliseconds(a.getTime());
    const instantB = temporal.Instant.fromEpochMilliseconds(b.getTime());
    return temporal.Instant.compare(instantA, instantB) > 0;
  }

  eachInterval(start: Date, end: Date, unit: Exclude<Unit, "custom">): Date[] {
    const result: Date[] = [];
    let current = new Date(start);
    let iterations = 0;
    const maxIterations = 100000; // Safety limit to prevent infinite loops

    // Special handling for stableMonth
    if (unit === "stableMonth") {
      throw new Error(
        "Cannot use stableMonth in eachInterval. Use 'day' or 'week' to divide a stableMonth."
      );
    }

    while (current.getTime() <= end.getTime() && iterations < maxIterations) {
      result.push(new Date(current));
      iterations++;

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
          break;
      }

      // Additional safety check: if add doesn't advance the date, break
      if (
        iterations > 1 &&
        current.getTime() === result[result.length - 2].getTime()
      ) {
        console.warn(
          "TemporalAdapter eachInterval: Date did not advance, breaking to prevent infinite loop"
        );
        break;
      }
    }

    if (iterations >= maxIterations) {
      console.warn(
        "TemporalAdapter eachInterval: Maximum iterations reached, breaking to prevent infinite loop"
      );
    }

    return result;
  }
}

// Factory function to create adapter instance
export function createTemporalAdapter(): TemporalAdapter {
  // Check if Temporal API is available before creating adapter
  if (
    typeof (globalThis as any).Temporal === "undefined" ||
    !(globalThis as any).Temporal.Instant ||
    !(globalThis as any).Temporal.Now
  ) {
    throw new Error(
      "Temporal API is not available in this environment. Please use a polyfill or different adapter."
    );
  }
  return new TemporalAdapter();
}
