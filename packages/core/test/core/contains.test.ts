import { describe, it, expect } from "vitest";
import { createTemporal } from "../../src/core/createTemporal";
import { periods } from "../../src/composables/periods";
import { MockDateAdapter } from "../mocks/mockAdapter";
import { createTestDate } from "../setup";
// Import composables to register them
import "../../src/composables";

describe("contains method", () => {
  const mockAdapter = new MockDateAdapter();

  describe("Year contains", () => {
    it("should check if year contains a month", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15),
      });

      const year2024 = periods.year({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      const june2024 = periods.month({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 5, 15)),
        adapter: temporal.adapter,
      });

      const jan2025 = periods.month({
        now: temporal.now,
        browsing: ref(createTestDate(2025, 0, 15)),
        adapter: temporal.adapter,
      });

      expect(year2024.contains(june2024)).toBe(true);
      expect(year2024.contains(jan2025)).toBe(false);
    });

    it("should check if year contains a day", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 1),
      });

      const year = periods.year({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      const dayInYear = periods.day({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 6, 15)),
        adapter: temporal.adapter,
      });

      const dayOutsideYear = periods.day({
        now: temporal.now,
        browsing: ref(createTestDate(2025, 0, 1)),
        adapter: temporal.adapter,
      });

      expect(year.contains(dayInYear)).toBe(true);
      expect(year.contains(dayOutsideYear)).toBe(false);
    });

    it("should check if year contains a date", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 1),
      });

      const year = periods.year({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      expect(year.contains(createTestDate(2024, 0, 1))).toBe(true); // First day
      expect(year.contains(createTestDate(2024, 11, 31))).toBe(true); // Last day
      expect(year.contains(createTestDate(2024, 6, 15))).toBe(true); // Mid-year
      expect(year.contains(createTestDate(2023, 11, 31))).toBe(false); // Previous year
      expect(year.contains(createTestDate(2025, 0, 1))).toBe(false); // Next year
    });
  });

  describe("Month contains", () => {
    it("should check if month contains a day", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // February 2024
      });

      const month = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      const dayInMonth = periods.day({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 1, 15)),
        adapter: temporal.adapter,
      });

      const dayOutsideMonth = periods.day({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 2, 1)),
        adapter: temporal.adapter,
      });

      expect(month.contains(dayInMonth)).toBe(true);
      expect(month.contains(dayOutsideMonth)).toBe(false);
    });

    it("should check if month contains dates", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 1), // February 2024
      });

      const month = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      // February 2024 is a leap year, has 29 days
      expect(month.contains(createTestDate(2024, 1, 1))).toBe(true); // First day
      expect(month.contains(createTestDate(2024, 1, 29))).toBe(true); // Last day (leap year)
      expect(month.contains(createTestDate(2024, 1, 15))).toBe(true); // Mid-month
      expect(month.contains(createTestDate(2024, 0, 31))).toBe(false); // Previous month
      expect(month.contains(createTestDate(2024, 2, 1))).toBe(false); // Next month
    });

    it("should check if month contains hours", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15, 12, 0),
      });

      const month = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      const hourInMonth = periods.hour({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 1, 15, 14, 0)),
        adapter: temporal.adapter,
      });

      const hourOutsideMonth = periods.hour({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 2, 1, 0, 0)),
        adapter: temporal.adapter,
      });

      expect(month.contains(hourInMonth)).toBe(true);
      expect(month.contains(hourOutsideMonth)).toBe(false);
    });
  });

  describe("Week contains", () => {
    it("should check if week contains a day", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 10), // Wednesday, Jan 10, 2024
        weekStartsOn: 1, // Monday
      });

      const week = periods.week({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      // Week should be Mon Jan 8 - Sun Jan 14
      const monday = periods.day({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 0, 8)),
        adapter: temporal.adapter,
      });

      const sunday = periods.day({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 0, 14)),
        adapter: temporal.adapter,
      });

      const nextMonday = periods.day({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 0, 15)),
        adapter: temporal.adapter,
      });

      expect(week.contains(monday)).toBe(true);
      expect(week.contains(sunday)).toBe(true);
      expect(week.contains(nextMonday)).toBe(false);
    });

    it("should respect weekStartsOn setting", () => {
      // Test with Sunday start
      const temporalSunday = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 10), // Wednesday, Jan 10, 2024
        weekStartsOn: 0, // Sunday
      });

      const weekSunday = periods.week({
        now: temporalSunday.now,
        browsing: temporalSunday.browsing,
        adapter: temporalSunday.adapter,
        weekStartsOn: temporalSunday.weekStartsOn,
      });

      // Week should be Sun Jan 7 - Sat Jan 13
      expect(weekSunday.contains(createTestDate(2024, 0, 7))).toBe(true); // Sunday
      expect(weekSunday.contains(createTestDate(2024, 0, 13))).toBe(true); // Saturday
      expect(weekSunday.contains(createTestDate(2024, 0, 6))).toBe(false); // Previous Saturday
      expect(weekSunday.contains(createTestDate(2024, 0, 14))).toBe(false); // Next Sunday
    });
  });

  describe("Day contains", () => {
    it("should check if day contains hours", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 15, 12, 0),
      });

      const day = periods.day({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      const morningHour = periods.hour({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 0, 15, 8, 0)),
        adapter: temporal.adapter,
      });

      const eveningHour = periods.hour({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 0, 15, 20, 0)),
        adapter: temporal.adapter,
      });

      const nextDayHour = periods.hour({
        now: temporal.now,
        browsing: ref(createTestDate(2024, 0, 16, 0, 0)),
        adapter: temporal.adapter,
      });

      expect(day.contains(morningHour)).toBe(true);
      expect(day.contains(eveningHour)).toBe(true);
      expect(day.contains(nextDayHour)).toBe(false);
    });

    it("should check if day contains specific times", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 15),
      });

      const day = periods.day({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      // Midnight to midnight
      expect(day.contains(createTestDate(2024, 0, 15, 0, 0, 0))).toBe(true); // Start
      expect(day.contains(createTestDate(2024, 0, 15, 23, 59, 59))).toBe(true); // End
      expect(day.contains(createTestDate(2024, 0, 15, 12, 30))).toBe(true); // Noon
      expect(day.contains(createTestDate(2024, 0, 16, 0, 0, 0))).toBe(false); // Next day
    });
  });

  describe("Hour contains", () => {
    it("should check if hour contains minutes", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 15, 14, 30), // 2:30 PM
      });

      const hour = periods.hour({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      // Hour should be 2:00 PM - 2:59:59 PM
      expect(hour.contains(createTestDate(2024, 0, 15, 14, 0))).toBe(true); // Start
      expect(hour.contains(createTestDate(2024, 0, 15, 14, 59, 59))).toBe(true); // End
      expect(hour.contains(createTestDate(2024, 0, 15, 14, 30))).toBe(true); // Middle
      expect(hour.contains(createTestDate(2024, 0, 15, 15, 0))).toBe(false); // Next hour
      expect(hour.contains(createTestDate(2024, 0, 15, 13, 59, 59))).toBe(
        false
      ); // Previous hour
    });
  });

  describe("StableMonth contains", () => {
    it("should only contain dates from the actual calendar month", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // February 2024
        weekStartsOn: 1,
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      // StableMonth grid includes Jan 29 - Mar 10, but only February dates should return true
      expect(stableMonth.contains(createTestDate(2024, 1, 1))).toBe(true); // Feb 1
      expect(stableMonth.contains(createTestDate(2024, 1, 29))).toBe(true); // Feb 29
      expect(stableMonth.contains(createTestDate(2024, 0, 31))).toBe(false); // Jan 31 (in grid)
      expect(stableMonth.contains(createTestDate(2024, 2, 1))).toBe(false); // Mar 1 (in grid)
    });
  });

  describe("Edge cases", () => {
    it("should handle boundary times correctly", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 15, 14, 30),
      });

      const day = periods.day({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      // Test exact boundary times
      const startOfDay = createTestDate(2024, 0, 15, 0, 0, 0, 0);
      const endOfDay = createTestDate(2024, 0, 15, 23, 59, 59, 999);

      expect(day.contains(startOfDay)).toBe(true);
      expect(day.contains(endOfDay)).toBe(true);
    });

    it("should handle cross-month boundaries", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 31), // Jan 31
      });

      const january = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      const lastDayJan = createTestDate(2024, 0, 31, 23, 59, 59);
      const firstDayFeb = createTestDate(2024, 1, 1, 0, 0, 0);

      expect(january.contains(lastDayJan)).toBe(true);
      expect(january.contains(firstDayFeb)).toBe(false);
    });

    it("should handle leap year boundaries", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 1), // February 2024 (leap year)
      });

      const february = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      expect(february.contains(createTestDate(2024, 1, 29))).toBe(true); // Feb 29 exists
      expect(february.contains(createTestDate(2024, 2, 1))).toBe(false); // March 1
    });
  });

  describe("Mixed unit type comparisons", () => {
    it("should allow checking different unit types", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15, 14, 30),
      });

      const year = periods.year({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      const month = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      const day = periods.day({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      const hour = periods.hour({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      // Year contains everything else from the same date
      expect(year.contains(month)).toBe(true);
      expect(year.contains(day)).toBe(true);
      expect(year.contains(hour)).toBe(true);

      // Month contains smaller units
      expect(month.contains(day)).toBe(true);
      expect(month.contains(hour)).toBe(true);

      // Day contains hour
      expect(day.contains(hour)).toBe(true);
    });
  });
});

// Import ref for creating test time units
import { ref } from "@vue/reactivity";
