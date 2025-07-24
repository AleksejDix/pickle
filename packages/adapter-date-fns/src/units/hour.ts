import type { UnitHandler } from "@usetemporal/core";
import {
  startOfHour,
  endOfHour,
  add,
  differenceInHours,
} from "date-fns";

export const hourHandler: UnitHandler = {
  startOf(date: Date): Date {
    return startOfHour(date);
  },
  
  endOf(date: Date): Date {
    return endOfHour(date);
  },
  
  add(date: Date, amount: number): Date {
    return add(date, { hours: amount });
  },
  
  diff(from: Date, to: Date): number {
    return differenceInHours(to, from);
  },
};