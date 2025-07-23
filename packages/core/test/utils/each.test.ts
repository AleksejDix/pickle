import { describe, it, expect, beforeEach } from "vitest";
import { each } from "../../src/utils/each";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
import type { DateAdapter } from "../../src/types/core";

describe("each", () => {
  let adapter: DateAdapter;

  beforeEach(() => {
    adapter = new NativeDateAdapter();
  });

  it("should generate dates with default monthly step", () => {
    const start = new Date("2024-01-15T00:00:00");
    const end = new Date("2024-04-15T00:00:00");

    const dates = each({
      start,
      end,
      adapter,
    });

    expect(dates).toHaveLength(4);
    // Use date comparison to avoid timezone issues
    expect(dates[0].getDate()).toBe(15);
    expect(dates[0].getMonth()).toBe(0); // January
    expect(dates[1].getDate()).toBe(15);
    expect(dates[1].getMonth()).toBe(1); // February
    expect(dates[2].getDate()).toBe(15);
    expect(dates[2].getMonth()).toBe(2); // March
    expect(dates[3].getDate()).toBe(15);
    expect(dates[3].getMonth()).toBe(3); // April
  });

  it("should generate dates with custom daily step", () => {
    const start = new Date("2024-06-01");
    const end = new Date("2024-06-05");

    const dates = each({
      start,
      end,
      step: { days: 1 },
      adapter,
    });

    expect(dates).toHaveLength(5);
    expect(dates[0]).toEqual(new Date("2024-06-01"));
    expect(dates[1]).toEqual(new Date("2024-06-02"));
    expect(dates[2]).toEqual(new Date("2024-06-03"));
    expect(dates[3]).toEqual(new Date("2024-06-04"));
    expect(dates[4]).toEqual(new Date("2024-06-05"));
  });

  it("should generate dates with weekly step", () => {
    const start = new Date("2024-06-01");
    const end = new Date("2024-06-22");

    const dates = each({
      start,
      end,
      step: { weeks: 1 },
      adapter,
    });

    expect(dates).toHaveLength(4);
    expect(dates[0]).toEqual(new Date("2024-06-01"));
    expect(dates[1]).toEqual(new Date("2024-06-08"));
    expect(dates[2]).toEqual(new Date("2024-06-15"));
    expect(dates[3]).toEqual(new Date("2024-06-22"));
  });

  it("should generate dates with yearly step", () => {
    const start = new Date("2020-01-01");
    const end = new Date("2024-01-01");

    const dates = each({
      start,
      end,
      step: { years: 1 },
      adapter,
    });

    expect(dates).toHaveLength(5);
    expect(dates[0]).toEqual(new Date("2020-01-01"));
    expect(dates[1]).toEqual(new Date("2021-01-01"));
    expect(dates[2]).toEqual(new Date("2022-01-01"));
    expect(dates[3]).toEqual(new Date("2023-01-01"));
    expect(dates[4]).toEqual(new Date("2024-01-01"));
  });

  it("should generate dates with hourly step", () => {
    const start = new Date("2024-06-15T10:00:00");
    const end = new Date("2024-06-15T14:00:00");

    const dates = each({
      start,
      end,
      step: { hours: 1 },
      adapter,
    });

    expect(dates).toHaveLength(5);
    expect(dates[0]).toEqual(new Date("2024-06-15T10:00:00"));
    expect(dates[1]).toEqual(new Date("2024-06-15T11:00:00"));
    expect(dates[2]).toEqual(new Date("2024-06-15T12:00:00"));
    expect(dates[3]).toEqual(new Date("2024-06-15T13:00:00"));
    expect(dates[4]).toEqual(new Date("2024-06-15T14:00:00"));
  });

  it("should handle single date range", () => {
    const date = new Date("2024-06-15");

    const dates = each({
      start: date,
      end: date,
      adapter,
    });

    expect(dates).toHaveLength(1);
    expect(dates[0]).toEqual(date);
  });

  it("should handle end date not on exact step", () => {
    const start = new Date("2024-01-01");
    const end = new Date("2024-01-25");

    const dates = each({
      start,
      end,
      step: { weeks: 1 },
      adapter,
    });

    expect(dates).toHaveLength(4);
    expect(dates[0]).toEqual(new Date("2024-01-01"));
    expect(dates[1]).toEqual(new Date("2024-01-08"));
    expect(dates[2]).toEqual(new Date("2024-01-15"));
    expect(dates[3]).toEqual(new Date("2024-01-22"));
    // Note: 2024-01-29 would be past the end date
  });

  it("should handle empty range when start is after end", () => {
    const start = new Date("2024-06-15");
    const end = new Date("2024-06-01");

    const dates = each({
      start,
      end,
      adapter,
    });

    expect(dates).toHaveLength(0);
  });

  it("should handle leap year correctly", () => {
    const start = new Date("2024-02-28");
    const end = new Date("2024-03-02");

    const dates = each({
      start,
      end,
      step: { days: 1 },
      adapter,
    });

    expect(dates).toHaveLength(4);
    expect(dates[0]).toEqual(new Date("2024-02-28"));
    expect(dates[1]).toEqual(new Date("2024-02-29")); // Leap day
    expect(dates[2]).toEqual(new Date("2024-03-01"));
    expect(dates[3]).toEqual(new Date("2024-03-02"));
  });

  it("should handle complex duration steps", () => {
    const start = new Date("2024-01-01T00:00:00");
    const end = new Date("2024-01-02T06:00:00");

    const dates = each({
      start,
      end,
      step: { days: 1, hours: 6 },
      adapter,
    });

    expect(dates).toHaveLength(2);
    expect(dates[0]).toEqual(new Date("2024-01-01T00:00:00"));
    expect(dates[1]).toEqual(new Date("2024-01-02T06:00:00"));
  });

  it("should handle month end dates correctly", () => {
    // When adding months to Jan 31, it should handle Feb correctly
    const start = new Date("2024-01-31");
    const end = new Date("2024-04-30");

    const dates = each({
      start,
      end,
      step: { months: 1 },
      adapter,
    });

    expect(dates).toHaveLength(4);
    expect(dates[0]).toEqual(new Date("2024-01-31"));
    // February doesn't have 31 days, so it should be Feb 29 (leap year)
    expect(dates[1].getMonth()).toBe(1); // February
    expect(dates[2].getMonth()).toBe(2); // March
    expect(dates[3].getMonth()).toBe(3); // April
  });
});