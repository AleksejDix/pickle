import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  TemporalAdapter,
  createTemporalAdapter,
} from "../../lib/adapters/temporal-api";
import { createTestDate } from "../setup";

// Mock the global Temporal API for testing
const mockTemporal = {
  Instant: {
    fromEpochMilliseconds: vi.fn(),
    compare: vi.fn(),
  },
  Now: {
    timeZone: vi.fn(),
  },
  PlainDate: {
    from: vi.fn(),
  },
  ZonedDateTime: {
    from: vi.fn(),
  },
};

const mockZonedDateTime = {
  year: 2024,
  month: 3,
  day: 15,
  hour: 14,
  minute: 30,
  second: 45,
  epochMilliseconds: 1710508245000,
  add: vi.fn(),
  subtract: vi.fn(),
  with: vi.fn(),
  toPlainDate: vi.fn(),
};

const mockPlainDate = {
  year: 2024,
  month: 3,
  day: 15,
  dayOfWeek: 4, // Thursday
  daysInMonth: 31,
  with: vi.fn(),
  equals: vi.fn(),
  add: vi.fn(),
  subtract: vi.fn(),
};

const mockInstant = {
  toZonedDateTimeISO: vi.fn(),
  equals: vi.fn(),
};

describe("TemporalAdapter", () => {
  let adapter: TemporalAdapter;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock return values
    mockTemporal.Instant.fromEpochMilliseconds.mockReturnValue(mockInstant);
    mockTemporal.Now.timeZone.mockReturnValue("UTC");
    mockTemporal.PlainDate.from.mockReturnValue(mockPlainDate);
    mockTemporal.ZonedDateTime.from.mockReturnValue(mockZonedDateTime);
    mockInstant.toZonedDateTimeISO.mockReturnValue(mockZonedDateTime);
    mockZonedDateTime.toPlainDate.mockReturnValue(mockPlainDate);
    mockZonedDateTime.add.mockReturnValue(mockZonedDateTime);
    mockZonedDateTime.subtract.mockReturnValue(mockZonedDateTime);
    mockZonedDateTime.with.mockReturnValue(mockZonedDateTime);
    mockPlainDate.with.mockReturnValue(mockPlainDate);
    mockPlainDate.add.mockReturnValue(mockPlainDate);
    mockPlainDate.subtract.mockReturnValue(mockPlainDate);
    mockPlainDate.equals.mockReturnValue(true);

    // Mock globalThis.Temporal
    (globalThis as any).Temporal = mockTemporal;

    adapter = new TemporalAdapter();
  });

  describe("Adapter Identity", () => {
    it("should have correct name", () => {
      expect(adapter.name).toBe("temporal");
    });

    it("should create adapter instance via factory", () => {
      const factoryAdapter = createTemporalAdapter();
      expect(factoryAdapter).toBeInstanceOf(TemporalAdapter);
      expect(factoryAdapter.name).toBe("temporal");
    });
  });

  describe("Temporal API Availability", () => {
    it("should throw error when Temporal API is not available", () => {
      delete (globalThis as any).Temporal;

      expect(() => {
        new TemporalAdapter().add(new Date(), { years: 1 });
      }).toThrow("Temporal API is not available in this environment");
    });

    it("should provide helpful error message", () => {
      delete (globalThis as any).Temporal;

      expect(() => {
        new TemporalAdapter().add(new Date(), { years: 1 });
      }).toThrow(/Please use a polyfill or different adapter/);
    });
  });

  describe("Date Addition", () => {
    it("should add years using Temporal API", () => {
      const date = createTestDate(2024, 0, 15);
      const result = adapter.add(date, { years: 2 });

      expect(mockTemporal.Instant.fromEpochMilliseconds).toHaveBeenCalledWith(
        date.getTime()
      );
      expect(mockZonedDateTime.add).toHaveBeenCalledWith({ years: 2 });
      expect(result).toBeInstanceOf(Date);
    });

    it("should add multiple duration units", () => {
      const date = createTestDate(2024, 0, 15);
      adapter.add(date, {
        years: 1,
        months: 2,
        weeks: 1,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
        milliseconds: 7,
      });

      expect(mockZonedDateTime.add).toHaveBeenCalledTimes(8);
    });

    it("should handle zero duration", () => {
      const date = createTestDate(2024, 0, 15);
      const result = adapter.add(date, {});

      expect(result).toBeInstanceOf(Date);
      expect(mockZonedDateTime.add).not.toHaveBeenCalled();
    });
  });

  describe("Date Subtraction", () => {
    it("should subtract dates using Temporal API", () => {
      const date = createTestDate(2024, 5, 15);
      adapter.subtract(date, { months: 3 });

      expect(mockZonedDateTime.subtract).toHaveBeenCalledWith({ months: 3 });
    });

    it("should subtract multiple duration units", () => {
      const date = createTestDate(2024, 5, 15);
      adapter.subtract(date, {
        years: 1,
        days: 10,
        hours: 5,
      });

      expect(mockZonedDateTime.subtract).toHaveBeenCalledTimes(3);
    });
  });

  describe("Start/End of Period", () => {
    it("should find start of year", () => {
      const date = createTestDate(2024, 7, 15, 14, 30);
      adapter.startOf(date, "year");

      expect(mockZonedDateTime.with).toHaveBeenCalledWith({
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    });

    it("should find start of month", () => {
      const date = createTestDate(2024, 7, 15, 14, 30);
      adapter.startOf(date, "month");

      expect(mockZonedDateTime.with).toHaveBeenCalledWith({
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    });

    it("should find start of week (Sunday)", () => {
      mockPlainDate.dayOfWeek = 4; // Thursday
      const date = createTestDate(2024, 0, 18); // Thursday
      adapter.startOf(date, "week");

      expect(mockZonedDateTime.subtract).toHaveBeenCalledWith({ days: 4 });
      expect(mockZonedDateTime.with).toHaveBeenCalledWith({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    });

    it("should handle start of week when date is Sunday", () => {
      mockPlainDate.dayOfWeek = 7; // Sunday
      const date = createTestDate(2024, 0, 21); // Sunday
      adapter.startOf(date, "week");

      expect(mockZonedDateTime.subtract).toHaveBeenCalledWith({ days: 0 });
    });

    it("should find start of decade", () => {
      mockZonedDateTime.year = 2024;
      const date = createTestDate(2024, 5, 15);
      adapter.startOf(date, "decade");

      expect(mockZonedDateTime.with).toHaveBeenCalledWith({
        year: 2020,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    });

    it("should find end of month with correct days", () => {
      mockPlainDate.daysInMonth = 29; // February in leap year
      const date = createTestDate(2024, 1, 15); // February
      adapter.endOf(date, "month");

      expect(mockPlainDate.with).toHaveBeenCalledWith({ day: 29 });
    });

    it("should find end of week (Saturday)", () => {
      mockPlainDate.dayOfWeek = 3; // Wednesday
      const date = createTestDate(2024, 0, 17); // Wednesday
      adapter.endOf(date, "week");

      expect(mockZonedDateTime.add).toHaveBeenCalledWith({ days: 3 });
    });
  });

  describe("Date Comparison", () => {
    it("should compare years correctly", () => {
      const date1 = createTestDate(2024, 3, 15);
      const date2 = createTestDate(2024, 8, 22);

      mockZonedDateTime.year = 2024;
      const result = adapter.isSame(date1, date2, "year");

      expect(mockTemporal.Instant.fromEpochMilliseconds).toHaveBeenCalledTimes(
        2
      );
      expect(result).toBe(true);
    });

    it("should compare months correctly", () => {
      const date1 = createTestDate(2024, 3, 15);
      const date2 = createTestDate(2024, 3, 22);

      // Create separate mock objects for each date to avoid conflicts
      const mockZoned1 = {
        year: 2024,
        month: 4,
        toPlainDate: vi.fn().mockReturnValue(mockPlainDate),
      };
      const mockZoned2 = {
        year: 2024,
        month: 4,
        toPlainDate: vi.fn().mockReturnValue(mockPlainDate),
      };

      mockInstant.toZonedDateTimeISO
        .mockReturnValueOnce(mockZoned1)
        .mockReturnValueOnce(mockZoned2);

      const result = adapter.isSame(date1, date2, "month");
      expect(result).toBe(true);
    });

    it("should compare days using PlainDate.equals", () => {
      const date1 = createTestDate(2024, 3, 15);
      const date2 = createTestDate(2024, 3, 15);

      mockPlainDate.equals.mockReturnValue(true);
      const result = adapter.isSame(date1, date2, "day");

      expect(mockPlainDate.equals).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should check before/after relationships", () => {
      const earlier = createTestDate(2024, 0, 15);
      const later = createTestDate(2024, 0, 20);

      mockTemporal.Instant.compare.mockReturnValue(-1);
      const isBeforeResult = adapter.isBefore(earlier, later);

      mockTemporal.Instant.compare.mockReturnValue(1);
      const isAfterResult = adapter.isAfter(later, earlier);

      expect(isBeforeResult).toBe(true);
      expect(isAfterResult).toBe(true);
    });
  });

  describe("Weekday and Weekend Utilities", () => {
    it("should convert Temporal weekday to JS weekday", () => {
      mockPlainDate.dayOfWeek = 7; // Sunday in Temporal
      const date = createTestDate(2024, 0, 7);

      const result = adapter.getWeekday(date);
      expect(result).toBe(0); // Sunday in JS
    });

    it("should convert Monday correctly", () => {
      mockPlainDate.dayOfWeek = 1; // Monday in Temporal
      const date = createTestDate(2024, 0, 8);

      const result = adapter.getWeekday(date);
      expect(result).toBe(1); // Monday in JS
    });

    it("should adjust weekday for different week starts", () => {
      mockPlainDate.dayOfWeek = 7; // Sunday in Temporal
      const date = createTestDate(2024, 0, 7);

      const result = adapter.getWeekday(date, { weekStartsOn: 1 });
      expect(result).toBe(6); // Sunday when week starts on Monday
    });

    it("should identify weekends correctly", () => {
      mockPlainDate.dayOfWeek = 6; // Saturday
      expect(adapter.isWeekend(createTestDate(2024, 0, 6))).toBe(true);

      mockPlainDate.dayOfWeek = 7; // Sunday
      expect(adapter.isWeekend(createTestDate(2024, 0, 7))).toBe(true);

      mockPlainDate.dayOfWeek = 1; // Monday
      expect(adapter.isWeekend(createTestDate(2024, 0, 8))).toBe(false);
    });
  });

  describe("Interval Generation", () => {
    it("should generate intervals using recursive add", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 0, 3);

      // Mock the add method to increment dates properly
      let callCount = 0;
      adapter.add = vi.fn().mockImplementation((_date, _duration) => {
        callCount++;
        if (callCount === 1) return createTestDate(2024, 0, 2);
        if (callCount === 2) return createTestDate(2024, 0, 3);
        return createTestDate(2024, 0, 4); // Beyond end date to break loop
      });

      const result = adapter.eachInterval(start, end, "day");

      expect(result).toHaveLength(3);
      expect(adapter.add).toHaveBeenCalledWith(expect.any(Date), { days: 1 });
    });

    it("should handle different time units", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 2, 1);

      // Mock add method to properly advance months and break the loop
      let monthCallCount = 0;
      adapter.add = vi.fn().mockImplementation((_, duration) => {
        if (duration.months) {
          monthCallCount++;
          if (monthCallCount === 1) return createTestDate(2024, 1, 1); // Feb 1
          if (monthCallCount === 2) return createTestDate(2024, 2, 1); // Mar 1
          return createTestDate(2024, 3, 1); // Beyond end date to break loop
        }
        return createTestDate(2024, 3, 1); // Default beyond end
      });

      const result = adapter.eachInterval(start, end, "month");

      expect(adapter.add).toHaveBeenCalledWith(expect.any(Date), { months: 1 });
      expect(result).toHaveLength(3); // Jan 1, Feb 1, Mar 1
    });
  });

  // Formatting tests removed - format method has been removed from adapters
  // describe("Formatting", () => {
  //   it("should format dates using Temporal values", () => {
  //     mockZonedDateTime.year = 2024;
  //     mockZonedDateTime.month = 3;
  //     mockZonedDateTime.day = 5;
  //     mockZonedDateTime.hour = 14;
  //     mockZonedDateTime.minute = 30;
  //     mockZonedDateTime.second = 45;

  //     const date = createTestDate(2024, 2, 5, 14, 30);
  //     const result = adapter.format(date, "YYYY-MM-DD HH:mm:ss");

  //     expect(result).toBe("2024-03-05 14:30:45");
  //   });

  //   it("should pad single digits correctly", () => {
  //     mockZonedDateTime.month = 1;
  //     mockZonedDateTime.day = 5;

  //     const result = adapter.format(createTestDate(), "MM-DD");
  //     expect(result).toBe("01-05");
  //   });
  // });

  describe("Advanced Time Units", () => {
    it("should handle century calculations", () => {
      mockZonedDateTime.year = 2024;
      adapter.startOf(createTestDate(2024, 5, 15), "century");

      expect(mockZonedDateTime.with).toHaveBeenCalledWith({
        year: 2000,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    });

    it("should handle millennium calculations", () => {
      mockZonedDateTime.year = 2024;
      adapter.endOf(createTestDate(2024, 5, 15), "millennium");

      expect(mockZonedDateTime.with).toHaveBeenCalledWith({
        year: 2999,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle unknown time units gracefully", () => {
      const date = createTestDate(2024, 0, 15);
      const result = adapter.startOf(date, "unknown" as any);

      expect(result).toBeInstanceOf(Date);
    });

    it("should prevent infinite loops in eachInterval", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 0, 3);

      const result = adapter.eachInterval(start, end, "unknown" as any);

      // Should contain at least the start date and break quickly
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.length).toBeLessThanOrEqual(2); // May add start and one more before breaking
      expect(result[0]).toEqual(start);
    });
  });
});
