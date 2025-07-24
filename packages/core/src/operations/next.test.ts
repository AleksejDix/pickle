import { describe, it, expect } from "vitest";
import { next } from "./next";
import { createTemporal } from "../createTemporal";
import { nativeAdapter } from "@usetemporal/adapter-native";
import type { Period } from "../types/period";

describe("next", () => {
  const temporal = createTemporal({
    date: new Date(),
    dateAdapter: nativeAdapter,
    weekStartsOn: 1, // Monday
  });

  it("should move to next year", () => {
    const year2024: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31, 23, 59, 59, 999),
      type: "year",
      value: new Date(2024, 5, 15),
      number: 2024,
    };

    const year2025 = next(temporal, year2024);

    expect(year2025.number).toBe(2025);
    expect(year2025.start.getFullYear()).toBe(2025);
    expect(year2025.end.getFullYear()).toBe(2025);
  });

  it("should move to next month", () => {
    const january: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "month",
      value: new Date(2024, 0, 15),
      number: 1,
    };

    const february = next(temporal, january);

    expect(february.number).toBe(2);
    expect(february.start.getMonth()).toBe(1); // February
    expect(february.end.getMonth()).toBe(1);
  });

  it("should move to next week", () => {
    const week1: Period = {
      start: new Date(2024, 0, 8), // Monday
      end: new Date(2024, 0, 14, 23, 59, 59, 999), // Sunday
      type: "week",
      value: new Date(2024, 0, 10),
      number: 2,
    };

    const week2 = next(temporal, week1);

    expect(week2.start.getDate()).toBe(15); // Next Monday
    expect(week2.end.getDate()).toBe(21); // Next Sunday
  });

  it("should move to next day", () => {
    const jan15: Period = {
      start: new Date(2024, 0, 15, 0, 0, 0),
      end: new Date(2024, 0, 15, 23, 59, 59, 999),
      type: "day",
      value: new Date(2024, 0, 15, 12, 0),
      number: 15,
    };

    const jan16 = next(temporal, jan15);

    expect(jan16.number).toBe(16);
    expect(jan16.start.getDate()).toBe(16);
    expect(jan16.end.getDate()).toBe(16);
  });

  it("should move to next hour", () => {
    const hour14: Period = {
      start: new Date(2024, 0, 15, 14, 0, 0),
      end: new Date(2024, 0, 15, 14, 59, 59, 999),
      type: "hour",
      value: new Date(2024, 0, 15, 14, 30),
      number: 14,
    };

    const hour15 = next(temporal, hour14);

    expect(hour15.number).toBe(15);
    expect(hour15.start.getHours()).toBe(15);
    expect(hour15.end.getHours()).toBe(15);
  });

  it("should handle month boundaries", () => {
    const jan31: Period = {
      start: new Date(2024, 0, 31, 0, 0, 0),
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "day",
      value: new Date(2024, 0, 31, 12, 0),
      number: 31,
    };

    const feb1 = next(temporal, jan31);

    expect(feb1.number).toBe(1);
    expect(feb1.start.getMonth()).toBe(1); // February
    expect(feb1.start.getDate()).toBe(1);
  });

  it("should handle year boundaries", () => {
    const dec2024: Period = {
      start: new Date(2024, 11, 1),
      end: new Date(2024, 11, 31, 23, 59, 59, 999),
      type: "month",
      value: new Date(2024, 11, 15),
      number: 12,
    };

    const jan2025 = next(temporal, dec2024);

    expect(jan2025.number).toBe(1);
    expect(jan2025.start.getFullYear()).toBe(2025);
    expect(jan2025.start.getMonth()).toBe(0); // January
  });

  it("should handle day boundaries at midnight", () => {
    const hour23: Period = {
      start: new Date(2024, 0, 15, 23, 0, 0),
      end: new Date(2024, 0, 15, 23, 59, 59, 999),
      type: "hour",
      value: new Date(2024, 0, 15, 23, 30),
      number: 23,
    };

    const hour0 = next(temporal, hour23);

    expect(hour0.number).toBe(0);
    expect(hour0.start.getDate()).toBe(16); // Next day
    expect(hour0.start.getHours()).toBe(0);
  });

  it("should handle stableMonth navigation", () => {
    const stableJanuary: Period = {
      start: new Date(2024, 0, 1), // Monday
      end: new Date(2024, 1, 11, 23, 59, 59, 999), // Sunday
      type: "stableMonth",
      value: new Date(2024, 0, 15),
      number: 1,
    };

    const stableFebruary = next(temporal, stableJanuary);

    expect(stableFebruary.number).toBe(2);
    expect(stableFebruary.value.getMonth()).toBe(1); // February
    // Exact grid boundaries depend on the adapter's startOf/endOf implementation
  });

  it("should handle quarter navigation", () => {
    const q1: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 2, 31, 23, 59, 59, 999),
      type: "quarter",
      value: new Date(2024, 1, 15),
      number: 1,
    };

    const q2 = next(temporal, q1);

    expect(q2.number).toBe(2);
    expect(q2.type).toBe("quarter");
    // The exact boundaries depend on the adapter implementation
  });
});
