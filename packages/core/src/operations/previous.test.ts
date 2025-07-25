import { describe, it, expect } from "vitest";
import { previous } from "./previous";
import { createTemporal } from "../createTemporal";
import { createMockAdapter } from "../test/functionalMockAdapter";
import { TEST_DATE } from "../test/testDates";
import type { Period } from "../types";

describe("previous", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: createMockAdapter({ weekStartsOn: 1 }),
    weekStartsOn: 1, // Monday
  });

  it("should move to previous year", () => {
    const year2024: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31, 23, 59, 59, 999),
      type: "year",
      date: new Date(2024, 5, 15),
    };

    const year2023 = previous(temporal, year2024);

    expect(year2023.start.getFullYear()).toBe(2023);
    expect(year2023.end.getFullYear()).toBe(2023);
  });

  it("should move to previous month", () => {
    const february: Period = {
      start: new Date(2024, 1, 1),
      end: new Date(2024, 1, 29, 23, 59, 59, 999),
      type: "month",
      date: new Date(2024, 1, 15),
    };

    const january = previous(temporal, february);

    expect(january.start.getMonth()).toBe(0); // January
    expect(january.end.getMonth()).toBe(0);
  });

  it("should move to previous week", () => {
    const week2: Period = {
      start: new Date(2024, 0, 15), // Monday
      end: new Date(2024, 0, 21, 23, 59, 59, 999), // Sunday
      type: "week",
      date: new Date(2024, 0, 17),
    };

    const week1 = previous(temporal, week2);

    expect(week1.start.getDate()).toBe(8); // Previous Monday
    expect(week1.end.getDate()).toBe(14); // Previous Sunday
  });

  it("should move to previous day", () => {
    const jan16: Period = {
      start: new Date(2024, 0, 16, 0, 0, 0),
      end: new Date(2024, 0, 16, 23, 59, 59, 999),
      type: "day",
      date: new Date(2024, 0, 16, 12, 0),
    };

    const jan15 = previous(temporal, jan16);

    expect(jan15.start.getDate()).toBe(15);
    expect(jan15.end.getDate()).toBe(15);
  });

  it("should move to previous hour", () => {
    const hour15: Period = {
      start: new Date(2024, 0, 15, 15, 0, 0),
      end: new Date(2024, 0, 15, 15, 59, 59, 999),
      type: "hour",
      date: new Date(2024, 0, 15, 15, 30),
    };

    const hour14 = previous(temporal, hour15);

    expect(hour14.start.getHours()).toBe(14);
    expect(hour14.end.getHours()).toBe(14);
  });

  it("should handle month boundaries", () => {
    const feb1: Period = {
      start: new Date(2024, 1, 1, 0, 0, 0),
      end: new Date(2024, 1, 1, 23, 59, 59, 999),
      type: "day",
      date: new Date(2024, 1, 1, 12, 0),
    };

    const jan31 = previous(temporal, feb1);

    expect(jan31.start.getMonth()).toBe(0); // January
    expect(jan31.start.getDate()).toBe(31);
  });

  it("should handle year boundaries", () => {
    const jan2024: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "month",
      date: new Date(2024, 0, 15),
    };

    const dec2023 = previous(temporal, jan2024);

    expect(dec2023.start.getFullYear()).toBe(2023);
    expect(dec2023.start.getMonth()).toBe(11); // December
  });

  it("should handle day boundaries at midnight", () => {
    const hour0: Period = {
      start: new Date(2024, 0, 16, 0, 0, 0),
      end: new Date(2024, 0, 16, 0, 59, 59, 999),
      type: "hour",
      date: new Date(2024, 0, 16, 0, 30),
    };

    const hour23 = previous(temporal, hour0);

    expect(hour23.start.getDate()).toBe(15); // Previous day
    expect(hour23.start.getHours()).toBe(23);
  });

  it("should handle stableMonth navigation", () => {
    const stableFebruary: Period = {
      start: new Date(2024, 0, 29), // Monday
      end: new Date(2024, 2, 10, 23, 59, 59, 999), // Sunday
      type: "stableMonth",
      date: new Date(2024, 1, 15),
    };

    const stableJanuary = previous(temporal, stableFebruary);

    expect(stableJanuary.date.getMonth()).toBe(0); // January
    // Exact grid boundaries depend on the adapter's startOf/endOf implementation
  });

  it("should handle quarter navigation", () => {
    const q2: Period = {
      start: new Date(2024, 3, 1),
      end: new Date(2024, 5, 30, 23, 59, 59, 999),
      type: "quarter",
      date: new Date(2024, 4, 15),
    };

    const q1 = previous(temporal, q2);

    expect(q1.type).toBe("quarter");
    // The exact boundaries depend on the adapter implementation
  });

  describe("custom period handling", () => {
    it("should move to previous custom period", () => {
      const customPeriod: Period = {
        start: new Date(2024, 0, 20), // Jan 20
        end: new Date(2024, 0, 29, 23, 59, 59, 999), // Jan 29 (10-day period)
        type: "custom",
        date: new Date(2024, 0, 25),
      };

      const prevCustom = previous(temporal, customPeriod);

      // Should end immediately before the current period starts
      expect(prevCustom.start).toEqual(new Date(2024, 0, 10)); // Jan 10
      expect(prevCustom.end).toEqual(new Date(2024, 0, 19, 23, 59, 59, 999)); // Jan 19
      expect(prevCustom.type).toBe("custom");
      expect(prevCustom.date).toEqual(prevCustom.start);
    });

    it("should handle custom period with single day", () => {
      const singleDayCustom: Period = {
        start: new Date(2024, 0, 16),
        end: new Date(2024, 0, 16, 23, 59, 59, 999),
        type: "custom",
        date: new Date(2024, 0, 16),
      };

      const prevSingleDay = previous(temporal, singleDayCustom);

      expect(prevSingleDay.start).toEqual(new Date(2024, 0, 15));
      expect(prevSingleDay.end).toEqual(new Date(2024, 0, 15, 23, 59, 59, 999));
    });

    it("should handle custom period crossing month boundary", () => {
      const customPeriod: Period = {
        start: new Date(2024, 1, 1), // Feb 1
        end: new Date(2024, 1, 7, 23, 59, 59, 999), // Feb 7 (7-day period)
        type: "custom",
        date: new Date(2024, 1, 4),
      };

      const prevCustom = previous(temporal, customPeriod);

      expect(prevCustom.start).toEqual(new Date(2024, 0, 25)); // Jan 25
      expect(prevCustom.end).toEqual(new Date(2024, 0, 31, 23, 59, 59, 999)); // Jan 31
    });

    it("should handle custom period with exact millisecond precision", () => {
      const customPeriod: Period = {
        start: new Date(2024, 0, 10, 11, 30, 45, 123),
        end: new Date(2024, 0, 10, 12, 30, 45, 122), // Exactly 1 hour - 1ms
        type: "custom",
        date: new Date(2024, 0, 10, 12, 0, 0),
      };

      const prevCustom = previous(temporal, customPeriod);

      // Should end at the millisecond before start
      expect(prevCustom.end).toEqual(new Date(2024, 0, 10, 11, 30, 45, 122));
      // Duration should be preserved (1 hour)
      expect(prevCustom.start).toEqual(new Date(2024, 0, 10, 10, 30, 45, 123));
    });
  });
});
