import type { UnitHandler } from "@usetemporal/core";
import {
  startOfSecond,
  endOfSecond,
  add,
  differenceInSeconds,
} from "date-fns";

export const secondHandler: UnitHandler = {
  startOf(date: Date): Date {
    return startOfSecond(date);
  },
  
  endOf(date: Date): Date {
    return endOfSecond(date);
  },
  
  add(date: Date, amount: number): Date {
    return add(date, { seconds: amount });
  },
  
  diff(from: Date, to: Date): number {
    return differenceInSeconds(to, from);
  },
};