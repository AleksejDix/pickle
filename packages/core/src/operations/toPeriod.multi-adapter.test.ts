import { describe, it, expect } from "vitest";
import { toPeriod } from "./toPeriod";
import { withAllAdapters } from "../test/shared-adapter-tests";
import { createTemporal } from "../createTemporal";

withAllAdapters("toPeriod", (adapter) => {
  const temporal = createTemporal({ adapter, date: new Date(2024, 0, 1) });

  describe("date to period conversion", () => {
    it("should convert date to year period", () => {
      const date = new Date(2024, 5, 15, 14, 30, 45);
      const year = toPeriod(temporal, date, "year");
      
      expect(year.type).toBe("year");
      expect(year.start.getFullYear()).toBe(2024);
      expect(year.start.getMonth()).toBe(0);
      expect(year.start.getDate()).toBe(1);
      expect(year.end.getFullYear()).toBe(2024);
      expect(year.end.getMonth()).toBe(11);
      expect(year.end.getDate()).toBe(31);
    });

    it("should convert date to month period", () => {
      const date = new Date(2024, 1, 29); // February 29 (leap year)
      const month = toPeriod(temporal, date, "month");
      
      expect(month.type).toBe("month");
      expect(month.start.getMonth()).toBe(1);
      expect(month.start.getDate()).toBe(1);
      expect(month.end.getMonth()).toBe(1);
      expect(month.end.getDate()).toBe(29);
    });

    it("should convert date to week period", () => {
      const date = new Date(2024, 0, 10); // Wednesday
      const week = toPeriod(temporal, date, "week");
      
      expect(week.type).toBe("week");
      // Should start on Monday (weekStartsOn: 1)
      expect(week.start.getDay()).toBe(1);
      expect(week.end.getDay()).toBe(0); // Sunday
      
      // Should contain the original date
      expect(week.start.getTime()).toBeLessThanOrEqual(date.getTime());
      expect(week.end.getTime()).toBeGreaterThanOrEqual(date.getTime());
    });

    it("should convert date to day period", () => {
      const date = new Date(2024, 0, 15, 14, 30, 45, 123);
      const day = toPeriod(temporal, date, "day");
      
      expect(day.type).toBe("day");
      expect(day.start.getDate()).toBe(15);
      expect(day.start.getHours()).toBe(0);
      expect(day.start.getMinutes()).toBe(0);
      expect(day.start.getSeconds()).toBe(0);
      expect(day.start.getMilliseconds()).toBe(0);
      
      expect(day.end.getDate()).toBe(15);
      expect(day.end.getHours()).toBe(23);
      expect(day.end.getMinutes()).toBe(59);
      expect(day.end.getSeconds()).toBe(59);
    });

    it("should convert date to hour period", () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const hour = toPeriod(temporal, date, "hour");
      
      expect(hour.type).toBe("hour");
      expect(hour.start.getHours()).toBe(14);
      expect(hour.start.getMinutes()).toBe(0);
      expect(hour.end.getHours()).toBe(14);
      expect(hour.end.getMinutes()).toBe(59);
    });

    it("should convert date to minute period", () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const minute = toPeriod(temporal, date, "minute");
      
      expect(minute.type).toBe("minute");
      expect(minute.start.getMinutes()).toBe(30);
      expect(minute.start.getSeconds()).toBe(0);
      expect(minute.end.getMinutes()).toBe(30);
      expect(minute.end.getSeconds()).toBe(59);
    });

    it("should convert date to second period", () => {
      const date = new Date(2024, 0, 15, 14, 30, 45, 678);
      const second = toPeriod(temporal, date, "second");
      
      expect(second.type).toBe("second");
      expect(second.start.getSeconds()).toBe(45);
      expect(second.start.getMilliseconds()).toBe(0);
      expect(second.end.getSeconds()).toBe(45);
      expect(second.end.getMilliseconds()).toBe(999);
    });

    it("should handle edge cases", () => {
      // Midnight
      const midnight = new Date(2024, 0, 15, 0, 0, 0);
      const midnightDay = toPeriod(temporal, midnight, "day");
      expect(midnightDay.start.getDate()).toBe(15);
      
      // End of year
      const endOfYear = new Date(2024, 11, 31, 23, 59, 59);
      const yearPeriod = toPeriod(temporal, endOfYear, "year");
      expect(yearPeriod.start.getFullYear()).toBe(2024);
      expect(yearPeriod.end.getFullYear()).toBe(2024);
      
      // Leap day
      const leapDay = new Date(2024, 1, 29);
      const leapMonth = toPeriod(temporal, leapDay, "month");
      expect(leapMonth.end.getDate()).toBe(29);
    });

    it("should preserve the original date reference", () => {
      const date = new Date(2024, 5, 15, 14, 30, 45, 123);
      const units = ["year", "month", "week", "day", "hour", "minute", "second"] as const;
      
      units.forEach(unit => {
        const period = toPeriod(temporal, date, unit);
        expect(period.date.getTime()).toBe(date.getTime());
      });
    });

    it("should handle different timezones consistently", () => {
      // Create dates at different times of day
      const morning = new Date(2024, 0, 15, 6, 0, 0);
      const evening = new Date(2024, 0, 15, 20, 0, 0);
      
      const morningDay = toPeriod(temporal, morning, "day");
      const eveningDay = toPeriod(temporal, evening, "day");
      
      // Should be the same day period
      expect(morningDay.start.getTime()).toBe(eveningDay.start.getTime());
      expect(morningDay.end.getTime()).toBe(eveningDay.end.getTime());
    });

    it("should handle week boundaries correctly", () => {
      // Test Sunday to Monday transition
      const sunday = new Date(2024, 0, 7); // Sunday
      const monday = new Date(2024, 0, 8); // Monday
      
      const sundayWeek = toPeriod(temporal, sunday, "week");
      const mondayWeek = toPeriod(temporal, monday, "week");
      
      // With weekStartsOn: 1 (Monday), these should be different weeks
      expect(sundayWeek.start.getTime()).not.toBe(mondayWeek.start.getTime());
    });
  });
});