import { describe, it, expect } from "vitest";
import { split } from "./split";
import { divide } from "./divide";
import { createTemporal } from "../createTemporal";
import { createMockAdapter } from "../test/functionalMockAdapter";
import { TEST_DATE, testDates } from "../test/testDates";
import type { Period } from "../types";

describe("split", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: createMockAdapter({ weekStartsOn: 1 }),
    weekStartsOn: 1,
  });

  describe("split at date", () => {
    it("should split a period at specific date", () => {
      const month: Period = {
        start: testDates.jan1,
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
        date: testDates.jan15,
      };

      const splitDate = new Date(2024, 0, 15, 12, 0, 0);
      const [before, after] = split(month, splitDate);

      expect(before.start.getTime()).toBe(month.start.getTime());
      expect(before.end.getTime()).toBeLessThan(after.start.getTime());
      expect(after.end.getTime()).toBe(month.end.getTime());
      expect(before.type).toBe("month");
      expect(after.type).toBe("month");
    });

    it("should handle split at start of period", () => {
      const day: Period = {
        start: testDates.jan15,
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
        date: testDates.jan15,
      };

      const [before, after] = split(day, day.start);

      expect(before.start.getTime()).toBe(before.end.getTime());
      expect(after.start.getTime()).toBe(day.start.getTime());
      expect(after.end.getTime()).toBe(day.end.getTime());
    });

    it("should handle split at end of period", () => {
      const day: Period = {
        start: testDates.jan15,
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
        date: testDates.jan15,
      };

      const [before, after] = split(day, day.end);

      expect(before.start.getTime()).toBe(day.start.getTime());
      expect(before.end.getTime()).toBe(day.end.getTime());
      expect(after.start.getTime()).toBe(after.end.getTime());
    });

    it("should split at exact time", () => {
      const hour: Period = {
        start: new Date(2024, 0, 15, 14, 0, 0),
        end: new Date(2024, 0, 15, 14, 59, 59, 999),
        type: "hour",
        date: new Date(2024, 0, 15, 14, 30, 0),
      };

      const splitTime = new Date(2024, 0, 15, 14, 30, 0);
      const [before, after] = split(hour, splitTime);

      expect(before.start.getHours()).toBe(14);
      expect(before.start.getMinutes()).toBe(0);
      expect(after.start.getHours()).toBe(14);
      expect(after.start.getMinutes()).toBe(30);
      expect(after.end.getMinutes()).toBe(59);
    });

    it("should handle split outside period", () => {
      const day: Period = {
        start: testDates.jan15,
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
        date: testDates.jan15,
      };

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
      const month: Period = {
        start: testDates.jan1,
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
        date: testDates.jan15,
      };

      const [before, after] = split(month, testDates.jan15);

      expect(before.type).toBe("month");
      expect(after.type).toBe("month");
    });
  });

  describe("split by unit (using divide)", () => {
    it("should split year by months", () => {
      const year: Period = {
        start: testDates.jan1,
        end: testDates.dec31,
        type: "year",
        date: testDates.jun15,
      };

      const months = divide(temporal, year, "month");

      expect(months).toHaveLength(12);
      expect(months[0].start.getMonth()).toBe(0); // January
      expect(months[11].start.getMonth()).toBe(11); // December
    });

    it("should split month by days", () => {
      const january: Period = {
        start: testDates.jan1,
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
        date: testDates.jan15,
      };

      const days = divide(temporal, january, "day");

      expect(days).toHaveLength(31);
    });

    it("should split month by weeks", () => {
      const january: Period = {
        start: testDates.jan1,
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
        date: testDates.jan15,
      };

      const weeks = divide(temporal, january, "week");

      expect(weeks.length).toBeGreaterThanOrEqual(4);
      expect(weeks.length).toBeLessThanOrEqual(6);
    });

    it("should split day by hours", () => {
      const day: Period = {
        start: testDates.jan15,
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
        date: testDates.jan15,
      };

      const hours = divide(temporal, day, "hour");

      expect(hours).toHaveLength(24);
      expect(hours[0].start.getHours()).toBe(0);
      expect(hours[23].start.getHours()).toBe(23);
    });

    it("should split hour by minutes", () => {
      const hour: Period = {
        start: new Date(2024, 0, 15, 14, 0, 0),
        end: new Date(2024, 0, 15, 14, 59, 59, 999),
        type: "hour",
        date: new Date(2024, 0, 15, 14, 30, 0),
      };

      const minutes = divide(temporal, hour, "minute");

      expect(minutes).toHaveLength(60);
      expect(minutes[0].start.getMinutes()).toBe(0);
      expect(minutes[59].start.getMinutes()).toBe(59);
    });

    it("should split minute by seconds", () => {
      const minute: Period = {
        start: new Date(2024, 0, 15, 14, 30, 0),
        end: new Date(2024, 0, 15, 14, 30, 59, 999),
        type: "minute",
        date: new Date(2024, 0, 15, 14, 30, 30),
      };

      const seconds = divide(temporal, minute, "second");

      expect(seconds).toHaveLength(60);
      expect(seconds[0].start.getSeconds()).toBe(0);
      expect(seconds[59].start.getSeconds()).toBe(59);
    });

    it("should handle partial periods", () => {
      const partialMonth: Period = {
        start: new Date(2024, 0, 10),
        end: new Date(2024, 0, 20, 23, 59, 59, 999),
        type: "custom",
        date: new Date(2024, 0, 15),
      };

      const days = divide(temporal, partialMonth, "day");

      expect(days).toHaveLength(11); // 10th through 20th inclusive
      expect(days[0].start.getDate()).toBe(10);
      expect(days[10].start.getDate()).toBe(20);
    });

    it("should handle cross-boundary periods", () => {
      const crossYear: Period = {
        start: new Date(2023, 11, 25),
        end: new Date(2024, 0, 5, 23, 59, 59, 999),
        type: "custom",
        date: new Date(2023, 11, 31),
      };

      const days = divide(temporal, crossYear, "day");

      expect(days).toHaveLength(12); // Dec 25-31 + Jan 1-5
      expect(days[0].start.getFullYear()).toBe(2023);
      expect(days[0].start.getDate()).toBe(25);
      expect(days[11].start.getFullYear()).toBe(2024);
      expect(days[11].start.getDate()).toBe(5);
    });

    it("should handle leap year February", () => {
      const february2024: Period = {
        start: new Date(2024, 1, 1),
        end: new Date(2024, 1, 29, 23, 59, 59, 999),
        type: "month",
        date: new Date(2024, 1, 15),
      };

      const days = divide(temporal, february2024, "day");

      expect(days).toHaveLength(29); // 2024 is a leap year
      expect(days[28].start.getDate()).toBe(29);
    });
  });
});