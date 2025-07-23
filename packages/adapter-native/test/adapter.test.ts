import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NativeDateAdapter, nativeAdapter } from "../src/index";

describe("NativeDateAdapter", () => {
  let adapter: NativeDateAdapter;

  beforeEach(() => {
    // Create fresh adapter instance for each test
    adapter = new NativeDateAdapter();
  });

  afterEach(() => {
    // Clean up after each test
    adapter = null as any;
  });

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

  describe("Additional Coverage", () => {
    it("should add all duration types", () => {
      const date = new Date(2024, 5, 15, 10, 30, 30, 500);

      // Test weeks
      const withWeeks = adapter.add(date, { weeks: 2 });
      expect(withWeeks.getDate()).toBe(29);

      // Test hours
      const withHours = adapter.add(date, { hours: 5 });
      expect(withHours.getHours()).toBe(15);

      // Test minutes
      const withMinutes = adapter.add(date, { minutes: 45 });
      expect(withMinutes.getMinutes()).toBe(15);
      expect(withMinutes.getHours()).toBe(11);

      // Test seconds
      const withSeconds = adapter.add(date, { seconds: 45 });
      expect(withSeconds.getSeconds()).toBe(15);
      expect(withSeconds.getMinutes()).toBe(31);

      // Test milliseconds
      const withMillis = adapter.add(date, { milliseconds: 600 });
      expect(withMillis.getMilliseconds()).toBe(100);
      expect(withMillis.getSeconds()).toBe(31);
    });

    it("should subtract all duration types", () => {
      const date = new Date(2024, 5, 15, 15, 30, 30, 500);

      // Test weeks
      const withWeeks = adapter.subtract(date, { weeks: 2 });
      expect(withWeeks.getDate()).toBe(1);

      // Test hours
      const withHours = adapter.subtract(date, { hours: 5 });
      expect(withHours.getHours()).toBe(10);

      // Test minutes
      const withMinutes = adapter.subtract(date, { minutes: 45 });
      expect(withMinutes.getMinutes()).toBe(45);
      expect(withMinutes.getHours()).toBe(14);

      // Test seconds
      const withSeconds = adapter.subtract(date, { seconds: 45 });
      expect(withSeconds.getSeconds()).toBe(45);
      expect(withSeconds.getMinutes()).toBe(29);

      // Test milliseconds
      const withMillis = adapter.subtract(date, { milliseconds: 600 });
      expect(withMillis.getMilliseconds()).toBe(900);
      expect(withMillis.getSeconds()).toBe(29);
    });

    it("should handle startOf/endOf for all units", () => {
      const date = new Date(2024, 5, 15, 14, 30, 45, 123);

      // Hour
      const startHour = adapter.startOf(date, "hour");
      expect(startHour.getMinutes()).toBe(0);
      expect(startHour.getSeconds()).toBe(0);
      expect(startHour.getMilliseconds()).toBe(0);

      const endHour = adapter.endOf(date, "hour");
      expect(endHour.getMinutes()).toBe(59);
      expect(endHour.getSeconds()).toBe(59);
      expect(endHour.getMilliseconds()).toBe(999);

      // Minute
      const startMinute = adapter.startOf(date, "minute");
      expect(startMinute.getSeconds()).toBe(0);
      expect(startMinute.getMilliseconds()).toBe(0);

      const endMinute = adapter.endOf(date, "minute");
      expect(endMinute.getSeconds()).toBe(59);
      expect(endMinute.getMilliseconds()).toBe(999);

      // Second
      const startSecond = adapter.startOf(date, "second");
      expect(startSecond.getMilliseconds()).toBe(0);

      const endSecond = adapter.endOf(date, "second");
      expect(endSecond.getMilliseconds()).toBe(999);

      // Decade
      const startDecade = adapter.startOf(date, "decade");
      expect(startDecade.getFullYear()).toBe(2020);
      expect(startDecade.getMonth()).toBe(0);
      expect(startDecade.getDate()).toBe(1);

      const endDecade = adapter.endOf(date, "decade");
      expect(endDecade.getFullYear()).toBe(2029);
      expect(endDecade.getMonth()).toBe(11);
      expect(endDecade.getDate()).toBe(31);

      // Century
      const startCentury = adapter.startOf(date, "century");
      expect(startCentury.getFullYear()).toBe(2000);

      const endCentury = adapter.endOf(date, "century");
      expect(endCentury.getFullYear()).toBe(2099);

      // Millennium
      const startMillennium = adapter.startOf(date, "millennium");
      expect(startMillennium.getFullYear()).toBe(2000);

      const endMillennium = adapter.endOf(date, "millennium");
      expect(endMillennium.getFullYear()).toBe(2999);

      // Unknown unit
      const unknownStart = adapter.startOf(date, "unknown" as any);
      expect(unknownStart.getTime()).toBe(date.getTime());

      const unknownEnd = adapter.endOf(date, "unknown" as any);
      expect(unknownEnd.getTime()).toBe(date.getTime());
    });

    it("should handle isSame for all units", () => {
      // Hour
      const date1Hour = new Date(2024, 5, 15, 14, 0, 0);
      const date2Hour = new Date(2024, 5, 15, 14, 59, 59);
      const date3Hour = new Date(2024, 5, 15, 15, 0, 0);
      expect(adapter.isSame(date1Hour, date2Hour, "hour")).toBe(true);
      expect(adapter.isSame(date1Hour, date3Hour, "hour")).toBe(false);

      // Minute
      const date1Minute = new Date(2024, 5, 15, 14, 30, 0);
      const date2Minute = new Date(2024, 5, 15, 14, 30, 59);
      const date3Minute = new Date(2024, 5, 15, 14, 31, 0);
      expect(adapter.isSame(date1Minute, date2Minute, "minute")).toBe(true);
      expect(adapter.isSame(date1Minute, date3Minute, "minute")).toBe(false);

      // Second
      const date1Second = new Date(2024, 5, 15, 14, 30, 45, 0);
      const date2Second = new Date(2024, 5, 15, 14, 30, 45, 999);
      const date3Second = new Date(2024, 5, 15, 14, 30, 46, 0);
      expect(adapter.isSame(date1Second, date2Second, "second")).toBe(true);
      expect(adapter.isSame(date1Second, date3Second, "second")).toBe(false);

      // Decade
      const date1Decade = new Date(2020, 0, 1);
      const date2Decade = new Date(2029, 11, 31);
      const date3Decade = new Date(2030, 0, 1);
      expect(adapter.isSame(date1Decade, date2Decade, "decade")).toBe(true);
      expect(adapter.isSame(date1Decade, date3Decade, "decade")).toBe(false);

      // Century
      const date1Century = new Date(2000, 0, 1);
      const date2Century = new Date(2099, 11, 31);
      const date3Century = new Date(2100, 0, 1);
      expect(adapter.isSame(date1Century, date2Century, "century")).toBe(true);
      expect(adapter.isSame(date1Century, date3Century, "century")).toBe(false);

      // Millennium
      const date1Millennium = new Date(2000, 0, 1);
      const date2Millennium = new Date(2999, 11, 31);
      const date3Millennium = new Date(3000, 0, 1);
      expect(
        adapter.isSame(date1Millennium, date2Millennium, "millennium")
      ).toBe(true);
      expect(
        adapter.isSame(date1Millennium, date3Millennium, "millennium")
      ).toBe(false);

      // Unknown unit - exact time comparison
      const dateExact1 = new Date(2024, 5, 15, 14, 30, 45, 123);
      const dateExact2 = new Date(2024, 5, 15, 14, 30, 45, 123);
      const dateExact3 = new Date(2024, 5, 15, 14, 30, 45, 124);
      expect(adapter.isSame(dateExact1, dateExact2, "unknown" as any)).toBe(
        true
      );
      expect(adapter.isSame(dateExact1, dateExact3, "unknown" as any)).toBe(
        false
      );
    });

    it("should handle eachInterval for all units", () => {
      // Year
      const yearStart = new Date(2020, 0, 1);
      const yearEnd = new Date(2023, 0, 1);
      const years = adapter.eachInterval(yearStart, yearEnd, "year");
      expect(years).toHaveLength(4);
      expect(years[0].getFullYear()).toBe(2020);
      expect(years[3].getFullYear()).toBe(2023);

      // Week
      const weekStart = new Date(2024, 5, 1);
      const weekEnd = new Date(2024, 5, 22);
      const weeks = adapter.eachInterval(weekStart, weekEnd, "week");
      expect(weeks.length).toBeGreaterThanOrEqual(3);
      // Check 7 days apart
      for (let i = 1; i < weeks.length; i++) {
        const diff =
          (weeks[i].getTime() - weeks[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        expect(diff).toBe(7);
      }

      // Hour
      const hourStart = new Date(2024, 5, 15, 10, 0, 0);
      const hourEnd = new Date(2024, 5, 15, 14, 0, 0);
      const hours = adapter.eachInterval(hourStart, hourEnd, "hour");
      expect(hours).toHaveLength(5);
      expect(hours[0].getHours()).toBe(10);
      expect(hours[4].getHours()).toBe(14);

      // Minute
      const minuteStart = new Date(2024, 5, 15, 10, 0, 0);
      const minuteEnd = new Date(2024, 5, 15, 10, 3, 0);
      const minutes = adapter.eachInterval(minuteStart, minuteEnd, "minute");
      expect(minutes).toHaveLength(4);
      expect(minutes[0].getMinutes()).toBe(0);
      expect(minutes[3].getMinutes()).toBe(3);

      // Unknown unit - should only return start
      const unknownStart = new Date(2024, 5, 15);
      const unknownEnd = new Date(2024, 5, 20);
      const unknown = adapter.eachInterval(
        unknownStart,
        unknownEnd,
        "unknown" as any
      );
      expect(unknown).toHaveLength(1);
      expect(unknown[0].getTime()).toBe(unknownStart.getTime());

      // Empty interval when start > end
      const emptyStart = new Date(2024, 5, 20);
      const emptyEnd = new Date(2024, 5, 15);
      const empty = adapter.eachInterval(emptyStart, emptyEnd, "day");
      expect(empty).toHaveLength(0);
    });

    it("should handle empty duration in add/subtract", () => {
      const date = new Date(2024, 5, 15);

      const addEmpty = adapter.add(date, {});
      expect(addEmpty.getTime()).toBe(date.getTime());

      const subtractEmpty = adapter.subtract(date, {});
      expect(subtractEmpty.getTime()).toBe(date.getTime());
    });
  });
});
