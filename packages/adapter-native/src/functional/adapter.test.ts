import { describe, it, expect } from "vitest";
import { createNativeAdapter } from "./adapter";

describe("Functional Native Adapter", () => {
  const adapter = createNativeAdapter({ weekStartsOn: 1 });

  describe("startOf", () => {
    const date = new Date(2024, 5, 15, 14, 30, 45, 500); // June 15, 2024 14:30:45.500

    it("should return start of year", () => {
      const result = adapter.startOf(date, "year");
      expect(result).toEqual(new Date(2024, 0, 1, 0, 0, 0, 0));
    });

    it("should return start of month", () => {
      const result = adapter.startOf(date, "month");
      expect(result).toEqual(new Date(2024, 5, 1, 0, 0, 0, 0));
    });

    it("should return start of week (Monday)", () => {
      const result = adapter.startOf(date, "week");
      expect(result).toEqual(new Date(2024, 5, 10, 0, 0, 0, 0)); // Monday
    });

    it("should return start of day", () => {
      const result = adapter.startOf(date, "day");
      expect(result).toEqual(new Date(2024, 5, 15, 0, 0, 0, 0));
    });

    it("should return start of hour", () => {
      const result = adapter.startOf(date, "hour");
      expect(result).toEqual(new Date(2024, 5, 15, 14, 0, 0, 0));
    });

    it("should return start of minute", () => {
      const result = adapter.startOf(date, "minute");
      expect(result).toEqual(new Date(2024, 5, 15, 14, 30, 0, 0));
    });

    it("should return start of second", () => {
      const result = adapter.startOf(date, "second");
      expect(result).toEqual(new Date(2024, 5, 15, 14, 30, 45, 0));
    });

    it("should return start of quarter", () => {
      const result = adapter.startOf(date, "quarter");
      expect(result).toEqual(new Date(2024, 3, 1, 0, 0, 0, 0)); // Q2 starts in April
    });
  });

  describe("endOf", () => {
    const date = new Date(2024, 5, 15, 14, 30, 45, 500); // June 15, 2024

    it("should return end of year", () => {
      const result = adapter.endOf(date, "year");
      expect(result).toEqual(new Date(2024, 11, 31, 23, 59, 59, 999));
    });

    it("should return end of month", () => {
      const result = adapter.endOf(date, "month");
      expect(result).toEqual(new Date(2024, 5, 30, 23, 59, 59, 999));
    });

    it("should return end of quarter", () => {
      const result = adapter.endOf(date, "quarter");
      expect(result).toEqual(new Date(2024, 5, 30, 23, 59, 59, 999)); // Q2 ends in June
    });
  });

  describe("add", () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024

    it("should add years", () => {
      const result = adapter.add(date, 2, "year");
      expect(result).toEqual(new Date(2026, 0, 15));
    });

    it("should add months", () => {
      const result = adapter.add(date, 3, "month");
      expect(result).toEqual(new Date(2024, 3, 15));
    });

    it("should add weeks", () => {
      const result = adapter.add(date, 2, "week");
      expect(result).toEqual(new Date(2024, 0, 29));
    });

    it("should add days", () => {
      const result = adapter.add(date, 10, "day");
      expect(result).toEqual(new Date(2024, 0, 25));
    });

    it("should handle negative amounts", () => {
      const result = adapter.add(date, -1, "month");
      expect(result).toEqual(new Date(2023, 11, 15));
    });

    it("should handle month-end edge cases", () => {
      const lastDay = new Date(2024, 0, 31); // Jan 31
      const result = adapter.add(lastDay, 1, "month");
      // Should be Feb 29 (leap year), not March 2
      expect(result).toEqual(new Date(2024, 1, 29));
    });
  });

  describe("diff", () => {
    it("should calculate year difference", () => {
      const from = new Date(2020, 5, 15);
      const to = new Date(2024, 5, 15);
      expect(adapter.diff(from, to, "year")).toBe(4);
    });

    it("should calculate month difference", () => {
      const from = new Date(2024, 0, 15);
      const to = new Date(2024, 5, 15);
      expect(adapter.diff(from, to, "month")).toBe(5);
    });

    it("should calculate week difference", () => {
      const from = new Date(2024, 0, 1);
      const to = new Date(2024, 0, 15);
      expect(adapter.diff(from, to, "week")).toBe(2);
    });

    it("should calculate day difference", () => {
      const from = new Date(2024, 0, 1);
      const to = new Date(2024, 0, 11);
      expect(adapter.diff(from, to, "day")).toBe(10);
    });

    it("should handle negative differences", () => {
      const from = new Date(2024, 5, 15);
      const to = new Date(2024, 0, 15);
      expect(adapter.diff(from, to, "month")).toBe(-5);
    });
  });

  describe("week start configuration", () => {
    it("should support Sunday as week start", () => {
      const sundayAdapter = createNativeAdapter({ weekStartsOn: 0 });
      const saturday = new Date(2024, 5, 15); // Saturday
      const result = sundayAdapter.startOf(saturday, "week");
      expect(result).toEqual(new Date(2024, 5, 9, 0, 0, 0, 0)); // Sunday
    });

    it("should support Monday as week start", () => {
      const mondayAdapter = createNativeAdapter({ weekStartsOn: 1 });
      const saturday = new Date(2024, 5, 15); // Saturday
      const result = mondayAdapter.startOf(saturday, "week");
      expect(result).toEqual(new Date(2024, 5, 10, 0, 0, 0, 0)); // Monday
    });
  });
});