import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isToday, isWeekday, isWeekend } from "./utils";
import { toPeriod } from "./toPeriod";
import { withAllAdapters } from "../test/shared-adapter-tests";
import { createTemporal } from "../createTemporal";

withAllAdapters("utils", (adapter) => {
  const temporal = createTemporal({ adapter, date: new Date(2024, 0, 1) });

  describe("isToday", () => {
    beforeEach(() => {
      // Mock current date to a known value
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 0, 15, 10, 30)); // Monday, January 15, 2024
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true for today's date", () => {
      const today = new Date(2024, 0, 15, 14, 45); // Different time, same day
      const todayPeriod = toPeriod(temporal, today, "day");
      expect(isToday(todayPeriod, temporal)).toBe(true);
    });

    it("should return false for yesterday", () => {
      const yesterday = new Date(2024, 0, 14);
      const yesterdayPeriod = toPeriod(temporal, yesterday, "day");
      expect(isToday(yesterdayPeriod, temporal)).toBe(false);
    });

    it("should return false for tomorrow", () => {
      const tomorrow = new Date(2024, 0, 16);
      const tomorrowPeriod = toPeriod(temporal, tomorrow, "day");
      expect(isToday(tomorrowPeriod, temporal)).toBe(false);
    });

    it("should return true for today period", () => {
      const todayPeriod = toPeriod(temporal, new Date(2024, 0, 15), "day");
      expect(isToday(todayPeriod, temporal)).toBe(true);
    });

    it("should return false for yesterday period", () => {
      const yesterdayPeriod = toPeriod(temporal, new Date(2024, 0, 14), "day");
      expect(isToday(yesterdayPeriod, temporal)).toBe(false);
    });

    it("should handle periods that contain today", () => {
      const weekPeriod = toPeriod(temporal, new Date(2024, 0, 15), "week");
      const monthPeriod = toPeriod(temporal, new Date(2024, 0, 15), "month");
      const yearPeriod = toPeriod(temporal, new Date(2024, 0, 15), "year");
      
      // These periods contain today but aren't "today" periods
      expect(isToday(weekPeriod, temporal)).toBe(false);
      expect(isToday(monthPeriod, temporal)).toBe(false);
      expect(isToday(yearPeriod, temporal)).toBe(false);
    });

    it("should handle edge of day correctly", () => {
      const startOfDay = new Date(2024, 0, 15, 0, 0, 0, 0);
      const endOfDay = new Date(2024, 0, 15, 23, 59, 59, 999);
      
      const startOfDayPeriod = toPeriod(temporal, startOfDay, "day");
      const endOfDayPeriod = toPeriod(temporal, endOfDay, "day");
      expect(isToday(startOfDayPeriod, temporal)).toBe(true);
      expect(isToday(endOfDayPeriod, temporal)).toBe(true);
    });
  });

  describe("isWeekday", () => {
    it("should return true for Monday through Friday", () => {
      const monday = new Date(2024, 0, 15); // Monday
      const tuesday = new Date(2024, 0, 16);
      const wednesday = new Date(2024, 0, 17);
      const thursday = new Date(2024, 0, 18);
      const friday = new Date(2024, 0, 19);
      
      const mondayPeriod = toPeriod(temporal, monday, "day");
      const tuesdayPeriod = toPeriod(temporal, tuesday, "day");
      const wednesdayPeriod = toPeriod(temporal, wednesday, "day");
      const thursdayPeriod = toPeriod(temporal, thursday, "day");
      const fridayPeriod = toPeriod(temporal, friday, "day");
      
      expect(isWeekday(mondayPeriod)).toBe(true);
      expect(isWeekday(tuesdayPeriod)).toBe(true);
      expect(isWeekday(wednesdayPeriod)).toBe(true);
      expect(isWeekday(thursdayPeriod)).toBe(true);
      expect(isWeekday(fridayPeriod)).toBe(true);
    });

    it("should return false for Saturday and Sunday", () => {
      const saturday = new Date(2024, 0, 20);
      const sunday = new Date(2024, 0, 21);
      
      const saturdayPeriod = toPeriod(temporal, saturday, "day");
      const sundayPeriod = toPeriod(temporal, sunday, "day");
      
      expect(isWeekday(saturdayPeriod)).toBe(false);
      expect(isWeekday(sundayPeriod)).toBe(false);
    });

    it("should handle periods correctly", () => {
      const mondayPeriod = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const saturdayPeriod = toPeriod(temporal, new Date(2024, 0, 20), "day");
      
      expect(isWeekday(mondayPeriod)).toBe(true);
      expect(isWeekday(saturdayPeriod)).toBe(false);
    });

    it("should handle non-day periods", () => {
      const weekdayWeek = toPeriod(temporal, new Date(2024, 0, 15), "week");
      const weekdayMonth = toPeriod(temporal, new Date(2024, 0, 15), "month");
      
      // These use the period's reference date
      expect(isWeekday(weekdayWeek)).toBe(true); // Monday
      expect(isWeekday(weekdayMonth)).toBe(true); // Monday
    });
  });

  describe("isWeekend", () => {
    it("should return true for Saturday and Sunday", () => {
      const saturday = new Date(2024, 0, 20);
      const sunday = new Date(2024, 0, 21);
      
      const saturdayPeriod = toPeriod(temporal, saturday, "day");
      const sundayPeriod = toPeriod(temporal, sunday, "day");
      
      expect(isWeekend(saturdayPeriod)).toBe(true);
      expect(isWeekend(sundayPeriod)).toBe(true);
    });

    it("should return false for Monday through Friday", () => {
      const monday = new Date(2024, 0, 15);
      const tuesday = new Date(2024, 0, 16);
      const wednesday = new Date(2024, 0, 17);
      const thursday = new Date(2024, 0, 18);
      const friday = new Date(2024, 0, 19);
      
      const mondayPeriod = toPeriod(temporal, monday, "day");
      const tuesdayPeriod = toPeriod(temporal, tuesday, "day");
      const wednesdayPeriod = toPeriod(temporal, wednesday, "day");
      const thursdayPeriod = toPeriod(temporal, thursday, "day");
      const fridayPeriod = toPeriod(temporal, friday, "day");
      
      expect(isWeekend(mondayPeriod)).toBe(false);
      expect(isWeekend(tuesdayPeriod)).toBe(false);
      expect(isWeekend(wednesdayPeriod)).toBe(false);
      expect(isWeekend(thursdayPeriod)).toBe(false);
      expect(isWeekend(fridayPeriod)).toBe(false);
    });

    it("should handle periods correctly", () => {
      const saturdayPeriod = toPeriod(temporal, new Date(2024, 0, 20), "day");
      const mondayPeriod = toPeriod(temporal, new Date(2024, 0, 15), "day");
      
      expect(isWeekend(saturdayPeriod)).toBe(true);
      expect(isWeekend(mondayPeriod)).toBe(false);
    });
  });

  describe("consistency tests", () => {
    it("should be opposite of isWeekday", () => {
      const dates = [
        new Date(2024, 0, 15), // Monday
        new Date(2024, 0, 16), // Tuesday
        new Date(2024, 0, 17), // Wednesday
        new Date(2024, 0, 18), // Thursday
        new Date(2024, 0, 19), // Friday
        new Date(2024, 0, 20), // Saturday
        new Date(2024, 0, 21), // Sunday
      ];
      
      for (const date of dates) {
        const period = toPeriod(temporal, date, "day");
        expect(isWeekday(period)).toBe(!isWeekend(period));
      }
    });
  });

  describe("utils edge cases", () => {
    it("should handle different times on the same day", () => {
      const morning = new Date(2024, 0, 20, 6, 0); // Saturday morning
      const evening = new Date(2024, 0, 20, 20, 0); // Saturday evening
      
      const morningPeriod = toPeriod(temporal, morning, "day");
      const eveningPeriod = toPeriod(temporal, evening, "day");
      
      expect(isWeekend(morningPeriod)).toBe(true);
      expect(isWeekend(eveningPeriod)).toBe(true);
      expect(isWeekday(morningPeriod)).toBe(false);
      expect(isWeekday(eveningPeriod)).toBe(false);
    });

    it("should work with different period types", () => {
      const saturdayHour = toPeriod(temporal, new Date(2024, 0, 20, 14), "hour");
      const mondayMinute = toPeriod(temporal, new Date(2024, 0, 15, 14, 30), "minute");
      
      expect(isWeekend(saturdayHour)).toBe(true);
      expect(isWeekday(mondayMinute)).toBe(true);
    });
  });
});