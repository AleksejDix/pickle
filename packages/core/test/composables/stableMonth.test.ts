import { describe, it, expect } from "vitest";
import "../../src/composables"; // Import to trigger registration
import { createTemporal } from "../../src/core/createTemporal";
import { periods } from "../../src/composables/periods";
import { MockDateAdapter } from "../mocks/mockAdapter";
import { createTestDate } from "../setup";

describe("stableMonth", () => {
  const mockAdapter = new MockDateAdapter();

  describe("Basic functionality", () => {
    it("should create a stableMonth unit", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // Feb 15, 2024
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      expect(stableMonth).toBeDefined();
      expect(stableMonth.number.value).toBe(2); // February
    });

    it("should always have 42 days", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // Feb 15, 2024
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      const days = temporal.divide(stableMonth, "day");
      expect(days).toHaveLength(42);
    });

    it("should always have 6 weeks", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // Feb 15, 2024
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      const weeks = temporal.divide(stableMonth, "week");
      expect(weeks).toHaveLength(6);
    });
  });

  describe("Week start configuration", () => {
    it("should respect weekStartsOn setting (Monday)", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 1), // Feb 1, 2024 (Thursday)
        weekStartsOn: 1, // Monday
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      // Feb 1 is Thursday, so the week starts on Jan 29 (Monday)
      expect(stableMonth.start.value.getDate()).toBe(29);
      expect(stableMonth.start.value.getMonth()).toBe(0); // January
      expect(stableMonth.start.value.getDay()).toBe(1); // Monday
    });

    it("should respect weekStartsOn setting (Sunday)", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 1), // Feb 1, 2024 (Thursday)
        weekStartsOn: 0, // Sunday
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      // Feb 1 is Thursday, so the week starts on Jan 28 (Sunday)
      expect(stableMonth.start.value.getDate()).toBe(28);
      expect(stableMonth.start.value.getMonth()).toBe(0); // January
      expect(stableMonth.start.value.getDay()).toBe(0); // Sunday
    });
  });

  describe("Contains method", () => {
    it("should identify dates in the actual calendar month", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // Feb 15, 2024
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      // February dates
      expect(stableMonth.contains(createTestDate(2024, 1, 1))).toBe(true);
      expect(stableMonth.contains(createTestDate(2024, 1, 29))).toBe(true);

      // January dates (in the stable month grid but not in February)
      expect(stableMonth.contains(createTestDate(2024, 0, 31))).toBe(false);

      // March dates (in the stable month grid but not in February)
      expect(stableMonth.contains(createTestDate(2024, 2, 1))).toBe(false);
    });
  });

  describe("Navigation", () => {
    it("should navigate to next month", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // Feb 15, 2024
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      expect(stableMonth.number.value).toBe(2); // February

      stableMonth.next();
      expect(stableMonth.number.value).toBe(3); // March
    });

    it("should navigate to previous month", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // Feb 15, 2024
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      expect(stableMonth.number.value).toBe(2); // February

      stableMonth.previous();
      expect(stableMonth.number.value).toBe(1); // January
    });

    it("should navigate multiple months with go", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // Feb 15, 2024
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      stableMonth.go(3);
      expect(stableMonth.number.value).toBe(5); // May

      stableMonth.go(-5);
      expect(stableMonth.number.value).toBe(12); // December (previous year)
    });
  });

  describe("Edge cases", () => {
    it("should handle months that start on the first day of week", () => {
      // April 2024 starts on Monday
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 3, 15), // April 15, 2024
        weekStartsOn: 1, // Monday
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      // Should start on April 1 (which is a Monday)
      expect(stableMonth.start.value.getDate()).toBe(1);
      expect(stableMonth.start.value.getMonth()).toBe(3); // April
    });

    it("should handle February in leap years", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // Feb 15, 2024 (leap year)
        weekStartsOn: 1,
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      const days = temporal.divide(stableMonth, "day");
      expect(days).toHaveLength(42); // Always 42 days

      // Count February days
      let febDays = 0;
      days.forEach((day) => {
        if (stableMonth.contains(day.raw.value)) {
          febDays++;
        }
      });
      expect(febDays).toBe(29); // Leap year February
    });
  });

  describe("Calendar grid example", () => {
    it("should create a proper calendar grid", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 1, 15), // Feb 15, 2024
        weekStartsOn: 1, // Monday
      });

      const stableMonth = periods.stableMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      const month = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      const weeks = temporal.divide(stableMonth, "week");

      // Build calendar grid
      const grid: Array<Array<{ day: number; isCurrentMonth: boolean }>> = [];

      weeks.forEach((week) => {
        const days = temporal.divide(week, "day");
        const weekRow = days.map((day) => ({
          day: day.number.value,
          isCurrentMonth: stableMonth.contains(day.raw.value),
        }));
        grid.push(weekRow);
      });

      // Verify grid structure
      expect(grid).toHaveLength(6); // 6 weeks
      expect(grid[0]).toHaveLength(7); // 7 days per week

      // First week should have some January days
      expect(grid[0][0].isCurrentMonth).toBe(false); // Jan 29
      expect(grid[0][3].isCurrentMonth).toBe(true); // Feb 1

      // Last week should have some March days
      expect(grid[5][6].isCurrentMonth).toBe(false); // March day
    });
  });
});
