import type { UnitHandler } from "@usetemporal/core";

export const dayHandler: UnitHandler = {
  startOf(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },
  
  endOf(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  },
  
  add(date: Date, amount: number): Date {
    const temporal = (globalThis as any).Temporal;
    const plainDate = temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    const result = plainDate.add({ days: amount });
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
    const duration = fromPlain.until(toPlain, { largestUnit: "day" });
    return duration.days;
  },
};