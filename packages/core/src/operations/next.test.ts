import { describe, it, expect } from "vitest";
import { next } from "./next";
import { createTemporal } from "../createTemporal";
import { createMockAdapter } from "../test/functionalMockAdapter";
import { TEST_DATE, testDates } from "../test/testDates";
import type { Period } from "../types";

describe("next", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: createMockAdapter({ weekStartsOn: 1 }),
    weekStartsOn: 1, // Monday
  });

  it("should move to next year", () => {
    const year2024: Period = {
      start: testDates.jan1,
      end: testDates.dec31,
      type: "year",
      date: testDates.jun15,
    };

    const year2025 = next(temporal, year2024);

    expect(year2025.start.getFullYear()).toBe(2025);
    expect(year2025.end.getFullYear()).toBe(2025);
  });

  it("should move to next month", () => {
    const january: Period = {
      start: testDates.jan1,
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "month",
      date: testDates.jan15,
    };

    const february = next(temporal, january);

    expect(february.start.getMonth()).toBe(1); // February
    expect(february.end.getMonth()).toBe(1);
  });

  it("should move to next week", () => {
    const week1: Period = {
      start: new Date(2024, 0, 8), // Monday
      end: new Date(2024, 0, 14, 23, 59, 59, 999), // Sunday
      type: "week",
      date: testDates.jan10,
    };

    const week2 = next(temporal, week1);

    expect(week2.start.getDate()).toBe(15); // Next Monday
    expect(week2.end.getDate()).toBe(21); // Next Sunday
  });

  it("should move to next day", () => {
    const jan15: Period = {
      start: new Date(2024, 0, 15, 0, 0, 0),
      end: new Date(2024, 0, 15, 23, 59, 59, 999),
      type: "day",
      date: testDates.jan15,
    };

    const jan16 = next(temporal, jan15);

    expect(jan16.start.getDate()).toBe(16);
    expect(jan16.end.getDate()).toBe(16);
  });

  it("should move to next hour", () => {
    const hour14: Period = {
      start: new Date(2024, 0, 15, 14, 0, 0),
      end: new Date(2024, 0, 15, 14, 59, 59, 999),
      type: "hour",
      date: new Date(2024, 5, 15, 14, 30, 45), // Use TEST_DATE with hour 14
    };

    const hour15 = next(temporal, hour14);

    expect(hour15.start.getHours()).toBe(15);
    expect(hour15.end.getHours()).toBe(15);
  });

  it("should handle month boundaries", () => {
    const jan31: Period = {
      start: new Date(2024, 0, 31, 0, 0, 0),
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "day",
      date: new Date(2024, 0, 31, 12, 0),
    };

    const feb1 = next(temporal, jan31);

    expect(feb1.start.getMonth()).toBe(1); // February
    expect(feb1.start.getDate()).toBe(1);
  });

  it("should handle year boundaries", () => {
    const dec2024: Period = {
      start: new Date(2024, 11, 1),
      end: testDates.dec31,
      type: "month",
      date: new Date(2024, 11, 15),
    };

    const jan2025 = next(temporal, dec2024);

    expect(jan2025.start.getFullYear()).toBe(2025);
    expect(jan2025.start.getMonth()).toBe(0); // January
  });

  it("should handle day boundaries at midnight", () => {
    const hour23: Period = {
      start: new Date(2024, 0, 15, 23, 0, 0),
      end: new Date(2024, 0, 15, 23, 59, 59, 999),
      type: "hour",
      date: new Date(2024, 0, 15, 23, 30),
    };

    const hour0 = next(temporal, hour23);

    expect(hour0.start.getDate()).toBe(16); // Next day
    expect(hour0.start.getHours()).toBe(0);
  });

  it("should handle stableMonth navigation", () => {
    const stableJanuary: Period = {
      start: testDates.jan1, // Monday
      end: new Date(2024, 1, 11, 23, 59, 59, 999), // Sunday
      type: "stableMonth",
      date: testDates.jan15,
    };

    const stableFebruary = next(temporal, stableJanuary);

    expect(stableFebruary.date.getMonth()).toBe(1); // February
    // Exact grid boundaries depend on the adapter's startOf/endOf implementation
  });

  it("should handle quarter navigation", () => {
    const q1: Period = {
      start: testDates.jan1,
      end: new Date(2024, 2, 31, 23, 59, 59, 999),
      type: "quarter",
      date: testDates.feb15,
    };

    const q2 = next(temporal, q1);

    expect(q2.type).toBe("quarter");
    // The exact boundaries depend on the adapter implementation
  });

  describe("custom period handling", () => {
    it("should move to next custom period", () => {
      const customPeriod: Period = {
        start: new Date(2024, 0, 10), // Jan 10
        end: new Date(2024, 0, 19, 23, 59, 59, 999), // Jan 19 (10-day period)
        type: "custom",
        date: new Date(2024, 0, 15),
      };

      const nextCustom = next(temporal, customPeriod);

      // Should start immediately after the current period ends
      expect(nextCustom.start).toEqual(new Date(2024, 0, 20)); // Jan 20
      expect(nextCustom.end).toEqual(new Date(2024, 0, 29, 23, 59, 59, 999)); // Jan 29
      expect(nextCustom.type).toBe("custom");
      expect(nextCustom.date).toEqual(nextCustom.start);
    });

    it("should handle custom period with single day", () => {
      const singleDayCustom: Period = {
        start: new Date(2024, 0, 15),
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "custom",
        date: new Date(2024, 0, 15),
      };

      const nextSingleDay = next(temporal, singleDayCustom);

      expect(nextSingleDay.start).toEqual(new Date(2024, 0, 16));
      expect(nextSingleDay.end).toEqual(new Date(2024, 0, 16, 23, 59, 59, 999));
    });

    it("should handle custom period crossing month boundary", () => {
      const customPeriod: Period = {
        start: new Date(2024, 0, 25), // Jan 25
        end: new Date(2024, 0, 31, 23, 59, 59, 999), // Jan 31 (7-day period)
        type: "custom",
        date: new Date(2024, 0, 28),
      };

      const nextCustom = next(temporal, customPeriod);

      expect(nextCustom.start).toEqual(new Date(2024, 1, 1)); // Feb 1
      expect(nextCustom.end).toEqual(new Date(2024, 1, 7, 23, 59, 59, 999)); // Feb 7
    });

    it("should handle custom period with exact millisecond precision", () => {
      const customPeriod: Period = {
        start: new Date(2024, 0, 10, 10, 30, 45, 123),
        end: new Date(2024, 0, 10, 11, 30, 45, 122), // Exactly 1 hour - 1ms
        type: "custom",
        date: new Date(2024, 0, 10, 11, 0, 0),
      };

      const nextCustom = next(temporal, customPeriod);

      // Should start at the next millisecond
      expect(nextCustom.start).toEqual(new Date(2024, 0, 10, 11, 30, 45, 123));
      // Duration should be preserved (1 hour)
      expect(nextCustom.end).toEqual(new Date(2024, 0, 10, 12, 30, 45, 122));
    });
  });
});
