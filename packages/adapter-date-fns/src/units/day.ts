import type { UnitHandler } from "@usetemporal/core";
import {
  startOfDay,
  endOfDay,
  add,
  differenceInDays,
} from "date-fns";

export const dayHandler: UnitHandler = {
  startOf(date: Date): Date {
    return startOfDay(date);
  },
  
  endOf(date: Date): Date {
    return endOfDay(date);
  },
  
  add(date: Date, amount: number): Date {
    return add(date, { days: amount });
  },
  
  diff(from: Date, to: Date): number {
    return differenceInDays(to, from);
  },
};