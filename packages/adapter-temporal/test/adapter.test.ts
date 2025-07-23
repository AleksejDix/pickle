import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import { TemporalAdapter, createTemporalAdapter } from "../src/index";
import type { DateAdapter } from "@usetemporal/core/types";

// Mock Temporal API
const mockTemporal = {
  Instant: {
    fromEpochMilliseconds: (ms: number) => ({
      epochMilliseconds: ms,
      toZonedDateTimeISO: (tz: string) => ({
        year: new Date(ms).getFullYear(),
        month: new Date(ms).getMonth() + 1,
        day: new Date(ms).getDate(),
        hour: new Date(ms).getHours(),
        minute: new Date(ms).getMinutes(),
        second: new Date(ms).getSeconds(),
        millisecond: new Date(ms).getMilliseconds(),
        dayOfWeek: new Date(ms).getDay() === 0 ? 7 : new Date(ms).getDay(),
        daysInMonth: new Date(
          new Date(ms).getFullYear(),
          new Date(ms).getMonth() + 1,
          0
        ).getDate(),
        timeZone: tz,
        epochMilliseconds: ms,
        toPlainDate: () => ({
          year: new Date(ms).getFullYear(),
          month: new Date(ms).getMonth() + 1,
          day: new Date(ms).getDate(),
          dayOfWeek: new Date(ms).getDay() === 0 ? 7 : new Date(ms).getDay(),
          daysInMonth: new Date(
            new Date(ms).getFullYear(),
            new Date(ms).getMonth() + 1,
            0
          ).getDate(),
          equals: function (other: any) {
            const d1 = new Date(ms);
            // Handle both plain date objects and other date representations
            let d2;
            if (other.toPlainDate) {
              const pd = other.toPlainDate();
              d2 = new Date(pd.year || 2024, (pd.month || 1) - 1, pd.day || 1);
            } else if (other._date) {
              d2 = other._date;
            } else if (other.epochMilliseconds !== undefined) {
              d2 = new Date(other.epochMilliseconds);
            } else {
              d2 = new Date(
                other.year || 2024,
                (other.month || 1) - 1,
                other.day || 1
              );
            }
            return (
              d1.getFullYear() === d2.getFullYear() &&
              d1.getMonth() === d2.getMonth() &&
              d1.getDate() === d2.getDate()
            );
          },
          with: (fields: any) => ({
            day: fields.day,
            _date: new Date(
              new Date(ms).getFullYear(),
              new Date(ms).getMonth(),
              fields.day || new Date(ms).getDate()
            ),
          }),
        }),
        with: function (fields: any) {
          const d = new Date(ms);
          if (fields.year !== undefined) d.setFullYear(fields.year);
          if (fields.month !== undefined) d.setMonth(fields.month - 1);
          if (fields.day !== undefined) d.setDate(fields.day);
          if (fields.hour !== undefined) d.setHours(fields.hour);
          if (fields.minute !== undefined) d.setMinutes(fields.minute);
          if (fields.second !== undefined) d.setSeconds(fields.second);
          if (fields.millisecond !== undefined)
            d.setMilliseconds(fields.millisecond);
          return mockTemporal.Instant.fromEpochMilliseconds(
            d.getTime()
          ).toZonedDateTimeISO(tz);
        },
        add: function (duration: any) {
          const d = new Date(ms);
          if (duration.years) d.setFullYear(d.getFullYear() + duration.years);
          if (duration.months) d.setMonth(d.getMonth() + duration.months);
          if (duration.weeks) d.setDate(d.getDate() + duration.weeks * 7);
          if (duration.days) d.setDate(d.getDate() + duration.days);
          if (duration.hours) d.setHours(d.getHours() + duration.hours);
          if (duration.minutes) d.setMinutes(d.getMinutes() + duration.minutes);
          if (duration.seconds) d.setSeconds(d.getSeconds() + duration.seconds);
          if (duration.milliseconds)
            d.setMilliseconds(d.getMilliseconds() + duration.milliseconds);
          return mockTemporal.Instant.fromEpochMilliseconds(
            d.getTime()
          ).toZonedDateTimeISO(tz);
        },
        subtract: function (duration: any) {
          const d = new Date(ms);
          if (duration.years) d.setFullYear(d.getFullYear() - duration.years);
          if (duration.months) d.setMonth(d.getMonth() - duration.months);
          if (duration.weeks) d.setDate(d.getDate() - duration.weeks * 7);
          if (duration.days) d.setDate(d.getDate() - duration.days);
          if (duration.hours) d.setHours(d.getHours() - duration.hours);
          if (duration.minutes) d.setMinutes(d.getMinutes() - duration.minutes);
          if (duration.seconds) d.setSeconds(d.getSeconds() - duration.seconds);
          if (duration.milliseconds)
            d.setMilliseconds(d.getMilliseconds() - duration.milliseconds);
          return mockTemporal.Instant.fromEpochMilliseconds(
            d.getTime()
          ).toZonedDateTimeISO(tz);
        },
      }),
    }),
    compare: (a: any, b: any) => {
      const diff = a.epochMilliseconds - b.epochMilliseconds;
      return diff < 0 ? -1 : diff > 0 ? 1 : 0;
    },
  },
  Now: {
    timeZone: () => "UTC",
  },
};

