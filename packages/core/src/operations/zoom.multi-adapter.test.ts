import { describe, it, expect } from "vitest";
import { zoomIn, zoomOut, zoomTo } from "./index";
import { toPeriod } from "./toPeriod";
import { withAllAdapters } from "../test/shared-adapter-tests";
import { createTemporal } from "../createTemporal";

withAllAdapters("zoom operations", (adapter) => {
  // Create temporal with a default browsing date
  const defaultDate = new Date(2024, 5, 15, 14, 30, 45);
  const temporal = createTemporal({ adapter, date: defaultDate });

  describe("zoomIn", () => {
    it("should zoom from year to month", () => {
      const year = toPeriod(temporal, new Date(2024, 5, 15), "year");
      const month = zoomIn(temporal, year, "month");
      
      expect(month.type).toBe("month");
      expect(month.start.getMonth()).toBe(5); // June
      expect(month.start.getFullYear()).toBe(2024);
    });

    it("should zoom from month to day", () => {
      const month = toPeriod(temporal, new Date(2024, 0, 31), "month");
      const day = zoomIn(temporal, month, "day");
      
      expect(day.type).toBe("day");
      expect(day.start.getDate()).toBe(31);
      expect(day.start.getMonth()).toBe(0);
    });

    it("should zoom from day to hour", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15, 14, 30), "day");
      const hour = zoomIn(temporal, day, "hour");
      
      expect(hour.type).toBe("hour");
      expect(hour.start.getHours()).toBe(14);
      expect(hour.start.getDate()).toBe(15);
    });

    it("should maintain reference date when zooming", () => {
      // Use the temporal's browsing date
      const browsingDate = temporal.browsing.value.date;
      const year = toPeriod(temporal, browsingDate, "year");
      
      const month = zoomIn(temporal, year, "month");
      const day = zoomIn(temporal, month, "day");
      const hour = zoomIn(temporal, day, "hour");
      
      // All zoomed periods should contain the browsing date
      expect(month.start.getTime()).toBeLessThanOrEqual(browsingDate.getTime());
      expect(month.end.getTime()).toBeGreaterThanOrEqual(browsingDate.getTime());
      
      expect(day.start.getTime()).toBeLessThanOrEqual(browsingDate.getTime());
      expect(day.end.getTime()).toBeGreaterThanOrEqual(browsingDate.getTime());
      
      expect(hour.start.getTime()).toBeLessThanOrEqual(browsingDate.getTime());
      expect(hour.end.getTime()).toBeGreaterThanOrEqual(browsingDate.getTime());
      
      // Verify specific periods
      expect(month.start.getMonth()).toBe(5); // June
      expect(day.start.getDate()).toBe(15);
      expect(hour.start.getHours()).toBe(14);
    });

    it("should zoom from week to day", () => {
      const week = toPeriod(temporal, new Date(2024, 0, 17), "week"); // Wednesday
      const day = zoomIn(temporal, week, "day");
      
      expect(day.type).toBe("day");
      expect(day.start.getDate()).toBe(17);
      expect(day.start.getDay()).toBe(3); // Wednesday
    });

    it("should handle edge cases when zooming", () => {
      // Zoom from last day of month
      const january = toPeriod(temporal, new Date(2024, 0, 31), "month");
      const lastDay = zoomIn(temporal, january, "day");
      
      expect(lastDay.start.getDate()).toBe(31);
      
      // Zoom to hour at midnight
      const midnight = toPeriod(temporal, new Date(2024, 0, 15, 0, 0), "day");
      const firstHour = zoomIn(temporal, midnight, "hour");
      
      expect(firstHour.start.getHours()).toBe(0);
    });
  });

  describe("zoomOut", () => {
    it("should zoom from day to month", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const month = zoomOut(temporal, day, "month");
      
      expect(month.type).toBe("month");
      expect(month.start.getMonth()).toBe(0); // January
      expect(month.start.getDate()).toBe(1);
      expect(month.end.getDate()).toBe(31);
    });

    it("should zoom from hour to day", () => {
      const hour = toPeriod(temporal, new Date(2024, 0, 15, 14), "hour");
      const day = zoomOut(temporal, hour, "day");
      
      expect(day.type).toBe("day");
      expect(day.start.getDate()).toBe(15);
      expect(day.start.getHours()).toBe(0);
      expect(day.end.getHours()).toBe(23);
    });

    it("should zoom from minute to hour", () => {
      const minute = toPeriod(temporal, new Date(2024, 0, 15, 14, 30), "minute");
      const hour = zoomOut(temporal, minute, "hour");
      
      expect(hour.type).toBe("hour");
      expect(hour.start.getHours()).toBe(14);
      expect(hour.start.getMinutes()).toBe(0);
      expect(hour.end.getMinutes()).toBe(59);
    });

    it("should zoom from day to year", () => {
      const day = toPeriod(temporal, new Date(2024, 11, 31), "day");
      const year = zoomOut(temporal, day, "year");
      
      expect(year.type).toBe("year");
      expect(year.start.getFullYear()).toBe(2024);
      expect(year.start.getMonth()).toBe(0);
      expect(year.end.getMonth()).toBe(11);
    });

    it("should handle week zoom out", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 17), "day"); // Wednesday
      const week = zoomOut(temporal, day, "week");
      
      expect(week.type).toBe("week");
      expect(week.start.getDay()).toBe(1); // Monday
      expect(week.end.getDay()).toBe(0); // Sunday
    });
  });

  describe("zoomTo", () => {
    it("should zoom to any unit from any other unit", () => {
      const year = toPeriod(temporal, new Date(2024, 5, 15, 14, 30), "year");
      
      // Zoom to various units
      const month = zoomTo(temporal, year, "month");
      const week = zoomTo(temporal, year, "week");
      const day = zoomTo(temporal, year, "day");
      const hour = zoomTo(temporal, year, "hour");
      
      expect(month.type).toBe("month");
      expect(week.type).toBe("week");
      expect(day.type).toBe("day");
      expect(hour.type).toBe("hour");
      
      // All should contain the reference date
      const refDate = year.date.getTime();
      expect(month.start.getTime()).toBeLessThanOrEqual(refDate);
      expect(month.end.getTime()).toBeGreaterThanOrEqual(refDate);
      
      expect(week.start.getTime()).toBeLessThanOrEqual(refDate);
      expect(week.end.getTime()).toBeGreaterThanOrEqual(refDate);
    });

    it("should handle same unit zoom", () => {
      const day = toPeriod(temporal, new Date(2024, 0, 15), "day");
      const sameDay = zoomTo(temporal, day, "day");
      
      expect(sameDay.type).toBe("day");
      expect(sameDay.start.getTime()).toBe(day.start.getTime());
      expect(sameDay.end.getTime()).toBe(day.end.getTime());
    });

    it("should zoom between non-hierarchical units", () => {
      // Zoom from week to month
      const week = toPeriod(temporal, new Date(2024, 0, 15), "week");
      const month = zoomTo(temporal, week, "month");
      
      expect(month.type).toBe("month");
      expect(month.start.getMonth()).toBe(0);
      
      // Zoom from month to week
      const monthPeriod = toPeriod(temporal, new Date(2024, 0, 17), "month");
      const weekPeriod = zoomTo(temporal, monthPeriod, "week");
      
      expect(weekPeriod.type).toBe("week");
      expect(weekPeriod.start.getTime()).toBeLessThanOrEqual(monthPeriod.date.getTime());
      expect(weekPeriod.end.getTime()).toBeGreaterThanOrEqual(monthPeriod.date.getTime());
    });

    it("should preserve reference date across all zoom operations", () => {
      const refDate = new Date(2024, 5, 15, 14, 30, 45, 123);
      const second = toPeriod(temporal, refDate, "second");
      
      const units = ["year", "month", "week", "day", "hour", "minute"] as const;
      
      units.forEach(unit => {
        const zoomed = zoomTo(temporal, second, unit);
        expect(zoomed.date.getTime()).toBe(refDate.getTime());
        expect(zoomed.type).toBe(unit);
      });
    });
  });

  describe("zoom consistency", () => {
    it("should maintain consistency between zoomIn and zoomOut", () => {
      const month = toPeriod(temporal, new Date(2024, 5, 15), "month");
      
      // Zoom in then out should give us back the same period
      const day = zoomIn(temporal, month, "day");
      const backToMonth = zoomOut(temporal, day, "month");
      
      expect(backToMonth.type).toBe("month");
      expect(backToMonth.start.getTime()).toBe(month.start.getTime());
      expect(backToMonth.end.getTime()).toBe(month.end.getTime());
    });

    it("should handle complex zoom chains", () => {
      const year = toPeriod(temporal, new Date(2024, 5, 15, 14, 30), "year");
      
      // Year -> Month -> Week -> Day -> Hour
      const month = zoomIn(temporal, year, "month");
      const week = zoomIn(temporal, month, "week");
      const day = zoomIn(temporal, week, "day");
      const hour = zoomIn(temporal, day, "hour");
      
      // All should be valid and contain the reference date
      expect(hour.type).toBe("hour");
      expect(hour.start.getHours()).toBe(14);
      
      // Zoom back out
      const backToYear = zoomOut(temporal, hour, "year");
      expect(backToYear.start.getFullYear()).toBe(2024);
    });
  });
});