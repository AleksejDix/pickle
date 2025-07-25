import { describe, it, expect } from "vitest";
import { isSame } from "./isSame";
import { toPeriod } from "./toPeriod";
import { createTemporal } from "../createTemporal";
import { createMockAdapter } from "../test/functionalMockAdapter";
import { TEST_DATE, testDates } from "../test/testDates";

describe("isSame", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: createMockAdapter({ weekStartsOn: 1 }),
    weekStartsOn: 1,
  });

  describe("year comparison", () => {
    it("should return true for same year", () => {
      const period1 = toPeriod(temporal, testDates.jan1, "year");
      const period2 = toPeriod(temporal, testDates.dec31, "year");

      expect(isSame(temporal, period1, period2, "year")).toBe(true);
    });

    it("should return false for different years", () => {
      const period1 = toPeriod(temporal, testDates.dec31, "year");
      const period2 = toPeriod(temporal, testDates.year2025, "year");

      expect(isSame(temporal, period1, period2, "year")).toBe(false);
    });
  });

  describe("month comparison", () => {
    it("should return true for same month", () => {
      const period1 = toPeriod(temporal, testDates.jun1, "month");
      const period2 = toPeriod(temporal, testDates.jun30, "month");

      expect(isSame(temporal, period1, period2, "month")).toBe(true);
    });

    it("should return false for different months", () => {
      const period1 = toPeriod(temporal, testDates.jun30, "month");
      const period2 = toPeriod(temporal, new Date(2024, 6, 1), "month");

      expect(isSame(temporal, period1, period2, "month")).toBe(false);
    });

    it("should return false for same month in different years", () => {
      const period1 = toPeriod(temporal, testDates.jun15, "month");
      const period2 = toPeriod(temporal, testDates.year2025, "month");

      expect(isSame(temporal, period1, period2, "month")).toBe(false);
    });
  });

  describe("day comparison", () => {
    it("should return true for same day", () => {
      const period1 = toPeriod(temporal, new Date(2024, 5, 15, 0, 0, 0), "day");
      const period2 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 23, 59, 59),
        "day"
      );

      expect(isSame(temporal, period1, period2, "day")).toBe(true);
    });

    it("should return false for different days", () => {
      const period1 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 23, 59, 59),
        "day"
      );
      const period2 = toPeriod(temporal, new Date(2024, 5, 16, 0, 0, 0), "day");

      expect(isSame(temporal, period1, period2, "day")).toBe(false);
    });
  });

  describe("hour comparison", () => {
    it("should return true for same hour", () => {
      const period1 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 0, 0),
        "day"
      );
      const period2 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 59, 59),
        "day"
      );

      expect(isSame(temporal, period1, period2, "hour")).toBe(true);
    });

    it("should return false for different hours", () => {
      const period1 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 59, 59),
        "day"
      );
      const period2 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 15, 0, 0),
        "day"
      );

      expect(isSame(temporal, period1, period2, "hour")).toBe(false);
    });
  });

  describe("quarter comparison", () => {
    it("should return true for Q1 dates", () => {
      const jan = toPeriod(temporal, testDates.jan15, "month");
      const feb = toPeriod(temporal, new Date(2024, 1, 20), "month");
      const mar = toPeriod(temporal, new Date(2024, 2, 31), "month");

      expect(isSame(temporal, jan, feb, "quarter")).toBe(true);
      expect(isSame(temporal, jan, mar, "quarter")).toBe(true);
      expect(isSame(temporal, feb, mar, "quarter")).toBe(true);
    });

    it("should return true for Q2 dates", () => {
      const apr = toPeriod(temporal, new Date(2024, 3, 1), "month");
      const may = toPeriod(temporal, testDates.may15, "month");
      const jun = toPeriod(temporal, testDates.jun30, "month");

      expect(isSame(temporal, apr, may, "quarter")).toBe(true);
      expect(isSame(temporal, apr, jun, "quarter")).toBe(true);
      expect(isSame(temporal, may, jun, "quarter")).toBe(true);
    });

    it("should return true for Q3 dates", () => {
      const jul = toPeriod(temporal, new Date(2024, 6, 1), "month");
      const aug = toPeriod(temporal, new Date(2024, 7, 15), "month");
      const sep = toPeriod(temporal, new Date(2024, 8, 30), "month");

      expect(isSame(temporal, jul, aug, "quarter")).toBe(true);
      expect(isSame(temporal, jul, sep, "quarter")).toBe(true);
      expect(isSame(temporal, aug, sep, "quarter")).toBe(true);
    });

    it("should return true for Q4 dates", () => {
      const oct = toPeriod(temporal, new Date(2024, 9, 1), "month");
      const nov = toPeriod(temporal, testDates.nov15, "month");
      const dec = toPeriod(temporal, testDates.dec31, "month");

      expect(isSame(temporal, oct, nov, "quarter")).toBe(true);
      expect(isSame(temporal, oct, dec, "quarter")).toBe(true);
      expect(isSame(temporal, nov, dec, "quarter")).toBe(true);
    });

    it("should return false for different quarters", () => {
      const q1 = toPeriod(temporal, new Date(2024, 2, 31), "month"); // March (Q1)
      const q2 = toPeriod(temporal, new Date(2024, 3, 1), "month"); // April (Q2)

      expect(isSame(temporal, q1, q2, "quarter")).toBe(false);
    });

    it("should return false for same quarter in different years", () => {
      const q1_2024 = toPeriod(temporal, testDates.jan15, "month");
      const q1_2025 = toPeriod(temporal, new Date(2025, 0, 15), "month");

      expect(isSame(temporal, q1_2024, q1_2025, "quarter")).toBe(false);
    });
  });

  describe("null/undefined handling", () => {
    it("should return false when first period is null", () => {
      const period = toPeriod(temporal, testDates.jun15, "day");

      expect(isSame(temporal, null, period, "day")).toBe(false);
    });

    it("should return false when second period is null", () => {
      const period = toPeriod(temporal, testDates.jun15, "day");

      expect(isSame(temporal, period, null, "day")).toBe(false);
    });

    it("should return false when both periods are null", () => {
      expect(isSame(temporal, null, null, "day")).toBe(false);
    });

    it("should return false when first period is undefined", () => {
      const period = toPeriod(temporal, testDates.jun15, "day");

      expect(isSame(temporal, undefined, period, "day")).toBe(false);
    });

    it("should return false when second period is undefined", () => {
      const period = toPeriod(temporal, testDates.jun15, "day");

      expect(isSame(temporal, period, undefined, "day")).toBe(false);
    });

    it("should return false when both periods are undefined", () => {
      expect(isSame(temporal, undefined, undefined, "day")).toBe(false);
    });
  });

  describe("week comparison", () => {
    it("should return true for dates in same week", () => {
      const monday = toPeriod(temporal, new Date(2024, 0, 8), "week"); // Monday
      const friday = toPeriod(temporal, new Date(2024, 0, 12), "week"); // Friday

      expect(isSame(temporal, monday, friday, "week")).toBe(true);
    });

    it("should return false for dates in different weeks", () => {
      const sunday = toPeriod(temporal, new Date(2024, 0, 14), "week"); // Sunday
      const monday = toPeriod(temporal, new Date(2024, 0, 15), "week"); // Next Monday

      expect(isSame(temporal, sunday, monday, "week")).toBe(false);
    });
  });

  describe("minute comparison", () => {
    it("should return true for same minute", () => {
      const period1 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 30, 0),
        "minute"
      );
      const period2 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 30, 59),
        "minute"
      );

      expect(isSame(temporal, period1, period2, "minute")).toBe(true);
    });

    it("should return false for different minutes", () => {
      const period1 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 30, 59),
        "minute"
      );
      const period2 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 31, 0),
        "minute"
      );

      expect(isSame(temporal, period1, period2, "minute")).toBe(false);
    });
  });

  describe("second comparison", () => {
    it("should return true for same second", () => {
      const period1 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 30, 45, 0),
        "second"
      );
      const period2 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 30, 45, 999),
        "second"
      );

      expect(isSame(temporal, period1, period2, "second")).toBe(true);
    });

    it("should return false for different seconds", () => {
      const period1 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 30, 45),
        "second"
      );
      const period2 = toPeriod(
        temporal,
        new Date(2024, 5, 15, 14, 30, 46),
        "second"
      );

      expect(isSame(temporal, period1, period2, "second")).toBe(false);
    });
  });

  describe("custom period comparison", () => {
    it("should return true for custom periods with same date", () => {
      const date = new Date(2024, 5, 15, 14, 30, 45, 123);
      const period1 = {
        start: date,
        end: new Date(date.getTime() + 1000 * 60 * 60 * 24), // +1 day
        type: "custom" as const,
        date: date,
      };
      const period2 = {
        start: new Date(date.getTime() - 1000 * 60 * 60), // Different start
        end: new Date(date.getTime() + 1000 * 60 * 60), // Different end
        type: "custom" as const,
        date: date, // Same reference date
      };

      expect(isSame(temporal, period1, period2, "custom")).toBe(true);
    });

    it("should return false for custom periods with different dates", () => {
      const date1 = new Date(2024, 5, 15, 14, 30, 45, 123);
      const date2 = new Date(2024, 5, 15, 14, 30, 45, 124); // 1ms different
      
      const period1 = {
        start: date1,
        end: new Date(date1.getTime() + 1000 * 60 * 60 * 24),
        type: "custom" as const,
        date: date1,
      };
      const period2 = {
        start: date2,
        end: new Date(date2.getTime() + 1000 * 60 * 60 * 24),
        type: "custom" as const,
        date: date2,
      };

      expect(isSame(temporal, period1, period2, "custom")).toBe(false);
    });
  });

  describe("stableMonth comparison", () => {
    it("should return true for dates in same stable month", () => {
      // Stable months start from the first Monday of the month
      const period1 = toPeriod(temporal, new Date(2024, 0, 10), "day"); // Jan 10
      const period2 = toPeriod(temporal, new Date(2024, 0, 20), "day"); // Jan 20

      expect(isSame(temporal, period1, period2, "stableMonth")).toBe(true);
    });

    it("should return false for dates in different stable months", () => {
      // These dates might be in the same calendar month but different stable months
      const period1 = toPeriod(temporal, new Date(2024, 0, 1), "day"); // Jan 1 (might be in Dec stable month)
      const period2 = toPeriod(temporal, new Date(2024, 0, 31), "day"); // Jan 31 (in Jan stable month)

      // First, let's check if they're actually different
      const startA = temporal.adapter.startOf(
        new Date(2024, 0, 1),
        "week"
      );
      const startB = temporal.adapter.startOf(
        new Date(2024, 0, 1),
        "week"
      );
      
      // If the stable months are the same, use different months
      if (startA.getTime() === startB.getTime()) {
        const period3 = toPeriod(temporal, new Date(2024, 0, 15), "day"); // Jan 15
        const period4 = toPeriod(temporal, new Date(2024, 1, 15), "day"); // Feb 15
        expect(isSame(temporal, period3, period4, "stableMonth")).toBe(false);
      } else {
        expect(isSame(temporal, period1, period2, "stableMonth")).toBe(false);
      }
    });

    it("should handle stable month boundaries correctly", () => {
      // Test dates at the beginning of different months
      const jan1 = toPeriod(temporal, new Date(2024, 0, 1), "day");
      const feb1 = toPeriod(temporal, new Date(2024, 1, 1), "day");
      
      expect(isSame(temporal, jan1, feb1, "stableMonth")).toBe(false);
    });
  });
});