describe("TemporalAdapter", () => {
  let adapter: DateAdapter;
  let testDate: Date;

  beforeAll(() => {
    // Set up Temporal mock
    (globalThis as any).Temporal = mockTemporal;
  });

  afterAll(() => {
    // Clean up
    delete (globalThis as any).Temporal;
  });

  beforeEach(() => {
    adapter = new TemporalAdapter();
    testDate = new Date("2024-06-15T10:30:45.123");
  });

  describe("Factory Function", () => {
    it("should create a TemporalAdapter instance", () => {
      const adapter = createTemporalAdapter();
      expect(adapter).toBeInstanceOf(TemporalAdapter);
      expect(adapter.name).toBe("temporal");
    });

    it("should throw error if Temporal API is not available", () => {
      const originalTemporal = (globalThis as any).Temporal;
      delete (globalThis as any).Temporal;

      expect(() => createTemporalAdapter()).toThrow(
        "Temporal API is not available in this environment"
      );

      (globalThis as any).Temporal = originalTemporal;
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

    it("should add milliseconds", () => {
      const result = adapter.add(testDate, { milliseconds: 500 });
      expect(result.getMilliseconds()).toBe(623); // 123 + 500
    });

    it("should handle complex durations", () => {
      const result = adapter.add(testDate, {
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
        milliseconds: 7,
      });
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(7); // August
      expect(result.getDate()).toBe(18);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(35);
      expect(result.getSeconds()).toBe(51);
      expect(result.getMilliseconds()).toBe(130); // 123 + 7
    });

    it("should add nothing when duration is empty", () => {
      const result = adapter.add(testDate, {});
      expect(result.getTime()).toBe(testDate.getTime());
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

    it("should subtract nothing when duration is empty", () => {
      const result = adapter.subtract(testDate, {});
      expect(result.getTime()).toBe(testDate.getTime());
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

    it("should check same day", () => {
      const date1 = new Date("2024-06-15T00:00:00");
      const date2 = new Date("2024-06-15T23:59:59");
      const date3 = new Date("2024-06-16T00:00:00");

      expect(adapter.isSame(date1, date2, "day")).toBe(true);
      expect(adapter.isSame(date1, date3, "day")).toBe(false);
    });

    it("should check same decade", () => {
      const date1 = new Date("2020-01-01");
      const date2 = new Date("2029-12-31");
      const date3 = new Date("2030-01-01");

      expect(adapter.isSame(date1, date2, "decade")).toBe(true);
      expect(adapter.isSame(date1, date3, "decade")).toBe(false);
    });

    it("should check same century", () => {
      const date1 = new Date("2000-01-01");
      const date2 = new Date("2099-12-31");
      const date3 = new Date("2100-01-01");

      expect(adapter.isSame(date1, date2, "century")).toBe(true);
      expect(adapter.isSame(date1, date3, "century")).toBe(false);
    });

    it("should check same millennium", () => {
      const date1 = new Date("2000-01-01");
      const date2 = new Date("2999-12-31");
      const date3 = new Date("3000-01-01");

      expect(adapter.isSame(date1, date2, "millennium")).toBe(true);
      expect(adapter.isSame(date1, date3, "millennium")).toBe(false);
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

    it("should generate days in interval", () => {
      const start = new Date("2024-06-01");
      const end = new Date("2024-06-05");
      const result = adapter.eachInterval(start, end, "day");

      expect(result).toHaveLength(5);
      expect(result[0].getDate()).toBe(1);
      expect(result[4].getDate()).toBe(5);
    });

    it("should handle unknown unit", () => {
      // Create a mock console.warn to suppress warning
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const start = new Date("2024-06-15");
      const end = new Date("2024-06-20");
      const result = adapter.eachInterval(start, end, "unknown" as any);

      // For unknown unit, it should break after the second iteration due to no advance
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toEqual(start);

      warnSpy.mockRestore();
    });

    it("should handle infinite loop protection", () => {
      // Create a mock console.warn
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Try to generate a very large interval that would hit the limit
      const start = new Date("1900-01-01");
      const end = new Date("2200-01-01"); // 300 years of days = ~109,500 days
      const result = adapter.eachInterval(start, end, "day");

      // Should hit the max iterations limit of 100,000
      expect(result.length).toBe(100000);
      expect(warnSpy).toHaveBeenCalledWith(
        "TemporalAdapter eachInterval: Maximum iterations reached, breaking to prevent infinite loop"
      );

      warnSpy.mockRestore();
    });
  });

  describe("Error handling", () => {
    it("should throw error when accessing temporal getter without API", () => {
      const originalTemporal = (globalThis as any).Temporal;
      delete (globalThis as any).Temporal;

      const adapter = new TemporalAdapter();
      expect(() => adapter.add(testDate, { days: 1 })).toThrow(
        "Temporal API is not available in this environment"
      );

      (globalThis as any).Temporal = originalTemporal;
    });
  });
});
