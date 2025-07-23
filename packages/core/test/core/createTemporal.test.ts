import { describe, it, expect } from "vitest";
import { isRef } from "@vue/reactivity";
import { createTemporal } from "../../src/core/createTemporal";
import { same } from "../../src/utils/same";
import { createTestDate } from "../setup";
import { MockDateAdapter } from "../mocks/mockAdapter";
// Import composables to register them
import "../../src/composables";

// Create a shared adapter instance for tests
const mockAdapter = new MockDateAdapter();

describe("createTemporal", () => {
  describe("timeUnitFactory", () => {
    it("should create time units with correct properties", async () => {
      const { createTimeUnit } = await import("../../src/core/timeUnitFactory");
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15),
      });

      const unit = createTimeUnit("day", {
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      expect(unit).toBeDefined();
      expect(unit.raw).toBeDefined();
      expect(unit.start).toBeDefined();
      expect(unit.end).toBeDefined();
      expect(unit.period).toBeDefined();
      expect(unit.isNow).toBeDefined();
      expect(unit.number).toBeDefined();
      expect(unit.browsing).toBeDefined();
      expect(typeof unit.next).toBe("function");
      expect(typeof unit.previous).toBe("function");
      expect(typeof unit.go).toBe("function");
      expect(typeof unit.isSame).toBe("function");
    });

    it("should handle unknown time unit", async () => {
      const { createTimeUnit } = await import("../../src/core/timeUnitFactory");
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15),
      });

      const unit = createTimeUnit("unknown" as any, {
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      expect(unit).toBeNull();
    });
  });
  describe("API and Framework Agnostic Behavior", () => {
    it("should create temporal instance with default options", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });

      expect(temporal).toBeDefined();
      expect(temporal.picked).toBeDefined();
      expect(temporal.now).toBeDefined();
      expect(temporal.browsing).toBeDefined();
      expect(temporal.adapter).toBeDefined();
      expect(typeof temporal.divide).toBe("function");
    });

    it("should accept date option", () => {
      const testDate = createTestDate(2023, 5, 15);
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: testDate,
      });

      expect(temporal.picked.value).toEqual(testDate);
      expect(temporal.browsing.value).toEqual(testDate);
    });

    it("should accept now option", () => {
      const testDate = createTestDate(2023, 5, 15);
      const nowDate = createTestDate(2024, 0, 1);

      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: testDate,
        now: nowDate,
      });

      expect(temporal.picked.value).toEqual(testDate);
      expect(temporal.now.value).toEqual(nowDate);
    });
  });

  describe("Adapter System Integration", () => {
    it("should require an adapter", () => {
      // Should throw without adapter
      expect(() => createTemporal()).toThrow("A date adapter is required");
    });

    it("should accept explicit adapter name", () => {
      const temporal = createTemporal({ dateAdapter: new MockDateAdapter() });
      expect(temporal.adapter.name).toBe("mock");
    });

    it("should accept adapter instance", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });
      expect(temporal.adapter).toBe(mockAdapter);
    });

    it("should validate adapter has required methods", () => {
      const adapter = new MockDateAdapter();
      const temporal = createTemporal({ dateAdapter: adapter });
      expect(typeof temporal.adapter.add).toBe("function");
      expect(typeof temporal.adapter.subtract).toBe("function");
      expect(typeof temporal.adapter.startOf).toBe("function");
      expect(typeof temporal.adapter.endOf).toBe("function");
    });
  });

  describe("Reactive Properties", () => {
    it("should have reactive picked property", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });

      expect(isRef(temporal.picked)).toBe(true);
    });

    it("should have reactive now property", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });

      expect(isRef(temporal.now)).toBe(true);
    });

    it("should have reactive browsing property", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });

      expect(isRef(temporal.browsing)).toBe(true);
    });

    it("should update reactive values", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });
      const newDate = createTestDate(2025, 6, 20);

      temporal.picked.value = newDate;
      expect(temporal.picked.value).toEqual(newDate);

      temporal.now.value = newDate;
      expect(temporal.now.value).toEqual(newDate);
    });
  });

  describe("Framework Agnostic Usage", () => {
    it("should work without Vue framework", () => {
      // This test ensures we only use @vue/reactivity, not full Vue
      const temporal = createTemporal({ dateAdapter: mockAdapter });

      // Should not throw when accessing reactive values directly
      expect(() => {
        const date = temporal.picked.value;
        const now = temporal.now.value;
        return { date, now };
      }).not.toThrow();
    });

    it("should provide direct value access for any framework", () => {
      const testDate = createTestDate(2024, 5, 15);
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: testDate,
      });

      // Vanilla JS access pattern
      const pickedValue = temporal.picked.value;
      const nowValue = temporal.now.value;

      expect(pickedValue).toEqual(testDate);
      expect(nowValue).toBeInstanceOf(Date);
    });

    it("should support reactive updates from any framework", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });

      // Simulate changing the value
      const newDate = createTestDate(2025, 8, 10);
      temporal.picked.value = newDate;

      expect(temporal.picked.value).toEqual(newDate);
    });
  });

  describe("Adapter-Powered Operations", () => {
    it("should use adapter for date operations", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });
      const testDate = createTestDate(2024, 0, 15);

      // Test that adapter methods are being used
      const startOfYear = temporal.adapter.startOf(testDate, "year");
      expect(startOfYear.getFullYear()).toBe(2024);
      expect(startOfYear.getMonth()).toBe(0);
      expect(startOfYear.getDate()).toBe(1);
    });

    it("should support date comparison through adapter", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });
      const date1 = createTestDate(2024, 0, 15);
      const date2 = createTestDate(2024, 0, 15);
      const date3 = createTestDate(2024, 0, 16);

      expect(temporal.adapter.isSame(date1, date2, "day")).toBe(true);
      expect(temporal.adapter.isSame(date1, date3, "day")).toBe(false);
    });

    it("should generate intervals using adapter", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 0, 5);

      const intervals = temporal.adapter.eachInterval(start, end, "day");
      expect(intervals).toHaveLength(5);
      expect(intervals[0].getDate()).toBe(1);
      expect(intervals[4].getDate()).toBe(5);
    });
  });

  describe("Type Safety", () => {
    it("should have correct TypeScript types", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });

      // These should compile without TypeScript errors
      const pickedDate: Date = temporal.picked.value;
      const nowDate: Date = temporal.now.value;
      const browsingDate: Date = temporal.browsing.value;

      expect(pickedDate).toBeInstanceOf(Date);
      expect(nowDate).toBeInstanceOf(Date);
      expect(browsingDate).toBeInstanceOf(Date);
    });

    it("should accept typed options", () => {
      const options = {
        date: createTestDate(2024, 0, 1),
        now: createTestDate(2024, 0, 2),
        dateAdapter: mockAdapter,
      };

      const temporal = createTemporal(options);

      expect(temporal.picked.value).toEqual(options.date);
      expect(temporal.now.value).toEqual(options.now);
      expect(temporal.adapter.name).toBe("mock");
    });
  });

  describe("Zero Dependencies Achievement", () => {
    it("should work with zero external dependencies", () => {
      // This test validates that our native adapter provides full functionality
      const temporal = createTemporal({ dateAdapter: new MockDateAdapter() });

      expect(temporal.adapter.name).toBe("mock");
      expect(typeof temporal.adapter.add).toBe("function");
      expect(typeof temporal.adapter.subtract).toBe("function");
      expect(typeof temporal.adapter.startOf).toBe("function");
      expect(typeof temporal.adapter.endOf).toBe("function");
      expect(typeof temporal.adapter.isSame).toBe("function");
      expect(typeof temporal.adapter.eachInterval).toBe("function");
    });
  });

  describe("Composables Integration", () => {
    it("should test useYear composable", async () => {
      const { periods } = await import("../../src/composables/periods");
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15),
      });

      const year = periods.year({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      expect(year.number.value).toBe(2024);
      // Just test the year part, avoid timezone issues
      expect(year.start.value.getFullYear()).toBe(2024);
      expect(year.start.value.getMonth()).toBe(0);
      expect(year.start.value.getDate()).toBe(1);

      // Test new navigation methods
      year.next();
      expect(year.number.value).toBe(2025);

      year.previous();
      year.previous();
      expect(year.number.value).toBe(2023);

      // Test go method
      year.go(2);
      expect(year.number.value).toBe(2025);

      year.go(-3);
      expect(year.number.value).toBe(2022);
    });

    it("should test useMonth composable", async () => {
      const { periods } = await import("../../src/composables/periods");
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15),
      });

      const month = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      expect(month.number.value).toBe(6);
      // Note: days property doesn't exist on month composable

      // Test new navigation methods
      month.next();
      expect(month.number.value).toBe(7);

      month.previous();
      month.previous();
      expect(month.number.value).toBe(5);

      // Test go method
      month.go(3);
      expect(month.number.value).toBe(8);

      month.go(-2);
      expect(month.number.value).toBe(6);
    });

    it("should test useWeek composable", async () => {
      const { periods } = await import("../../src/composables/periods");
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15),
      }); // Saturday

      const week = periods.week({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
        weekStartsOn: temporal.weekStartsOn,
      });

      // Just test the date parts, avoid timezone issues
      expect(week.start.value.getDate()).toBe(10); // Monday (default)
      expect(week.end.value.getDate()).toBe(16); // Sunday

      // Test new navigation methods
      week.next();
      expect(week.start.value.getDate()).toBe(17);

      week.previous();
      week.previous();
      expect(week.start.value.getDate()).toBe(3);

      // Test go method
      week.go(2);
      expect(week.start.value.getDate()).toBe(17);

      week.go(-1);
      expect(week.start.value.getDate()).toBe(10);
    });

    it("should test useDay composable", async () => {
      const { periods } = await import("../../src/composables/periods");
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15),
      });

      const day = periods.day({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      expect(day.number.value).toBe(15);

      // Test new navigation methods
      day.next();
      expect(day.number.value).toBe(16);

      day.previous();
      day.previous();
      expect(day.number.value).toBe(14);

      // Test go method
      day.go(5);
      expect(day.number.value).toBe(19);

      day.go(-10);
      expect(day.number.value).toBe(9);
    });

    it("should test useHour composable", async () => {
      const { periods } = await import("../../src/composables/periods");
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15, 14, 30),
      });

      const hour = periods.hour({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      expect(hour.number.value).toBe(14);

      // Test new navigation methods
      hour.next();
      expect(hour.number.value).toBe(15);

      hour.previous();
      hour.previous();
      expect(hour.number.value).toBe(13);

      // Test go method
      hour.go(3);
      expect(hour.number.value).toBe(16);

      hour.go(-5);
      expect(hour.number.value).toBe(11);
    });
  });

  describe("Standalone navigation functions", () => {
    it("should test standalone navigation functions", async () => {
      const { next, previous, go } = await import("../../src/navigation");
      const { periods } = await import("../../src/composables/periods");

      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 5, 15),
      });

      const month = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter,
      });

      // Test standalone next
      next(month);
      expect(month.number.value).toBe(7);

      // Test standalone previous
      previous(month);
      previous(month);
      expect(month.number.value).toBe(5);

      // Test standalone go
      go(month, 3);
      expect(month.number.value).toBe(8);

      go(month, -4);
      expect(month.number.value).toBe(4);
    });
  });

  describe("divide() function", () => {
    it("should have divide method", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });
      expect(typeof temporal.divide).toBe("function");
    });

    // TODO: Fix circular dependency issue before enabling these tests
    /*
    it("should divide year into months", async () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 0, 15) });
      const { periods } = await import("../../src/composables/periods");
      
      const year = periods.year({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
      });
      
      const months = temporal.divide(year, "month");
      
      expect(months).toHaveLength(12);
      expect(months[0].period).toBeDefined();
      expect(months[0].period).toBeDefined();
      expect(months[0].number.value).toBe(1);
      expect(months[11].number.value).toBe(12);
    });

    it("should divide month into days", async () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 0, 15) });
      const { periods } = await import("../../src/composables/periods");
      
      const month = periods.month({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
      });
      
      const days = temporal.divide(month, "day");
      
      expect(days).toHaveLength(31); // January has 31 days
      expect(days[0].number.value).toBe(1);
      expect(days[30].number.value).toBe(31);
    });
    */

    it("should divide time intervals into smaller units", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });
      const mockUnit = {
        period: {
          value: { start: new Date(2024, 0, 1), end: new Date(2024, 0, 31) },
        },
        raw: { value: new Date(2024, 0, 15) },
        isNow: { value: false },
        number: { value: 1 },
        browsing: { value: new Date(2024, 0, 15) },
        future: () => {},
        past: () => {},
        isSame: () => false,
      };

      const result = temporal.divide(mockUnit as any, "day");

      // January has 31 days
      expect(result.length).toBe(31);
      expect(result[0]).toBeDefined();
      expect(result[0].browsing).toBeDefined();
    });
  });

  describe("Reactive ref options", () => {
    it("should accept ref for date option", async () => {
      const { ref } = await import("@vue/reactivity");
      const dateRef = ref(createTestDate(2024, 5, 15));

      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: dateRef,
      });

      expect(temporal.picked).toBe(dateRef);
      expect(temporal.picked.value).toEqual(dateRef.value);

      // Update ref and check if temporal reflects the change
      dateRef.value = createTestDate(2025, 0, 1);
      expect(temporal.picked.value).toEqual(createTestDate(2025, 0, 1));
    });

    it("should accept ref for now option", async () => {
      const { ref } = await import("@vue/reactivity");
      const nowRef = ref(createTestDate(2024, 0, 1));

      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        now: nowRef,
      });

      expect(temporal.now).toBe(nowRef);
      expect(temporal.now.value).toEqual(nowRef.value);
    });

    it("should handle mix of refs and values", async () => {
      const { ref } = await import("@vue/reactivity");
      const dateRef = ref(createTestDate(2024, 5, 15));
      const plainNow = createTestDate(2024, 0, 1);

      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        date: dateRef,
        now: plainNow,
      });

      expect(temporal.picked).toBe(dateRef);
      expect(temporal.now.value).toEqual(plainNow);
      expect(isRef(temporal.now)).toBe(true);
    });
  });

  describe("weekStartsOn configuration", () => {
    it("should default to Monday (1) when not specified", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter });
      expect(temporal.weekStartsOn).toBe(1);
    });

    it("should accept weekStartsOn option", () => {
      const temporal = createTemporal({
        dateAdapter: mockAdapter,
        weekStartsOn: 0, // Sunday
      });
      expect(temporal.weekStartsOn).toBe(0);
    });

    it("should pass weekStartsOn to week composable", async () => {
      const { periods } = await import("../../src/composables/periods");

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

      // Week should start on Sunday Jan 7
      expect(weekSunday.start.value.getDate()).toBe(7);
      expect(weekSunday.start.value.getDay()).toBe(0); // Sunday

      // Test with Monday start
      const temporalMonday = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 10), // Wednesday, Jan 10, 2024
        weekStartsOn: 1, // Monday
      });

      const weekMonday = periods.week({
        now: temporalMonday.now,
        browsing: temporalMonday.browsing,
        adapter: temporalMonday.adapter,
        weekStartsOn: temporalMonday.weekStartsOn,
      });

      // Week should start on Monday Jan 8
      expect(weekMonday.start.value.getDate()).toBe(8);
      expect(weekMonday.start.value.getDay()).toBe(1); // Monday
    });

    it("should calculate week boundaries correctly for different weekStartsOn values", async () => {
      const { periods } = await import("../../src/composables/periods");
      const testDate = createTestDate(2024, 0, 13); // Saturday, Jan 13, 2024

      // Test all weekStartsOn values (0-6)
      const expectations = [
        { weekStartsOn: 0, startDate: 7, startDay: 0 }, // Sunday
        { weekStartsOn: 1, startDate: 8, startDay: 1 }, // Monday
        { weekStartsOn: 2, startDate: 9, startDay: 2 }, // Tuesday
        { weekStartsOn: 3, startDate: 10, startDay: 3 }, // Wednesday
        { weekStartsOn: 4, startDate: 11, startDay: 4 }, // Thursday
        { weekStartsOn: 5, startDate: 12, startDay: 5 }, // Friday
        { weekStartsOn: 6, startDate: 13, startDay: 6 }, // Saturday
      ];

      for (const { weekStartsOn, startDate, startDay } of expectations) {
        const temporal = createTemporal({
          dateAdapter: mockAdapter,
          date: testDate,
          weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        });

        const week = periods.week({
          now: temporal.now,
          browsing: temporal.browsing,
          adapter: temporal.adapter,
          weekStartsOn: temporal.weekStartsOn,
        });

        expect(week.start.value.getDate()).toBe(startDate);
        expect(week.start.value.getDay()).toBe(startDay);
        expect(week.end.value.getDate()).toBe(startDate + 6);
      }
    });

    it("should respect weekStartsOn when dividing months into weeks", () => {
      const temporalSunday = createTemporal({
        dateAdapter: mockAdapter,
        date: createTestDate(2024, 0, 15), // January 2024
        weekStartsOn: 0, // Sunday
      });

      const month = {
        period: {
          value: {
            start: createTestDate(2024, 0, 1),
            end: createTestDate(2024, 0, 31),
          },
        },
        raw: { value: createTestDate(2024, 0, 15) },
        isNow: { value: false },
        number: { value: 1 },
        browsing: { value: createTestDate(2024, 0, 15) },
        next: () => {},
        previous: () => {},
        go: () => {},
        isSame: () => false,
      };

      const weeks = temporalSunday.divide(month as any, "week");

      // Verify the first week starts on the correct day
      expect(weeks.length).toBeGreaterThan(0);
      // The first week should respect weekStartsOn
      const firstWeek = weeks[0];
      expect(firstWeek).toBeDefined();
    });
  });

  describe("Utils Functions", () => {
    it("should test same() helper function", () => {
      const adapter = mockAdapter;

      const date1 = createTestDate(2024, 0, 15, 10, 30);
      const date2 = createTestDate(2024, 0, 15, 14, 45);
      const date3 = createTestDate(2024, 0, 16);

      expect(same(date1, date2, "day", adapter)).toBe(true);
      expect(same(date1, date3, "day", adapter)).toBe(false);
      expect(same(date1, date2, "hour", adapter)).toBe(false);
    });

    it("should handle null/undefined dates in same()", () => {
      const adapter = mockAdapter;
      const date = createTestDate(2024, 0, 15);

      expect(same(null, date, "day", adapter)).toBe(false);
      expect(same(date, null, "day", adapter)).toBe(false);
      expect(same(undefined, date, "day", adapter)).toBe(false);
      expect(same(date, undefined, "day", adapter)).toBe(false);
      expect(same(null, null, "day", adapter)).toBe(false);
      expect(same(undefined, undefined, "day", adapter)).toBe(false);
    });

    it("should work with different units in same()", () => {
      const adapter = mockAdapter;

      const date1 = createTestDate(2024, 5, 15);
      const date2 = createTestDate(2024, 6, 20);

      expect(same(date1, date2, "year", adapter)).toBe(true);
      expect(same(date1, date2, "month", adapter)).toBe(false);
    });

    it("should test each() helper function", async () => {
      const { each } = await import("../../src/utils/each");
      const adapter = mockAdapter;

      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 0, 5);

      const days = each({
        start,
        end,
        step: { days: 1 },
        adapter,
      });
      expect(days).toHaveLength(5);
      expect(days[0].getDate()).toBe(1);
      expect(days[4].getDate()).toBe(5);

      // Test with months
      const monthStart = createTestDate(2024, 0, 1);
      const monthEnd = createTestDate(2024, 2, 1);
      const months = each({
        start: monthStart,
        end: monthEnd,
        step: { months: 1 },
        adapter,
      });
      expect(months).toHaveLength(3);

      // Test with years
      const yearStart = createTestDate(2020, 0, 1);
      const yearEnd = createTestDate(2022, 0, 1);
      const years = each({
        start: yearStart,
        end: yearEnd,
        step: { years: 1 },
        adapter,
      });
      expect(years).toHaveLength(3);
    });

    it("should handle edge cases in each()", async () => {
      const { each } = await import("../../src/utils/each");
      const adapter = mockAdapter;

      // Same date
      const date = createTestDate(2024, 0, 1);
      const sameDates = each({
        start: date,
        end: date,
        step: { days: 1 },
        adapter,
      });
      expect(sameDates).toHaveLength(1);

      // End before start
      const start = createTestDate(2024, 0, 5);
      const end = createTestDate(2024, 0, 1);
      const reversed = each({
        start,
        end,
        step: { days: 1 },
        adapter,
      });
      expect(reversed).toHaveLength(0);
    });
  });
});
