import { describe, it, expect } from "vitest";
import { split } from "./split";
import { createTemporal } from "../createTemporal";
import { nativeAdapter } from "@usetemporal/adapter-native";
import type { Period } from "../types/period";

describe("split", () => {
  const temporal = createTemporal({
    dateAdapter: nativeAdapter,
    weekStartsOn: 1, // Monday
  });

  describe("split by unit", () => {
    it("should split year by months", () => {
      const year: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 11, 31, 23, 59, 59, 999),
        type: "year",
        value: new Date(2024, 5, 15),
        number: 2024,
      };

      const months = split(temporal, year, { by: "month" });

      expect(months).toHaveLength(12);
      expect(months[0].start.getMonth()).toBe(0); // January
      expect(months[11].start.getMonth()).toBe(11); // December
    });

    it("should split month by days", () => {
      const january: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 0, 15),
        number: 1,
      };

      const days = split(temporal, january, { by: "day" });

      expect(days).toHaveLength(31);
      expect(days[0].number).toBe(1);
      expect(days[30].number).toBe(31);
    });
  });

  describe("split by count", () => {
    it("should split year into quarters", () => {
      const year: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 11, 31, 23, 59, 59, 999),
        type: "year",
        value: new Date(2024, 5, 15),
        number: 2024,
      };

      const quarters = split(temporal, year, { count: 4 });

      expect(quarters).toHaveLength(4);
      expect(quarters[0].type).toBe("custom");
      expect(quarters[0].number).toBe(1);
      expect(quarters[3].number).toBe(4);

      // Each quarter should be roughly equal
      const q1Duration =
        quarters[0].end.getTime() - quarters[0].start.getTime();
      const q2Duration =
        quarters[1].end.getTime() - quarters[1].start.getTime();
      expect(Math.abs(q1Duration - q2Duration)).toBeLessThan(
        5 * 24 * 60 * 60 * 1000
      ); // Within 5 days
    });

    it("should split month into equal parts", () => {
      const january: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 0, 15),
        number: 1,
      };

      const parts = split(temporal, january, { count: 3 });

      expect(parts).toHaveLength(3);
      expect(parts[0].start.getDate()).toBe(1);
      expect(parts[2].end).toEqual(january.end); // Last part ends exactly at month end
    });

    it("should handle count of 1", () => {
      const week: Period = {
        start: new Date(2024, 0, 8),
        end: new Date(2024, 0, 14, 23, 59, 59, 999),
        type: "week",
        value: new Date(2024, 0, 10),
        number: 2,
      };

      const parts = split(temporal, week, { count: 1 });

      expect(parts).toHaveLength(1);
      expect(parts[0].start).toEqual(week.start);
      expect(parts[0].end).toEqual(week.end);
    });
  });

  describe("split by duration", () => {
    it("should split month by 2-week periods", () => {
      const january: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 0, 15),
        number: 1,
      };

      const twoWeekPeriods = split(temporal, january, {
        duration: { weeks: 2 },
      });

      expect(twoWeekPeriods.length).toBeGreaterThanOrEqual(2);

      // First period should be 2 weeks
      const firstDuration =
        twoWeekPeriods[0].end.getTime() - twoWeekPeriods[0].start.getTime();
      const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
      expect(firstDuration).toBe(twoWeeksMs);
    });

    it("should split week by days and hours", () => {
      const week: Period = {
        start: new Date(2024, 0, 8), // Monday
        end: new Date(2024, 0, 14, 23, 59, 59, 999), // Sunday
        type: "week",
        value: new Date(2024, 0, 10),
        number: 2,
      };

      const periods = split(temporal, week, {
        duration: { days: 2, hours: 12 },
      });

      expect(periods.length).toBe(3); // 7 days / 2.5 days = ~3 periods

      // Check first period duration (2 days + 12 hours = 60 hours)
      const firstDuration =
        periods[0].end.getTime() - periods[0].start.getTime();
      const expectedDuration = 2.5 * 24 * 60 * 60 * 1000;
      expect(firstDuration).toBe(expectedDuration);
    });

    it("should handle duration larger than period", () => {
      const day: Period = {
        start: new Date(2024, 0, 15),
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
        value: new Date(2024, 0, 15, 12, 0),
        number: 15,
      };

      const periods = split(temporal, day, { duration: { days: 2 } });

      expect(periods).toHaveLength(1);
      expect(periods[0].start).toEqual(day.start);
      expect(periods[0].end).toEqual(day.end);
    });

    it("should split year by months", () => {
      const year: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 11, 31, 23, 59, 59, 999),
        type: "year",
        value: new Date(2024, 5, 15),
        number: 2024,
      };

      const monthPeriods = split(temporal, year, { duration: { months: 1 } });

      expect(monthPeriods).toHaveLength(12);
      expect(monthPeriods[0].start.getMonth()).toBe(0); // January
      expect(monthPeriods[11].start.getMonth()).toBe(11); // December
    });

    it("should handle complex durations", () => {
      const quarter: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 2, 31, 23, 59, 59, 999),
        type: "quarter",
        value: new Date(2024, 1, 15),
        number: 1,
      };

      const periods = split(temporal, quarter, {
        duration: { months: 1, days: 15 },
      });

      expect(periods.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("error handling", () => {
    it("should throw error without valid options", () => {
      const month: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 0, 31),
        type: "month",
        value: new Date(2024, 0, 15),
        number: 1,
      };

      expect(() => split(temporal, month, {})).toThrow(
        "Split requires either 'by', 'count', or 'duration' option"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle single day split", () => {
      const day: Period = {
        start: new Date(2024, 0, 15, 0, 0, 0),
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
        value: new Date(2024, 0, 15, 12, 0),
        number: 15,
      };

      const hours = split(temporal, day, { by: "hour" });
      expect(hours).toHaveLength(24);

      const halves = split(temporal, day, { count: 2 });
      expect(halves).toHaveLength(2);
      // The exact split time depends on millisecond precision
      // It should be close to noon
      expect(halves[0].end.getHours()).toBeGreaterThanOrEqual(11);
      expect(halves[0].end.getHours()).toBeLessThanOrEqual(12);
    });

    it("should preserve exact end time with count split", () => {
      const customPeriod: Period = {
        start: new Date(2024, 0, 1, 9, 0, 0),
        end: new Date(2024, 0, 1, 17, 0, 0),
        type: "custom",
        value: new Date(2024, 0, 1, 13, 0, 0),
        number: 0,
      };

      const parts = split(temporal, customPeriod, { count: 4 });

      expect(parts).toHaveLength(4);
      expect(parts[3].end).toEqual(customPeriod.end);
    });
  });
});
