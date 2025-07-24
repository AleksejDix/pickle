import type { UnitHandler } from "@usetemporal/core";
import {
  startOfQuarter,
  endOfQuarter,
  add,
  differenceInQuarters,
} from "date-fns";

export const quarterHandler: UnitHandler = {
  startOf(date: Date): Date {
    return startOfQuarter(date);
  },
  
  endOf(date: Date): Date {
    return endOfQuarter(date);
  },
  
  add(date: Date, amount: number): Date {
    return add(date, { months: amount * 3 });
  },
  
  diff(from: Date, to: Date): number {
    return differenceInQuarters(to, from);
  },
};