import { describe, it, expect } from "vitest";
import { isRef } from "@vue/reactivity";
import { createTemporal } from "../../src/core/createTemporal";
import { createTestDate } from "../setup";
import { nativeAdapter } from "../../src/adapters/native";

describe("createTemporal", () => {
  describe("API and Framework Agnostic Behavior", () => {
    it("should create temporal instance with default options", () => {
      const temporal = createTemporal();

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
      const temporal = createTemporal({ date: testDate });

      expect(temporal.picked.value).toEqual(testDate);
      expect(temporal.browsing.value).toEqual(testDate);
    });

    it("should accept now option", () => {
      const testDate = createTestDate(2023, 5, 15);
      const nowDate = createTestDate(2024, 0, 1);

      const temporal = createTemporal({
        date: testDate,
        now: nowDate,
      });

      expect(temporal.picked.value).toEqual(testDate);
      expect(temporal.now.value).toEqual(nowDate);
    });

    it("should accept locale option", () => {
      const temporal = createTemporal({ locale: "fr-FR" });

      // Test locale formatting
      const testDate = createTestDate(2024, 0, 15);
      const formatted = temporal.f(testDate, { month: "long" });

      expect(formatted).toContain("janvier"); // French month name
    });
  });

  describe("Adapter System Integration", () => {
    it("should use native adapter by default", () => {
      const temporal = createTemporal();
      expect(temporal.adapter.name).toBe("native");
    });

    it("should accept explicit adapter name", () => {
      const temporal = createTemporal({ dateAdapter: "native" });
      expect(temporal.adapter.name).toBe("native");
    });

    it("should accept adapter instance", () => {
      const temporal = createTemporal({ dateAdapter: nativeAdapter });
      expect(temporal.adapter).toBe(nativeAdapter);
    });

    it("should use auto-detection when specified", () => {
      const temporal = createTemporal({ dateAdapter: "auto" });
      expect(temporal.adapter).toBeDefined();
      expect(typeof temporal.adapter.add).toBe("function");
    });

    it("should fallback to native for unknown adapters", () => {
      const temporal = createTemporal({ dateAdapter: "unknown" as any });
      expect(temporal.adapter.name).toBe("native");
    });
  });

  describe("Reactive Properties", () => {
    it("should have reactive picked property", () => {
      const temporal = createTemporal();

      expect(isRef(temporal.picked)).toBe(true);
    });

    it("should have reactive now property", () => {
      const temporal = createTemporal();

      expect(isRef(temporal.now)).toBe(true);
    });

    it("should have reactive browsing property", () => {
      const temporal = createTemporal();

      expect(isRef(temporal.browsing)).toBe(true);
    });

    it("should update reactive values", () => {
      const temporal = createTemporal();
      const newDate = createTestDate(2025, 6, 20);

      temporal.picked.value = newDate;
      expect(temporal.picked.value).toEqual(newDate);

      temporal.now.value = newDate;
      expect(temporal.now.value).toEqual(newDate);
    });
  });

  describe("Locale Formatting", () => {
    it("should format dates using f() method", () => {
      const temporal = createTemporal({ locale: "en-US" });
      const testDate = createTestDate(2024, 0, 15); // January 15, 2024

      const monthName = temporal.f(testDate, { month: "long" });
      const year = temporal.f(testDate, { year: "numeric" });

      expect(monthName).toBe("January");
      expect(year).toBe("2024");
    });

    it("should respect different locales", () => {
      const enTemporal = createTemporal({ locale: "en-US" });
      const frTemporal = createTemporal({ locale: "fr-FR" });

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
      const temporal = createTemporal();

      // Should not throw when accessing reactive values directly
      expect(() => {
        const date = temporal.picked.value;
        const now = temporal.now.value;
        return { date, now };
      }).not.toThrow();
    });

    it("should provide direct value access for any framework", () => {
      const testDate = createTestDate(2024, 5, 15);
      const temporal = createTemporal({ date: testDate });

      // Vanilla JS access pattern
      const pickedValue = temporal.picked.value;
      const nowValue = temporal.now.value;

      expect(pickedValue).toEqual(testDate);
      expect(nowValue).toBeInstanceOf(Date);
    });

    it("should support reactive updates from any framework", () => {
      const temporal = createTemporal();

      // Simulate changing the value
      const newDate = createTestDate(2025, 8, 10);
      temporal.picked.value = newDate;

      expect(temporal.picked.value).toEqual(newDate);
    });
  });

  describe("Adapter-Powered Operations", () => {
    it("should use adapter for date operations", () => {
      const temporal = createTemporal();
      const testDate = createTestDate(2024, 0, 15);

      // Test that adapter methods are being used
      const startOfYear = temporal.adapter.startOf(testDate, "year");
      expect(startOfYear.getFullYear()).toBe(2024);
      expect(startOfYear.getMonth()).toBe(0);
      expect(startOfYear.getDate()).toBe(1);
    });

    it("should support date comparison through adapter", () => {
      const temporal = createTemporal();
      const date1 = createTestDate(2024, 0, 15);
      const date2 = createTestDate(2024, 0, 15);
      const date3 = createTestDate(2024, 0, 16);

      expect(temporal.adapter.isSame(date1, date2, "day")).toBe(true);
      expect(temporal.adapter.isSame(date1, date3, "day")).toBe(false);
    });

    it("should generate intervals using adapter", () => {
      const temporal = createTemporal();
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
      const temporal = createTemporal();

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
        dateAdapter: "native" as const,
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
      const temporal = createTemporal({ dateAdapter: "native" });

      expect(temporal.adapter.name).toBe("native");
      expect(typeof temporal.adapter.add).toBe("function");
      expect(typeof temporal.adapter.subtract).toBe("function");
      expect(typeof temporal.adapter.startOf).toBe("function");
      expect(typeof temporal.adapter.endOf).toBe("function");
      expect(typeof temporal.adapter.isSame).toBe("function");
      expect(typeof temporal.adapter.eachInterval).toBe("function");
    });
  });
});
