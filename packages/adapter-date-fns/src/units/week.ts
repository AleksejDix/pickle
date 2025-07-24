import type { UnitHandler } from "@usetemporal/core";
import {
  startOfWeek,
  endOfWeek,
  add,
  differenceInWeeks,
} from "date-fns";

export function createWeekHandler(weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): UnitHandler {
  return {
    startOf(date: Date): Date {
      return startOfWeek(date, { weekStartsOn });
    },
    
    endOf(date: Date): Date {
      return endOfWeek(date, { weekStartsOn });
    },
    
    add(date: Date, amount: number): Date {
      return add(date, { weeks: amount });
    },
    
    diff(from: Date, to: Date): number {
      return differenceInWeeks(to, from);
    },
  };
}