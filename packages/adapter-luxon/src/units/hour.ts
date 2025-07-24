import type { UnitHandler } from "@usetemporal/core";
import { DateTime } from "luxon";

export const hourHandler: UnitHandler = {
  startOf(date: Date): Date {
    return DateTime.fromJSDate(date).startOf("hour").toJSDate();
  },
  
  endOf(date: Date): Date {
    return DateTime.fromJSDate(date).endOf("hour").toJSDate();
  },
  
  add(date: Date, amount: number): Date {
    return DateTime.fromJSDate(date).plus({ hours: amount }).toJSDate();
  },
  
  diff(from: Date, to: Date): number {
    const start = DateTime.fromJSDate(from);
    const end = DateTime.fromJSDate(to);
    return Math.floor(end.diff(start, "hours").hours);
  },
};