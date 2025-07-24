import type { UnitHandler } from "@usetemporal/core";
import { DateTime } from "luxon";

export const quarterHandler: UnitHandler = {
  startOf(date: Date): Date {
    return DateTime.fromJSDate(date).startOf("quarter").toJSDate();
  },
  
  endOf(date: Date): Date {
    return DateTime.fromJSDate(date).endOf("quarter").toJSDate();
  },
  
  add(date: Date, amount: number): Date {
    return DateTime.fromJSDate(date).plus({ quarters: amount }).toJSDate();
  },
  
  diff(from: Date, to: Date): number {
    const start = DateTime.fromJSDate(from);
    const end = DateTime.fromJSDate(to);
    return Math.floor(end.diff(start, "quarters").quarters);
  },
};