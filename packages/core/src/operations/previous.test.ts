import { describe, it, expect } from "vitest";
import { previous } from "./previous";
import { createTemporal } from "../createTemporal";
import { nativeAdapter } from "@usetemporal/adapter-native";
import type { Period } from "../types/period";

describe("previous", () => {
  const temporal = createTemporal({
    date: new Date(),
    dateAdapter: nativeAdapter,
    weekStartsOn: 1, // Monday
  });

  it("should move to previous year", () => {
    const year2024: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31, 23, 59, 59, 999),
      type: "year",
      value: new Date(2024, 5, 15),
      number: 2024,
    };

    const year2023 = previous(temporal, year2024);

    expect(year2023.number).toBe(2023);
    expect(year2023.start.getFullYear()).toBe(2023);
    expect(year2023.end.getFullYear()).toBe(2023);
  });

  it("should move to previous month", () => {
    const february: Period = {
      start: new Date(2024, 1, 1),
      end: new Date(2024, 1, 29, 23, 59, 59, 999),
      type: "month",
      value: new Date(2024, 1, 15),
      number: 2,
    };

    const january = previous(temporal, february);

    expect(january.number).toBe(1);
    expect(january.start.getMonth()).toBe(0); // January
    expect(january.end.getMonth()).toBe(0);
  });

  it("should move to previous week", () => {
    const week2: Period = {
      start: new Date(2024, 0, 15), // Monday
      end: new Date(2024, 0, 21, 23, 59, 59, 999), // Sunday
      type: "week",
      value: new Date(2024, 0, 17),
      number: 3,
    };

    const week1 = previous(temporal, week2);

    expect(week1.start.getDate()).toBe(8); // Previous Monday
    expect(week1.end.getDate()).toBe(14); // Previous Sunday
  });

  it("should move to previous day", () => {
    const jan16: Period = {
      start: new Date(2024, 0, 16, 0, 0, 0),
      end: new Date(2024, 0, 16, 23, 59, 59, 999),
      type: "day",
      value: new Date(2024, 0, 16, 12, 0),
      number: 16,
    };

    const jan15 = previous(temporal, jan16);

    expect(jan15.number).toBe(15);
    expect(jan15.start.getDate()).toBe(15);
    expect(jan15.end.getDate()).toBe(15);
  });

  it("should move to previous hour", () => {
    const hour15: Period = {
      start: new Date(2024, 0, 15, 15, 0, 0),
      end: new Date(2024, 0, 15, 15, 59, 59, 999),
      type: "hour",
      value: new Date(2024, 0, 15, 15, 30),
      number: 15,
    };

    const hour14 = previous(temporal, hour15);

    expect(hour14.number).toBe(14);
    expect(hour14.start.getHours()).toBe(14);
    expect(hour14.end.getHours()).toBe(14);
  });

  it("should handle month boundaries", () => {
    const feb1: Period = {
      start: new Date(2024, 1, 1, 0, 0, 0),
      end: new Date(2024, 1, 1, 23, 59, 59, 999),
      type: "day",
      value: new Date(2024, 1, 1, 12, 0),
      number: 1,
    };

    const jan31 = previous(temporal, feb1);

    expect(jan31.number).toBe(31);
    expect(jan31.start.getMonth()).toBe(0); // January
    expect(jan31.start.getDate()).toBe(31);
  });

  it("should handle year boundaries", () => {
    const jan2024: Period = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31, 23, 59, 59, 999),
      type: "month",
      value: new Date(2024, 0, 15),
      number: 1,
    };

    const dec2023 = previous(temporal, jan2024);

    expect(dec2023.number).toBe(12);
    expect(dec2023.start.getFullYear()).toBe(2023);
    expect(dec2023.start.getMonth()).toBe(11); // December
  });

  it("should handle day boundaries at midnight", () => {
    const hour0: Period = {
      start: new Date(2024, 0, 16, 0, 0, 0),
      end: new Date(2024, 0, 16, 0, 59, 59, 999),
      type: "hour",
      value: new Date(2024, 0, 16, 0, 30),
      number: 0,
    };

    const hour23 = previous(temporal, hour0);

    expect(hour23.number).toBe(23);
    expect(hour23.start.getDate()).toBe(15); // Previous day
    expect(hour23.start.getHours()).toBe(23);
  });

  it("should handle stableMonth navigation", () => {
    const stableFebruary: Period = {
      start: new Date(2024, 0, 29), // Monday
      end: new Date(2024, 2, 10, 23, 59, 59, 999), // Sunday
      type: "stableMonth",
      value: new Date(2024, 1, 15),
      number: 2,
    };

    const stableJanuary = previous(temporal, stableFebruary);

    expect(stableJanuary.number).toBe(1);
    expect(stableJanuary.value.getMonth()).toBe(0); // January
    // Exact grid boundaries depend on the adapter's startOf/endOf implementation
  });

  it("should handle quarter navigation", () => {
    const q2: Period = {
      start: new Date(2024, 3, 1),
      end: new Date(2024, 5, 30, 23, 59, 59, 999),
      type: "quarter",
      value: new Date(2024, 4, 15),
      number: 2,
    };

    const q1 = previous(temporal, q2);

    expect(q1.number).toBe(1);
    expect(q1.type).toBe("quarter");
    // The exact boundaries depend on the adapter implementation
  });
});
