import { describe, it, expect } from "vitest";
import { zoomIn } from "./zoomIn";
import { createTemporal } from "../createTemporal";
import { mockAdapter } from "../test/mockAdapter";
import { TEST_DATE, testDates } from "../test/testDates";
import type { Period } from "../types/period";

describe("zoomIn", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    dateAdapter: mockAdapter,
    weekStartsOn: 1, // Monday
  });

  it("should zoom from year to months", () => {
    const year: Period = {
      start: testDates.jan1,
      end: testDates.dec31,
      type: "year",
      value: testDates.jun15,
      number: 2024,
    };

    const months = zoomIn(temporal, year, "month");

    expect(months).toHaveLength(12);
    expect(months[0].start.getMonth()).toBe(0); // January
    expect(months[11].start.getMonth()).toBe(11); // December
  });

  it("should zoom from month to weeks", () => {
    const january: Period = {
      start: testDates.jan1,
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "month",
      value: testDates.jan15,
      number: 1,
    };

    const weeks = zoomIn(temporal, january, "week");

    expect(weeks.length).toBeGreaterThanOrEqual(4);
    expect(weeks.length).toBeLessThanOrEqual(6);
  });

  it("should zoom from week to days", () => {
    const week: Period = {
      start: new Date(2024, 0, 8), // Monday
      end: new Date(2024, 0, 14, 23, 59, 59, 999), // Sunday
      type: "week",
      value: testDates.jan10,
      number: 2,
    };

    const days = zoomIn(temporal, week, "day");

    expect(days).toHaveLength(7);
    expect(days[0].start.getDay()).toBe(1); // Monday
    expect(days[6].start.getDay()).toBe(0); // Sunday
  });

  it("should zoom from day to hours", () => {
    const day: Period = {
      start: new Date(2024, 0, 15, 0, 0, 0),
      end: new Date(2024, 0, 15, 23, 59, 59, 999),
      type: "day",
      value: testDates.jan15,
      number: 15,
    };

    const hours = zoomIn(temporal, day, "hour");

    expect(hours).toHaveLength(24);
    expect(hours[0].number).toBe(0);
    expect(hours[23].number).toBe(23);
  });

  it("should zoom from custom period", () => {
    const sprint: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 14, 23, 59, 59, 999),
      type: "custom",
      value: new Date(2024, 0, 7),
      number: 0,
    };

    const days = zoomIn(temporal, sprint, "day");

    expect(days).toHaveLength(14);
    expect(days[0].start.getDate()).toBe(1);
    expect(days[13].start.getDate()).toBe(14);
  });

  it("should zoom from hour to minutes", () => {
    const hour: Period = {
      start: new Date(2024, 0, 15, 14, 0, 0),
      end: new Date(2024, 0, 15, 14, 59, 59, 999),
      type: "hour",
      value: new Date(2024, 0, 15, 14, 30),
      number: 14,
    };

    const minutes = zoomIn(temporal, hour, "minute");

    expect(minutes).toHaveLength(60);
    expect(minutes[0].number).toBe(0);
    expect(minutes[59].number).toBe(59);
  });

  it("should preserve period properties when zooming", () => {
    const month: Period = {
      start: testDates.jun1,
      end: testDates.jun30,
      type: "month",
      value: testDates.jun15,
      number: 6,
    };

    const days = zoomIn(temporal, month, "day");

    expect(days).toHaveLength(30); // June has 30 days

    // All days should be within the month
    days.forEach((day) => {
      expect(day.start.getMonth()).toBe(5); // June
      expect(day.end.getMonth()).toBe(5);
    });
  });

  it("should handle quarter zoom to months", () => {
    const q2: Period = {
      start: new Date(2024, 3, 1),
      end: testDates.jun30,
      type: "quarter",
      value: testDates.may15,
      number: 2,
    };

    const months = zoomIn(temporal, q2, "month");

    expect(months).toHaveLength(3);
    expect(months[0].number).toBe(4); // April
    expect(months[1].number).toBe(5); // May
    expect(months[2].number).toBe(6); // June
  });

  it("should handle stableMonth zoom to days", () => {
    const stableMonth: Period = {
      start: new Date(2024, 0, 29), // Monday before Feb 1
      end: new Date(2024, 2, 10, 23, 59, 59, 999), // Sunday
      type: "stableMonth",
      value: testDates.feb15,
      number: 2,
    };

    const days = zoomIn(temporal, stableMonth, "day");

    expect(days).toHaveLength(42); // 6 weeks * 7 days
  });

  it("should handle stableMonth zoom to weeks", () => {
    const stableMonth: Period = {
      start: new Date(2024, 0, 29), // Monday before Feb 1
      end: new Date(2024, 2, 10, 23, 59, 59, 999), // Sunday
      type: "stableMonth",
      value: testDates.feb15,
      number: 2,
    };

    const weeks = zoomIn(temporal, stableMonth, "week");

    expect(weeks).toHaveLength(6);
  });

  it("should throw error when trying to zoom to stableMonth", () => {
    const month: Period = {
      start: testDates.jan1,
      end: new Date(2024, 0, 31),
      type: "month",
      value: testDates.jan15,
      number: 1,
    };

    expect(() => zoomIn(temporal, month, "stableMonth")).toThrow(
      "Cannot divide by stableMonth. Use useStableMonth() instead."
    );
  });
});
