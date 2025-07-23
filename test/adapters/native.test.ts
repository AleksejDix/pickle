import { describe, it, expect } from "vitest";
import { nativeAdapter } from "../../src/adapters/native";
import { createTestDate } from "../setup";

describe("NativeDateAdapter", () => {
  describe("Adapter Identity", () => {
    it("should have correct name", () => {
      expect(nativeAdapter.name).toBe("native");
    });
  });

  describe("Date Addition", () => {
    it("should add years correctly", () => {
      const date = createTestDate(2024, 0, 15);
      const result = nativeAdapter.add(date, { years: 2 });

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    it("should add months correctly", () => {
      const date = createTestDate(2024, 0, 15);
      const result = nativeAdapter.add(date, { months: 3 });

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(3);
      expect(result.getDate()).toBe(15);
    });

    it("should add weeks correctly", () => {
      const date = createTestDate(2024, 0, 15);
      const result = nativeAdapter.add(date, { weeks: 2 });

      expect(result.getDate()).toBe(29);
    });

    it("should add multiple units together", () => {
      const date = createTestDate(2024, 0, 15, 10, 30);
      const result = nativeAdapter.add(date, {
        years: 1,
        months: 2,
        days: 5,
        hours: 3,
      });

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(20);
      expect(result.getHours()).toBe(13);
    });
  });

  describe("Date Subtraction", () => {
    it("should subtract years correctly", () => {
      const date = createTestDate(2024, 5, 15);
      const result = nativeAdapter.subtract(date, { years: 2 });

      expect(result.getFullYear()).toBe(2022);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
    });

    it("should subtract multiple units", () => {
      const date = createTestDate(2024, 5, 15, 14, 45);
      const result = nativeAdapter.subtract(date, {
        months: 3,
        days: 10,
        hours: 5,
      });

      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(5);
      expect(result.getHours()).toBe(9);
    });
  });

  describe("Start/End of Period", () => {
    it("should find start of year", () => {
      const date = createTestDate(2024, 7, 15, 14, 30);
      const result = nativeAdapter.startOf(date, "year");

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it("should find start of month", () => {
      const date = createTestDate(2024, 7, 15, 14, 30);
      const result = nativeAdapter.startOf(date, "month");

      expect(result.getMonth()).toBe(7);
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
    });

    it("should find start of week", () => {
      const date = createTestDate(2024, 0, 17); // Wednesday
      const result = nativeAdapter.startOf(date, "week");

      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getHours()).toBe(0);
    });

    it("should find start of day", () => {
      const date = createTestDate(2024, 0, 15, 14, 30);
      const result = nativeAdapter.startOf(date, "day");

      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it("should find end of year", () => {
      const date = createTestDate(2024, 7, 15);
      const result = nativeAdapter.endOf(date, "year");

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
    });

    it("should find end of month", () => {
      const date = createTestDate(2024, 1, 15); // February
      const result = nativeAdapter.endOf(date, "month");

      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(29); // 2024 is leap year
      expect(result.getHours()).toBe(23);
    });
  });

  describe("Date Comparison", () => {
    it("should check if dates are same year", () => {
      const date1 = createTestDate(2024, 3, 15);
      const date2 = createTestDate(2024, 8, 22);
      const date3 = createTestDate(2023, 3, 15);

      expect(nativeAdapter.isSame(date1, date2, "year")).toBe(true);
      expect(nativeAdapter.isSame(date1, date3, "year")).toBe(false);
    });

    it("should check if dates are same month", () => {
      const date1 = createTestDate(2024, 3, 15);
      const date2 = createTestDate(2024, 3, 22);
      const date3 = createTestDate(2024, 4, 15);

      expect(nativeAdapter.isSame(date1, date2, "month")).toBe(true);
      expect(nativeAdapter.isSame(date1, date3, "month")).toBe(false);
    });

    it("should check if dates are same day", () => {
      const date1 = createTestDate(2024, 3, 15, 10, 30);
      const date2 = createTestDate(2024, 3, 15, 18, 45);
      const date3 = createTestDate(2024, 3, 16, 10, 30);

      expect(nativeAdapter.isSame(date1, date2, "day")).toBe(true);
      expect(nativeAdapter.isSame(date1, date3, "day")).toBe(false);
    });

    it("should check before/after relationships", () => {
      const earlier = createTestDate(2024, 0, 15);
      const later = createTestDate(2024, 0, 20);

      expect(nativeAdapter.isBefore(earlier, later)).toBe(true);
      expect(nativeAdapter.isAfter(later, earlier)).toBe(true);
      expect(nativeAdapter.isBefore(later, earlier)).toBe(false);
    });
  });

  describe("Interval Generation", () => {
    it("should generate daily intervals", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 0, 5);
      const result = nativeAdapter.eachInterval(start, end, "day");

      expect(result).toHaveLength(5);
      expect(result[0].getDate()).toBe(1);
      expect(result[4].getDate()).toBe(5);
    });

    it("should generate weekly intervals", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 0, 22);
      const result = nativeAdapter.eachInterval(start, end, "week");

      expect(result).toHaveLength(4);
      expect(result[1].getDate()).toBe(8);
    });

    it("should generate monthly intervals", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 3, 1);
      const result = nativeAdapter.eachInterval(start, end, "month");

      expect(result).toHaveLength(4);
      expect(result[0].getMonth()).toBe(0);
      expect(result[3].getMonth()).toBe(3);
    });
  });

  describe("Weekday and Weekend Utilities", () => {
    it("should get weekday correctly", () => {
      const sunday = createTestDate(2024, 0, 7); // Sunday
      const monday = createTestDate(2024, 0, 8); // Monday

      expect(nativeAdapter.getWeekday(sunday)).toBe(0);
      expect(nativeAdapter.getWeekday(monday)).toBe(1);
    });

    it("should adjust weekday for different week starts", () => {
      const sunday = createTestDate(2024, 0, 7);
      const monday = createTestDate(2024, 0, 8);

      // Week starts on Monday
      expect(nativeAdapter.getWeekday(sunday, { weekStartsOn: 1 })).toBe(6);
      expect(nativeAdapter.getWeekday(monday, { weekStartsOn: 1 })).toBe(0);
    });

    it("should identify weekends correctly", () => {
      const saturday = createTestDate(2024, 0, 6);
      const sunday = createTestDate(2024, 0, 7);
      const monday = createTestDate(2024, 0, 8);

      expect(nativeAdapter.isWeekend(saturday)).toBe(true);
      expect(nativeAdapter.isWeekend(sunday)).toBe(true);
      expect(nativeAdapter.isWeekend(monday)).toBe(false);
    });
  });

  // Formatting tests removed - format method has been removed from adapters
  // describe("Basic Formatting", () => {
  //   it("should format dates with basic patterns", () => {
  //     const date = createTestDate(2024, 2, 5, 14, 30);

  //     expect(nativeAdapter.format(date, "YYYY-MM-DD")).toBe("2024-03-05");
  //     expect(nativeAdapter.format(date, "YYYY/MM/DD HH:mm")).toBe(
  //       "2024/03/05 14:30"
  //     );
  //   });
  // });

  describe("Advanced Time Units", () => {
    it("should handle decade calculations", () => {
      const date = createTestDate(2024, 5, 15);
      const startOfDecade = nativeAdapter.startOf(date, "decade");
      const endOfDecade = nativeAdapter.endOf(date, "decade");

      expect(startOfDecade.getFullYear()).toBe(2020);
      expect(endOfDecade.getFullYear()).toBe(2029);
    });

    it("should handle century calculations", () => {
      const date = createTestDate(2024, 5, 15);
      const startOfCentury = nativeAdapter.startOf(date, "century");
      const endOfCentury = nativeAdapter.endOf(date, "century");

      expect(startOfCentury.getFullYear()).toBe(2000);
      expect(endOfCentury.getFullYear()).toBe(2099);
    });

    it("should handle millennium calculations", () => {
      const date = createTestDate(2024, 5, 15);
      const startOfMillennium = nativeAdapter.startOf(date, "millennium");
      const endOfMillennium = nativeAdapter.endOf(date, "millennium");

      expect(startOfMillennium.getFullYear()).toBe(2000);
      expect(endOfMillennium.getFullYear()).toBe(2999);
    });
  });

  describe("Edge Cases and Boundary Testing", () => {
    it("should handle leap year edge cases", () => {
      // Leap year Feb 29
      const leapDay = createTestDate(2024, 1, 29);
      expect(nativeAdapter.startOf(leapDay, "year").getFullYear()).toBe(2024);
      expect(nativeAdapter.endOf(leapDay, "year").getFullYear()).toBe(2024);

      // Non-leap year handling
      const nonLeapYear = createTestDate(2023, 1, 28);
      const endOfFeb2023 = nativeAdapter.endOf(nonLeapYear, "month");
      expect(endOfFeb2023.getDate()).toBe(28);
    });

    it("should handle month boundary edge cases", () => {
      // January 31 + 1 month should handle February properly
      const jan31 = createTestDate(2024, 0, 31);
      const feb = nativeAdapter.add(jan31, { months: 1 });
      expect(feb.getMonth()).toBe(1); // February
      expect(feb.getDate()).toBeLessThanOrEqual(29); // At most 29 in leap year

      // May 31 + 6 months should handle November properly
      const may31 = createTestDate(2024, 4, 31);
      const nov = nativeAdapter.add(may31, { months: 6 });
      expect(nov.getMonth()).toBe(10); // November
      expect(nov.getDate()).toBe(30); // November has 30 days
    });

    it("should handle extreme time calculations", () => {
      const baseDate = createTestDate(2024, 5, 15);

      // Large additions
      const thousandYears = nativeAdapter.add(baseDate, { years: 1000 });
      expect(thousandYears.getFullYear()).toBe(3024);

      // Large subtractions
      const thousandYearsAgo = nativeAdapter.subtract(baseDate, {
        years: 1000,
      });
      expect(thousandYearsAgo.getFullYear()).toBe(1024);

      // Millennium calculations
      const millenniumStart = nativeAdapter.startOf(baseDate, "millennium");
      expect(millenniumStart.getFullYear()).toBe(2000);

      const millenniumEnd = nativeAdapter.endOf(baseDate, "millennium");
      expect(millenniumEnd.getFullYear()).toBe(2999);
    });

    it("should handle week boundaries correctly", () => {
      // Test each day of the week
      const weekDays = [
        createTestDate(2024, 0, 7), // Sunday
        createTestDate(2024, 0, 8), // Monday
        createTestDate(2024, 0, 9), // Tuesday
        createTestDate(2024, 0, 10), // Wednesday
        createTestDate(2024, 0, 11), // Thursday
        createTestDate(2024, 0, 12), // Friday
        createTestDate(2024, 0, 13), // Saturday
      ];

      weekDays.forEach((day, index) => {
        const startOfWeek = nativeAdapter.startOf(day, "week");
        const endOfWeek = nativeAdapter.endOf(day, "week");

        expect(startOfWeek.getDay()).toBe(0); // Sunday
        expect(endOfWeek.getDay()).toBe(6); // Saturday

        expect(nativeAdapter.getWeekday(day)).toBe(index);
        expect(nativeAdapter.isWeekend(day)).toBe(index === 0 || index === 6);
      });
    });

    it("should handle year boundary transitions", () => {
      const newYearsEve = createTestDate(2023, 11, 31, 23, 59, 59);
      const newYear = nativeAdapter.add(newYearsEve, { seconds: 1 });

      expect(newYear.getFullYear()).toBe(2024);
      expect(newYear.getMonth()).toBe(0);
      expect(newYear.getDate()).toBe(1);
      expect(newYear.getHours()).toBe(0);
      expect(newYear.getMinutes()).toBe(0);
      expect(newYear.getSeconds()).toBe(0);
    });
  });

  describe("Complex Duration Arithmetic", () => {
    it("should handle compound duration additions", () => {
      const base = createTestDate(2024, 0, 1, 0, 0);
      const result = nativeAdapter.add(base, {
        years: 1,
        months: 2,
        weeks: 3,
        days: 4,
        hours: 5,
        minutes: 6,
        seconds: 7,
        milliseconds: 123,
      });

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getMilliseconds()).toBe(123);
    });

    it("should handle negative durations correctly", () => {
      const base = createTestDate(2024, 6, 15, 12, 30);

      const pastDate = nativeAdapter.add(base, {
        years: -1,
        months: -2,
        days: -5,
      });

      expect(pastDate.getFullYear()).toBe(2023);
      expect(pastDate.getMonth()).toBe(4); // May
      expect(pastDate.getDate()).toBe(10);
    });

    it("should handle mixed positive/negative durations", () => {
      const base = createTestDate(2024, 6, 15); // July 15, 2024

      const result = nativeAdapter.add(base, {
        years: 1,
        months: -3,
        days: 10,
      });

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(3); // April
      expect(result.getDate()).toBe(25);
    });
  });

  describe("Timezone and DST Considerations", () => {
    it("should maintain consistent behavior across timezone changes", () => {
      // Test around typical DST transition dates
      const beforeDST = createTestDate(2024, 2, 9); // March 9, 2024
      const afterDST = createTestDate(2024, 2, 11); // March 11, 2024

      const startOfDayBefore = nativeAdapter.startOf(beforeDST, "day");
      const startOfDayAfter = nativeAdapter.startOf(afterDST, "day");

      expect(startOfDayBefore.getHours()).toBe(0);
      expect(startOfDayAfter.getHours()).toBe(0);

      // Day calculations should remain consistent
      const daysBetween = Math.floor(
        (afterDST.getTime() - beforeDST.getTime()) / (24 * 60 * 60 * 1000)
      );
      expect(daysBetween).toBe(2);
    });

    it("should handle hour arithmetic around DST transitions", () => {
      const dstTransition = createTestDate(2024, 2, 10, 1, 0); // 1 AM on DST day

      // Adding 25 hours should skip the "lost" hour
      const after25Hours = nativeAdapter.add(dstTransition, { hours: 25 });
      expect(after25Hours).toBeInstanceOf(Date);

      // Should not throw on any hour arithmetic
      expect(() =>
        nativeAdapter.add(dstTransition, { hours: 1 })
      ).not.toThrow();
      expect(() =>
        nativeAdapter.add(dstTransition, { hours: 2 })
      ).not.toThrow();
      expect(() =>
        nativeAdapter.add(dstTransition, { hours: 3 })
      ).not.toThrow();
    });
  });

  describe("Performance and Memory Tests", () => {
    it("should handle large interval generations without memory issues", () => {
      const start = createTestDate(2024, 0, 1);
      const end = createTestDate(2024, 11, 31);

      const startTime = performance.now();
      const intervals = nativeAdapter.eachInterval(start, end, "day");
      const endTime = performance.now();

      expect(intervals).toHaveLength(366); // 2024 is a leap year
      expect(endTime - startTime).toBeLessThan(500); // Should be fast

      // Test memory - all intervals should be proper Date objects
      intervals.forEach((date) => {
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(false);
      });
    });

    it("should handle repeated operations without performance degradation", () => {
      const base = createTestDate(2024, 5, 15);

      const startTime = performance.now();

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        nativeAdapter.add(base, { days: i % 30 });
        nativeAdapter.startOf(base, "month");
        nativeAdapter.endOf(base, "year");
        nativeAdapter.isSame(base, base, "day");
        nativeAdapter.getWeekday(base);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should not accumulate floating point errors", () => {
      let date = createTestDate(2024, 0, 1);

      // Add and subtract the same amount many times
      for (let i = 0; i < 100; i++) {
        date = nativeAdapter.add(date, { days: 1 });
        date = nativeAdapter.subtract(date, { days: 1 });
      }

      // Should return to original date (within millisecond precision)
      const original = createTestDate(2024, 0, 1);
      expect(Math.abs(date.getTime() - original.getTime())).toBeLessThan(1);
    });
  });

  describe("Internationalization and Locale Support", () => {
    it("should handle different week start configurations", () => {
      const tuesday = createTestDate(2024, 0, 9); // Tuesday

      // Default (Sunday start)
      expect(nativeAdapter.getWeekday(tuesday)).toBe(2);

      // Monday start
      expect(nativeAdapter.getWeekday(tuesday, { weekStartsOn: 1 })).toBe(1);

      // Saturday start
      expect(nativeAdapter.getWeekday(tuesday, { weekStartsOn: 6 })).toBe(3);
    });

    // Formatting test removed - format method has been removed from adapters
    // it("should format dates consistently", () => {
    //   const date = createTestDate(2024, 0, 5, 9, 7, 7); // Include seconds: 7

    //   expect(nativeAdapter.format(date, "YYYY-MM-DD")).toBe("2024-01-05");
    //   expect(nativeAdapter.format(date, "HH:mm:ss")).toBe("09:07:07");
    //   expect(nativeAdapter.format(date, "YYYY/MM/DD HH:mm")).toBe(
    //     "2024/01/05 09:07"
    //   );
    // });
  });

  describe("Error Resilience", () => {
    it("should handle invalid dates gracefully", () => {
      const invalidDate = new Date("invalid");

      // Should not throw, even with invalid input
      expect(() => nativeAdapter.add(invalidDate, { days: 1 })).not.toThrow();
      expect(() => nativeAdapter.startOf(invalidDate, "day")).not.toThrow();
      expect(() => nativeAdapter.getWeekday(invalidDate)).not.toThrow();
      // Format test removed - format method has been removed from adapters
      // expect(() =>
      //   nativeAdapter.format(invalidDate, "YYYY-MM-DD")
      // ).not.toThrow();
    });

    it("should handle extreme date values", () => {
      const veryEarlyDate = new Date(-8640000000000000); // Minimum safe date
      const veryLateDate = new Date(8640000000000000); // Maximum safe date

      expect(() => nativeAdapter.add(veryEarlyDate, { days: 1 })).not.toThrow();
      expect(() =>
        nativeAdapter.subtract(veryLateDate, { days: 1 })
      ).not.toThrow();
    });

    it("should handle malformed durations", () => {
      const date = createTestDate(2024, 5, 15);

      // Zero duration
      const sameDate = nativeAdapter.add(date, {});
      expect(sameDate.getTime()).toBe(date.getTime());

      // Partial duration objects
      expect(() => nativeAdapter.add(date, { years: 1 })).not.toThrow();
      expect(() =>
        nativeAdapter.add(date, { milliseconds: 500 })
      ).not.toThrow();
    });
  });

  describe("Date Comparison Edge Cases", () => {
    it("should handle same instant comparisons", () => {
      const date1 = createTestDate(2024, 5, 15, 14, 30);
      const date2 = new Date(date1.getTime()); // Same instant

      expect(nativeAdapter.isSame(date1, date2, "year")).toBe(true);
      expect(nativeAdapter.isSame(date1, date2, "month")).toBe(true);
      expect(nativeAdapter.isSame(date1, date2, "day")).toBe(true);
      expect(nativeAdapter.isSame(date1, date2, "hour")).toBe(true);
      expect(nativeAdapter.isSame(date1, date2, "minute")).toBe(true);
      expect(nativeAdapter.isSame(date1, date2, "second")).toBe(true);
    });

    it("should handle cross-unit boundary comparisons", () => {
      const lastSecondOfYear = createTestDate(2024, 11, 31, 23, 59);
      const firstSecondOfNextYear = createTestDate(2025, 0, 1, 0, 0);

      expect(
        nativeAdapter.isSame(lastSecondOfYear, firstSecondOfNextYear, "year")
      ).toBe(false);
      expect(
        nativeAdapter.isSame(lastSecondOfYear, firstSecondOfNextYear, "month")
      ).toBe(false);
      expect(
        nativeAdapter.isSame(lastSecondOfYear, firstSecondOfNextYear, "day")
      ).toBe(false);

      expect(
        nativeAdapter.isBefore(lastSecondOfYear, firstSecondOfNextYear)
      ).toBe(true);
      expect(
        nativeAdapter.isAfter(firstSecondOfNextYear, lastSecondOfYear)
      ).toBe(true);
    });
  });
});
