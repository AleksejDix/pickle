import type { UnitHandler } from "@usetemporal/core";

export const quarterHandler: UnitHandler = {
  startOf(date: Date): Date {
    const month = date.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const result = new Date(date.getFullYear(), quarterStartMonth, 1);
    result.setHours(0, 0, 0, 0);
    return result;
  },
  
  endOf(date: Date): Date {
    const month = date.getMonth();
    const quarterEndMonth = Math.floor(month / 3) * 3 + 2;
    const temporal = (globalThis as any).Temporal;
    const plainDate = temporal.PlainDate.from({
      year: date.getFullYear(),
      month: quarterEndMonth + 1,
      day: 1,
    });
    const lastDay = plainDate.daysInMonth;
    const result = new Date(date.getFullYear(), quarterEndMonth, lastDay);
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
    const result = plainDate.add({ months: amount * 3 });
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
    const duration = fromPlain.until(toPlain, { largestUnit: "month" });
    return Math.floor(duration.months / 3);
  },
};