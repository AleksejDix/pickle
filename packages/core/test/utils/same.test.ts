import { describe, it, expect, beforeEach } from "vitest";
import { same } from "../../src/utils/same";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
import type { DateAdapter } from "../../src/types/core";

describe("same", () => {
  let adapter: DateAdapter;

  beforeEach(() => {
    adapter = new NativeDateAdapter();
  });

  it("should return true for same dates at the specified unit", () => {
    const date1 = new Date("2024-06-15T10:30:00");
    const date2 = new Date("2024-06-15T20:45:00");

    // Same day
    expect(same(date1, date2, "day", adapter)).toBe(true);
    
    // Same month
    expect(same(date1, date2, "month", adapter)).toBe(true);
    
    // Same year
    expect(same(date1, date2, "year", adapter)).toBe(true);
    
    // Different hour
    expect(same(date1, date2, "hour", adapter)).toBe(false);
  });

  it("should return false for different dates at the specified unit", () => {
    const date1 = new Date("2024-06-15T10:30:00");
    const date2 = new Date("2024-06-16T10:30:00");

    // Different day
    expect(same(date1, date2, "day", adapter)).toBe(false);
    
    // Same month
    expect(same(date1, date2, "month", adapter)).toBe(true);
    
    // Same year
    expect(same(date1, date2, "year", adapter)).toBe(true);
  });

  it("should handle null and undefined values", () => {
    const date = new Date("2024-06-15");

    expect(same(null, date, "day", adapter)).toBe(false);
    expect(same(date, null, "day", adapter)).toBe(false);
    expect(same(null, null, "day", adapter)).toBe(false);
    
    expect(same(undefined, date, "day", adapter)).toBe(false);
    expect(same(date, undefined, "day", adapter)).toBe(false);
    expect(same(undefined, undefined, "day", adapter)).toBe(false);
    
    expect(same(null, undefined, "day", adapter)).toBe(false);
  });

  it("should work with different time units", () => {
    const date1 = new Date("2024-06-15T10:30:45.123");
    const date2 = new Date("2024-06-15T10:30:45.456");

    // Same second but different milliseconds
    expect(same(date1, date2, "second", adapter)).toBe(true);
    
    // Same minute
    expect(same(date1, date2, "minute", adapter)).toBe(true);
    
    // Same hour
    expect(same(date1, date2, "hour", adapter)).toBe(true);
  });

  it("should handle year boundaries", () => {
    const lastDayOfYear = new Date("2024-12-31T23:59:59");
    const firstDayOfNextYear = new Date("2025-01-01T00:00:00");

    expect(same(lastDayOfYear, firstDayOfNextYear, "year", adapter)).toBe(false);
    expect(same(lastDayOfYear, firstDayOfNextYear, "month", adapter)).toBe(false);
    expect(same(lastDayOfYear, firstDayOfNextYear, "day", adapter)).toBe(false);
  });

  it("should handle month boundaries", () => {
    const lastDayOfMonth = new Date("2024-06-30T23:59:59");
    const firstDayOfNextMonth = new Date("2024-07-01T00:00:00");

    expect(same(lastDayOfMonth, firstDayOfNextMonth, "month", adapter)).toBe(false);
    expect(same(lastDayOfMonth, firstDayOfNextMonth, "day", adapter)).toBe(false);
    expect(same(lastDayOfMonth, firstDayOfNextMonth, "year", adapter)).toBe(true);
  });

  it("should handle week comparisons", () => {
    const sunday = new Date("2024-06-09"); // Sunday
    const saturday = new Date("2024-06-15"); // Saturday of same week

    expect(same(sunday, saturday, "week", adapter)).toBe(true);

    const nextSunday = new Date("2024-06-16");
    expect(same(sunday, nextSunday, "week", adapter)).toBe(false);
  });

  it("should handle identical dates", () => {
    const date1 = new Date("2024-06-15T10:30:45.123");
    const date2 = new Date("2024-06-15T10:30:45.123");

    expect(same(date1, date2, "millisecond", adapter)).toBe(true);
    expect(same(date1, date2, "second", adapter)).toBe(true);
    expect(same(date1, date2, "minute", adapter)).toBe(true);
    expect(same(date1, date2, "hour", adapter)).toBe(true);
    expect(same(date1, date2, "day", adapter)).toBe(true);
    expect(same(date1, date2, "week", adapter)).toBe(true);
    expect(same(date1, date2, "month", adapter)).toBe(true);
    expect(same(date1, date2, "year", adapter)).toBe(true);
  });
});