import { describe, it, expect, beforeEach } from "vitest";
import { ref } from "@vue/reactivity";
import useYear from "../../src/composables/useYear";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
import type { DateAdapter } from "../../src/types/core";

describe("useYear", () => {
  let adapter: DateAdapter;
  let testDate: Date;

  beforeEach(() => {
    adapter = new NativeDateAdapter();
    testDate = new Date("2024-06-15T10:30:00");
  });

  it("should initialize with provided date", () => {
    const year = useYear({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(year.raw.value).toEqual(testDate);
    expect(year.number.value).toBe(2024);
    expect(year.name.value).toBe("2024");
  });

  it("should throw error if adapter is not provided", () => {
    expect(() => {
      useYear({
        now: testDate,
        browsing: testDate,
        adapter: undefined as any,
      });
    }).toThrow("Adapter is required for useYear composable");
  });

  it("should work with reactive refs", () => {
    const now = ref(testDate);
    const browsing = ref(testDate);

    const year = useYear({
      now,
      browsing,
      adapter,
    });

    expect(year.raw.value).toEqual(testDate);
    expect(year.isNow.value).toBe(true);

    // Change browsing year
    browsing.value = new Date("2025-01-01");
    expect(year.number.value).toBe(2025);
    expect(year.isNow.value).toBe(false);
  });

  it("should calculate start and end of year", () => {
    const year = useYear({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(year.start.value).toEqual(new Date("2024-01-01T00:00:00"));
    expect(year.end.value).toEqual(new Date("2024-12-31T23:59:59.999"));
  });

  it("should calculate timespan", () => {
    const year = useYear({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    const timespan = year.timespan.value;
    expect(timespan.start).toEqual(new Date("2024-01-01T00:00:00"));
    expect(timespan.end).toEqual(new Date("2024-12-31T23:59:59.999"));
  });

  it("should navigate to future year", () => {
    const year = useYear({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    year.future();
    expect(year.number.value).toBe(2025);
    expect(year.isNow.value).toBe(false);
  });

  it("should navigate to past year", () => {
    const year = useYear({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    year.past();
    expect(year.number.value).toBe(2023);
    expect(year.isNow.value).toBe(false);
  });

  it("should format year correctly", () => {
    const year = useYear({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(year.format(new Date("2025-03-20"))).toBe(2025);
    expect(year.format(new Date("1999-12-31"))).toBe(1999);
  });

  it("should compare years with isSame", () => {
    const year = useYear({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(year.isSame(
      new Date("2024-01-01"),
      new Date("2024-12-31")
    )).toBe(true);

    expect(year.isSame(
      new Date("2024-06-15"),
      new Date("2025-06-15")
    )).toBe(false);
  });

  it("should calculate weekDay of year start", () => {
    const year = useYear({
      now: testDate,
      browsing: new Date("2024-01-01"), // Monday
      adapter,
    });

    expect(year.weekDay.value).toBe(1); // Monday

    // Test Sunday (should return 7 instead of 0)
    const year2023 = useYear({
      now: testDate,
      browsing: new Date("2023-01-01"), // Sunday
      adapter,
    });
    expect(year2023.weekDay.value).toBe(7); // Sunday as 7
  });

  it("should update isNow when browsing changes", () => {
    const now = ref(new Date("2024-06-15"));
    const browsing = ref(new Date("2024-01-01"));

    const year = useYear({
      now,
      browsing,
      adapter,
    });

    expect(year.isNow.value).toBe(true); // Same year

    browsing.value = new Date("2025-01-01");
    expect(year.isNow.value).toBe(false); // Different year
  });
});