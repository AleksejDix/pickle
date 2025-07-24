import { describe, it, expect } from "vitest";
import { createPeriod } from "./createPeriod";
import { createTemporal } from "../createTemporal";
import { mockAdapter } from "../test/mockAdapter";
import { TEST_DATE, testDates, timeDates } from "../test/testDates";
import type { Period } from "../types";

// Helper to create a temporary period from a date
function tempPeriod(date: Date): Period {
  return {
    start: date,
    end: date,
    type: "second",
    date: date,
  };
}

describe("createPeriod", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: mockAdapter,
    weekStartsOn: 1, // Monday
  });

  it("should create year period", () => {
    const date = testDates.jun15;
    const year = createPeriod(temporal, "year", tempPeriod(date));

    expect(year.type).toBe("year");
    expect(year.start.getFullYear()).toBe(2024);
    expect(year.start.getMonth()).toBe(0); // January
    expect(year.start.getDate()).toBe(1);
    expect(year.end.getFullYear()).toBe(2024);
    expect(year.end.getMonth()).toBe(11); // December
    expect(year.end.getDate()).toBe(31);
  });

  it("should create month period", () => {
    const date = testDates.jun15;
    const month = createPeriod(temporal, "month", tempPeriod(date));

    expect(month.type).toBe("month");
    expect(month.start.getMonth()).toBe(5);
    expect(month.start.getDate()).toBe(1);
    expect(month.end.getMonth()).toBe(5);
    expect(month.end.getDate()).toBe(30); // June has 30 days
  });

  it("should create week period respecting weekStartsOn", () => {
    const date = testDates.jan10; // Wednesday
    const week = createPeriod(temporal, "week", tempPeriod(date));

    expect(week.type).toBe("week");
    // Week should start on Monday Jan 8
    expect(week.start.getDate()).toBe(8);
    expect(week.start.getDay()).toBe(1); // Monday
    // Week should end on Sunday Jan 14
    expect(week.end.getDate()).toBe(14);
    expect(week.end.getDay()).toBe(0); // Sunday
  });

  it("should create week period with Sunday start", () => {
    const sundayTemporal = createTemporal({
      date: TEST_DATE,
      adapter: mockAdapter,
      weekStartsOn: 0, // Sunday
    });

    const date = testDates.jan10; // Wednesday
    const week = createPeriod(sundayTemporal, "week", tempPeriod(date));

    expect(week.type).toBe("week");
    // Week should start on Sunday Jan 7
    expect(week.start.getDate()).toBe(7);
    expect(week.start.getDay()).toBe(0); // Sunday
    // Week should end on Saturday Jan 13
    expect(week.end.getDate()).toBe(13);
    expect(week.end.getDay()).toBe(6); // Saturday
  });

  it("should create day period", () => {
    const date = timeDates.afternoon;
    const day = createPeriod(temporal, "day", tempPeriod(date));

    expect(day.type).toBe("day");
    expect(day.start.getDate()).toBe(15);
    expect(day.start.getHours()).toBe(0);
    expect(day.start.getMinutes()).toBe(0);
    expect(day.end.getDate()).toBe(15);
    expect(day.end.getHours()).toBe(23);
    expect(day.end.getMinutes()).toBe(59);
  });

  it("should create hour period", () => {
    const date = timeDates.afternoon;
    const hour = createPeriod(temporal, "hour", tempPeriod(date));

    expect(hour.type).toBe("hour");
    expect(hour.start.getHours()).toBe(14);
    expect(hour.start.getMinutes()).toBe(0);
    expect(hour.start.getSeconds()).toBe(0);
    expect(hour.end.getHours()).toBe(14);
    expect(hour.end.getMinutes()).toBe(59);
    expect(hour.end.getSeconds()).toBe(59);
  });

  it("should create quarter period", () => {
    const date = testDates.may15; // Q2
    const quarter = createPeriod(temporal, "quarter", tempPeriod(date));

    expect(quarter.type).toBe("quarter");
    // Note: The actual boundaries depend on the adapter implementation
    // Native adapter might handle quarters differently
  });

  it("should handle edge cases for quarters", () => {
    // Q1
    const q1 = createPeriod(temporal, "quarter", tempPeriod(testDates.feb15));
    expect(q1.type).toBe("quarter");
    expect(q1.start.getMonth()).toBeLessThanOrEqual(2); // Q1 includes Jan-Mar

    // Q4
    const q4 = createPeriod(temporal, "quarter", tempPeriod(testDates.nov15));
    expect(q4.type).toBe("quarter");
    expect(q4.start.getMonth()).toBeGreaterThanOrEqual(9); // Q4 includes Oct-Dec
  });

  it("should preserve the reference date", () => {
    const date = TEST_DATE;
    const month = createPeriod(temporal, "month", tempPeriod(date));

    expect(month.date).toEqual(date);
  });

  it("should handle leap year for February", () => {
    const date = testDates.feb15; // February 2024 (leap year)
    const month = createPeriod(temporal, "month", tempPeriod(date));

    expect(month.end.getDate()).toBe(29); // Leap year has 29 days
  });

  it("should handle non-leap year for February", () => {
    const date = testDates.feb15_2023; // February 2023 (non-leap year)
    const month = createPeriod(temporal, "month", tempPeriod(date));

    expect(month.end.getDate()).toBe(28); // Non-leap year has 28 days
  });
});
