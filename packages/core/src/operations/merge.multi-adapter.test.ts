import { describe, it, expect } from "vitest";
import { merge } from "./merge";
import { divide } from "./divide";
import { toPeriod } from "./toPeriod";
import { withAllAdapters } from "../test/shared-adapter-tests";
import { createTemporal } from "../createTemporal";

withAllAdapters("merge", (adapter) => {
  const temporal = createTemporal({ adapter, date: new Date(2024, 0, 1) });

  describe("period merging", () => {
    it("should merge days into a week", () => {
      const week = toPeriod(temporal, new Date(2024, 0, 15), "week");
      const days = divide(temporal, week, "day");
      
      const mergedWeek = merge(temporal, days, "week");
      expect(mergedWeek!.type).toBe("week");
      expect(mergedWeek!.start.getTime()).toBe(week.start.getTime());
      expect(mergedWeek!.end.getTime()).toBe(week.end.getTime());
    });

    it("should merge months into a year", () => {
      const year = toPeriod(temporal, new Date(2024, 5, 15), "year");
      const months = divide(temporal, year, "month");
      
      const mergedYear = merge(temporal, months, "year");
      expect(mergedYear!.type).toBe("year");
      expect(mergedYear!.start.getFullYear()).toBe(2024);
      expect(mergedYear!.start.getMonth()).toBe(0);
      expect(mergedYear!.end.getMonth()).toBe(11);
    });

    it("should merge hours into a day", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const hours = divide(temporal, day, "hour");
      
      const mergedDay = merge(temporal, hours, "day");
      expect(mergedDay!.type).toBe("day");
      expect(mergedDay!.start.getDate()).toBe(15);
      expect(mergedDay!.start.getHours()).toBe(0);
      expect(mergedDay!.end.getHours()).toBe(23);
    });

    it("should merge partial periods", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const hours = divide(temporal, day, "hour");
      
      // Take only morning hours (0-11)
      const morningHours = hours.slice(0, 12);
      const mergedMorning = merge(temporal, morningHours, "day");
      
      expect(mergedMorning!.type).toBe("day");
      expect(mergedMorning!.start.getHours()).toBe(0);
      expect(mergedMorning!.end.getHours()).toBe(11);
      expect(mergedMorning!.end.getMinutes()).toBe(59);
    });

    it("should handle non-contiguous periods", () => {
      // Create periods for Monday, Wednesday, Friday
      const monday = toPeriod(temporal, new Date(2024, 0, 8), "day");
      const wednesday = toPeriod(temporal, new Date(2024, 0, 10), "day");
      const friday = toPeriod(temporal, new Date(2024, 0, 12), "day");
      
      const merged = merge(temporal, [monday, wednesday, friday], "week");
      
      expect(merged!.type).toBe("week");
      // Should span from Monday to Friday's week
      expect(merged!.start.getTime()).toBeLessThanOrEqual(monday.start.getTime());
      expect(merged!.end.getTime()).toBeGreaterThanOrEqual(friday.end.getTime());
    });

    it("should merge minutes into an hour", () => {
      const hour = toPeriod(temporal, new Date(2024, 0, 15, 14), "hour");
      const minutes = divide(temporal, hour, "minute");
      
      const mergedHour = merge(temporal, minutes, "hour");
      expect(mergedHour!.type).toBe("hour");
      expect(mergedHour!.start.getHours()).toBe(14);
      expect(mergedHour!.start.getMinutes()).toBe(0);
      expect(mergedHour!.end.getMinutes()).toBe(59);
    });

    it("should merge seconds into a minute", () => {
      const minute = toPeriod(temporal, new Date(2024, 0, 15, 14, 30), "minute");
      const seconds = divide(temporal, minute, "second");
      
      const mergedMinute = merge(temporal, seconds, "minute");
      expect(mergedMinute!.type).toBe("minute");
      expect(mergedMinute!.start.getMinutes()).toBe(30);
      expect(mergedMinute!.start.getSeconds()).toBe(0);
      expect(mergedMinute!.end.getSeconds()).toBe(59);
    });

    it("should handle single period merge", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      
      const mergedWeek = merge(temporal, [day], "week");
      expect(mergedWeek!.type).toBe("week");
      // The week should contain the day
      expect(mergedWeek!.start.getTime()).toBeLessThanOrEqual(day.start.getTime());
      expect(mergedWeek!.end.getTime()).toBeGreaterThanOrEqual(day.end.getTime());
    });

    it("should handle empty array", () => {
      const merged = merge(temporal, [], "day");
      
      // Should return a period for the current date
      expect(merged!.type).toBe("day");
      expect(merged!.date).toBeDefined();
    });

    it("should merge across boundaries", () => {
      // Create days spanning month boundary
      const lastDayOfJan = toPeriod(temporal, new Date(2024, 0, 31), "day");
      const firstDayOfFeb = toPeriod(temporal, new Date(2024, 1, 1), "day");
      const secondDayOfFeb = toPeriod(temporal, new Date(2024, 1, 2), "day");
      
      const merged = merge(temporal, [lastDayOfJan, firstDayOfFeb, secondDayOfFeb], "month");
      
      // Should create a month period that contains all days
      expect(merged!.type).toBe("month");
      // The exact month depends on the merge algorithm
      expect(merged!.start.getTime()).toBeLessThanOrEqual(lastDayOfJan.start.getTime());
      expect(merged!.end.getTime()).toBeGreaterThanOrEqual(secondDayOfFeb.end.getTime());
    });

    it("should preserve reference date from first period", () => {
      const periods = [
        toPeriod(temporal, new Date(2024, 0, 10), "day"),
        toPeriod(temporal, new Date(2024, 0, 11), "day"),
        toPeriod(temporal, new Date(2024, 0, 12), "day"),
      ];
      
      const merged = merge(temporal, periods, "week");
      
      // Reference date should come from the first period
      expect(merged!.date.getTime()).toBe(periods[0].date.getTime());
    });
  });
});