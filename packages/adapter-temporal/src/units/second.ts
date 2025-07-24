import type { UnitHandler } from "@usetemporal/core";

export const secondHandler: UnitHandler = {
  startOf(date: Date): Date {
    const result = new Date(date);
    result.setMilliseconds(0);
    return result;
  },
  
  endOf(date: Date): Date {
    const result = new Date(date);
    result.setMilliseconds(999);
    return result;
  },
  
  add(date: Date, amount: number): Date {
    const temporal = (globalThis as any).Temporal;
    const plainDateTime = temporal.PlainDateTime.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
    });
    const result = plainDateTime.add({ seconds: amount });
    return new Date(result.toString());
  },
  
  diff(from: Date, to: Date): number {
    const diffInMs = to.getTime() - from.getTime();
    return Math.floor(diffInMs / 1000);
  },
};