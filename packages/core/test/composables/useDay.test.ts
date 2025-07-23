import { describe, it, expect, beforeEach } from "vitest";
import { ref } from "@vue/reactivity";
import useDay from "../../src/composables/useDay";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
import type { DateAdapter } from "../../src/types/core";

describe("useDay", () => {
  let adapter: DateAdapter;
  let testDate: Date;

  beforeEach(() => {
    adapter = new NativeDateAdapter();
    testDate = new Date("2024-06-15T10:30:00");
  });

  it("should initialize with provided date", () => {
    const day = useDay({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(day.raw.value).toEqual(testDate);
    expect(day.number.value).toBe(15); // 15th day of month
    expect(day.name.value).toBe("Saturday, Jun 15");
  });

  it("should throw error if adapter is not provided", () => {
    expect(() => {
      useDay({
        now: testDate,
        browsing: testDate,
        adapter: undefined as any,
      });
    }).toThrow("Adapter is required for useDay composable");
  });

  it("should work with reactive refs", () => {
    const now = ref(testDate);
    const browsing = ref(testDate);

    const day = useDay({
      now,
      browsing,
      adapter,
    });

    expect(day.raw.value).toEqual(testDate);
    expect(day.isNow.value).toBe(true);

    // Change browsing day
    browsing.value = new Date("2024-06-16");
    expect(day.number.value).toBe(16);
    expect(day.name.value).toBe("Sunday, Jun 16");
    expect(day.isNow.value).toBe(false);
  });

  it("should calculate start and end of day", () => {
    const day = useDay({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(day.start.value).toEqual(new Date("2024-06-15T00:00:00"));
    expect(day.end.value).toEqual(new Date("2024-06-15T23:59:59.999"));
  });

  it("should calculate timespan", () => {
    const day = useDay({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    const timespan = day.timespan.value;
    expect(timespan.start).toEqual(new Date("2024-06-15T00:00:00"));
    expect(timespan.end).toEqual(new Date("2024-06-15T23:59:59.999"));
  });

  it("should navigate to future day", () => {
    const day = useDay({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    day.future();
    expect(day.number.value).toBe(16);
    expect(day.name.value).toBe("Sunday, Jun 16");
    expect(day.isNow.value).toBe(false);
  });

  it("should navigate to past day", () => {
    const day = useDay({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    day.past();
    expect(day.number.value).toBe(14);
    expect(day.name.value).toBe("Friday, Jun 14");
    expect(day.isNow.value).toBe(false);
  });

  it("should handle month boundaries when navigating", () => {
    // Test end of month
    const endOfMonth = new Date("2024-06-30T10:00:00");
    const day = useDay({
      now: testDate,
      browsing: endOfMonth,
      adapter,
    });

    day.future();
    expect(day.number.value).toBe(1); // July 1st
    expect(day.raw.value.getMonth()).toBe(6); // July (0-indexed)

    // Test start of month
    const startOfMonth = new Date("2024-07-01T10:00:00");
    const day2 = useDay({
      now: testDate,
      browsing: startOfMonth,
      adapter,
    });

    day2.past();
    expect(day2.number.value).toBe(30); // June 30th
    expect(day2.raw.value.getMonth()).toBe(5); // June (0-indexed)
  });

  it("should format day correctly", () => {
    const day = useDay({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(day.format(new Date("2024-06-01"))).toBe(1);
    expect(day.format(new Date("2024-06-30"))).toBe(30); // Last day of June
  });

  it("should compare days with isSame", () => {
    const day = useDay({
      now: testDate,
      browsing: testDate,
      adapter,
    });

    expect(day.isSame(
      new Date("2024-06-15T00:00:00"),
      new Date("2024-06-15T23:59:59")
    )).toBe(true);

    expect(day.isSame(
      new Date("2024-06-15"),
      new Date("2024-06-16")
    )).toBe(false);
  });

  it("should return correct day names", () => {
    const days = [
      { date: new Date("2024-06-09"), name: "Sunday, Jun 9" },
      { date: new Date("2024-06-10"), name: "Monday, Jun 10" },
      { date: new Date("2024-06-11"), name: "Tuesday, Jun 11" },
      { date: new Date("2024-06-12"), name: "Wednesday, Jun 12" },
      { date: new Date("2024-06-13"), name: "Thursday, Jun 13" },
      { date: new Date("2024-06-14"), name: "Friday, Jun 14" },
      { date: new Date("2024-06-15"), name: "Saturday, Jun 15" },
    ];

    days.forEach(({ date, name }) => {
      const day = useDay({
        now: testDate,
        browsing: date,
        adapter,
      });
      expect(day.name.value).toBe(name);
    });
  });

  it("should calculate weekDay correctly", () => {
    const testCases = [
      { date: new Date("2024-06-09"), weekDay: 7 }, // Sunday = 7
      { date: new Date("2024-06-10"), weekDay: 1 }, // Monday = 1
      { date: new Date("2024-06-11"), weekDay: 2 }, // Tuesday = 2
      { date: new Date("2024-06-12"), weekDay: 3 }, // Wednesday = 3
      { date: new Date("2024-06-13"), weekDay: 4 }, // Thursday = 4
      { date: new Date("2024-06-14"), weekDay: 5 }, // Friday = 5
      { date: new Date("2024-06-15"), weekDay: 6 }, // Saturday = 6
    ];

    testCases.forEach(({ date, weekDay }) => {
      const day = useDay({
        now: testDate,
        browsing: date,
        adapter,
      });
      expect(day.weekDay.value).toBe(weekDay);
    });
  });

  it("should update isNow when browsing changes", () => {
    const now = ref(new Date("2024-06-15T10:00:00"));
    const browsing = ref(new Date("2024-06-15T20:00:00"));

    const day = useDay({
      now,
      browsing,
      adapter,
    });

    expect(day.isNow.value).toBe(true); // Same day

    browsing.value = new Date("2024-06-16T10:00:00");
    expect(day.isNow.value).toBe(false); // Different day
  });

  it("should handle leap year correctly", () => {
    // Test February 29 in leap year
    const leapDay = new Date("2024-02-29");
    const day = useDay({
      now: testDate,
      browsing: leapDay,
      adapter,
    });

    expect(day.number.value).toBe(29);
    day.future();
    expect(day.number.value).toBe(1); // March 1st
    expect(day.raw.value.getMonth()).toBe(2); // March
  });
});