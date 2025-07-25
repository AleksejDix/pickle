import { describe, it, expect } from "vitest";
import { split } from "./split";
import { toPeriod } from "./toPeriod";
import { withAllAdapters } from "../test/shared-adapter-tests";
import { createTemporal } from "../createTemporal";

withAllAdapters("split", (adapter) => {
  const temporal = createTemporal({ adapter, date: new Date(2024, 0, 1) });

  describe("period splitting", () => {
    it("should split a period at specific date", () => {
      const month = toPeriod(temporal, new Date(2024, 0, 15), "month");
      const splitDate = new Date(2024, 0, 15, 12, 0, 0);
      
      const [before, after] = split(month, splitDate);
      
      expect(before.start.getTime()).toBe(month.start.getTime());
      expect(before.end.getTime()).toBeLessThan(splitDate.getTime());
      expect(after.start.getTime()).toBeGreaterThanOrEqual(splitDate.getTime());
      expect(after.end.getTime()).toBe(month.end.getTime());
    });

    it("should handle split at period start", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const splitDate = day.start;
      
      const [before, after] = split(day, splitDate);
      
      // Before should be empty or minimal
      expect(before.start.getTime()).toBe(day.start.getTime());
      expect(before.end.getTime()).toBeLessThanOrEqual(day.start.getTime());
      
      // After should be the full period
      expect(after.start.getTime()).toBe(day.start.getTime());
      expect(after.end.getTime()).toBe(day.end.getTime());
    });

    it("should handle split at period end", () => {
      const week = toPeriod(temporal, new Date(2024, 0, 15), "week");
      const splitDate = week.end;
      
      const [before, after] = split(week, splitDate);
      
      // Before should be the full period
      expect(before.start.getTime()).toBe(week.start.getTime());
      expect(before.end.getTime()).toBeLessThanOrEqual(week.end.getTime());
      
      // After should be empty or minimal
      expect(after.start.getTime()).toBeGreaterThanOrEqual(week.end.getTime());
      expect(after.end.getTime()).toBe(week.end.getTime());
    });

    it("should split year in half", () => {
      const year = toPeriod(temporal, new Date(2024, 0, 1), "year");
      const midYear = new Date(2024, 6, 1); // July 1
      
      const [firstHalf, secondHalf] = split(year, midYear);
      
      expect(firstHalf.start.getMonth()).toBe(0); // January
      expect(firstHalf.end.getMonth()).toBeLessThan(6);
      expect(secondHalf.start.getMonth()).toBeGreaterThanOrEqual(6); // July or later
      expect(secondHalf.end.getMonth()).toBe(11); // December
    });

    it("should split hour at 30 minutes", () => {
      const hour = toPeriod(temporal, new Date(2024, 0, 15, 14), "hour");
      const halfHour = new Date(2024, 0, 15, 14, 30);
      
      const [firstHalf, secondHalf] = split(hour, halfHour);
      
      expect(firstHalf.start.getMinutes()).toBe(0);
      expect(firstHalf.end.getMinutes()).toBeLessThan(30);
      expect(secondHalf.start.getMinutes()).toBeGreaterThanOrEqual(30);
      expect(secondHalf.end.getMinutes()).toBe(59);
    });

    it("should handle split outside period", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const beforeDay = new Date(2024, 0, 14);
      const afterDay = new Date(2024, 0, 16);
      
      // Split before period
      const [, after1] = split(day, beforeDay);
      expect(after1.start.getTime()).toBe(day.start.getTime());
      expect(after1.end.getTime()).toBe(day.end.getTime());
      
      // Split after period
      const [before2] = split(day, afterDay);
      expect(before2.start.getTime()).toBe(day.start.getTime());
      expect(before2.end.getTime()).toBe(day.end.getTime());
    });

    it("should preserve period type", () => {
      const month = toPeriod(temporal, new Date(2024, 0, 15), "month");
      const splitDate = new Date(2024, 0, 20);
      
      const [before, after] = split(month, splitDate);
      
      expect(before.type).toBe("month");
      expect(after.type).toBe("month");
    });

    it("should split custom period", () => {
      const customPeriod = {
        start: new Date(2024, 0, 10, 10, 0),
        end: new Date(2024, 0, 20, 18, 0),
        type: "custom" as const,
        date: new Date(2024, 0, 15),
      };
      
      const splitDate = new Date(2024, 0, 15, 14, 0);
      const [before, after] = split(customPeriod, splitDate);
      
      expect(before.start.getTime()).toBe(customPeriod.start.getTime());
      expect(before.end.getTime()).toBeLessThan(splitDate.getTime());
      expect(after.start.getTime()).toBeGreaterThanOrEqual(splitDate.getTime());
      expect(after.end.getTime()).toBe(customPeriod.end.getTime());
    });

    it("should handle millisecond precision", () => {
      const second = toPeriod(temporal, new Date(2024, 0, 15, 14, 30, 45), "second");
      const splitMs = new Date(2024, 0, 15, 14, 30, 45, 500);
      
      const [before, after] = split(second, splitMs);
      
      expect(before.start.getMilliseconds()).toBe(0);
      expect(before.end.getMilliseconds()).toBeLessThan(500);
      expect(after.start.getMilliseconds()).toBeGreaterThanOrEqual(500);
      expect(after.end.getMilliseconds()).toBe(999);
    });

    it("should maintain split point consistency", () => {
      const week = toPeriod(temporal, new Date(2024, 0, 15), "week");
      const wednesday = new Date(2024, 0, 17, 12, 0);
      
      const [before, after] = split(week, wednesday);
      
      // The split parts should be contiguous
      const gap = after.start.getTime() - before.end.getTime();
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThanOrEqual(1); // At most 1ms gap
    });
  });
});