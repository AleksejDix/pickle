import type { FunctionalAdapter, Unit } from "../types";

/**
 * Functional mock adapter for testing
 * Returns predictable results for all operations
 */
export function createMockAdapter(options?: {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}): FunctionalAdapter {
  const weekStartsOn = options?.weekStartsOn ?? 1;

  return {
    startOf(date: Date, unit: Exclude<Unit, "custom" | "stableMonth">): Date {
      const result = new Date(date);

      switch (unit) {
        case "year":
          result.setMonth(0, 1);
          result.setHours(0, 0, 0, 0);
          break;
        case "month":
          result.setDate(1);
          result.setHours(0, 0, 0, 0);
          break;
        case "week": {
          const day = result.getDay();
          const diff = (day - weekStartsOn + 7) % 7;
          result.setDate(result.getDate() - diff);
          result.setHours(0, 0, 0, 0);
          break;
        }
        case "day":
          result.setHours(0, 0, 0, 0);
          break;
        case "hour":
          result.setMinutes(0, 0, 0);
          break;
        case "minute":
          result.setSeconds(0, 0);
          break;
        case "second":
          result.setMilliseconds(0);
          break;
        case "quarter": {
          const month = result.getMonth();
          const quarterStartMonth = Math.floor(month / 3) * 3;
          result.setMonth(quarterStartMonth, 1);
          result.setHours(0, 0, 0, 0);
          break;
        }
      }

      return result;
    },

    endOf(date: Date, unit: Exclude<Unit, "custom" | "stableMonth">): Date {
      const result = new Date(date);

      switch (unit) {
        case "year":
          result.setMonth(11, 31);
          result.setHours(23, 59, 59, 999);
          break;
        case "month":
          result.setMonth(result.getMonth() + 1, 0);
          result.setHours(23, 59, 59, 999);
          break;
        case "week": {
          const day = result.getDay();
          const diff = (day - weekStartsOn + 7) % 7;
          result.setDate(result.getDate() - diff + 6);
          result.setHours(23, 59, 59, 999);
          break;
        }
        case "day":
          result.setHours(23, 59, 59, 999);
          break;
        case "hour":
          result.setMinutes(59, 59, 999);
          break;
        case "minute":
          result.setSeconds(59, 999);
          break;
        case "second":
          result.setMilliseconds(999);
          break;
        case "quarter": {
          const month = result.getMonth();
          const quarterStartMonth = Math.floor(month / 3) * 3;
          result.setMonth(quarterStartMonth + 3, 0);
          result.setHours(23, 59, 59, 999);
          break;
        }
      }

      return result;
    },

    add(
      date: Date,
      amount: number,
      unit: Exclude<Unit, "custom" | "stableMonth">
    ): Date {
      const result = new Date(date);

      switch (unit) {
        case "year":
          result.setFullYear(result.getFullYear() + amount);
          break;
        case "month":
          result.setMonth(result.getMonth() + amount);
          break;
        case "week":
          result.setDate(result.getDate() + amount * 7);
          break;
        case "day":
          result.setDate(result.getDate() + amount);
          break;
        case "hour":
          result.setHours(result.getHours() + amount);
          break;
        case "minute":
          result.setMinutes(result.getMinutes() + amount);
          break;
        case "second":
          result.setSeconds(result.getSeconds() + amount);
          break;
        case "quarter":
          result.setMonth(result.getMonth() + amount * 3);
          break;
      }

      return result;
    },

    diff(
      from: Date,
      to: Date,
      unit: Exclude<Unit, "custom" | "stableMonth">
    ): number {
      const diffMs = to.getTime() - from.getTime();

      switch (unit) {
        case "year":
          return to.getFullYear() - from.getFullYear();
        case "month":
          return (
            (to.getFullYear() - from.getFullYear()) * 12 +
            (to.getMonth() - from.getMonth())
          );
        case "week":
          return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        case "day":
          return Math.floor(diffMs / (24 * 60 * 60 * 1000));
        case "hour":
          return Math.floor(diffMs / (60 * 60 * 1000));
        case "minute":
          return Math.floor(diffMs / (60 * 1000));
        case "second":
          return Math.floor(diffMs / 1000);
        case "quarter": {
          const fromQuarter = Math.floor(from.getMonth() / 3);
          const toQuarter = Math.floor(to.getMonth() / 3);
          const yearDiff = to.getFullYear() - from.getFullYear();
          return yearDiff * 4 + (toQuarter - fromQuarter);
        }
      }
    },
  };
}

// Export a default instance
export const mockAdapter = createMockAdapter({ weekStartsOn: 1 });
