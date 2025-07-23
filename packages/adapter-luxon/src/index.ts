// Luxon Adapter Plugin
// Modern immutable date library adapter

import type {
  DateAdapter,
  DateDuration,
  TimeUnitKind,
} from "@usetemporal/core/types";

// Import Luxon - this will be tree-shaken if adapter is not used
import * as luxonImport from "luxon";

export class LuxonAdapter implements DateAdapter {
  name = "luxon";
  private luxon = luxonImport;

  add(date: Date, duration: DateDuration): Date {
    const { DateTime } = this.luxon;
    const dt = DateTime.fromJSDate(date);

    let result = dt;
    if (duration.years) result = result.plus({ years: duration.years });
    if (duration.months) result = result.plus({ months: duration.months });
    if (duration.weeks) result = result.plus({ weeks: duration.weeks });
    if (duration.days) result = result.plus({ days: duration.days });
    if (duration.hours) result = result.plus({ hours: duration.hours });
    if (duration.minutes) result = result.plus({ minutes: duration.minutes });
    if (duration.seconds) result = result.plus({ seconds: duration.seconds });
    if (duration.milliseconds)
      result = result.plus({ milliseconds: duration.milliseconds });

    return result.toJSDate();
  }

  subtract(date: Date, duration: DateDuration): Date {
    const { DateTime } = this.luxon;
    const dt = DateTime.fromJSDate(date);

    let result = dt;
    if (duration.years) result = result.minus({ years: duration.years });
    if (duration.months) result = result.minus({ months: duration.months });
    if (duration.weeks) result = result.minus({ weeks: duration.weeks });
    if (duration.days) result = result.minus({ days: duration.days });
    if (duration.hours) result = result.minus({ hours: duration.hours });
    if (duration.minutes) result = result.minus({ minutes: duration.minutes });
    if (duration.seconds) result = result.minus({ seconds: duration.seconds });
    if (duration.milliseconds)
      result = result.minus({ milliseconds: duration.milliseconds });

    return result.toJSDate();
  }

  startOf(date: Date, unit: TimeUnitKind): Date {
    const { DateTime } = this.luxon;
    const dt = DateTime.fromJSDate(date);

    switch (unit) {
      case "year":
        return dt.startOf("year").toJSDate();
      case "month":
        return dt.startOf("month").toJSDate();
      case "week":
        return dt.startOf("week").toJSDate();
      case "day":
        return dt.startOf("day").toJSDate();
      case "hour":
        return dt.startOf("hour").toJSDate();
      case "minute":
        return dt.startOf("minute").toJSDate();
      case "second":
        return dt.startOf("second").toJSDate();
      case "decade":
        const currentYear = dt.year;
        const decadeStart = Math.floor(currentYear / 10) * 10;
        return dt
          .set({ year: decadeStart, month: 1, day: 1 })
          .startOf("day")
          .toJSDate();
      case "century":
        const centuryYear = dt.year;
        const centuryStart = Math.floor(centuryYear / 100) * 100;
        return dt
          .set({ year: centuryStart, month: 1, day: 1 })
          .startOf("day")
          .toJSDate();
      case "millennium":
        const millenniumYear = dt.year;
        const millenniumStart = Math.floor(millenniumYear / 1000) * 1000;
        return dt
          .set({ year: millenniumStart, month: 1, day: 1 })
          .startOf("day")
          .toJSDate();
      default:
        return dt.toJSDate();
    }
  }

