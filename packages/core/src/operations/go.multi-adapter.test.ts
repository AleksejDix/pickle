import { describe, it, expect } from "vitest";
import { go } from "./go";
import { toPeriod } from "./toPeriod";
import { withAllAdapters } from "../test/shared-adapter-tests";
import { createTemporal } from "../createTemporal";

withAllAdapters("go", (adapter) => {
  const temporal = createTemporal({ adapter, date: new Date(2024, 0, 1) });

  describe("navigation operations", () => {
    it("should navigate forward by positive amounts", () => {
      const startDate = new Date(2024, 0, 15);
      const day = toPeriod(temporal, startDate, "day");
      
      const nextWeek = go(temporal, day, 7);
      expect(nextWeek.type).toBe("day");
      expect(nextWeek.start.getDate()).toBe(22);
      expect(nextWeek.start.getMonth()).toBe(0);
      
      const nextMonth = go(temporal, day, 31);
      expect(nextMonth.start.getMonth()).toBe(1); // February
      expect(nextMonth.start.getDate()).toBe(15);
    });

    it("should navigate backward by negative amounts", () => {
      const startDate = new Date(2024, 5, 15); // June 15
      const month = toPeriod(temporal, startDate, "month");
      
      const twoMonthsAgo = go(temporal, month, -2);
      expect(twoMonthsAgo.type).toBe("month");
      expect(twoMonthsAgo.start.getMonth()).toBe(3); // April
      expect(twoMonthsAgo.start.getFullYear()).toBe(2024);
      
      const sixMonthsAgo = go(temporal, month, -6);
      expect(sixMonthsAgo.start.getMonth()).toBe(11); // December
      expect(sixMonthsAgo.start.getFullYear()).toBe(2023);
    });

    it("should handle zero offset", () => {
      const date = new Date(2024, 0, 15);
      const week = toPeriod(temporal, date, "week");
      
      const sameWeek = go(temporal, week, 0);
      expect(sameWeek.type).toBe("week");
      expect(sameWeek.start.getTime()).toBe(week.start.getTime());
      expect(sameWeek.end.getTime()).toBe(week.end.getTime());
    });

    it("should navigate years correctly", () => {
      const year = toPeriod(temporal, new Date(2024, 5, 15), "year");
      
      const nextYear = go(temporal, year, 1);
      expect(nextYear.start.getFullYear()).toBe(2025);
      expect(nextYear.end.getFullYear()).toBe(2025);
      
      const tenYearsAgo = go(temporal, year, -10);
      expect(tenYearsAgo.start.getFullYear()).toBe(2014);
    });

    it("should navigate weeks correctly", () => {
      const week = toPeriod(temporal, new Date(2024, 0, 10), "week");
      
      const fourWeeksLater = go(temporal, week, 4);
      // Should be approximately 28 days later
      const daysDiff = Math.round((fourWeeksLater.start.getTime() - week.start.getTime()) / (24 * 60 * 60 * 1000));
      expect(daysDiff).toBe(28);
    });

    it("should navigate hours correctly", () => {
      const hour = toPeriod(temporal, new Date(2024, 0, 15, 10), "hour");
      
      const fifteenHoursLater = go(temporal, hour, 15);
      expect(fifteenHoursLater.start.getDate()).toBe(16); // Next day
      expect(fifteenHoursLater.start.getHours()).toBe(1); // 10 + 15 = 25, so 1 AM next day
    });

    it("should handle month boundaries correctly", () => {
      // Start on January 31
      const day = toPeriod(temporal, new Date(2024, 0, 31), "day");
      
      const nextDay = go(temporal, day, 1);
      expect(nextDay.start.getMonth()).toBe(1); // February
      expect(nextDay.start.getDate()).toBe(1);
      
      // Navigate months from January 31
      const month = toPeriod(temporal, new Date(2024, 0, 31), "month");
      const nextMonth = go(temporal, month, 1);
      expect(nextMonth.start.getMonth()).toBe(1); // February
      expect(nextMonth.end.getDate()).toBe(29); // Feb 29 (leap year)
    });

    it("should handle year boundaries correctly", () => {
      const december = toPeriod(temporal, new Date(2023, 11, 15), "month");
      
      const january = go(temporal, december, 1);
      expect(january.start.getFullYear()).toBe(2024);
      expect(january.start.getMonth()).toBe(0);
      
      const november = go(temporal, december, -1);
      expect(november.start.getFullYear()).toBe(2023);
      expect(november.start.getMonth()).toBe(10);
    });

    it("should handle daylight saving time transitions", () => {
      // Test navigation across DST boundary (spring forward)
      const beforeDST = toPeriod(temporal, new Date(2024, 2, 9), "day"); // March 9
      const afterDST = go(temporal, beforeDST, 2); // March 11
      
      expect(afterDST.start.getDate()).toBe(11);
      expect(afterDST.type).toBe("day");
    });

    it("should preserve period type", () => {
      const units = ["year", "month", "week", "day", "hour", "minute", "second"] as const;
      const date = new Date(2024, 5, 15, 14, 30, 45);
      
      units.forEach(unit => {
        const period = toPeriod(temporal, date, unit);
        const navigated = go(temporal, period, 1);
        expect(navigated.type).toBe(unit);
      });
    });

    it("should handle large offsets", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 1), "day");
      
      const yearLater = go(temporal, day, 365);
      expect(yearLater.start.getFullYear()).toBe(2025);
      expect(yearLater.start.getMonth()).toBe(0);
      expect(yearLater.start.getDate()).toBe(1);
      
      const leapYearLater = go(temporal, day, 366); // 2024 is a leap year
      expect(leapYearLater.start.getFullYear()).toBe(2025);
      expect(leapYearLater.start.getDate()).toBe(2);
    });
  });
});