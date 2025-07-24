import { describe, it, expect } from "vitest";
import { go } from "./go";
import { createTemporal } from "../createTemporal";
import { nativeAdapter } from "@usetemporal/adapter-native";
import type { Period } from "../types/period";

describe("go", () => {
  const temporal = createTemporal({
    date: new Date(),
    dateAdapter: nativeAdapter,
    weekStartsOn: 1, // Monday
  });

  it("should move forward by positive steps", () => {
    const year2024: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31, 23, 59, 59, 999),
      type: "year",
      value: new Date(2024, 5, 15),
      number: 2024,
    };

    const year2027 = go(temporal, year2024, 3);

    expect(year2027.number).toBe(2027);
    expect(year2027.start.getFullYear()).toBe(2027);
  });

  it("should move backward by negative steps", () => {
    const year2024: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31, 23, 59, 59, 999),
      type: "year",
      value: new Date(2024, 5, 15),
      number: 2024,
    };

    const year2020 = go(temporal, year2024, -4);

    expect(year2020.number).toBe(2020);
    expect(year2020.start.getFullYear()).toBe(2020);
  });

  it("should return same period when steps is 0", () => {
    const month: Period = {
      start: new Date(2024, 5, 1),
      end: new Date(2024, 5, 30, 23, 59, 59, 999),
      type: "month",
      value: new Date(2024, 5, 15),
      number: 6,
    };

    const sameMonth = go(temporal, month, 0);

    expect(sameMonth).toEqual(month);
  });

  it("should handle multiple month navigation", () => {
    const january: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "month",
      value: new Date(2024, 0, 15),
      number: 1,
    };

    const august = go(temporal, january, 7);

    expect(august.number).toBe(8);
    expect(august.start.getMonth()).toBe(7); // August (0-indexed)
  });

  it("should handle week navigation", () => {
    const week1: Period = {
      start: new Date(2024, 0, 1), // Monday
      end: new Date(2024, 0, 7, 23, 59, 59, 999), // Sunday
      type: "week",
      value: new Date(2024, 0, 3),
      number: 1,
    };

    const week5 = go(temporal, week1, 4);

    expect(week5.start.getDate()).toBe(29); // 4 weeks later
  });

  it("should handle day navigation across months", () => {
    const jan28: Period = {
      start: new Date(2024, 0, 28, 0, 0, 0),
      end: new Date(2024, 0, 28, 23, 59, 59, 999),
      type: "day",
      value: new Date(2024, 0, 28, 12, 0),
      number: 28,
    };

    const feb3 = go(temporal, jan28, 6);

    expect(feb3.number).toBe(3);
    expect(feb3.start.getMonth()).toBe(1); // February
    expect(feb3.start.getDate()).toBe(3);
  });

  it("should handle hour navigation across days", () => {
    const hour22: Period = {
      start: new Date(2024, 0, 15, 22, 0, 0),
      end: new Date(2024, 0, 15, 22, 59, 59, 999),
      type: "hour",
      value: new Date(2024, 0, 15, 22, 30),
      number: 22,
    };

    const nextDayHour2 = go(temporal, hour22, 4);

    expect(nextDayHour2.number).toBe(2);
    expect(nextDayHour2.start.getDate()).toBe(16);
    expect(nextDayHour2.start.getHours()).toBe(2);
  });

  it("should handle negative navigation across boundaries", () => {
    const feb5: Period = {
      start: new Date(2024, 1, 5, 0, 0, 0),
      end: new Date(2024, 1, 5, 23, 59, 59, 999),
      type: "day",
      value: new Date(2024, 1, 5, 12, 0),
      number: 5,
    };

    const jan27 = go(temporal, feb5, -9);

    expect(jan27.number).toBe(27);
    expect(jan27.start.getMonth()).toBe(0); // January
    expect(jan27.start.getDate()).toBe(27);
  });

  it("should handle year navigation across centuries", () => {
    const year1999: Period = {
      start: new Date(1999, 0, 1),
      end: new Date(1999, 11, 31, 23, 59, 59, 999),
      type: "year",
      value: new Date(1999, 5, 15),
      number: 1999,
    };

    const year2005 = go(temporal, year1999, 6);

    expect(year2005.number).toBe(2005);
    expect(year2005.start.getFullYear()).toBe(2005);
  });

  it("should handle quarter navigation", () => {
    const q1: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 2, 31, 23, 59, 59, 999),
      type: "quarter",
      value: new Date(2024, 1, 15),
      number: 1,
    };

    const q3 = go(temporal, q1, 2);

    expect(q3.number).toBe(3);
    expect(q3.type).toBe("quarter");
    // The exact boundaries depend on the adapter implementation
  });

  it("should handle stableMonth navigation", () => {
    const stableJan: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 1, 11, 23, 59, 59, 999),
      type: "stableMonth",
      value: new Date(2024, 0, 15),
      number: 1,
    };

    const stableMay = go(temporal, stableJan, 4);

    expect(stableMay.number).toBe(5);
    expect(stableMay.value.getMonth()).toBe(4); // May
  });
});
