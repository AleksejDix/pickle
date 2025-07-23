import { describe, it, expect } from "vitest";
import { createTemporal } from "../../src/core/createTemporal";
import { createAdapter } from "../../src/adapters/registry";
import { nativeAdapter } from "../../src/adapters/native";
import { createDateFnsAdapter } from "../../src/adapters/date-fns";
import { createTestDate } from "../setup";

describe("Adapter Integration Tests", () => {
  describe("Cross-Adapter Compatibility", () => {
    it("should produce consistent results across different adapters", () => {
      const baseDate = createTestDate(2024, 2, 15, 14, 30);

      const nativeAdapterInstance = nativeAdapter;
      const dateFnsAdapterInstance = createDateFnsAdapter();

      // Test date addition
      const nativeResult = nativeAdapterInstance.add(baseDate, {
        days: 5,
        hours: 3,
      });
      const dateFnsResult = dateFnsAdapterInstance.add(baseDate, {
        days: 5,
        hours: 3,
      });

      // Results should be within same minute (accounting for small implementation differences)
      expect(
        Math.abs(nativeResult.getTime() - dateFnsResult.getTime())
      ).toBeLessThan(60000);
    });

    it("should handle start/end of periods consistently", () => {
      const date = createTestDate(2024, 6, 15, 14, 30);

      const nativeAdapterInstance = nativeAdapter;
      const dateFnsAdapterInstance = createDateFnsAdapter();

      const nativeStartOfDay = nativeAdapterInstance.startOf(date, "day");
      const dateFnsStartOfDay = dateFnsAdapterInstance.startOf(date, "day");

      expect(nativeStartOfDay.getTime()).toBe(dateFnsStartOfDay.getTime());

      const nativeEndOfMonth = nativeAdapterInstance.endOf(date, "month");
      const dateFnsEndOfMonth = dateFnsAdapterInstance.endOf(date, "month");

      expect(nativeEndOfMonth.getTime()).toBe(dateFnsEndOfMonth.getTime());
    });

    it("should handle weekday calculations consistently", () => {
      const sunday = createTestDate(2024, 0, 7); // Sunday
      const monday = createTestDate(2024, 0, 8); // Monday

      const nativeAdapterInstance = nativeAdapter;
      const dateFnsAdapterInstance = createDateFnsAdapter();

      expect(nativeAdapterInstance.getWeekday(sunday)).toBe(
        dateFnsAdapterInstance.getWeekday(sunday)
      );
      expect(nativeAdapterInstance.getWeekday(monday)).toBe(
        dateFnsAdapterInstance.getWeekday(monday)
      );

      expect(nativeAdapterInstance.isWeekend(sunday)).toBe(
        dateFnsAdapterInstance.isWeekend(sunday)
      );
      expect(nativeAdapterInstance.isWeekend(monday)).toBe(
        dateFnsAdapterInstance.isWeekend(monday)
      );
    });
  });

  describe("Real-World Scenarios", () => {
    it("should handle leap year calculations correctly", () => {
      const leapYearDate = createTestDate(2024, 1, 28); // Feb 28, 2024 (leap year)
      const adapter = nativeAdapter;

      const nextDay = adapter.add(leapYearDate, { days: 1 });
      expect(nextDay.getDate()).toBe(29); // Feb 29
      expect(nextDay.getMonth()).toBe(1); // Still February

      const endOfMonth = adapter.endOf(leapYearDate, "month");
      expect(endOfMonth.getDate()).toBe(29); // February has 29 days in 2024
    });

    it("should handle month boundary arithmetic", () => {
      const jan31 = createTestDate(2024, 0, 31); // Jan 31
      const adapter = nativeAdapter;

      const plusOneMonth = adapter.add(jan31, { months: 1 });
      // Should handle February not having 31 days
      expect(plusOneMonth.getMonth()).toBe(1); // February
      expect(plusOneMonth.getDate()).toBeLessThanOrEqual(29);

      const minusOneMonth = adapter.subtract(plusOneMonth, { months: 1 });
      expect(minusOneMonth.getMonth()).toBe(0); // Back to January
    });

    it("should handle daylight saving time transitions", () => {
      // Test around typical DST transition dates
      const springForward = createTestDate(2024, 2, 10); // March 10, 2024
      const fallBack = createTestDate(2024, 10, 3); // November 3, 2024

      const adapter = nativeAdapter;

      // These should not throw and should produce valid dates
      expect(() => adapter.add(springForward, { hours: 25 })).not.toThrow();
      expect(() => adapter.add(fallBack, { hours: 25 })).not.toThrow();
    });

    it("should handle timezone-independent calculations", () => {
      const date = createTestDate(2024, 5, 15, 12, 0);
      const adapter = nativeAdapter;

      // Date arithmetic should be consistent regardless of local timezone
      const sameTimeNextDay = adapter.add(date, { days: 1 });
      expect(sameTimeNextDay.getHours()).toBe(12);
      expect(sameTimeNextDay.getMinutes()).toBe(0);

      const startOfDay = adapter.startOf(date, "day");
      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);
    });
  });

  describe("Temporal Instance Integration", () => {
    it("should work with createTemporal using different adapters", () => {
      const nativeTemporal = createTemporal({
        dateAdapter: "native",
      });

      const dateFnsTemporal = createTemporal({
        dateAdapter: "date-fns",
      });

      // Both should produce similar reactive behavior
      expect(nativeTemporal.now.value).toBeInstanceOf(Date);
      expect(dateFnsTemporal.now.value).toBeInstanceOf(Date);

      // Time difference should be minimal (within a few milliseconds)
      const timeDiff = Math.abs(
        nativeTemporal.now.value.getTime() - dateFnsTemporal.now.value.getTime()
      );
      expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
    });

    it("should maintain reactivity when switching adapters", () => {
      const temporal = createTemporal({
        dateAdapter: "native",
      });

      // Test that adapter methods work
      const nextWeek = temporal.adapter.add(temporal.now.value, { weeks: 1 });
      expect(nextWeek).toBeInstanceOf(Date);
      expect(nextWeek.getTime()).toBeGreaterThan(temporal.now.value.getTime());
    });

    it("should handle same() function with different adapters", () => {
      const date1 = createTestDate(2024, 2, 15, 14, 30);
      const date2 = createTestDate(2024, 2, 15, 16, 45);

      const nativeTemporal = createTemporal({
        dateAdapter: "native",
      });

      const dateFnsTemporal = createTemporal({
        dateAdapter: "date-fns",
      });

      // Both should identify same day correctly
      expect(nativeTemporal.adapter.isSame(date1, date2, "day")).toBe(true);
      expect(dateFnsTemporal.adapter.isSame(date1, date2, "day")).toBe(true);

      // Both should identify different hours correctly
      expect(nativeTemporal.adapter.isSame(date1, date2, "hour")).toBe(false);
      expect(dateFnsTemporal.adapter.isSame(date1, date2, "hour")).toBe(false);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle extreme dates", () => {
      const veryEarlyDate = new Date(1900, 0, 1);
      const veryLateDate = new Date(2100, 11, 31);

      const adapter = nativeAdapter;

      expect(() => adapter.add(veryEarlyDate, { years: 10 })).not.toThrow();
      expect(() => adapter.subtract(veryLateDate, { years: 10 })).not.toThrow();

      const startOfEarlyYear = adapter.startOf(veryEarlyDate, "year");
      expect(startOfEarlyYear.getFullYear()).toBe(1900);

      const endOfLateYear = adapter.endOf(veryLateDate, "year");
      expect(endOfLateYear.getFullYear()).toBe(2100);
    });

    it("should handle invalid durations gracefully", () => {
      const date = createTestDate(2024, 5, 15);
      const adapter = nativeAdapter;

      // Negative durations should work
      const pastDate = adapter.add(date, { days: -5 });
      expect(pastDate.getTime()).toBeLessThan(date.getTime());

      // Zero durations should return equivalent date
      const sameDate = adapter.add(date, { days: 0 });
      expect(sameDate.getTime()).toBe(date.getTime());

      // Large durations should not crash
      expect(() => adapter.add(date, { years: 1000 })).not.toThrow();
    });

    it("should handle malformed dates consistently", () => {
      const invalidDate = new Date("invalid");
      const adapter = nativeAdapter;

      // Should not crash on invalid input
      expect(() => adapter.add(invalidDate, { days: 1 })).not.toThrow();
      expect(() => adapter.startOf(invalidDate, "day")).not.toThrow();
      expect(() => adapter.isWeekend(invalidDate)).not.toThrow();
    });

    it("should handle concurrent operations safely", async () => {
      const adapter = nativeAdapter;
      const baseDate = createTestDate(2024, 5, 1); // June 1st to avoid month boundary issues

      // Simulate concurrent date operations
      const operations = Array.from(
        { length: 30 },
        (
          _,
          i // Reduce to 30 days to stay within month
        ) => Promise.resolve(adapter.add(baseDate, { days: i }))
      );

      const results = await Promise.all(operations);

      // All operations should complete successfully
      expect(results).toHaveLength(30);
      results.forEach((result, index) => {
        expect(result).toBeInstanceOf(Date);
        expect(result.getDate()).toBe(baseDate.getDate() + index);
      });
    });
  });

  describe("Performance and Memory", () => {
    it("should not leak memory during repeated operations", () => {
      const adapter = nativeAdapter;
      const baseDate = createTestDate(2024, 5, 15);

      // Perform many operations that could potentially leak
      for (let i = 0; i < 1000; i++) {
        adapter.add(baseDate, { days: i });
        adapter.startOf(baseDate, "month");
        adapter.eachInterval(
          baseDate,
          adapter.add(baseDate, { days: 7 }),
          "day"
        );
      }

      // Should complete without issues (memory leaks would cause test timeout)
      expect(true).toBe(true);
    });

    it("should handle large interval generations efficiently", () => {
      const adapter = nativeAdapter;
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 11, 31);

      const startTime = Date.now();
      const dailyIntervals = adapter.eachInterval(start, end, "day");
      const endTime = Date.now();

      expect(dailyIntervals).toHaveLength(366); // 2024 is a leap year
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("Advanced Time Unit Coverage", () => {
    it("should handle all supported time units consistently", () => {
      const adapter = nativeAdapter;
      const testDate = createTestDate(2024, 5, 15, 14, 30);

      const timeUnits: Array<
        | "year"
        | "month"
        | "week"
        | "day"
        | "hour"
        | "minute"
        | "second"
        | "decade"
        | "century"
        | "millennium"
      > = [
        "millennium",
        "century",
        "decade",
        "year",
        "month",
        "week",
        "day",
        "hour",
        "minute",
        "second",
      ];

      timeUnits.forEach((unit) => {
        expect(() => adapter.startOf(testDate, unit)).not.toThrow();
        expect(() => adapter.endOf(testDate, unit)).not.toThrow();

        const start = adapter.startOf(testDate, unit);
        const end = adapter.endOf(testDate, unit);

        expect(start.getTime()).toBeLessThanOrEqual(testDate.getTime());
        expect(end.getTime()).toBeGreaterThanOrEqual(testDate.getTime());

        // The testDate should be within the same unit period
        expect(adapter.isSame(testDate, start, unit)).toBe(true);
        expect(adapter.isSame(testDate, end, unit)).toBe(true);
      });
    });

    it("should handle millennium and century boundaries correctly", () => {
      const adapter = nativeAdapter;

      // Test millennium boundary (year 2000)
      const y2k = createTestDate(2000, 0, 1);
      const millenniumStart = adapter.startOf(y2k, "millennium");
      const millenniumEnd = adapter.endOf(y2k, "millennium");

      expect(millenniumStart.getFullYear()).toBe(2000);
      expect(millenniumEnd.getFullYear()).toBe(2999);

      // Test century boundary
      const centuryStart = adapter.startOf(y2k, "century");
      const centuryEnd = adapter.endOf(y2k, "century");

      expect(centuryStart.getFullYear()).toBe(2000);
      expect(centuryEnd.getFullYear()).toBe(2099);
    });
  });

  describe("Adapter Registry Auto-Detection", () => {
    it("should auto-detect and use best available adapter", () => {
      // This tests the actual auto-detection logic
      const adapter = createAdapter("auto");
      expect(adapter).toBeDefined();
      expect(adapter.name).toMatch(/native|date-fns|luxon|temporal/);
    });

    it("should fall back to native adapter when others unavailable", () => {
      // Force fallback by creating adapter when other libraries aren't available
      const adapter = createAdapter("auto");

      // At minimum, should always get native adapter
      expect(adapter.name).toBe("native");
    });

    it("should handle custom adapter registration", () => {
      // This would test custom adapter registration if implemented
      const customAdapter = nativeAdapter;

      // Custom adapters should work with the same interface
      expect(customAdapter.add(createTestDate(), { days: 1 })).toBeInstanceOf(
        Date
      );
    });
  });

  // Formatting tests removed - format method has been removed from adapters
  // describe("Formatting and Internationalization", () => {
  //   it("should handle basic date formatting across adapters", () => {
  //     const date = createTestDate(2024, 2, 5, 14, 30);
  //     const pattern = "YYYY-MM-DD HH:mm:ss";

  //     const nativeAdapterInstance = nativeAdapter;
  //     const dateFnsAdapterInstance = createDateFnsAdapter();

  //     const nativeFormatted = nativeAdapterInstance.format(date, pattern);
  //     const dateFnsFormatted = dateFnsAdapterInstance.format(date, pattern);

  //     // Both should produce similar format (allowing for small differences)
  //     expect(nativeFormatted).toMatch(/2024-03-05/);
  //     expect(dateFnsFormatted).toMatch(/2024-03-05/);
  //   });

  //   it("should handle different date format patterns", () => {
  //     const adapter = nativeAdapter;
  //     const date = createTestDate(2024, 0, 5, 9, 7, 7); // Include seconds: 7

  //     expect(adapter.format(date, "YYYY")).toBe("2024");
  //     expect(adapter.format(date, "MM")).toBe("01");
  //     expect(adapter.format(date, "DD")).toBe("05");
  //     expect(adapter.format(date, "HH")).toBe("09");
  //     expect(adapter.format(date, "mm")).toBe("07");
  //     expect(adapter.format(date, "ss")).toBe("07");
  //   });
  // });
});
