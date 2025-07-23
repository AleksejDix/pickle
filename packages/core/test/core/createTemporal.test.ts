import { describe, it, expect } from "vitest";
import { isRef } from "@vue/reactivity";
import { createTemporal } from "../../src/core/createTemporal";
import { same } from "../../src/utils/same";
import { createTestDate } from "../setup";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
// Import composables to register them
import "../../src/composables";

// Create a shared adapter instance for tests
const nativeAdapter = new NativeDateAdapter();

describe("createTemporal", () => {
  describe("API and Framework Agnostic Behavior", () => {
    it("should create temporal instance with default options", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });

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
      const temporal = createTemporal({ dateAdapter: nativeAdapter, date: testDate });

      expect(temporal.picked.value).toEqual(testDate);
      expect(temporal.browsing.value).toEqual(testDate);
    });

    it("should accept now option", () => {
      const testDate = createTestDate(2023, 5, 15);
      const nowDate = createTestDate(2024, 0, 1);

      const temporal = createTemporal({ dateAdapter: nativeAdapter,
        date: testDate,
        now: nowDate,
      });

      expect(temporal.picked.value).toEqual(testDate);
      expect(temporal.now.value).toEqual(nowDate);
    });

    it("should accept locale option", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter, locale: "fr-FR" });

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
      const temporal = createTemporal({ dateAdapter: new NativeDateAdapter() });
      expect(temporal.adapter.name).toBe("native");
    });

    it("should accept adapter instance", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });
      expect(temporal.adapter).toBe(nativeAdapter);
    });

    it("should validate adapter has required methods", () => {
      const adapter = new NativeDateAdapter();
      const temporal = createTemporal({ dateAdapter: adapter });
      expect(typeof temporal.adapter.add).toBe("function");
      expect(typeof temporal.adapter.subtract).toBe("function");
      expect(typeof temporal.adapter.startOf).toBe("function");
      expect(typeof temporal.adapter.endOf).toBe("function");
    });

  });

  describe("Reactive Properties", () => {
    it("should have reactive picked property", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });

      expect(isRef(temporal.picked)).toBe(true);
    });

    it("should have reactive now property", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });

      expect(isRef(temporal.now)).toBe(true);
    });

    it("should have reactive browsing property", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });

      expect(isRef(temporal.browsing)).toBe(true);
    });

    it("should update reactive values", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });
      const newDate = createTestDate(2025, 6, 20);

      temporal.picked.value = newDate;
      expect(temporal.picked.value).toEqual(newDate);

      temporal.now.value = newDate;
      expect(temporal.now.value).toEqual(newDate);
    });
  });

  describe("Locale Formatting", () => {
    it("should format dates using f() method", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter, locale: "en-US" });
      const testDate = createTestDate(2024, 0, 15); // January 15, 2024

      const monthName = temporal.f(testDate, { month: "long" });
      const year = temporal.f(testDate, { year: "numeric" });

      expect(monthName).toBe("January");
      expect(year).toBe("2024");
    });

    it("should respect different locales", () => {
      const enTemporal = createTemporal({ dateAdapter: nativeAdapter, locale: "en-US" });
      const frTemporal = createTemporal({ dateAdapter: nativeAdapter, locale: "fr-FR" });

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
      const temporal = createTemporal({ dateAdapter: nativeAdapter });

      // Should not throw when accessing reactive values directly
      expect(() => {
        const date = temporal.picked.value;
        const now = temporal.now.value;
        return { date, now };
      }).not.toThrow();
    });

    it("should provide direct value access for any framework", () => {
      const testDate = createTestDate(2024, 5, 15);
      const temporal = createTemporal({ dateAdapter: nativeAdapter, date: testDate });

      // Vanilla JS access pattern
      const pickedValue = temporal.picked.value;
      const nowValue = temporal.now.value;

      expect(pickedValue).toEqual(testDate);
      expect(nowValue).toBeInstanceOf(Date);
    });

    it("should support reactive updates from any framework", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });

      // Simulate changing the value
      const newDate = createTestDate(2025, 8, 10);
      temporal.picked.value = newDate;

      expect(temporal.picked.value).toEqual(newDate);
    });
  });

  describe("Adapter-Powered Operations", () => {
    it("should use adapter for date operations", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });
      const testDate = createTestDate(2024, 0, 15);

      // Test that adapter methods are being used
      const startOfYear = temporal.adapter.startOf(testDate, "year");
      expect(startOfYear.getFullYear()).toBe(2024);
      expect(startOfYear.getMonth()).toBe(0);
      expect(startOfYear.getDate()).toBe(1);
    });

    it("should support date comparison through adapter", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });
      const date1 = createTestDate(2024, 0, 15);
      const date2 = createTestDate(2024, 0, 15);
      const date3 = createTestDate(2024, 0, 16);

      expect(temporal.adapter.isSame(date1, date2, "day")).toBe(true);
      expect(temporal.adapter.isSame(date1, date3, "day")).toBe(false);
    });

    it("should generate intervals using adapter", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });
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
      const temporal = createTemporal({ dateAdapter: nativeAdapter });

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
        dateAdapter: nativeAdapter,
      };

      const temporal = createTemporal(options);

      expect(temporal.picked.value).toEqual(options.date);
      expect(temporal.now.value).toEqual(options.now);
      expect(temporal.adapter.name).toBe("native");
    });
  });

  describe("Zero Dependencies Achievement", () => {
    it("should work with zero external dependencies", () => {
      // This test validates that our native adapter provides full functionality
      const temporal = createTemporal({ dateAdapter: new NativeDateAdapter() });

      expect(temporal.adapter.name).toBe("native");
      expect(typeof temporal.adapter.add).toBe("function");
      expect(typeof temporal.adapter.subtract).toBe("function");
      expect(typeof temporal.adapter.startOf).toBe("function");
      expect(typeof temporal.adapter.endOf).toBe("function");
      expect(typeof temporal.adapter.isSame).toBe("function");
      expect(typeof temporal.adapter.eachInterval).toBe("function");
    });
  });

  describe("divide() function", () => {
    it("should have divide method", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });
      expect(typeof temporal.divide).toBe("function");
    });

    // TODO: Fix circular dependency issue before enabling these tests
    /*
    it("should divide year into months", async () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter, date: createTestDate(2024, 0, 15) });
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
      const temporal = createTemporal({ dateAdapter: nativeAdapter, date: createTestDate(2024, 0, 15) });
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
      const temporal = createTemporal({ dateAdapter: nativeAdapter });
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
      
      const temporal = createTemporal({ dateAdapter: nativeAdapter, date: dateRef });
      
      expect(temporal.picked).toBe(dateRef);
      expect(temporal.picked.value).toEqual(dateRef.value);
      
      // Update ref and check if temporal reflects the change
      dateRef.value = createTestDate(2025, 0, 1);
      expect(temporal.picked.value).toEqual(createTestDate(2025, 0, 1));
    });

    it("should accept ref for now option", async () => {
      const { ref } = await import("@vue/reactivity");
      const nowRef = ref(createTestDate(2024, 0, 1));
      
      const temporal = createTemporal({ dateAdapter: nativeAdapter, now: nowRef });
      
      expect(temporal.now).toBe(nowRef);
      expect(temporal.now.value).toEqual(nowRef.value);
    });

    it("should accept ref for locale option", async () => {
      const { ref } = await import("@vue/reactivity");
      const localeRef = ref("fr-FR");
      
      const temporal = createTemporal({ dateAdapter: nativeAdapter, locale: localeRef });
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
      
      const temporal = createTemporal({ dateAdapter: nativeAdapter, 
        date: dateRef,
        now: plainNow,
        locale: "de-DE"
      });
      
      expect(temporal.picked).toBe(dateRef);
      expect(temporal.now.value).toEqual(plainNow);
      expect(isRef(temporal.now)).toBe(true);
    });
  });

  describe("same() helper function", () => {
    it("should compare dates for same unit", () => {
      const adapter = nativeAdapter;
      
      const date1 = createTestDate(2024, 0, 15, 10, 30);
      const date2 = createTestDate(2024, 0, 15, 14, 45);
      const date3 = createTestDate(2024, 0, 16);
      
      expect(same(date1, date2, "day", adapter)).toBe(true);
      expect(same(date1, date3, "day", adapter)).toBe(false);
      expect(same(date1, date2, "hour", adapter)).toBe(false);
    });

    it("should handle null/undefined dates", () => {
      const adapter = nativeAdapter;
      const date = createTestDate(2024, 0, 15);
      
      expect(same(null, date, "day", adapter)).toBe(false);
      expect(same(date, null, "day", adapter)).toBe(false);
      expect(same(undefined, date, "day", adapter)).toBe(false);
      expect(same(date, undefined, "day", adapter)).toBe(false);
      expect(same(null, null, "day", adapter)).toBe(false);
      expect(same(undefined, undefined, "day", adapter)).toBe(false);
    });

    it("should work with different units", () => {
      const adapter = nativeAdapter;
      
      const date1 = createTestDate(2024, 5, 15);
      const date2 = createTestDate(2024, 6, 20);
      
      expect(same(date1, date2, "year", adapter)).toBe(true);
      expect(same(date1, date2, "month", adapter)).toBe(false);
    });
  });
});
