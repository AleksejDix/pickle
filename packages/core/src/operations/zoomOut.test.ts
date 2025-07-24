import { describe, it, expect } from "vitest";
import { zoomOut } from "./zoomOut";
import { createTemporal } from "../createTemporal";
import { createMockAdapter } from "../test/functionalMockAdapter";
import { TEST_DATE, testDates } from "../test/testDates";
import type { Period } from "../types";

describe("zoomOut", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: createMockAdapter({ weekStartsOn: 1 }),
    weekStartsOn: 1, // Monday
  });

  it("should zoom from day to month", () => {
    const day: Period = {
      start: new Date(2024, 0, 15, 0, 0, 0),
      end: new Date(2024, 0, 15, 23, 59, 59, 999),
      type: "day",
      date: testDates.jan15,
    };

    const month = zoomOut(temporal, day, "month");

    expect(month.type).toBe("month");
    expect(month.start.getMonth()).toBe(0);
    expect(month.start.getDate()).toBe(1);
    expect(month.end.getMonth()).toBe(0);
    expect(month.end.getDate()).toBe(31);
  });

  it("should zoom from day to week", () => {
    const wednesday: Period = {
      start: new Date(2024, 0, 17, 0, 0, 0), // Jan 17, 2024 (Wednesday)
      end: new Date(2024, 0, 17, 23, 59, 59, 999),
      type: "day",
      date: new Date(2024, 0, 17, 12, 0),
    };

    const week = zoomOut(temporal, wednesday, "week");

    expect(week.type).toBe("week");
    // Week should start on Monday (Jan 15)
    expect(week.start.getDate()).toBe(15);
    expect(week.start.getDay()).toBe(1); // Monday
    // Week should end on Sunday (Jan 21)
    expect(week.end.getDate()).toBe(21);
    expect(week.end.getDay()).toBe(0); // Sunday
  });

  it("should zoom from month to year", () => {
    const june: Period = {
      start: testDates.jun1,
      end: testDates.jun30,
      type: "month",
      date: testDates.jun15,
    };

    const year = zoomOut(temporal, june, "year");

    expect(year.type).toBe("year");
    expect(year.start.getFullYear()).toBe(2024);
    expect(year.start.getMonth()).toBe(0); // January
    expect(year.end.getFullYear()).toBe(2024);
    expect(year.end.getMonth()).toBe(11); // December
  });

  it("should zoom from hour to day", () => {
    const hour: Period = {
      start: new Date(2024, 0, 15, 14, 0, 0),
      end: new Date(2024, 0, 15, 14, 59, 59, 999),
      type: "hour",
      date: new Date(2024, 0, 15, 14, 30),
    };

    const day = zoomOut(temporal, hour, "day");

    expect(day.type).toBe("day");
    expect(day.start.getDate()).toBe(15);
    expect(day.start.getHours()).toBe(0);
    expect(day.end.getDate()).toBe(15);
    expect(day.end.getHours()).toBe(23);
  });

  it("should zoom from custom period to month", () => {
    const sprint: Period = {
      start: new Date(2024, 0, 8), // Jan 8
      end: new Date(2024, 0, 21, 23, 59, 59, 999), // Jan 21
      type: "custom",
      date: new Date(2024, 0, 14),
    };

    const month = zoomOut(temporal, sprint, "month");

    expect(month.type).toBe("month");
    expect(month.start.getMonth()).toBe(0);
  });

  it("should zoom to stableMonth", () => {
    const day: Period = {
      start: new Date(2024, 1, 15, 0, 0, 0), // Feb 15, 2024
      end: new Date(2024, 1, 15, 23, 59, 59, 999),
      type: "day",
      date: testDates.feb15,
    };

    const stableMonth = zoomOut(temporal, day, "stableMonth");

    expect(stableMonth.type).toBe("stableMonth");
    // Actual boundaries depend on adapter implementation
  });

  it("should update temporal browsing value", () => {
    const originalBrowsing = temporal.browsing.value.date;

    const day: Period = {
      start: new Date(2024, 5, 15, 0, 0, 0),
      end: new Date(2024, 5, 15, 23, 59, 59, 999),
      type: "day",
      date: testDates.jun15,
    };

    zoomOut(temporal, day, "month");

    expect(temporal.browsing.value.date).toEqual(day.date);
    expect(temporal.browsing.value.date).not.toEqual(originalBrowsing);
  });

  it("should handle direct navigation from hour to year", () => {
    const hour: Period = {
      start: new Date(2024, 5, 15, 14, 0, 0),
      end: new Date(2024, 5, 15, 14, 59, 59, 999),
      type: "hour",
      date: new Date(2024, 5, 15, 14, 30),
    };

    const year = zoomOut(temporal, hour, "year");

    expect(year.type).toBe("year");
    expect(year.start.getMonth()).toBe(0); // January
    expect(year.end.getMonth()).toBe(11); // December
  });

  it("should handle zoom to quarter", () => {
    const may: Period = {
      start: new Date(2024, 4, 1),
      end: new Date(2024, 4, 31, 23, 59, 59, 999),
      type: "month",
      date: testDates.may15,
    };

    const quarter = zoomOut(temporal, may, "quarter");

    expect(quarter.type).toBe("quarter");
    // The exact boundaries depend on the adapter implementation
  });

  it("should preserve date when zooming", () => {
    const specificDate = new Date(2024, 6, 4, 16, 45, 30); // July 4, 2024, 4:45:30 PM

    const hour: Period = {
      start: new Date(2024, 6, 4, 16, 0, 0),
      end: new Date(2024, 6, 4, 16, 59, 59, 999),
      type: "hour",
      date: specificDate,
    };

    const month = zoomOut(temporal, hour, "month");

    expect(month.date).toEqual(specificDate);
    expect(month.date.getMonth()).toBe(6); // July
  });
});
