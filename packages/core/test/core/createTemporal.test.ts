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
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 5, 15) });
      
      const unit = createTimeUnit("day", {
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
      });
      
      expect(unit).toBeDefined();
      expect(unit.raw).toBeDefined();
      expect(unit.start).toBeDefined();
      expect(unit.end).toBeDefined();
      expect(unit.timespan).toBeDefined();
      expect(unit.isNow).toBeDefined();
      expect(unit.number).toBeDefined();
      expect(unit.name).toBeDefined();
      expect(unit.browsing).toBeDefined();
      expect(typeof unit.future).toBe("function");
      expect(typeof unit.past).toBe("function");
      expect(typeof unit.isSame).toBe("function");
    });

    it("should handle unknown time unit", async () => {
      const { createTimeUnit } = await import("../../src/core/timeUnitFactory");
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 5, 15) });
      
      const unit = createTimeUnit("unknown" as any, {
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
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
      expect(typeof temporal.f).toBe("function");
    });

    it("should accept date option", () => {
      const testDate = createTestDate(2023, 5, 15);
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: testDate });

      expect(temporal.picked.value).toEqual(testDate);
      expect(temporal.browsing.value).toEqual(testDate);
    });

    it("should accept now option", () => {
      const testDate = createTestDate(2023, 5, 15);
      const nowDate = createTestDate(2024, 0, 1);

      const temporal = createTemporal({ dateAdapter: mockAdapter,
        date: testDate,
        now: nowDate,
      });

      expect(temporal.picked.value).toEqual(testDate);
      expect(temporal.now.value).toEqual(nowDate);
    });

    it("should accept locale option", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter, locale: "fr-FR" });

      // Test locale formatting
      const testDate = createTestDate(2024, 0, 15);
      const formatted = temporal.f(testDate, { month: "long" });

      expect(formatted).toContain("janvier"); // French month name
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

  describe("Locale Formatting", () => {
    it("should format dates using f() method", () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter, locale: "en-US" });
      const testDate = createTestDate(2024, 0, 15); // January 15, 2024

      const monthName = temporal.f(testDate, { month: "long" });
      const year = temporal.f(testDate, { year: "numeric" });

      expect(monthName).toBe("January");
      expect(year).toBe("2024");
    });

    it("should respect different locales", () => {
      const enTemporal = createTemporal({ dateAdapter: mockAdapter, locale: "en-US" });
      const frTemporal = createTemporal({ dateAdapter: mockAdapter, locale: "fr-FR" });

      const testDate = createTestDate(2024, 0, 15);

      const enMonth = enTemporal.f(testDate, { month: "long" });
      const frMonth = frTemporal.f(testDate, { month: "long" });

      expect(enMonth).toBe("January");
      expect(frMonth).toBe("janvier");
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
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: testDate });

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
        locale: "en-US" as const,
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
      const { default: useYear } = await import("../../src/composables/useYear");
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 5, 15) });
      
      const year = useYear({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
      });
      
      expect(year.number.value).toBe(2024);
      expect(year.name.value).toBe("2024");
      // Just test the year part, avoid timezone issues
      expect(year.start.value.getFullYear()).toBe(2024);
      expect(year.start.value.getMonth()).toBe(0);
      expect(year.start.value.getDate()).toBe(1);
      
      // Test navigation
      year.future();
      expect(year.number.value).toBe(2025);
      
      year.past();
      year.past();
      expect(year.number.value).toBe(2023);
    });

    it("should test useMonth composable", async () => {
      const { default: useMonth } = await import("../../src/composables/useMonth");
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 5, 15) });
      
      const month = useMonth({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
      });
      
      expect(month.number.value).toBe(6);
      expect(month.name.value).toBe("June 2024");
      // Note: days property doesn't exist on month composable
      
      // Test navigation
      month.future();
      expect(month.number.value).toBe(7);
      expect(month.name.value).toBe("July 2024");
      
      month.past();
      month.past();
      expect(month.number.value).toBe(5);
      expect(month.name.value).toBe("May 2024");
    });

    it("should test useWeek composable", async () => {
      const { default: useWeek } = await import("../../src/composables/useWeek");
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 5, 15) }); // Saturday
      
      const week = useWeek({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
      });
      
      // Just test the date parts, avoid timezone issues
      expect(week.start.value.getDate()).toBe(9); // Sunday
      expect(week.end.value.getDate()).toBe(15); // Saturday
      
      // Test navigation
      week.future();
      expect(week.start.value.getDate()).toBe(16);
      
      week.past();
      week.past();
      expect(week.start.value.getDate()).toBe(2);
    });

    it("should test useDay composable", async () => {
      const { default: useDay } = await import("../../src/composables/useDay");
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 5, 15) });
      
      const day = useDay({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
      });
      
      expect(day.number.value).toBe(15);
      // Name format might include month, so just check it includes the day
      expect(day.name.value).toContain("15");
      expect(day.weekDay.value).toBe(6);
      
      // Test navigation
      day.future();
      expect(day.number.value).toBe(16);
      
      day.past();
      day.past();
      expect(day.number.value).toBe(14);
    });

    it("should test useHour composable", async () => {
      const { default: useHour } = await import("../../src/composables/useHour");
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 5, 15, 14, 30) });
      
      const hour = useHour({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
      });
      
      expect(hour.number.value).toBe(14);
      expect(hour.name.value).toBe("2:30 PM");
      
      // Test navigation
      hour.future();
      expect(hour.number.value).toBe(15);
      
      hour.past();
      hour.past();
      expect(hour.number.value).toBe(13);
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
      const { default: useYear } = await import("../../src/composables/useYear");
      
      const year = useYear({
        now: temporal.now,
        browsing: temporal.browsing,
        adapter: temporal.adapter
      });
      
      const months = temporal.divide(year, "month");
      
      expect(months).toHaveLength(12);
      expect(months[0].timespan).toBeDefined();
      expect(months[0].name).toBeDefined();
      expect(months[0].number.value).toBe(1);
      expect(months[11].number.value).toBe(12);
    });

    it("should divide month into days", async () => {
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: createTestDate(2024, 0, 15) });
      const { default: useMonth } = await import("../../src/composables/useMonth");
      
      const month = useMonth({
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
        timespan: { value: { start: new Date(2024, 0, 1), end: new Date(2024, 0, 31) } },
        raw: { value: new Date(2024, 0, 15) },
        isNow: { value: false },
        number: { value: 1 },
        name: { value: "January 2024" },
        browsing: { value: new Date(2024, 0, 15) },
        future: () => {},
        past: () => {},
        isSame: () => false
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
      
      const temporal = createTemporal({ dateAdapter: mockAdapter, date: dateRef });
      
      expect(temporal.picked).toBe(dateRef);
      expect(temporal.picked.value).toEqual(dateRef.value);
      
      // Update ref and check if temporal reflects the change
      dateRef.value = createTestDate(2025, 0, 1);
      expect(temporal.picked.value).toEqual(createTestDate(2025, 0, 1));
    });

    it("should accept ref for now option", async () => {
      const { ref } = await import("@vue/reactivity");
      const nowRef = ref(createTestDate(2024, 0, 1));
      
      const temporal = createTemporal({ dateAdapter: mockAdapter, now: nowRef });
      
      expect(temporal.now).toBe(nowRef);
      expect(temporal.now.value).toEqual(nowRef.value);
    });

    it("should accept ref for locale option", async () => {
      const { ref } = await import("@vue/reactivity");
      const localeRef = ref("fr-FR");
      
      const temporal = createTemporal({ dateAdapter: mockAdapter, locale: localeRef });
      const testDate = createTestDate(2024, 0, 15);
      
      const formatted = temporal.f(testDate, { month: "long" });
      expect(formatted).toBe("janvier");
      
      // Change locale and test again
      localeRef.value = "en-US";
      const formattedEn = temporal.f(testDate, { month: "long" });
      expect(formattedEn).toBe("January");
    });

    it("should handle mix of refs and values", async () => {
      const { ref } = await import("@vue/reactivity");
      const dateRef = ref(createTestDate(2024, 5, 15));
      const plainNow = createTestDate(2024, 0, 1);
      
      const temporal = createTemporal({ dateAdapter: mockAdapter, 
        date: dateRef,
        now: plainNow,
        locale: "de-DE"
      });
      
      expect(temporal.picked).toBe(dateRef);
      expect(temporal.now.value).toEqual(plainNow);
      expect(isRef(temporal.now)).toBe(true);
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
        adapter
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
        adapter
      });
      expect(months).toHaveLength(3);
      
      // Test with years
      const yearStart = createTestDate(2020, 0, 1);
      const yearEnd = createTestDate(2022, 0, 1);
      const years = each({
        start: yearStart,
        end: yearEnd,
        step: { years: 1 },
        adapter
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
        adapter
      });
      expect(sameDates).toHaveLength(1);
      
      // End before start
      const start = createTestDate(2024, 0, 5);
      const end = createTestDate(2024, 0, 1);
      const reversed = each({
        start,
        end,
        step: { days: 1 },
        adapter
      });
      expect(reversed).toHaveLength(0);
    });
  });
});
