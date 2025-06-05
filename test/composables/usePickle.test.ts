import { describe, it, expect, beforeEach } from "vitest";
import { ref, computed } from "vue";
import { usePickle, same } from "@/use/usePickle";
import type { TimeUnit } from "@/types";

describe("usePickle", () => {
  const testDate = new Date("2024-01-15T12:00:00.000Z");

  beforeEach(() => {
    // Reset any global state
  });

  describe("Core Functionality", () => {
    it("should initialize with provided date", () => {
      const pickle = usePickle({
        date: testDate,
        now: testDate,
      });

      expect(pickle.picked.value).toEqual(testDate);
      expect(pickle.now.value).toEqual(testDate);
      expect(pickle.browsing.value).toEqual(testDate);
    });

    it("should work with reactive refs", () => {
      const dateRef = ref(testDate);
      const nowRef = ref(testDate);

      const pickle = usePickle({
        date: dateRef,
        now: nowRef,
        locale: "en",
      });

      expect(pickle.picked.value).toEqual(testDate);

      // Test reactivity
      const newDate = new Date("2024-02-15T12:00:00.000Z");
      dateRef.value = newDate;
      expect(pickle.picked.value).toEqual(newDate);
    });

    it("should format dates correctly", () => {
      const pickle = usePickle({
        date: testDate,
        locale: "en",
      });

      const formatted = pickle.f(testDate, { year: "numeric", month: "long" });
      expect(formatted).toBe("January 2024");
    });
  });

  describe("The Revolutionary Divide Pattern", () => {
    it("should divide time units hierarchically", () => {
      const pickle = usePickle({
        date: testDate,
        now: testDate,
      });

      // Create a mock time unit for testing
      const mockYear: Partial<TimeUnit> = {
        timespan: computed(() => ({
          start: new Date("2024-01-01T00:00:00.000Z"),
          end: new Date("2024-12-31T23:59:59.999Z"),
        })),
      };

      // This is the innovative part - fractal time division!
      const months = pickle.divide(mockYear as TimeUnit, "month");

      expect(Array.isArray(months)).toBe(true);
      // Should have 12 months in a year
      expect(months.length).toBe(12);
    });

    it("should handle edge cases gracefully", () => {
      const pickle = usePickle({
        date: testDate,
      });

      const mockUnit: Partial<TimeUnit> = {
        timespan: computed(() => ({
          start: testDate,
          end: testDate,
        })),
      };

      // Test with unsupported unit type
      const result = pickle.divide(mockUnit as TimeUnit, "millennium" as any);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Internationalization", () => {
    it("should support different locales", () => {
      const pickle = usePickle({
        date: testDate,
        locale: "de",
      });

      const germanFormat = pickle.f(testDate, { month: "long" });
      expect(germanFormat).toBe("Januar");
    });

    it("should work with reactive locale changes", () => {
      const localeRef = ref("en");
      const pickle = usePickle({
        date: testDate,
        locale: localeRef,
      });

      expect(pickle.f(testDate, { month: "long" })).toBe("January");

      localeRef.value = "de";
      expect(pickle.f(testDate, { month: "long" })).toBe("Januar");
    });
  });

  describe("same() utility function", () => {
    it("should compare dates correctly", () => {
      const date1 = new Date("2024-01-15T12:00:00.000Z");
      const date2 = new Date("2024-01-15T15:00:00.000Z"); // Same day, different time
      const date3 = new Date("2024-01-16T12:00:00.000Z"); // Different day

      expect(same(date1, date2, "day")).toBe(true);
      expect(same(date1, date3, "day")).toBe(false);
      expect(same(date1, date2, "year")).toBe(true);
      expect(same(date1, date3, "year")).toBe(true);
    });

    it("should handle null/undefined gracefully", () => {
      expect(same(null, testDate, "day")).toBe(false);
      expect(same(testDate, undefined, "day")).toBe(false);
      expect(same(null, null, "day")).toBe(false);
    });
  });
});
