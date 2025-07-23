import { describe, it, expect, beforeEach } from "vitest";
import { ref } from "@vue/reactivity";
import useWeek from "../../src/composables/useWeek";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
import type { DateAdapter } from "../../src/types/core";

describe("useWeek", () => {
  let adapter: DateAdapter;
  let testDate: Date;

  beforeEach(() => {
    adapter = new NativeDateAdapter();
    testDate = new Date("2024-06-15T10:30:00"); // Saturday
  });

  it("should initialize with provided date", () => {
    const week = useWeek({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(week.raw.value).toEqual(testDate);
    // Week number format includes year: "2024-W24"
    expect(week.name.value).toMatch(/^\d{4}-W\d{1,2}$/);
  });

  it("should throw error if adapter is not provided", () => {
    expect(() => {
      useWeek({
        now: testDate,
        browsing: testDate,
        adapter: undefined as any,
      });
    }).toThrow("Adapter is required for useWeek composable");
  });

  it("should work with reactive refs", () => {
    const now = ref(testDate);
    const browsing = ref(testDate);

    const week = useWeek({
      now,
      browsing,
      adapter,
    });

    expect(week.raw.value).toEqual(testDate);
    expect(week.isNow.value).toBe(true);

    // Change browsing to next week
    browsing.value = new Date("2024-06-22");
    expect(week.isNow.value).toBe(false);
  });

  it("should calculate start and end of week", () => {
    const week = useWeek({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    // Week starts on Sunday for native adapter
    expect(week.start.value.getDay()).toBe(0); // Sunday
    expect(week.end.value.getDay()).toBe(6); // Saturday
    
    // Should be same week
    expect(week.start.value <= testDate).toBe(true);
    expect(week.end.value >= testDate).toBe(true);
  });

  it("should calculate timespan", () => {
    const week = useWeek({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    const timespan = week.timespan.value;
    expect(timespan.start.getDay()).toBe(0); // Sunday
    expect(timespan.end.getDay()).toBe(6); // Saturday
  });

  it("should navigate to future week", () => {
    const week = useWeek({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    const startBefore = week.start.value;
    week.future();
    const startAfter = week.start.value;

    // Should advance by 7 days
    const daysDiff = (startAfter.getTime() - startBefore.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysDiff).toBe(7);
    expect(week.isNow.value).toBe(false);
  });

  it("should navigate to past week", () => {
    const week = useWeek({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    const startBefore = week.start.value;
    week.past();
    const startAfter = week.start.value;

    // Should go back by 7 days
    const daysDiff = (startBefore.getTime() - startAfter.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysDiff).toBe(7);
    expect(week.isNow.value).toBe(false);
  });

  it("should format week correctly", () => {
    const week = useWeek({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    // Format should return week number (1-52)
    const weekNum = week.format(testDate);
    expect(weekNum).toBeGreaterThanOrEqual(1);
    expect(weekNum).toBeLessThanOrEqual(53);
  });

  it("should compare weeks with isSame", () => {
    const week = useWeek({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    // Same week
    expect(week.isSame(
      new Date("2024-06-09"), // Sunday of same week
      new Date("2024-06-15")  // Saturday of same week
    )).toBe(true);

    // Different weeks
    expect(week.isSame(
      new Date("2024-06-15"),
      new Date("2024-06-22")
    )).toBe(false);
  });

  it("should handle year boundary correctly", () => {
    // Test week that spans year boundary
    const newYear = new Date("2024-12-30"); // Monday
    const week = useWeek({
      now: testDate,
      browsing: newYear,
      adapter,
    });

    const start = week.start.value;
    const end = week.end.value;

    // Week should span from Dec 2024 to Jan 2025
    expect(start.getFullYear()).toBe(2024);
    expect(end.getFullYear()).toBe(2025);
  });

  it("should calculate weekDay correctly", () => {
    const week = useWeek({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    // weekDay should be the day of week at start (Sunday = 7)
    expect(week.weekDay.value).toBe(7); // Sunday as 7
  });

  it("should update isNow when browsing changes", () => {
    const now = ref(new Date("2024-06-15"));
    const browsing = ref(new Date("2024-06-15"));

    const week = useWeek({
      now,
      browsing,
      adapter,
    });

    expect(week.isNow.value).toBe(true); // Same week

    // Move to next week
    browsing.value = new Date("2024-06-22");
    expect(week.isNow.value).toBe(false); // Different week
  });

  it("should handle week number edge cases", () => {
    // First week of year
    const firstWeek = useWeek({
      now: testDate,
      browsing: new Date("2024-01-07"), // First Sunday of year
      adapter,
    });
    expect(firstWeek.number.value).toBe(1);

    // Last week of year (can be 51, 52 or 53 depending on calculation method)
    const lastWeek = useWeek({
      now: testDate,
      browsing: new Date("2024-12-28"),
      adapter,
    });
    expect(lastWeek.number.value).toBeGreaterThanOrEqual(51);
    expect(lastWeek.number.value).toBeLessThanOrEqual(53);
  });
});