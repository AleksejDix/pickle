import { describe, it, expect } from "vitest";
import { contains } from "./contains";
import { toPeriod } from "./toPeriod";
import { withAllAdapters } from "../test/shared-adapter-tests";
import { createTemporal } from "../createTemporal";

withAllAdapters("contains", (adapter) => {
  const temporal = createTemporal({ adapter, date: new Date(2024, 0, 1) });

  describe("period containment", () => {
    it("should detect when a period contains a date", () => {
      const period = toPeriod(temporal, new Date(2024, 0, 1), "month");
      
      expect(contains(period, new Date(2024, 0, 15))).toBe(true);
      expect(contains(period, new Date(2024, 0, 1))).toBe(true);
      expect(contains(period, new Date(2024, 0, 31, 23, 59, 59))).toBe(true);
      expect(contains(period, new Date(2024, 1, 1))).toBe(false);
      expect(contains(period, new Date(2023, 11, 31))).toBe(false);
    });

    it("should detect when a period contains another period", () => {
      const year = toPeriod(temporal, new Date(2024, 5, 15), "year");
      const month = toPeriod(temporal, new Date(2024, 5, 15), "month");
      const day = toPeriod(temporal, new Date(2024, 5, 15), "day");
      
      expect(contains(year, month)).toBe(true);
      expect(contains(year, day)).toBe(true);
      expect(contains(month, day)).toBe(true);
      expect(contains(day, month)).toBe(false);
      expect(contains(month, year)).toBe(false);
    });

    it("should handle cross-year boundaries", () => {
      const december = toPeriod(temporal, new Date(2023, 11, 15), "month");
      const january = toPeriod(temporal, new Date(2024, 0, 15), "month");
      
      expect(contains(december, new Date(2023, 11, 31))).toBe(true);
      expect(contains(december, new Date(2024, 0, 1))).toBe(false);
      expect(contains(january, new Date(2023, 11, 31))).toBe(false);
      expect(contains(january, new Date(2024, 0, 1))).toBe(true);
    });

    it("should handle week containment", () => {
      const week = toPeriod(temporal, new Date(2024, 0, 15), "week");
      const weekStart = adapter.startOf(new Date(2024, 0, 15), "week");
      const weekEnd = adapter.endOf(new Date(2024, 0, 15), "week");
      
      expect(contains(week, weekStart)).toBe(true);
      expect(contains(week, weekEnd)).toBe(true);
      expect(contains(week, new Date(weekEnd.getTime() + 1))).toBe(false);
    });

    it("should handle partial period overlap", () => {
      const period1 = {
        start: new Date(2024, 0, 10),
        end: new Date(2024, 0, 20),
        type: "custom" as const,
        date: new Date(2024, 0, 15),
      };
      
      const period2 = {
        start: new Date(2024, 0, 15),
        end: new Date(2024, 0, 25),
        type: "custom" as const,
        date: new Date(2024, 0, 20),
      };
      
      // period1 does not fully contain period2
      expect(contains(period1, period2)).toBe(false);
      
      // But it contains part of period2
      expect(contains(period1, new Date(2024, 0, 15))).toBe(true);
      expect(contains(period1, new Date(2024, 0, 18))).toBe(true);
      expect(contains(period1, new Date(2024, 0, 21))).toBe(false);
    });

    it("should handle exact boundary matches", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const dayStart = adapter.startOf(new Date(2024, 0, 15), "day");
      const dayEnd = adapter.endOf(new Date(2024, 0, 15), "day");
      
      expect(contains(day, dayStart)).toBe(true);
      expect(contains(day, dayEnd)).toBe(true);
      expect(contains(day, new Date(dayStart.getTime() - 1))).toBe(false);
      expect(contains(day, new Date(dayEnd.getTime() + 1))).toBe(false);
    });

    it("should handle hour and minute containment", () => {
      const hour = toPeriod(temporal, new Date(2024, 0, 15, 14, 30), "hour");
      
      expect(contains(hour, new Date(2024, 0, 15, 14, 0))).toBe(true);
      expect(contains(hour, new Date(2024, 0, 15, 14, 30))).toBe(true);
      expect(contains(hour, new Date(2024, 0, 15, 14, 59, 59))).toBe(true);
      expect(contains(hour, new Date(2024, 0, 15, 15, 0))).toBe(false);
      expect(contains(hour, new Date(2024, 0, 15, 13, 59, 59))).toBe(false);
    });
  });
});