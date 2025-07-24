import type { UnitHandler } from "@usetemporal/core";
import {
  startOfMonth,
  endOfMonth,
  add,
  differenceInMonths,
} from "date-fns";

export const monthHandler: UnitHandler = {
  startOf(date: Date): Date {
    return startOfMonth(date);
  },
  
  endOf(date: Date): Date {
    return endOfMonth(date);
  },
  
  add(date: Date, amount: number): Date {
    return add(date, { months: amount });
  },
  
  diff(from: Date, to: Date): number {
    return differenceInMonths(to, from);
  },
};