import { describe, it, expect } from "vitest";
import { isSame } from "./isSame";
import { toPeriod } from "./toPeriod";
import { createTemporal } from "../createTemporal";
import { withAllAdapters, getAdapterTestCases } from "../test/shared-adapter-tests";
import { TEST_DATE, testDates } from "../test/testDates";

// Example using withAllAdapters wrapper
withAllAdapters("isSame operation", (adapter) => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter,
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

  describe("custom period comparison", () => {
    it("should return true for custom periods with same date", () => {
      const date = new Date(2024, 5, 15, 14, 30, 45, 123);
      const period1 = {
        start: date,
        end: new Date(date.getTime() + 1000 * 60 * 60 * 24),
        type: "custom" as const,
        date: date,
      };
      const period2 = {
        start: new Date(date.getTime() - 1000 * 60 * 60),
        end: new Date(date.getTime() + 1000 * 60 * 60),
        type: "custom" as const,
        date: date,
      };

      expect(isSame(temporal, period1, period2, "custom")).toBe(true);
    });
  });
});

// Alternative: Using describe.each for more granular control
const adapters = getAdapterTestCases();

describe.each(adapters)("isSame with %s adapter", (_, adapter) => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter,
    weekStartsOn: 1,
  });

  it("should handle month comparison correctly", () => {
    const period1 = toPeriod(temporal, testDates.jun1, "month");
    const period2 = toPeriod(temporal, testDates.jun30, "month");

    expect(isSame(temporal, period1, period2, "month")).toBe(true);
  });

  it("should handle null/undefined correctly", () => {
    const period = toPeriod(temporal, testDates.jun15, "day");

    expect(isSame(temporal, null, period, "day")).toBe(false);
    expect(isSame(temporal, period, null, "day")).toBe(false);
    expect(isSame(temporal, null, null, "day")).toBe(false);
  });
});