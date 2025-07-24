import type { UnitHandler } from "@usetemporal/core";
import { DateTime } from "luxon";

export const dayHandler: UnitHandler = {
  startOf(date: Date): Date {
    return DateTime.fromJSDate(date).startOf("day").toJSDate();
  },
  
  endOf(date: Date): Date {
    return DateTime.fromJSDate(date).endOf("day").toJSDate();
  },
  
  add(date: Date, amount: number): Date {
    return DateTime.fromJSDate(date).plus({ days: amount }).toJSDate();
  },
  
  diff(from: Date, to: Date): number {
    const start = DateTime.fromJSDate(from);
    const end = DateTime.fromJSDate(to);
    return Math.floor(end.diff(start, "days").days);
  },
};