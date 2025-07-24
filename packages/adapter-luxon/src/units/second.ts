import type { UnitHandler } from "@usetemporal/core";
import { DateTime } from "luxon";

export const secondHandler: UnitHandler = {
  startOf(date: Date): Date {
    return DateTime.fromJSDate(date).startOf("second").toJSDate();
  },
  
  endOf(date: Date): Date {
    return DateTime.fromJSDate(date).endOf("second").toJSDate();
  },
  
  add(date: Date, amount: number): Date {
    return DateTime.fromJSDate(date).plus({ seconds: amount }).toJSDate();
  },
  
  diff(from: Date, to: Date): number {
    const start = DateTime.fromJSDate(from);
    const end = DateTime.fromJSDate(to);
    return Math.floor(end.diff(start, "seconds").seconds);
  },
};