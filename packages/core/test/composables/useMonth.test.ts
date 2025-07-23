import { describe, it, expect, beforeEach } from "vitest";
import { ref } from "@vue/reactivity";
import useMonth from "../../src/composables/useMonth";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
import type { DateAdapter } from "../../src/types/core";

describe("useMonth", () => {
  let adapter: DateAdapter;
  let testDate: Date;

  beforeEach(() => {
    adapter = new NativeDateAdapter();
    testDate = new Date("2024-06-15T10:30:00");
  });

  it("should initialize with provided date", () => {
    const month = useMonth({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(month.raw.value).toEqual(testDate);
    expect(month.number.value).toBe(6); // June is month 6 (1-indexed)
    expect(month.name.value).toBe("June 2024");
  });

  it("should throw error if adapter is not provided", () => {
    expect(() => {
      useMonth({
        now: testDate,
        browsing: testDate,
        adapter: undefined as any,
      });
    }).toThrow("Adapter is required for useMonth composable");
  });

  it("should work with reactive refs", () => {
    const now = ref(testDate);
    const browsing = ref(testDate);

    const month = useMonth({
      now,
      browsing,
      adapter,
    });

    expect(month.raw.value).toEqual(testDate);
    expect(month.isNow.value).toBe(true);

    // Change browsing month
    browsing.value = new Date("2024-07-01");
    expect(month.number.value).toBe(7);
    expect(month.name.value).toBe("July 2024");
    expect(month.isNow.value).toBe(false);
  });

  it("should calculate start and end of month", () => {
    const month = useMonth({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(month.start.value).toEqual(new Date("2024-06-01T00:00:00"));
    expect(month.end.value).toEqual(new Date("2024-06-30T23:59:59.999"));
  });

  it("should calculate timespan", () => {
    const month = useMonth({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    const timespan = month.timespan.value;
    expect(timespan.start).toEqual(new Date("2024-06-01T00:00:00"));
    expect(timespan.end).toEqual(new Date("2024-06-30T23:59:59.999"));
  });

  it("should navigate to future month", () => {
    const month = useMonth({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    month.future();
    expect(month.number.value).toBe(7); // July
    expect(month.isNow.value).toBe(false);
  });

  it("should navigate to past month", () => {
    const month = useMonth({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    month.past();
    expect(month.number.value).toBe(5); // May
    expect(month.isNow.value).toBe(false);
  });

  it("should handle year boundary when navigating", () => {
    // Test December to January
    const december = useMonth({
      now: testDate,
      browsing: new Date("2024-12-15"),
      adapter,
    });

    december.future();
    expect(december.number.value).toBe(1); // January
    expect(december.raw.value.getFullYear()).toBe(2025);

    // Test January to December
    const january = useMonth({
      now: testDate,
      browsing: new Date("2024-01-15"),
      adapter,
    });

    january.past();
    expect(january.number.value).toBe(12); // December
    expect(january.raw.value.getFullYear()).toBe(2023);
  });

  it("should format month correctly", () => {
    const month = useMonth({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(month.format(new Date("2024-01-15"))).toBe(1);
    expect(month.format(new Date("2024-12-31"))).toBe(12);
  });

  it("should compare months with isSame", () => {
    const month = useMonth({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(month.isSame(
      new Date("2024-06-01"),
      new Date("2024-06-30")
    )).toBe(true);

    expect(month.isSame(
      new Date("2024-06-15"),
      new Date("2024-07-15")
    )).toBe(false);
  });

  it("should calculate weekDay of month start", () => {
    const month = useMonth({
      now: testDate,
      browsing: new Date("2024-06-15"), // June 1, 2024 is Saturday
      adapter,
    });

    expect(month.weekDay.value).toBe(6); // Saturday

    // Test Sunday (should return 7 instead of 0)
    const month2 = useMonth({
      now: testDate,
      browsing: new Date("2024-09-15"), // September 1, 2024 is Sunday
      adapter,
    });
    expect(month2.weekDay.value).toBe(7); // Sunday as 7
  });

  it("should return correct month names", () => {
    const months = [
      "January 2024", "February 2024", "March 2024", "April 2024", "May 2024", "June 2024",
      "July 2024", "August 2024", "September 2024", "October 2024", "November 2024", "December 2024"
    ];

    months.forEach((monthName, index) => {
      const month = useMonth({
        now: testDate,
        browsing: new Date(2024, index, 15),
        adapter,
      });
      expect(month.name.value).toBe(monthName);
    });
  });

  it("should update isNow when browsing changes", () => {
    const now = ref(new Date("2024-06-15"));
    const browsing = ref(new Date("2024-06-01"));

    const month = useMonth({
      now,
      browsing,
      adapter,
    });

    expect(month.isNow.value).toBe(true); // Same month

    browsing.value = new Date("2024-07-01");
    expect(month.isNow.value).toBe(false); // Different month
  });
});