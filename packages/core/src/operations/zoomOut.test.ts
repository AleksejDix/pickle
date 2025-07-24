import { describe, it, expect } from "vitest";
import { zoomOut } from "./zoomOut";
import { createTemporal } from "../createTemporal";
import { mockAdapter } from "../test/mockAdapter";
import { TEST_DATE, testDates } from "../test/testDates";
import type { Period } from "../types/period";

describe("zoomOut", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    dateAdapter: mockAdapter,
    weekStartsOn: 1, // Monday
  });

  it("should zoom from day to month", () => {
    const day: Period = {
      start: new Date(2024, 0, 15, 0, 0, 0),
      end: new Date(2024, 0, 15, 23, 59, 59, 999),
      type: "day",
      value: testDates.jan15,
      number: 15,
    };

    const month = zoomOut(temporal, day, "month");

    expect(month.type).toBe("month");
    expect(month.number).toBe(1); // January
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
      value: new Date(2024, 0, 17, 12, 0),
      number: 17,
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
      value: testDates.jun15,
      number: 6,
    };

    const year = zoomOut(temporal, june, "year");

    expect(year.type).toBe("year");
    expect(year.number).toBe(2024);
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
      value: new Date(2024, 0, 15, 14, 30),
      number: 14,
    };

    const day = zoomOut(temporal, hour, "day");

    expect(day.type).toBe("day");
    expect(day.number).toBe(15);
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
      value: new Date(2024, 0, 14),
      number: 0,
    };

    const month = zoomOut(temporal, sprint, "month");

    expect(month.type).toBe("month");
    expect(month.number).toBe(1); // January
    expect(month.start.getMonth()).toBe(0);
  });

  it("should zoom to stableMonth", () => {
    const day: Period = {
      start: new Date(2024, 1, 15, 0, 0, 0), // Feb 15, 2024
      end: new Date(2024, 1, 15, 23, 59, 59, 999),
      type: "day",
      value: testDates.feb15,
      number: 15,
    };

    const stableMonth = zoomOut(temporal, day, "stableMonth");

    expect(stableMonth.type).toBe("stableMonth");
    expect(stableMonth.number).toBe(2); // February
    // Actual boundaries depend on adapter implementation
  });

  it("should update temporal browsing value", () => {
    const originalBrowsing = new Date(temporal.browsing.value);

    const day: Period = {
      start: new Date(2024, 5, 15, 0, 0, 0),
      end: new Date(2024, 5, 15, 23, 59, 59, 999),
      type: "day",
      value: testDates.jun15,
      number: 15,
    };

    zoomOut(temporal, day, "month");

    expect(temporal.browsing.value).toEqual(day.value);
    expect(temporal.browsing.value).not.toEqual(originalBrowsing);
  });

  it("should handle direct navigation from hour to year", () => {
    const hour: Period = {
      start: new Date(2024, 5, 15, 14, 0, 0),
      end: new Date(2024, 5, 15, 14, 59, 59, 999),
      type: "hour",
      value: new Date(2024, 5, 15, 14, 30),
      number: 14,
    };

    const year = zoomOut(temporal, hour, "year");

    expect(year.type).toBe("year");
    expect(year.number).toBe(2024);
    expect(year.start.getMonth()).toBe(0); // January
    expect(year.end.getMonth()).toBe(11); // December
  });

  it("should handle zoom to quarter", () => {
    const may: Period = {
      start: new Date(2024, 4, 1),
      end: new Date(2024, 4, 31, 23, 59, 59, 999),
      type: "month",
      value: testDates.may15,
      number: 5,
    };

    const quarter = zoomOut(temporal, may, "quarter");

    expect(quarter.type).toBe("quarter");
    expect(quarter.number).toBe(2); // Q2
    // The exact boundaries depend on the adapter implementation
  });

  it("should preserve date when zooming", () => {
    const specificDate = new Date(2024, 6, 4, 16, 45, 30); // July 4, 2024, 4:45:30 PM

    const hour: Period = {
      start: new Date(2024, 6, 4, 16, 0, 0),
      end: new Date(2024, 6, 4, 16, 59, 59, 999),
      type: "hour",
      value: specificDate,
      number: 16,
    };

    const month = zoomOut(temporal, hour, "month");

    expect(month.value).toEqual(specificDate);
    expect(month.value.getMonth()).toBe(6); // July
  });
});
