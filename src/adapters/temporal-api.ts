// Temporal API Adapter Plugin
// Future-proof adapter using the native JavaScript Temporal API

import type {
  DateAdapter,
  DateDuration,
  TimeUnit,
  WeekOptions,
  DateAdapterOptions,
} from "./types";

export class TemporalAdapter implements DateAdapter {
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

  add(date: Date, duration: DateDuration): Date {
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

  subtract(date: Date, duration: DateDuration): Date {
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

  startOf(date: Date, unit: TimeUnit, _options?: DateAdapterOptions): Date {
    const { Instant, Now } = this.temporal;

    const instant = Instant.fromEpochMilliseconds(date.getTime());
    const zonedDateTime = instant.toZonedDateTimeISO(Now.timeZone());
    const plainDate = zonedDateTime.toPlainDate();

    switch (unit) {
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
        // Temporal API: 1 = Monday, 7 = Sunday
        const dayOfWeek = plainDate.dayOfWeek;
        const daysToSubtract = dayOfWeek === 7 ? 0 : dayOfWeek; // Sunday = 0 days to subtract
        const startOfWeekZoned = zonedDateTime
          .subtract({ days: daysToSubtract })
          .with({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
        return new Date(startOfWeekZoned.epochMilliseconds);
      case "decade":
        const currentYear = zonedDateTime.year;
        const decadeStart = Math.floor(currentYear / 10) * 10;
        const startOfDecadeZoned = zonedDateTime.with({
          year: decadeStart,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        return new Date(startOfDecadeZoned.epochMilliseconds);
      case "century":
        const centuryStart = Math.floor(zonedDateTime.year / 100) * 100;
        const startOfCenturyZoned = zonedDateTime.with({
          year: centuryStart,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        return new Date(startOfCenturyZoned.epochMilliseconds);
      case "millennium":
        const millenniumStart = Math.floor(zonedDateTime.year / 1000) * 1000;
        const startOfMillenniumZoned = zonedDateTime.with({
          year: millenniumStart,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        return new Date(startOfMillenniumZoned.epochMilliseconds);
      default:
        return new Date(date);
    }
  }

  endOf(date: Date, unit: TimeUnit, _options?: DateAdapterOptions): Date {
    const { Instant, Now } = this.temporal;

    const instant = Instant.fromEpochMilliseconds(date.getTime());
    const zonedDateTime = instant.toZonedDateTimeISO(Now.timeZone());
    const plainDate = zonedDateTime.toPlainDate();

    switch (unit) {
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
        // Temporal API: 1 = Monday, 7 = Sunday
        const dayOfWeek = plainDate.dayOfWeek;
        const daysToAdd = dayOfWeek === 7 ? 6 : 6 - dayOfWeek; // Days to Saturday
        const endOfWeekZoned = zonedDateTime.add({ days: daysToAdd }).with({
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
        });
        return new Date(endOfWeekZoned.epochMilliseconds);
      case "decade":
        const decadeEnd = Math.floor(zonedDateTime.year / 10) * 10 + 9;
        const endOfDecadeZoned = zonedDateTime.with({
          year: decadeEnd,
          month: 12,
          day: 31,
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
        });
        return new Date(endOfDecadeZoned.epochMilliseconds);
      case "century":
        const centuryEnd = Math.floor(zonedDateTime.year / 100) * 100 + 99;
        const endOfCenturyZoned = zonedDateTime.with({
          year: centuryEnd,
          month: 12,
          day: 31,
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
        });
        return new Date(endOfCenturyZoned.epochMilliseconds);
      case "millennium":
        const millenniumEnd =
          Math.floor(zonedDateTime.year / 1000) * 1000 + 999;
        const endOfMillenniumZoned = zonedDateTime.with({
          year: millenniumEnd,
          month: 12,
          day: 31,
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
        });
        return new Date(endOfMillenniumZoned.epochMilliseconds);
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
    const { Instant, Now } = this.temporal;

    const instantA = Instant.fromEpochMilliseconds(a.getTime());
    const instantB = Instant.fromEpochMilliseconds(b.getTime());
    const zonedA = instantA.toZonedDateTimeISO(Now.timeZone());
    const zonedB = instantB.toZonedDateTimeISO(Now.timeZone());
    const plainA = zonedA.toPlainDate();
    const plainB = zonedB.toPlainDate();

    switch (unit) {
      case "year":
        return zonedA.year === zonedB.year;
      case "month":
        return zonedA.year === zonedB.year && zonedA.month === zonedB.month;
      case "day":
        return plainA.equals(plainB);
      case "decade":
        const decadeA = Math.floor(zonedA.year / 10);
        const decadeB = Math.floor(zonedB.year / 10);
        return decadeA === decadeB;
      case "century":
        const centuryA = Math.floor(zonedA.year / 100);
        const centuryB = Math.floor(zonedB.year / 100);
        return centuryA === centuryB;
      case "millennium":
        const millenniumA = Math.floor(zonedA.year / 1000);
        const millenniumB = Math.floor(zonedB.year / 1000);
        return millenniumA === millenniumB;
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

  eachInterval(start: Date, end: Date, unit: TimeUnit): Date[] {
    const result: Date[] = [];
    let current = new Date(start);
    let iterations = 0;
    const maxIterations = 100000; // Safety limit to prevent infinite loops

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

  getWeekday(date: Date, options?: WeekOptions): number {
    const temporal = this.temporal;
    const instant = temporal.Instant.fromEpochMilliseconds(date.getTime());
    const zonedDateTime = instant.toZonedDateTimeISO(temporal.Now.timeZone());
    const plainDate = zonedDateTime.toPlainDate();

    // Temporal API: 1 = Monday, 7 = Sunday
    // Convert to JavaScript: 0 = Sunday, 1 = Monday, etc.
    const temporalDayOfWeek = plainDate.dayOfWeek;
    const jsDayOfWeek = temporalDayOfWeek === 7 ? 0 : temporalDayOfWeek;

    const weekStartsOn = options?.weekStartsOn ?? 0;
    return (jsDayOfWeek - weekStartsOn + 7) % 7;
  }

  isWeekend(date: Date): boolean {
    const temporal = this.temporal;
    const instant = temporal.Instant.fromEpochMilliseconds(date.getTime());
    const zonedDateTime = instant.toZonedDateTimeISO(temporal.Now.timeZone());
    const plainDate = zonedDateTime.toPlainDate();

    // Temporal API: 6 = Saturday, 7 = Sunday
    const dayOfWeek = plainDate.dayOfWeek;
    return dayOfWeek === 6 || dayOfWeek === 7;
  }

  format(date: Date, pattern: string): string {
    const temporal = this.temporal;
    const instant = temporal.Instant.fromEpochMilliseconds(date.getTime());
    const zonedDateTime = instant.toZonedDateTimeISO(temporal.Now.timeZone());

    // Basic formatting implementation
    const year = zonedDateTime.year;
    const month = zonedDateTime.month;
    const day = zonedDateTime.day;
    const hour = zonedDateTime.hour;
    const minute = zonedDateTime.minute;
    const second = zonedDateTime.second;

    return pattern
      .replace("YYYY", year.toString())
      .replace("MM", month.toString().padStart(2, "0"))
      .replace("DD", day.toString().padStart(2, "0"))
      .replace("HH", hour.toString().padStart(2, "0"))
      .replace("mm", minute.toString().padStart(2, "0"))
      .replace("ss", second.toString().padStart(2, "0"));
  }
}

// Factory function to create adapter instance
export function createTemporalAdapter(): TemporalAdapter {
  return new TemporalAdapter();
}
