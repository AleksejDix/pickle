import { describe, it, expect, beforeEach } from "vitest";
import { ref } from "@vue/reactivity";
import useHour from "../../src/composables/useHour";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
import type { DateAdapter } from "../../src/types/core";

describe("useHour", () => {
  let adapter: DateAdapter;
  let testDate: Date;

  beforeEach(() => {
    adapter = new NativeDateAdapter();
    testDate = new Date("2024-06-15T10:30:45.123");
  });

  it("should initialize with provided date", () => {
    const hour = useHour({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(hour.raw.value).toEqual(testDate);
    expect(hour.number.value).toBe(10); // 10 AM
    expect(hour.name.value).toBe("10:30 AM");
  });

  it("should throw error if adapter is not provided", () => {
    expect(() => {
      useHour({
        now: testDate,
        browsing: testDate,
        adapter: undefined as any,
      });
    }).toThrow("Adapter is required for useHour composable");
  });

  it("should work with reactive refs", () => {
    const now = ref(testDate);
    const browsing = ref(testDate);

    const hour = useHour({
      now,
      browsing,
      adapter,
    });

    expect(hour.raw.value).toEqual(testDate);
    expect(hour.isNow.value).toBe(true);

    // Change browsing hour
    browsing.value = new Date("2024-06-15T14:30:00");
    expect(hour.number.value).toBe(14);
    expect(hour.name.value).toBe("2:30 PM");
    expect(hour.isNow.value).toBe(false);
  });

  it("should calculate start and end of hour", () => {
    const hour = useHour({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(hour.start.value).toEqual(new Date("2024-06-15T10:00:00"));
    expect(hour.end.value).toEqual(new Date("2024-06-15T10:59:59.999"));
  });

  it("should calculate timespan", () => {
    const hour = useHour({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    const timespan = hour.timespan.value;
    expect(timespan.start).toEqual(new Date("2024-06-15T10:00:00"));
    expect(timespan.end).toEqual(new Date("2024-06-15T10:59:59.999"));
  });

  it("should navigate to future hour", () => {
    const hour = useHour({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    hour.future();
    expect(hour.number.value).toBe(11);
    expect(hour.name.value).toBe("11:30 AM");
    expect(hour.isNow.value).toBe(false);
  });

  it("should navigate to past hour", () => {
    const hour = useHour({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    hour.past();
    expect(hour.number.value).toBe(9);
    expect(hour.name.value).toBe("9:30 AM");
    expect(hour.isNow.value).toBe(false);
  });

  it("should handle day boundaries when navigating", () => {
    // Test end of day
    const endOfDay = new Date("2024-06-15T23:30:00");
    const hour = useHour({
      now: testDate,
      browsing: endOfDay,
      adapter,
    });

    hour.future();
    expect(hour.number.value).toBe(0); // Midnight
    expect(hour.name.value).toBe("12:30 AM");
    expect(hour.raw.value.getDate()).toBe(16); // Next day

    // Test start of day
    const startOfDay = new Date("2024-06-15T00:30:00");
    const hour2 = useHour({
      now: testDate,
      browsing: startOfDay,
      adapter,
    });

    hour2.past();
    expect(hour2.number.value).toBe(23); // 11 PM
    expect(hour2.name.value).toBe("11:30 PM");
    expect(hour2.raw.value.getDate()).toBe(14); // Previous day
  });

  it("should format hour correctly", () => {
    const hour = useHour({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(hour.format(new Date("2024-06-15T00:00:00"))).toBe(0);
    expect(hour.format(new Date("2024-06-15T12:00:00"))).toBe(12);
    expect(hour.format(new Date("2024-06-15T23:59:59"))).toBe(23);
  });

  it("should compare hours with isSame", () => {
    const hour = useHour({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(hour.isSame(
      new Date("2024-06-15T10:00:00"),
      new Date("2024-06-15T10:59:59")
    )).toBe(true);

    expect(hour.isSame(
      new Date("2024-06-15T10:30:00"),
      new Date("2024-06-15T11:30:00")
    )).toBe(false);
  });

  it("should format hour names correctly", () => {
    const testCases = [
      { hour: 0, name: "12:30 AM" },
      { hour: 1, name: "1:30 AM" },
      { hour: 11, name: "11:30 AM" },
      { hour: 12, name: "12:30 PM" },
      { hour: 13, name: "1:30 PM" },
      { hour: 23, name: "11:30 PM" },
    ];

    testCases.forEach(({ hour, name }) => {
      const date = new Date(2024, 5, 15, hour, 30, 0);
      const hourObj = useHour({
        now: testDate,
        browsing: date,
        adapter,
      });
      expect(hourObj.name.value).toBe(name);
    });
  });

  it("should calculate weekDay correctly", () => {
    const hour = useHour({
      now: testDate,
      browsing: testDate, // Saturday
      adapter,
    });

    expect(hour.weekDay.value).toBe(6); // Saturday = 6

    // Test Sunday
    const sunday = new Date("2024-06-09T10:30:00");
    const hourSunday = useHour({
      now: testDate,
      browsing: sunday,
      adapter,
    });
    expect(hourSunday.weekDay.value).toBe(7); // Sunday = 7
  });

  it("should update isNow when browsing changes", () => {
    const now = ref(new Date("2024-06-15T10:30:00"));
    const browsing = ref(new Date("2024-06-15T10:45:00"));

    const hour = useHour({
      now,
      browsing,
      adapter,
    });

    expect(hour.isNow.value).toBe(true); // Same hour

    browsing.value = new Date("2024-06-15T11:00:00");
    expect(hour.isNow.value).toBe(false); // Different hour
  });

  it("should handle midnight correctly", () => {
    const midnight = new Date("2024-06-15T00:00:00");
    const hour = useHour({
      now: testDate,
      browsing: midnight,
      adapter,
    });

    expect(hour.number.value).toBe(0);
    expect(hour.name.value).toBe("12:00 AM");

    // Going to past should be 11 PM of previous day
    hour.past();
    expect(hour.number.value).toBe(23);
    expect(hour.name.value).toBe("11:00 PM");
    expect(hour.raw.value.getDate()).toBe(14);
  });

  it("should handle noon correctly", () => {
    const noon = new Date("2024-06-15T12:00:00");
    const hour = useHour({
      now: testDate,
      browsing: noon,
      adapter,
    });

    expect(hour.number.value).toBe(12);
    expect(hour.name.value).toBe("12:00 PM");
  });
});