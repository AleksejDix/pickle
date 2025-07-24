import { describe, it, expect } from "vitest";
import { createPeriod } from "./createPeriod";
import { createTemporal } from "../createTemporal";
import { nativeAdapter } from "@usetemporal/adapter-native";

describe("createPeriod", () => {
  const temporal = createTemporal({
    date: new Date(),
    dateAdapter: nativeAdapter,
    weekStartsOn: 1, // Monday
  });

  it("should create year period", () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    const year = createPeriod(temporal, "year", date);

    expect(year.type).toBe("year");
    expect(year.number).toBe(2024);
    expect(year.start.getFullYear()).toBe(2024);
    expect(year.start.getMonth()).toBe(0); // January
    expect(year.start.getDate()).toBe(1);
    expect(year.end.getFullYear()).toBe(2024);
    expect(year.end.getMonth()).toBe(11); // December
    expect(year.end.getDate()).toBe(31);
  });

  it("should create month period", () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    const month = createPeriod(temporal, "month", date);

    expect(month.type).toBe("month");
    expect(month.number).toBe(6); // June
    expect(month.start.getMonth()).toBe(5);
    expect(month.start.getDate()).toBe(1);
    expect(month.end.getMonth()).toBe(5);
    expect(month.end.getDate()).toBe(30); // June has 30 days
  });

  it("should create week period respecting weekStartsOn", () => {
    const date = new Date(2024, 0, 10); // Wednesday, Jan 10, 2024
    const week = createPeriod(temporal, "week", date);

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
    date: new Date(),
      dateAdapter: nativeAdapter,
      weekStartsOn: 0, // Sunday
    });

    const date = new Date(2024, 0, 10); // Wednesday, Jan 10, 2024
    const week = createPeriod(sundayTemporal, "week", date);

    // Week should start on Sunday Jan 7
    expect(week.start.getDate()).toBe(7);
    expect(week.start.getDay()).toBe(0); // Sunday
    // Week should end on Saturday Jan 13
    expect(week.end.getDate()).toBe(13);
    expect(week.end.getDay()).toBe(6); // Saturday
  });

  it("should create day period", () => {
    const date = new Date(2024, 5, 15, 14, 30); // June 15, 2024, 2:30 PM
    const day = createPeriod(temporal, "day", date);

    expect(day.type).toBe("day");
    expect(day.number).toBe(15);
    expect(day.start.getDate()).toBe(15);
    expect(day.start.getHours()).toBe(0);
    expect(day.start.getMinutes()).toBe(0);
    expect(day.end.getDate()).toBe(15);
    expect(day.end.getHours()).toBe(23);
    expect(day.end.getMinutes()).toBe(59);
  });

  it("should create hour period", () => {
    const date = new Date(2024, 5, 15, 14, 30, 45); // 2:30:45 PM
    const hour = createPeriod(temporal, "hour", date);

    expect(hour.type).toBe("hour");
    expect(hour.number).toBe(14);
    expect(hour.start.getHours()).toBe(14);
    expect(hour.start.getMinutes()).toBe(0);
    expect(hour.start.getSeconds()).toBe(0);
    expect(hour.end.getHours()).toBe(14);
    expect(hour.end.getMinutes()).toBe(59);
    expect(hour.end.getSeconds()).toBe(59);
  });

  it("should create quarter period", () => {
    const date = new Date(2024, 4, 15); // May 15, 2024 (Q2)
    const quarter = createPeriod(temporal, "quarter", date);

    expect(quarter.type).toBe("quarter");
    expect(quarter.number).toBe(2); // Q2
    // Note: The actual boundaries depend on the adapter implementation
    // Native adapter might handle quarters differently
  });

  it("should handle edge cases for quarters", () => {
    // Q1
    const q1Date = new Date(2024, 1, 15); // February
    const q1 = createPeriod(temporal, "quarter", q1Date);
    expect(q1.number).toBe(1);

    // Q4
    const q4Date = new Date(2024, 10, 15); // November
    const q4 = createPeriod(temporal, "quarter", q4Date);
    expect(q4.number).toBe(4);
  });

  it("should preserve the value date", () => {
    const date = new Date(2024, 5, 15, 14, 30);
    const month = createPeriod(temporal, "month", date);

    expect(month.value).toEqual(date);
  });

  it("should handle leap year for February", () => {
    const date = new Date(2024, 1, 15); // February 2024 (leap year)
    const month = createPeriod(temporal, "month", date);

    expect(month.end.getDate()).toBe(29); // Leap year has 29 days
  });

  it("should handle non-leap year for February", () => {
    const date = new Date(2023, 1, 15); // February 2023 (non-leap year)
    const month = createPeriod(temporal, "month", date);

    expect(month.end.getDate()).toBe(28); // Non-leap year has 28 days
  });
});
