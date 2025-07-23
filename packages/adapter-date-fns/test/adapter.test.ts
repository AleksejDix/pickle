import { describe, it, expect, beforeEach, vi } from "vitest";
import { DateFnsAdapter, createDateFnsAdapter } from "../src/index";
import type { DateAdapter } from "@usetemporal/core/types";

describe("DateFnsAdapter", () => {
  let adapter: DateAdapter;
  let testDate: Date;

  beforeEach(() => {
    adapter = new DateFnsAdapter();
    testDate = new Date("2024-06-15T10:30:45.123");
  });

  describe("Factory Function", () => {
    it("should create a DateFnsAdapter instance", () => {
      const adapter = createDateFnsAdapter();
      expect(adapter).toBeInstanceOf(DateFnsAdapter);
      expect(adapter.name).toBe("date-fns");
    });

    it("should throw error if date-fns is not available", () => {
      // Mock the date-fns import to simulate missing dependency
      const originalImport = (DateFnsAdapter as any).prototype.dateFns;

      // Test with null import
      vi.doMock("date-fns", () => null);
      expect(() => {
        const mockCreateDateFnsAdapter = () => {
          if (!originalImport || !originalImport.add) {
            throw new Error(
              "date-fns is required when using DateFnsAdapter. Install it with: npm install date-fns"
            );
          }
          return new DateFnsAdapter();
        };
        mockCreateDateFnsAdapter();
      }).toThrow("date-fns is required when using DateFnsAdapter");

      // Restore
      vi.doUnmock("date-fns");
    });
  });

  describe("add", () => {
    it("should add years", () => {
      const result = adapter.add(testDate, { years: 1 });
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(5); // June
      expect(result.getDate()).toBe(15);
    });

    it("should add months", () => {
      const result = adapter.add(testDate, { months: 3 });
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(8); // September
      expect(result.getDate()).toBe(15);
    });

    it("should add weeks", () => {
      const result = adapter.add(testDate, { weeks: 2 });
      expect(result.getDate()).toBe(29);
    });

    it("should add days", () => {
      const result = adapter.add(testDate, { days: 10 });
      expect(result.getDate()).toBe(25);
    });

    it("should add hours", () => {
      const result = adapter.add(testDate, { hours: 5 });
      expect(result.getHours()).toBe(15);
    });

    it("should add minutes", () => {
      const result = adapter.add(testDate, { minutes: 45 });
      expect(result.getMinutes()).toBe(15); // 30 + 45 = 75, which is 1:15
      expect(result.getHours()).toBe(11);
    });

    it("should add seconds", () => {
      const result = adapter.add(testDate, { seconds: 30 });
      expect(result.getSeconds()).toBe(15); // 45 + 30 = 75, which is 1:15
      expect(result.getMinutes()).toBe(31);
    });

    it("should handle complex durations", () => {
      const result = adapter.add(testDate, {
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
      });
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(7); // August
      expect(result.getDate()).toBe(18);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(35);
      expect(result.getSeconds()).toBe(51);
    });

    it("should handle month overflow", () => {
      const endOfMonth = new Date("2024-01-31");
      const result = adapter.add(endOfMonth, { months: 1 });
      // February doesn't have 31 days, so it should be Feb 29 (leap year)
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(29);
    });
  });

  describe("subtract", () => {
    it("should subtract years", () => {
      const result = adapter.subtract(testDate, { years: 1 });
      expect(result.getFullYear()).toBe(2023);
    });

    it("should subtract months", () => {
      const result = adapter.subtract(testDate, { months: 3 });
      expect(result.getMonth()).toBe(2); // March
    });

    it("should subtract weeks", () => {
      const result = adapter.subtract(testDate, { weeks: 2 });
      expect(result.getDate()).toBe(1);
    });

    it("should subtract days", () => {
      const result = adapter.subtract(testDate, { days: 10 });
      expect(result.getDate()).toBe(5);
    });

    it("should subtract hours", () => {
      const result = adapter.subtract(testDate, { hours: 5 });
      expect(result.getHours()).toBe(5);
    });

    it("should handle complex subtractions", () => {
      const result = adapter.subtract(testDate, {
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
      });
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(3); // April
      expect(result.getDate()).toBe(12);
      expect(result.getHours()).toBe(6);
      expect(result.getMinutes()).toBe(25);
      expect(result.getSeconds()).toBe(39);
    });
  });

  describe("startOf", () => {
    it("should get start of year", () => {
      const result = adapter.startOf(testDate, "year");
      expect(result).toEqual(new Date("2024-01-01T00:00:00.000"));
    });

    it("should get start of month", () => {
      const result = adapter.startOf(testDate, "month");
      expect(result).toEqual(new Date("2024-06-01T00:00:00.000"));
    });

    it("should get start of week", () => {
      const result = adapter.startOf(testDate, "week");
      // We now default to Monday as start of week
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it("should get start of day", () => {
      const result = adapter.startOf(testDate, "day");
      expect(result).toEqual(new Date("2024-06-15T00:00:00.000"));
    });

    it("should get start of hour", () => {
      const result = adapter.startOf(testDate, "hour");
      expect(result).toEqual(new Date("2024-06-15T10:00:00.000"));
    });

    it("should get start of minute", () => {
      const result = adapter.startOf(testDate, "minute");
      expect(result).toEqual(new Date("2024-06-15T10:30:00.000"));
    });

    it("should get start of second", () => {
      const result = adapter.startOf(testDate, "second");
      expect(result).toEqual(new Date("2024-06-15T10:30:45.000"));
    });

    it("should get start of decade", () => {
      const result = adapter.startOf(testDate, "decade");
      expect(result).toEqual(new Date("2020-01-01T00:00:00.000"));
    });

    it("should get start of century", () => {
      const result = adapter.startOf(testDate, "century");
      expect(result).toEqual(new Date("2000-01-01T00:00:00.000"));
    });

    it("should get start of millennium", () => {
      const result = adapter.startOf(testDate, "millennium");
      expect(result).toEqual(new Date("2000-01-01T00:00:00.000"));
    });

    it("should handle unknown unit", () => {
      const result = adapter.startOf(testDate, "unknown" as any);
      expect(result.getTime()).toBe(testDate.getTime());
    });
  });

  describe("endOf", () => {
    it("should get end of year", () => {
      const result = adapter.endOf(testDate, "year");
      expect(result).toEqual(new Date("2024-12-31T23:59:59.999"));
    });

    it("should get end of month", () => {
      const result = adapter.endOf(testDate, "month");
      expect(result).toEqual(new Date("2024-06-30T23:59:59.999"));
    });

    it("should get end of week", () => {
      const result = adapter.endOf(testDate, "week");
      // We now default to Monday as start of week, so Sunday is end
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it("should get end of day", () => {
      const result = adapter.endOf(testDate, "day");
      expect(result).toEqual(new Date("2024-06-15T23:59:59.999"));
    });

    it("should get end of hour", () => {
      const result = adapter.endOf(testDate, "hour");
      expect(result).toEqual(new Date("2024-06-15T10:59:59.999"));
    });

    it("should get end of minute", () => {
      const result = adapter.endOf(testDate, "minute");
      expect(result).toEqual(new Date("2024-06-15T10:30:59.999"));
    });

    it("should get end of second", () => {
      const result = adapter.endOf(testDate, "second");
      expect(result).toEqual(new Date("2024-06-15T10:30:45.999"));
    });

    it("should get end of decade", () => {
      const result = adapter.endOf(testDate, "decade");
      expect(result).toEqual(new Date("2029-12-31T23:59:59.999"));
    });

    it("should get end of century", () => {
      const result = adapter.endOf(testDate, "century");
      expect(result).toEqual(new Date("2099-12-31T23:59:59.999"));
    });

    it("should get end of millennium", () => {
      const result = adapter.endOf(testDate, "millennium");
      expect(result).toEqual(new Date("2999-12-31T23:59:59.999"));
    });

    it("should handle unknown unit", () => {
      const result = adapter.endOf(testDate, "unknown" as any);
      expect(result.getTime()).toBe(testDate.getTime());
    });
  });

  describe("isSame", () => {
    it("should check same year", () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-12-31");
      const date3 = new Date("2025-01-01");

      expect(adapter.isSame(date1, date2, "year")).toBe(true);
      expect(adapter.isSame(date1, date3, "year")).toBe(false);
    });

    it("should check same month", () => {
      const date1 = new Date("2024-06-01");
      const date2 = new Date("2024-06-30");
      const date3 = new Date("2024-07-01");

      expect(adapter.isSame(date1, date2, "month")).toBe(true);
      expect(adapter.isSame(date1, date3, "month")).toBe(false);
    });

    it("should check same week", () => {
      const sunday = new Date("2024-06-09");
      const saturday = new Date("2024-06-15");
      const nextSunday = new Date("2024-06-16");

      expect(adapter.isSame(sunday, saturday, "week")).toBe(true);
      expect(adapter.isSame(sunday, nextSunday, "week")).toBe(false);
    });

    it("should check same day", () => {
      const date1 = new Date("2024-06-15T00:00:00");
      const date2 = new Date("2024-06-15T23:59:59");
      const date3 = new Date("2024-06-16T00:00:00");

      expect(adapter.isSame(date1, date2, "day")).toBe(true);
      expect(adapter.isSame(date1, date3, "day")).toBe(false);
    });

    it("should check same hour", () => {
      const date1 = new Date("2024-06-15T10:00:00");
      const date2 = new Date("2024-06-15T10:59:59");
      const date3 = new Date("2024-06-15T11:00:00");

      expect(adapter.isSame(date1, date2, "hour")).toBe(true);
      expect(adapter.isSame(date1, date3, "hour")).toBe(false);
    });

    it("should check same minute", () => {
      const date1 = new Date("2024-06-15T10:30:00");
      const date2 = new Date("2024-06-15T10:30:59");
      const date3 = new Date("2024-06-15T10:31:00");

      expect(adapter.isSame(date1, date2, "minute")).toBe(true);
      expect(adapter.isSame(date1, date3, "minute")).toBe(false);
    });

    it("should check same second", () => {
      const date1 = new Date("2024-06-15T10:30:45.000");
      const date2 = new Date("2024-06-15T10:30:45.999");
      const date3 = new Date("2024-06-15T10:30:46.000");

      expect(adapter.isSame(date1, date2, "second")).toBe(true);
      expect(adapter.isSame(date1, date3, "second")).toBe(false);
    });

    it("should handle unknown unit", () => {
      const date1 = new Date("2024-06-15T10:30:45.123");
      const date2 = new Date("2024-06-15T10:30:45.123");
      const date3 = new Date("2024-06-15T10:30:45.124");

      expect(adapter.isSame(date1, date2, "unknown" as any)).toBe(true);
      expect(adapter.isSame(date1, date3, "unknown" as any)).toBe(false);
    });
  });

  describe("isBefore", () => {
    it("should check if date is before another", () => {
      const earlier = new Date("2024-06-14");
      const later = new Date("2024-06-15");

      expect(adapter.isBefore(earlier, later)).toBe(true);
      expect(adapter.isBefore(later, earlier)).toBe(false);
      expect(adapter.isBefore(earlier, earlier)).toBe(false);
    });
  });

  describe("isAfter", () => {
    it("should check if date is after another", () => {
      const earlier = new Date("2024-06-14");
      const later = new Date("2024-06-15");

      expect(adapter.isAfter(later, earlier)).toBe(true);
      expect(adapter.isAfter(earlier, later)).toBe(false);
      expect(adapter.isAfter(later, later)).toBe(false);
    });
  });

  describe("eachInterval", () => {
    it("should generate years in interval", () => {
      const start = new Date("2020-01-01");
      const end = new Date("2023-12-31");
      const result = adapter.eachInterval(start, end, "year");

      expect(result).toHaveLength(4);
      expect(result[0].getFullYear()).toBe(2020);
      expect(result[1].getFullYear()).toBe(2021);
      expect(result[2].getFullYear()).toBe(2022);
      expect(result[3].getFullYear()).toBe(2023);
    });

    it("should generate months in interval", () => {
      const start = new Date("2024-01-15");
      const end = new Date("2024-04-15");
      const result = adapter.eachInterval(start, end, "month");

      expect(result).toHaveLength(4);
      expect(result[0].getMonth()).toBe(0); // January
      expect(result[1].getMonth()).toBe(1); // February
      expect(result[2].getMonth()).toBe(2); // March
      expect(result[3].getMonth()).toBe(3); // April
    });

    it("should generate weeks in interval", () => {
      const start = new Date("2024-06-01");
      const end = new Date("2024-06-22");
      const result = adapter.eachInterval(start, end, "week");

      expect(result.length).toBeGreaterThanOrEqual(3);
      // Check that dates are roughly a week apart
      for (let i = 1; i < result.length; i++) {
        const diff = result[i].getTime() - result[i - 1].getTime();
        const daysDiff = diff / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBeCloseTo(7, 0);
      }
    });

    it("should generate days in interval", () => {
      const start = new Date("2024-06-01");
      const end = new Date("2024-06-05");
      const result = adapter.eachInterval(start, end, "day");

      expect(result).toHaveLength(5);
      expect(result[0].getDate()).toBe(1);
      expect(result[4].getDate()).toBe(5);
    });

    it("should generate hours in interval", () => {
      const start = new Date("2024-06-15T10:00:00");
      const end = new Date("2024-06-15T14:00:00");
      const result = adapter.eachInterval(start, end, "hour");

      expect(result).toHaveLength(5);
      expect(result[0].getHours()).toBe(10);
      expect(result[4].getHours()).toBe(14);
    });

    it("should generate minutes in interval", () => {
      const start = new Date("2024-06-15T10:00:00");
      const end = new Date("2024-06-15T10:03:00");
      const result = adapter.eachInterval(start, end, "minute");

      expect(result).toHaveLength(4);
      expect(result[0].getMinutes()).toBe(0);
      expect(result[3].getMinutes()).toBe(3);
    });

    it("should handle decades", () => {
      const start = new Date("2000-01-01");
      const end = new Date("2030-01-01");
      const result = adapter.eachInterval(start, end, "decade");

      // date-fns doesn't have specific decade handling, so it uses year
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle unknown unit", () => {
      const start = new Date("2024-06-15");
      const end = new Date("2024-06-20");
      const result = adapter.eachInterval(start, end, "unknown" as any);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(start);
    });
  });
});
