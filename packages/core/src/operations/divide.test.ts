import { describe, it, expect } from "vitest";
import { divide } from "./divide";
import { createTemporal } from "../createTemporal";
import { nativeAdapter } from "@usetemporal/adapter-native";
import type { Period } from "../types/period";

describe("divide", () => {
  const temporal = createTemporal({
    date: new Date(),
    dateAdapter: nativeAdapter,
    weekStartsOn: 1, // Monday
  });

  it("should divide year into months", () => {
    const year: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31, 23, 59, 59, 999),
      type: "year",
      value: new Date(2024, 5, 15),
      number: 2024,
    };

    const months = divide(temporal, year, "month");

    expect(months).toHaveLength(12);
    expect(months[0].number).toBe(1); // January
    expect(months[0].start.getMonth()).toBe(0);
    expect(months[11].number).toBe(12); // December
    expect(months[11].start.getMonth()).toBe(11);
  });

  it("should divide month into days", () => {
    const january: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "month",
      value: new Date(2024, 0, 15),
      number: 1,
    };

    const days = divide(temporal, january, "day");

    expect(days).toHaveLength(31); // January has 31 days
    expect(days[0].number).toBe(1);
    expect(days[30].number).toBe(31);
  });

  it("should divide week into days", () => {
    const week: Period = {
      start: new Date(2024, 0, 8), // Monday
      end: new Date(2024, 0, 14, 23, 59, 59, 999), // Sunday
      type: "week",
      value: new Date(2024, 0, 10),
      number: 2,
    };

    const days = divide(temporal, week, "day");

    expect(days).toHaveLength(7);
    expect(days[0].start.getDay()).toBe(1); // Monday
    expect(days[6].start.getDay()).toBe(0); // Sunday
  });

  it("should divide day into hours", () => {
    const day: Period = {
      start: new Date(2024, 0, 15, 0, 0, 0),
      end: new Date(2024, 0, 15, 23, 59, 59, 999),
      type: "day",
      value: new Date(2024, 0, 15, 12, 0),
      number: 15,
    };

    const hours = divide(temporal, day, "hour");

    expect(hours).toHaveLength(24);
    expect(hours[0].number).toBe(0);
    expect(hours[23].number).toBe(23);
  });

  it("should throw error when dividing by stableMonth", () => {
    const month: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31),
      type: "month",
      value: new Date(2024, 0, 15),
      number: 1,
    };

    expect(() => divide(temporal, month, "stableMonth")).toThrow(
      "Cannot divide by stableMonth. Use useStableMonth() instead."
    );
  });

  it("should handle stableMonth division by day", () => {
    const stableMonth: Period = {
      start: new Date(2024, 0, 29), // Monday before Feb 1
      end: new Date(2024, 2, 10, 23, 59, 59, 999), // Sunday
      type: "stableMonth",
      value: new Date(2024, 1, 15),
      number: 2,
    };

    const days = divide(temporal, stableMonth, "day");

    expect(days).toHaveLength(42); // 6 weeks * 7 days
    expect(days[0].start.getDate()).toBe(29); // Jan 29
    expect(days[41].start.getDate()).toBe(10); // Mar 10
  });

  it("should handle stableMonth division by week", () => {
    const stableMonth: Period = {
      start: new Date(2024, 0, 29), // Monday before Feb 1
      end: new Date(2024, 2, 10, 23, 59, 59, 999), // Sunday
      type: "stableMonth",
      value: new Date(2024, 1, 15),
      number: 2,
    };

    const weeks = divide(temporal, stableMonth, "week");

    expect(weeks).toHaveLength(6);
    expect(weeks[0].start.getDate()).toBe(29); // First week starts Jan 29
    expect(weeks[5].end.getDate()).toBe(10); // Last week ends Mar 10
  });

  it("should throw error when dividing stableMonth by invalid unit", () => {
    const stableMonth: Period = {
      start: new Date(2024, 0, 29),
      end: new Date(2024, 2, 10),
      type: "stableMonth",
      value: new Date(2024, 1, 15),
      number: 2,
    };

    expect(() => divide(temporal, stableMonth, "month")).toThrow(
      "stableMonth can only be divided by 'day' or 'week'"
    );
  });

  it("should respect weekStartsOn when dividing by week", () => {
    const sundayTemporal = createTemporal({
    date: new Date(),
      dateAdapter: nativeAdapter,
      weekStartsOn: 0, // Sunday
    });

    const january: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "month",
      value: new Date(2024, 0, 15),
      number: 1,
    };

    const weeks = divide(sundayTemporal, january, "week");

    // First week should start on Sunday
    if (weeks.length > 0) {
      const firstWeekStart = weeks[0].start.getDay();
      expect(firstWeekStart).toBe(0); // Sunday
    }
  });
});
