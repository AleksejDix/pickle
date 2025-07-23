import { describe, it, expect } from "vitest";
import { NativeDateAdapter, nativeAdapter } from "../src/index";

describe("NativeDateAdapter", () => {
  const adapter = new NativeDateAdapter();

  describe("Adapter Identity", () => {
    it("should have correct name", () => {
      expect(adapter.name).toBe("native");
    });

    it("should export default adapter instance", () => {
      expect(nativeAdapter).toBeInstanceOf(NativeDateAdapter);
      expect(nativeAdapter.name).toBe("native");
    });
  });

  describe("Date Addition", () => {
    it("should add years", () => {
      const date = new Date(2024, 0, 15);
      const result = adapter.add(date, { years: 1 });
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    it("should add months", () => {
      const date = new Date(2024, 0, 15);
      const result = adapter.add(date, { months: 2 });
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(15);
    });

    it("should add days", () => {
      const date = new Date(2024, 0, 15);
      const result = adapter.add(date, { days: 10 });
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(25);
    });

    it("should add multiple units", () => {
      const date = new Date(2024, 0, 15, 10, 30, 0);
      const result = adapter.add(date, {
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
        minutes: 5,
      });
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(18);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(35);
    });
  });

  describe("Date Subtraction", () => {
    it("should subtract months", () => {
      const date = new Date(2024, 3, 15);
      const result = adapter.subtract(date, { months: 2 });
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(15);
    });

    it("should subtract across year boundary", () => {
      const date = new Date(2024, 1, 15);
      const result = adapter.subtract(date, { months: 3 });
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(10);
      expect(result.getDate()).toBe(15);
    });
  });

  describe("Start/End of Period", () => {
    it("should find start of year", () => {
      const date = new Date(2024, 6, 15, 14, 30, 45);
      const result = adapter.startOf(date, "year");
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it("should find end of month", () => {
      const date = new Date(2024, 1, 15); // February
      const result = adapter.endOf(date, "month");
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(29); // Leap year
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });

    it("should find start of week", () => {
      const date = new Date(2024, 0, 17); // Wednesday
      const result = adapter.startOf(date, "week");
      expect(result.getDate()).toBe(14); // Previous Sunday
    });

    it("should find end of week", () => {
      const date = new Date(2024, 0, 17); // Wednesday
      const result = adapter.endOf(date, "week");
      expect(result.getDate()).toBe(20); // Next Saturday
    });
  });

  describe("Date Comparison", () => {
    it("should check if dates are same year", () => {
      const date1 = new Date(2024, 3, 15);
      const date2 = new Date(2024, 8, 22);
      expect(adapter.isSame(date1, date2, "year")).toBe(true);
    });

    it("should check if dates are different months", () => {
      const date1 = new Date(2024, 3, 15);
      const date2 = new Date(2024, 4, 15);
      expect(adapter.isSame(date1, date2, "month")).toBe(false);
    });

    it("should check if date is before another", () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 20);
      expect(adapter.isBefore(date1, date2)).toBe(true);
      expect(adapter.isBefore(date2, date1)).toBe(false);
    });

    it("should check if date is after another", () => {
      const date1 = new Date(2024, 0, 20);
      const date2 = new Date(2024, 0, 15);
      expect(adapter.isAfter(date1, date2)).toBe(true);
      expect(adapter.isAfter(date2, date1)).toBe(false);
    });
  });

  describe("Interval Generation", () => {
    it("should generate daily intervals", () => {
      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 0, 5);
      const result = adapter.eachInterval(start, end, "day");
      expect(result).toHaveLength(5);
      expect(result[0].getDate()).toBe(1);
      expect(result[4].getDate()).toBe(5);
    });

    it("should generate monthly intervals", () => {
      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 3, 1);
      const result = adapter.eachInterval(start, end, "month");
      expect(result).toHaveLength(4);
      expect(result[0].getMonth()).toBe(0);
      expect(result[3].getMonth()).toBe(3);
    });
  });

  describe("Weekday and Weekend", () => {
    it("should get correct weekday", () => {
      const sunday = new Date(2024, 0, 7);
      const monday = new Date(2024, 0, 8);
      const saturday = new Date(2024, 0, 6);

      expect(adapter.getWeekday(sunday)).toBe(0);
      expect(adapter.getWeekday(monday)).toBe(1);
      expect(adapter.getWeekday(saturday)).toBe(6);
    });

    it("should identify weekends", () => {
      const friday = new Date(2024, 0, 5);
      const saturday = new Date(2024, 0, 6);
      const sunday = new Date(2024, 0, 7);
      const monday = new Date(2024, 0, 8);

      expect(adapter.isWeekend(friday)).toBe(false);
      expect(adapter.isWeekend(saturday)).toBe(true);
      expect(adapter.isWeekend(sunday)).toBe(true);
      expect(adapter.isWeekend(monday)).toBe(false);
    });
  });
});