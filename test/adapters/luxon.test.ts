import { describe, it, expect, beforeEach, vi } from "vitest";
import { LuxonAdapter, createLuxonAdapter } from "../../lib/adapters/luxon";
import { createTestDate } from "../setup";

// Mock Luxon library for testing
const mockDateTime = {
  fromJSDate: vi.fn(),
  plus: vi.fn(),
  minus: vi.fn(),
  startOf: vi.fn(),
  endOf: vi.fn(),
  set: vi.fn(),
  hasSame: vi.fn(),
  valueOf: vi.fn(),
  toJSDate: vi.fn(),
  toFormat: vi.fn(),
  year: 2024,
  weekday: 4, // Thursday
};

const mockInterval = {
  fromDateTimes: vi.fn(),
  splitBy: vi.fn(),
};

const mockLuxon = {
  DateTime: {
    fromJSDate: vi.fn().mockReturnValue(mockDateTime),
  },
  Interval: {
    fromDateTimes: vi.fn().mockReturnValue(mockInterval),
  },
};

describe("LuxonAdapter", () => {
  let adapter: LuxonAdapter;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock return values
    mockDateTime.plus.mockReturnValue(mockDateTime);
    mockDateTime.minus.mockReturnValue(mockDateTime);
    mockDateTime.startOf.mockReturnValue(mockDateTime);
    mockDateTime.endOf.mockReturnValue(mockDateTime);
    mockDateTime.set.mockReturnValue(mockDateTime);
    mockDateTime.toJSDate.mockReturnValue(new Date(2024, 2, 15, 14, 30));
    mockDateTime.toFormat.mockReturnValue("2024-03-15 14:30");
    mockDateTime.hasSame.mockReturnValue(true);
    mockDateTime.valueOf.mockReturnValue(1710508245000);
    mockInterval.splitBy.mockReturnValue([
      { start: { toJSDate: () => createTestDate(2024, 0, 1) } },
      { start: { toJSDate: () => createTestDate(2024, 0, 2) } },
    ]);

    adapter = new LuxonAdapter();

    // Mock the private luxon getter using Object.defineProperty
    Object.defineProperty(adapter, "luxon", {
      get: () => mockLuxon,
      configurable: true,
    });
  });

  describe("Adapter Identity", () => {
    it("should have correct name", () => {
      expect(adapter.name).toBe("luxon");
    });

    it("should create adapter instance via factory", () => {
      const factoryAdapter = createLuxonAdapter();
      expect(factoryAdapter).toBeInstanceOf(LuxonAdapter);
      expect(factoryAdapter.name).toBe("luxon");
    });
  });

  describe("Luxon Library Availability", () => {
    it("should throw error when Luxon is not available", () => {
      const testAdapter = new LuxonAdapter();

      // Mock the private luxon getter to throw an error
      Object.defineProperty(testAdapter, "luxon", {
        get: () => {
          throw new Error("Cannot find module 'luxon'");
        },
        configurable: true,
      });

      expect(() => {
        testAdapter.add(new Date(), { years: 1 });
      }).toThrow(/Cannot find module 'luxon'/);
    });

    it("should provide helpful error message", () => {
      const testAdapter = new LuxonAdapter();

      // Mock the private luxon getter to throw an error
      Object.defineProperty(testAdapter, "luxon", {
        get: () => {
          throw new Error("Module not found");
        },
        configurable: true,
      });

      expect(() => {
        testAdapter.add(new Date(), { years: 1 });
      }).toThrow(/Module not found/);
    });
  });

  describe("Date Addition", () => {
    it("should add years using Luxon", () => {
      const date = createTestDate(2024, 0, 15);
      const result = adapter.add(date, { years: 2 });

      expect(mockLuxon.DateTime.fromJSDate).toHaveBeenCalledWith(date);
      expect(mockDateTime.plus).toHaveBeenCalledWith({ years: 2 });
      expect(mockDateTime.toJSDate).toHaveBeenCalled();
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

      expect(mockDateTime.plus).toHaveBeenCalledTimes(8);
      expect(mockDateTime.plus).toHaveBeenCalledWith({ years: 1 });
      expect(mockDateTime.plus).toHaveBeenCalledWith({ months: 2 });
      expect(mockDateTime.plus).toHaveBeenCalledWith({ milliseconds: 7 });
    });

    it("should handle zero duration", () => {
      const date = createTestDate(2024, 0, 15);
      const result = adapter.add(date, {});

      expect(result).toBeInstanceOf(Date);
      expect(mockDateTime.plus).not.toHaveBeenCalled();
    });
  });

  describe("Date Subtraction", () => {
    it("should subtract dates using Luxon", () => {
      const date = createTestDate(2024, 5, 15);
      adapter.subtract(date, { months: 3 });

      expect(mockDateTime.minus).toHaveBeenCalledWith({ months: 3 });
    });

    it("should subtract multiple duration units", () => {
      const date = createTestDate(2024, 5, 15);
      adapter.subtract(date, {
        years: 1,
        days: 10,
        hours: 5,
      });

      expect(mockDateTime.minus).toHaveBeenCalledTimes(3);
    });
  });

  describe("Start/End of Period", () => {
    it("should find start of year", () => {
      const date = createTestDate(2024, 7, 15, 14, 30);
      adapter.startOf(date, "year");

      expect(mockDateTime.startOf).toHaveBeenCalledWith("year");
    });

    it("should find start of month", () => {
      const date = createTestDate(2024, 7, 15, 14, 30);
      adapter.startOf(date, "month");

      expect(mockDateTime.startOf).toHaveBeenCalledWith("month");
    });

    it("should find start of week", () => {
      const date = createTestDate(2024, 0, 17);
      adapter.startOf(date, "week");

      expect(mockDateTime.startOf).toHaveBeenCalledWith("week");
    });

    it("should find start of decade", () => {
      mockDateTime.year = 2024;
      const date = createTestDate(2024, 5, 15);
      adapter.startOf(date, "decade");

      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2020,
        month: 1,
        day: 1,
      });
      expect(mockDateTime.startOf).toHaveBeenCalledWith("day");
    });

    it("should find start of century", () => {
      mockDateTime.year = 2024;
      const date = createTestDate(2024, 5, 15);
      adapter.startOf(date, "century");

      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2000,
        month: 1,
        day: 1,
      });
    });

    it("should find start of millennium", () => {
      mockDateTime.year = 2024;
      const date = createTestDate(2024, 5, 15);
      adapter.startOf(date, "millennium");

      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2000,
        month: 1,
        day: 1,
      });
    });

    it("should find end of year", () => {
      const date = createTestDate(2024, 7, 15);
      adapter.endOf(date, "year");

      expect(mockDateTime.endOf).toHaveBeenCalledWith("year");
    });

    it("should find end of decade", () => {
      mockDateTime.year = 2024;
      const date = createTestDate(2024, 5, 15);
      adapter.endOf(date, "decade");

      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2029,
        month: 12,
        day: 31,
      });
      expect(mockDateTime.endOf).toHaveBeenCalledWith("day");
    });
  });

  describe("Date Comparison", () => {
    it("should compare years correctly", () => {
      const date1 = createTestDate(2024, 3, 15);
      const date2 = createTestDate(2024, 8, 22);

      const result = adapter.isSame(date1, date2, "year");

      expect(mockLuxon.DateTime.fromJSDate).toHaveBeenCalledTimes(2);
      expect(mockDateTime.hasSame).toHaveBeenCalledWith(mockDateTime, "year");
      expect(result).toBe(true);
    });

    it("should compare months correctly", () => {
      const date1 = createTestDate(2024, 3, 15);
      const date2 = createTestDate(2024, 3, 22);

      adapter.isSame(date1, date2, "month");
      expect(mockDateTime.hasSame).toHaveBeenCalledWith(mockDateTime, "month");
    });

    it("should compare decades correctly", () => {
      const mockDt1 = { year: 2024 };
      const mockDt2 = { year: 2027 };
      mockLuxon.DateTime.fromJSDate
        .mockReturnValueOnce(mockDt1)
        .mockReturnValueOnce(mockDt2);

      const result = adapter.isSame(
        createTestDate(2024, 0, 1),
        createTestDate(2027, 0, 1),
        "decade"
      );
      expect(result).toBe(true); // Both in 2020s decade
    });

    it("should compare centuries correctly", () => {
      const mockDt1 = { year: 2024 };
      const mockDt2 = { year: 2099 };
      mockLuxon.DateTime.fromJSDate
        .mockReturnValueOnce(mockDt1)
        .mockReturnValueOnce(mockDt2);

      const result = adapter.isSame(
        createTestDate(2024, 0, 1),
        createTestDate(2099, 0, 1),
        "century"
      );
      expect(result).toBe(true); // Both in 21st century (2000-2099)
    });

    it("should check before/after relationships", () => {
      const dt1 = { ...mockDateTime, valueOf: () => 1000 };
      const dt2 = { ...mockDateTime, valueOf: () => 2000 };
      mockLuxon.DateTime.fromJSDate
        .mockReturnValueOnce(dt1)
        .mockReturnValueOnce(dt2);

      const earlier = createTestDate(2024, 0, 15);
      const later = createTestDate(2024, 0, 20);

      const isBeforeResult = adapter.isBefore(earlier, later);
      expect(isBeforeResult).toBe(true);

      mockLuxon.DateTime.fromJSDate
        .mockReturnValueOnce(dt2)
        .mockReturnValueOnce(dt1);
      const isAfterResult = adapter.isAfter(later, earlier);
      expect(isAfterResult).toBe(true);
    });
  });

  describe("Interval Generation", () => {
    it("should generate daily intervals", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 0, 3);

      const result = adapter.eachInterval(start, end, "day");

      expect(mockLuxon.Interval.fromDateTimes).toHaveBeenCalled();
      expect(mockInterval.splitBy).toHaveBeenCalledWith({ days: 1 });
      expect(result).toHaveLength(2);
    });

    it("should generate weekly intervals", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 0, 22);

      adapter.eachInterval(start, end, "week");
      expect(mockInterval.splitBy).toHaveBeenCalledWith({ weeks: 1 });
    });

    it("should generate monthly intervals", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 3, 1);

      adapter.eachInterval(start, end, "month");
      expect(mockInterval.splitBy).toHaveBeenCalledWith({ months: 1 });
    });

    it("should generate yearly intervals for decades", () => {
      const start = createTestDate(2020, 0, 1);
      const end = createTestDate(2029, 11, 31);

      adapter.eachInterval(start, end, "decade");
      expect(mockInterval.splitBy).toHaveBeenCalledWith({ years: 1 });
    });

    it("should handle unknown units gracefully", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 0, 3);

      const result = adapter.eachInterval(start, end, "unknown" as any);
      expect(result).toEqual([start]);
    });
  });

  describe("Weekday and Weekend Utilities", () => {
    it("should convert Luxon weekday to JS weekday", () => {
      mockDateTime.weekday = 7; // Sunday in Luxon
      const date = createTestDate(2024, 0, 7);

      const result = adapter.getWeekday(date);
      expect(result).toBe(0); // Sunday in JS
    });

    it("should convert Monday correctly", () => {
      mockDateTime.weekday = 1; // Monday in Luxon
      const date = createTestDate(2024, 0, 8);

      const result = adapter.getWeekday(date);
      expect(result).toBe(1); // Monday in JS
    });

    it("should adjust weekday for different week starts", () => {
      mockDateTime.weekday = 7; // Sunday in Luxon
      const date = createTestDate(2024, 0, 7);

      const result = adapter.getWeekday(date, { weekStartsOn: 1 });
      expect(result).toBe(6); // Sunday when week starts on Monday
    });

    it("should identify weekends correctly", () => {
      // Saturday
      mockDateTime.weekday = 6;
      expect(adapter.isWeekend(createTestDate(2024, 0, 6))).toBe(true);

      // Sunday
      mockDateTime.weekday = 7;
      expect(adapter.isWeekend(createTestDate(2024, 0, 7))).toBe(true);

      // Monday
      mockDateTime.weekday = 1;
      expect(adapter.isWeekend(createTestDate(2024, 0, 8))).toBe(false);
    });
  });

  // Formatting tests removed - format method has been removed from adapters
  // describe("Formatting", () => {
  //   it("should format dates using Luxon toFormat", () => {
  //     const date = createTestDate(2024, 2, 5, 14, 30);
  //     mockDateTime.toFormat.mockReturnValue("2024-03-05 14:30:00");

  //     const result = adapter.format(date, "YYYY-MM-DD HH:mm:ss");

  //     expect(mockDateTime.toFormat).toHaveBeenCalledWith("yyyy-MM-dd HH:mm:ss");
  //     expect(result).toBe("2024-03-05 14:30:00");
  //   });

  //   it("should convert pattern formats correctly", () => {
  //     const date = createTestDate(2024, 0, 1);

  //     adapter.format(date, "YYYY/MM/DD");
  //     expect(mockDateTime.toFormat).toHaveBeenCalledWith("yyyy/MM/dd");
  //   });
  // });

  describe("Advanced Time Units Edge Cases", () => {
    it("should handle edge decade years", () => {
      // Test year 2020 (start of decade)
      mockDateTime.year = 2020;
      adapter.startOf(createTestDate(2020, 0, 1), "decade");
      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2020,
        month: 1,
        day: 1,
      });

      // Test year 2029 (end of decade)
      mockDateTime.year = 2029;
      adapter.endOf(createTestDate(2029, 11, 31), "decade");
      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2029,
        month: 12,
        day: 31,
      });
    });

    it("should handle edge century years", () => {
      // Test year 2000 (start of century)
      mockDateTime.year = 2000;
      adapter.startOf(createTestDate(2000, 0, 1), "century");
      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2000,
        month: 1,
        day: 1,
      });

      // Test year 2099 (end of century)
      mockDateTime.year = 2099;
      adapter.endOf(createTestDate(2099, 11, 31), "century");
      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2099,
        month: 12,
        day: 31,
      });
    });

    it("should handle millennium calculations", () => {
      // Test year 2000 (start of millennium)
      mockDateTime.year = 2000;
      adapter.startOf(createTestDate(2000, 0, 1), "millennium");
      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2000,
        month: 1,
        day: 1,
      });

      // Test year 2999 (end of millennium)
      mockDateTime.year = 2999;
      adapter.endOf(createTestDate(2999, 11, 31), "millennium");
      expect(mockDateTime.set).toHaveBeenCalledWith({
        year: 2999,
        month: 12,
        day: 31,
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle unknown time units gracefully in startOf", () => {
      const date = createTestDate(2024, 0, 15);
      const result = adapter.startOf(date, "unknown" as any);

      expect(result).toBeInstanceOf(Date);
      expect(mockDateTime.toJSDate).toHaveBeenCalled();
    });

    it("should handle unknown time units gracefully in endOf", () => {
      const date = createTestDate(2024, 0, 15);
      const result = adapter.endOf(date, "unknown" as any);

      expect(result).toBeInstanceOf(Date);
    });

    it("should handle undefined valueOf in comparison", () => {
      mockDateTime.valueOf.mockReturnValue(undefined);
      const result = adapter.isSame(
        createTestDate(),
        createTestDate(),
        "millisecond"
      );

      expect(result).toBe(false);
    });
  });

  describe("Performance Considerations", () => {
    it("should reuse DateTime instances efficiently", () => {
      const date = createTestDate(2024, 0, 15);

      // Multiple operations on same date
      adapter.add(date, { days: 1 });
      adapter.subtract(date, { days: 1 });
      adapter.startOf(date, "day");

      // Should create new DateTime for each operation
      expect(mockLuxon.DateTime.fromJSDate).toHaveBeenCalledTimes(3);
      expect(mockLuxon.DateTime.fromJSDate).toHaveBeenCalledWith(date);
    });
  });
});