  endOf(date: Date, unit: TimeUnitKind): Date {
    const { DateTime } = this.luxon;
    const dt = DateTime.fromJSDate(date);

    switch (unit) {
      case "year":
        return dt.endOf("year").toJSDate();
      case "month":
        return dt.endOf("month").toJSDate();
      case "week":
        return dt.endOf("week").toJSDate();
      case "day":
        return dt.endOf("day").toJSDate();
      case "hour":
        return dt.endOf("hour").toJSDate();
      case "minute":
        return dt.endOf("minute").toJSDate();
      case "second":
        return dt.endOf("second").toJSDate();
      case "decade":
        const currentYear = dt.year;
        const decadeEnd = Math.floor(currentYear / 10) * 10 + 9;
        return dt
          .set({ year: decadeEnd, month: 12, day: 31 })
          .endOf("day")
          .toJSDate();
      case "century":
        const centuryYear = dt.year;
        const centuryEnd = Math.floor(centuryYear / 100) * 100 + 99;
        return dt
          .set({ year: centuryEnd, month: 12, day: 31 })
          .endOf("day")
          .toJSDate();
      case "millennium":
        const millenniumYear = dt.year;
        const millenniumEnd = Math.floor(millenniumYear / 1000) * 1000 + 999;
        return dt
          .set({ year: millenniumEnd, month: 12, day: 31 })
          .endOf("day")
          .toJSDate();
      default:
        return dt.toJSDate();
    }
  }

  isSame(a: Date, b: Date, unit: TimeUnitKind): boolean {
    const { DateTime } = this.luxon;
    const dtA = DateTime.fromJSDate(a);
    const dtB = DateTime.fromJSDate(b);

    switch (unit) {
      case "year":
        return dtA.hasSame(dtB, "year");
      case "month":
        return dtA.hasSame(dtB, "month");
      case "week":
        return dtA.hasSame(dtB, "week");
      case "day":
        return dtA.hasSame(dtB, "day");
      case "hour":
        return dtA.hasSame(dtB, "hour");
      case "minute":
        return dtA.hasSame(dtB, "minute");
      case "second":
        return dtA.hasSame(dtB, "second");
      case "decade":
        const decadeA = Math.floor(dtA.year / 10);
        const decadeB = Math.floor(dtB.year / 10);
        return decadeA === decadeB;
      case "century":
        const centuryA = Math.floor(dtA.year / 100);
        const centuryB = Math.floor(dtB.year / 100);
        return centuryA === centuryB;
      case "millennium":
        const millenniumA = Math.floor(dtA.year / 1000);
        const millenniumB = Math.floor(dtB.year / 1000);
        return millenniumA === millenniumB;
      default:
        const aValue = dtA.valueOf();
        const bValue = dtB.valueOf();

        // Handle cases where valueOf() might return undefined
        if (aValue === undefined || bValue === undefined) {
          return false;
        }

        return aValue === bValue;
    }
  }

  isBefore(a: Date, b: Date): boolean {
    const { DateTime } = this.luxon;
    const dtA = DateTime.fromJSDate(a);
    const dtB = DateTime.fromJSDate(b);
    return dtA < dtB;
  }

  isAfter(a: Date, b: Date): boolean {
    const { DateTime } = this.luxon;
    const dtA = DateTime.fromJSDate(a);
    const dtB = DateTime.fromJSDate(b);
    return dtA > dtB;
  }

  eachInterval(start: Date, end: Date, unit: TimeUnitKind): Date[] {
    const { DateTime, Interval } = this.luxon;
    const startDt = DateTime.fromJSDate(start);
    const endDt = DateTime.fromJSDate(end);
    const interval = Interval.fromDateTimes(startDt, endDt);

    switch (unit) {
      case "year":
      case "decade":
      case "century":
      case "millennium":
        return interval
          .splitBy({ years: 1 })
          .map((i: any) => i.start.toJSDate());
      case "month":
        return interval
          .splitBy({ months: 1 })
          .map((i: any) => i.start.toJSDate());
      case "week":
        return interval
          .splitBy({ weeks: 1 })
          .map((i: any) => i.start.toJSDate());
      case "day":
        return interval
          .splitBy({ days: 1 })
          .map((i: any) => i.start.toJSDate());
      case "hour":
        return interval
          .splitBy({ hours: 1 })
          .map((i: any) => i.start.toJSDate());
      case "minute":
        return interval
          .splitBy({ minutes: 1 })
          .map((i: any) => i.start.toJSDate());
      default:
        return [start];
    }
  }
}

// Factory function to create adapter instance
export function createLuxonAdapter(): LuxonAdapter {
  // Check if Luxon is available
  if (!luxonImport || !luxonImport.DateTime) {
    throw new Error(
      "luxon is required when using LuxonAdapter. Install it with: npm install luxon"
    );
  }
  return new LuxonAdapter();
}
