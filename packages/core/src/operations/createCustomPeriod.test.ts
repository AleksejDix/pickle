import { describe, it, expect } from "vitest";
import { createCustomPeriod } from "./createCustomPeriod";

describe("createCustomPeriod", () => {
  it("should create custom period with correct properties", () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 14, 23, 59, 59, 999);

    const period = createCustomPeriod(start, end);

    expect(period.type).toBe("custom");
    expect(period.start).toEqual(start);
    expect(period.end).toEqual(end);
  });

  it("should calculate middle value correctly", () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 31);

    const period = createCustomPeriod(start, end);

    const expectedMiddle = new Date((start.getTime() + end.getTime()) / 2);
    expect(period.date).toEqual(expectedMiddle);
  });

  it("should handle same start and end dates", () => {
    const date = new Date(2024, 0, 15, 12, 0, 0);

    const period = createCustomPeriod(date, date);

    expect(period.start).toEqual(date);
    expect(period.end).toEqual(date);
    expect(period.date).toEqual(date);
  });

  it("should handle time components", () => {
    const start = new Date(2024, 0, 1, 9, 0, 0);
    const end = new Date(2024, 0, 1, 17, 0, 0);

    const period = createCustomPeriod(start, end);

    expect(period.start.getHours()).toBe(9);
    expect(period.end.getHours()).toBe(17);
    expect(period.date.getHours()).toBe(13); // Middle of workday
  });

  it("should handle cross-month periods", () => {
    const start = new Date(2024, 0, 15);
    const end = new Date(2024, 1, 15);

    const period = createCustomPeriod(start, end);

    expect(period.start.getMonth()).toBe(0); // January
    expect(period.end.getMonth()).toBe(1); // February
    expect(period.date.getMonth()).toBe(0); // Still January (around Jan 30)
  });

  it("should handle cross-year periods", () => {
    const start = new Date(2023, 11, 15); // Dec 15, 2023
    const end = new Date(2024, 0, 15); // Jan 15, 2024

    const period = createCustomPeriod(start, end);

    expect(period.start.getFullYear()).toBe(2023);
    expect(period.end.getFullYear()).toBe(2024);
    // Middle should be around Dec 30, 2023
    expect(period.date.getFullYear()).toBe(2023);
    expect(period.date.getMonth()).toBe(11);
  });

  it("should handle millisecond precision", () => {
    const start = new Date(2024, 0, 1, 0, 0, 0, 0);
    const end = new Date(2024, 0, 1, 0, 0, 0, 999);

    const period = createCustomPeriod(start, end);

    // JavaScript Date rounds milliseconds to integers
    expect(period.date.getMilliseconds()).toBe(499);
  });
});
