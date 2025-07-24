import type { UnitHandler } from "@usetemporal/core";
import { DateTime } from "luxon";

export const yearHandler: UnitHandler = {
  startOf(date: Date): Date {
    return DateTime.fromJSDate(date).startOf("year").toJSDate();
  },
  
  endOf(date: Date): Date {
    return DateTime.fromJSDate(date).endOf("year").toJSDate();
  },
  
  add(date: Date, amount: number): Date {
    return DateTime.fromJSDate(date).plus({ years: amount }).toJSDate();
  },
  
  diff(from: Date, to: Date): number {
    const start = DateTime.fromJSDate(from);
    const end = DateTime.fromJSDate(to);
    return Math.floor(end.diff(start, "years").years);
  },
};