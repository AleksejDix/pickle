import type { UnitHandler } from "@usetemporal/core";

export const yearHandler: UnitHandler = {
  startOf(date: Date): Date {
    const temporal = (globalThis as any).Temporal;
    const plainDate = temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    const startOfYear = plainDate.with({ month: 1, day: 1 });
    return new Date(startOfYear.toString());
  },
  
  endOf(date: Date): Date {
    const temporal = (globalThis as any).Temporal;
    const plainDate = temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    const endOfYear = plainDate.with({ month: 12, day: 31 });
    const endDate = new Date(endOfYear.toString());
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  },
  
  add(date: Date, amount: number): Date {
    const temporal = (globalThis as any).Temporal;
    const plainDate = temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    const result = plainDate.add({ years: amount });
    const newDate = new Date(result.toString());
    newDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    return newDate;
  },
  
  diff(from: Date, to: Date): number {
    const temporal = (globalThis as any).Temporal;
    const fromPlain = temporal.PlainDate.from({
      year: from.getFullYear(),
      month: from.getMonth() + 1,
      day: from.getDate(),
    });
    const toPlain = temporal.PlainDate.from({
      year: to.getFullYear(),
      month: to.getMonth() + 1,
      day: to.getDate(),
    });
    const duration = fromPlain.until(toPlain, { largestUnit: "year" });
    return duration.years;
  },
};