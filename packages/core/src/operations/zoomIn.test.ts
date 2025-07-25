import { describe, it, expect } from "vitest";
import { zoomIn } from "./zoomIn";
import { createTemporal } from "../createTemporal";
import { createMockAdapter } from "../test/functionalMockAdapter";
import { TEST_DATE, testDates } from "../test/testDates";
import type { Period } from "../types";
import { contains } from "./contains";

describe("zoomIn", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: createMockAdapter({ weekStartsOn: 1 }),
    weekStartsOn: 1, // Monday
  });

  it("should zoom from year to month containing browsing date", () => {
    const year: Period = {
      start: testDates.jan1,
      end: testDates.dec31,
      type: "year",
      date: testDates.jun15,
    };

    const month = zoomIn(temporal, year, "month");

    expect(month.type).toBe("month");
    expect(month.start.getMonth()).toBe(5); // June (since browsing date is in June)
    expect(contains(year, month)).toBe(true);
  });

  it("should zoom from month to week containing browsing date", () => {
    const january: Period = {
      start: testDates.jan1,
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "month",
      date: testDates.jan15,
    };

    // Update temporal browsing to be in January
    temporal.browsing.value = {
      start: testDates.jan15,
      end: testDates.jan15,
      type: "day",
      date: testDates.jan15,
    };

    const week = zoomIn(temporal, january, "week");

    expect(week.type).toBe("week");
    expect(contains(january, week)).toBe(true);
    expect(contains(week, testDates.jan15)).toBe(true);
  });

  it("should zoom from week to day containing browsing date", () => {
    const week: Period = {
      start: new Date(2024, 0, 8), // Monday
      end: new Date(2024, 0, 14, 23, 59, 59, 999), // Sunday
      type: "week",
      date: testDates.jan10,
    };

    // Update temporal browsing to be Jan 10 (Wednesday)
    temporal.browsing.value = {
      start: testDates.jan10,
      end: testDates.jan10,
      type: "day",
      date: testDates.jan10,
    };

    const day = zoomIn(temporal, week, "day");

    expect(day.type).toBe("day");
    expect(day.start.getDate()).toBe(10); // January 10
    expect(contains(week, day)).toBe(true);
  });

  it("should zoom from day to hour containing browsing date", () => {
    const period: Period = {
      start: new Date(2024, 5, 15, 0, 0, 0),
      end: new Date(2024, 5, 15, 23, 59, 59, 999),
      type: "day",
      date: TEST_DATE, // 14:30
    };

    // Reset temporal browsing to TEST_DATE
    temporal.browsing.value = {
      start: TEST_DATE,
      end: TEST_DATE,
      type: "day",
      date: TEST_DATE,
    };

    const hour = zoomIn(temporal, period, "hour");

    expect(hour.type).toBe("hour");
    expect(hour.start.getHours()).toBe(14); // 2 PM (since TEST_DATE is 14:30)
    expect(contains(period, hour)).toBe(true);
  });

  it("should fall back to period's date when browsing date is out of range", () => {
    const march: Period = {
      start: new Date(2024, 2, 1),
      end: new Date(2024, 2, 31, 23, 59, 59, 999),
      type: "month",
      date: new Date(2024, 2, 15),
    };

    // Set browsing to a date outside of March
    temporal.browsing.value = {
      start: testDates.jan15,
      end: testDates.jan15,
      type: "day",
      date: testDates.jan15,
    };

    const week = zoomIn(temporal, march, "week");

    expect(week.type).toBe("week");
    expect(contains(march, week)).toBe(true);
    expect(contains(week, march.date)).toBe(true); // Should contain March 15
  });

  it("should handle nested zooming", () => {
    const year: Period = {
      start: testDates.jan1,
      end: testDates.dec31,
      type: "year",
      date: TEST_DATE,
    };

    // Reset browsing to TEST_DATE
    temporal.browsing.value = {
      start: TEST_DATE,
      end: TEST_DATE,
      type: "day",
      date: TEST_DATE,
    };

    const month = zoomIn(temporal, year, "month");
    const week = zoomIn(temporal, month, "week");
    const day = zoomIn(temporal, week, "day");

    expect(contains(year, month)).toBe(true);
    expect(contains(month, week)).toBe(true);
    expect(contains(week, day)).toBe(true);
    expect(contains(year, day)).toBe(true);

    // Should all contain the browsing date
    expect(contains(month, TEST_DATE)).toBe(true);
    expect(contains(week, TEST_DATE)).toBe(true);
    expect(contains(day, TEST_DATE)).toBe(true);
  });
});