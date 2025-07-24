import type { UnitHandler } from "@usetemporal/core";
import {
  startOfMinute,
  endOfMinute,
  add,
  differenceInMinutes,
} from "date-fns";

export const minuteHandler: UnitHandler = {
  startOf(date: Date): Date {
    return startOfMinute(date);
  },
  
  endOf(date: Date): Date {
    return endOfMinute(date);
  },
  
  add(date: Date, amount: number): Date {
    return add(date, { minutes: amount });
  },
  
  diff(from: Date, to: Date): number {
    return differenceInMinutes(to, from);
  },
};