import { describe, it, expect } from "vitest";
import { next, previous } from "./index";
import { toPeriod } from "./toPeriod";
import { withAllAdapters } from "../test/shared-adapter-tests";
import { createTemporal } from "../createTemporal";

withAllAdapters("next/previous", (adapter) => {
  const temporal = createTemporal({ adapter, date: new Date(2024, 0, 1) });

  describe("next operation", () => {
    it("should get next day", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const nextDay = next(temporal, day);
      
      expect(nextDay.type).toBe("day");
      expect(nextDay.start.getDate()).toBe(16);
      expect(nextDay.start.getMonth()).toBe(0);
    });

    it("should get next month", () => {
      const month = toPeriod(temporal, new Date(2024, 0, 15), "month");
      const nextMonth = next(temporal, month);
      
      expect(nextMonth.type).toBe("month");
      expect(nextMonth.start.getMonth()).toBe(1); // February
      expect(nextMonth.start.getFullYear()).toBe(2024);
    });

    it("should get next year", () => {
      const year = toPeriod(temporal, new Date(2024, 5, 15), "year");
      const nextYear = next(temporal, year);
      
      expect(nextYear.type).toBe("year");
      expect(nextYear.start.getFullYear()).toBe(2025);
    });

    it("should handle month boundaries", () => {
      const lastDayOfMonth = toPeriod(temporal, new Date(2024, 0, 31), "day");
      const nextDay = next(temporal, lastDayOfMonth);
      
      expect(nextDay.start.getMonth()).toBe(1); // February
      expect(nextDay.start.getDate()).toBe(1);
    });

    it("should handle year boundaries", () => {
      const december = toPeriod(temporal, new Date(2023, 11, 15), "month");
      const january = next(temporal, december);
      
      expect(january.start.getFullYear()).toBe(2024);
      expect(january.start.getMonth()).toBe(0);
    });

    it("should get next hour", () => {
      const hour = toPeriod(temporal, new Date(2024, 0, 15, 14), "hour");
      const nextHour = next(temporal, hour);
      
      expect(nextHour.type).toBe("hour");
      expect(nextHour.start.getHours()).toBe(15);
    });

    it("should handle day boundary for hours", () => {
      const lastHour = toPeriod(temporal, new Date(2024, 0, 15, 23), "hour");
      const nextHour = next(temporal, lastHour);
      
      expect(nextHour.start.getDate()).toBe(16);
      expect(nextHour.start.getHours()).toBe(0);
    });
  });

  describe("previous operation", () => {
    it("should get previous day", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const prevDay = previous(temporal, day);
      
      expect(prevDay.type).toBe("day");
      expect(prevDay.start.getDate()).toBe(14);
      expect(prevDay.start.getMonth()).toBe(0);
    });

    it("should get previous month", () => {
      const month = toPeriod(temporal, new Date(2024, 1, 15), "month");
      const prevMonth = previous(temporal, month);
      
      expect(prevMonth.type).toBe("month");
      expect(prevMonth.start.getMonth()).toBe(0); // January
      expect(prevMonth.start.getFullYear()).toBe(2024);
    });

    it("should get previous year", () => {
      const year = toPeriod(temporal, new Date(2024, 5, 15), "year");
      const prevYear = previous(temporal, year);
      
      expect(prevYear.type).toBe("year");
      expect(prevYear.start.getFullYear()).toBe(2023);
    });

    it("should handle month boundaries", () => {
      const firstDayOfMonth = toPeriod(temporal, new Date(2024, 1, 1), "day");
      const prevDay = previous(temporal, firstDayOfMonth);
      
      expect(prevDay.start.getMonth()).toBe(0); // January
      expect(prevDay.start.getDate()).toBe(31);
    });

    it("should handle year boundaries", () => {
      const january = toPeriod(temporal, new Date(2024, 0, 15), "month");
      const december = previous(temporal, january);
      
      expect(december.start.getFullYear()).toBe(2023);
      expect(december.start.getMonth()).toBe(11);
    });

    it("should get previous minute", () => {
      const minute = toPeriod(temporal, new Date(2024, 0, 15, 14, 30), "minute");
      const prevMinute = previous(temporal, minute);
      
      expect(prevMinute.type).toBe("minute");
      expect(prevMinute.start.getMinutes()).toBe(29);
    });

    it("should handle hour boundary for minutes", () => {
      const firstMinute = toPeriod(temporal, new Date(2024, 0, 15, 14, 0), "minute");
      const prevMinute = previous(temporal, firstMinute);
      
      expect(prevMinute.start.getHours()).toBe(13);
      expect(prevMinute.start.getMinutes()).toBe(59);
    });
  });

  describe("next/previous consistency", () => {
    it("should be reversible operations", () => {
      const units = ["year", "month", "week", "day", "hour", "minute", "second"] as const;
      const date = new Date(2024, 5, 15, 14, 30, 45);
      
      units.forEach(unit => {
        const period = toPeriod(temporal, date, unit);
        const nextPeriod = next(temporal, period);
        const backToPeriod = previous(temporal, nextPeriod);
        
        expect(backToPeriod.type).toBe(period.type);
        expect(backToPeriod.start.getTime()).toBe(period.start.getTime());
        expect(backToPeriod.end.getTime()).toBe(period.end.getTime());
      });
    });

    it("should maintain period continuity", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const nextDay = next(temporal, day);
      
      // End of current day should be just before start of next day
      const msBetween = nextDay.start.getTime() - day.end.getTime();
      expect(msBetween).toBe(1);
    });

    it("should handle week navigation correctly", () => {
      const week = toPeriod(temporal, new Date(2024, 0, 15), "week");
      const nextWeek = next(temporal, week);
      const prevWeek = previous(temporal, week);
      
      // Weeks should be exactly 7 days apart
      const nextDiff = (nextWeek.start.getTime() - week.start.getTime()) / (24 * 60 * 60 * 1000);
      const prevDiff = (week.start.getTime() - prevWeek.start.getTime()) / (24 * 60 * 60 * 1000);
      
      expect(nextDiff).toBe(7);
      expect(prevDiff).toBe(7);
    });
  });
});