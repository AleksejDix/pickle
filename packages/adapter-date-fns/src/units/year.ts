import type { UnitHandler } from "@usetemporal/core";
import {
  startOfYear,
  endOfYear,
  add,
  differenceInYears,
} from "date-fns";

export const yearHandler: UnitHandler = {
  startOf(date: Date): Date {
    return startOfYear(date);
  },
  
  endOf(date: Date): Date {
    return endOfYear(date);
  },
  
  add(date: Date, amount: number): Date {
    return add(date, { years: amount });
  },
  
  diff(from: Date, to: Date): number {
    return differenceInYears(to, from);
  },
};