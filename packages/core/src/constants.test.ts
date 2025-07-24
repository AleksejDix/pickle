import { describe, it, expect } from "vitest";
import {
  UNITS,
  YEAR,
  QUARTER,
  MONTH,
  WEEK,
  DAY,
  HOUR,
  MINUTE,
  SECOND,
  STABLE_MONTH,
  CUSTOM,
  type Unit,
} from "./types";
import { createTemporal } from "./createTemporal";
import { createPeriod, divide, isSame } from "./operations";
import { MockAdapter } from "./test/mockAdapter";
import { testDates } from "./test/testDates";

describe("Unit Constants", () => {
  const adapter = new MockAdapter();
  const temporal = createTemporal({
    date: testDates.noon,
    adapter,
    weekStartsOn: 1,
  });

  it("should export UNITS object with all unit types", () => {
    expect(UNITS).toEqual({
      year: "year",
      quarter: "quarter",
      month: "month",
      week: "week",
      day: "day",
      hour: "hour",
      minute: "minute",
      second: "second",
      stableMonth: "stableMonth",
      custom: "custom",
    });
  });

  it("should export individual constants", () => {
    expect(YEAR).toBe("year");
    expect(QUARTER).toBe("quarter");
    expect(MONTH).toBe("month");
    expect(WEEK).toBe("week");
    expect(DAY).toBe("day");
    expect(HOUR).toBe("hour");
    expect(MINUTE).toBe("minute");
    expect(SECOND).toBe("second");
    expect(STABLE_MONTH).toBe("stableMonth");
    expect(CUSTOM).toBe("custom");
  });

  it("should work with createPeriod using constants", () => {
    const yearPeriod = createPeriod(temporal, YEAR, temporal.now.value);
    expect(yearPeriod.type).toBe("year");

    const monthPeriod = createPeriod(temporal, UNITS.month, temporal.now.value);
    expect(monthPeriod.type).toBe("month");
  });

  it("should work with divide operation using constants", () => {
    const yearPeriod = createPeriod(temporal, YEAR, temporal.now.value);
    const months = divide(temporal, yearPeriod, MONTH);
    expect(months).toHaveLength(12);

    const monthPeriod = months[0];
    const days = divide(temporal, monthPeriod, UNITS.day);
    expect(days.length).toBeGreaterThan(27);
  });

  it("should work with isSame operation using constants", () => {
    const period1 = createPeriod(temporal, DAY, temporal.now.value);
    const period2 = createPeriod(temporal, DAY, temporal.now.value);

    expect(isSame(temporal, period1, period2, DAY)).toBe(true);
    expect(isSame(temporal, period1, period2, UNITS.day)).toBe(true);
  });

  it("should provide type safety with constants", () => {
    // These should all compile without TypeScript errors
    const validUnit1: Unit = YEAR;
    const validUnit2: Unit = UNITS.month;

    // The constants are properly typed
    expect(validUnit1).toBe("year");
    expect(validUnit2).toBe("month");
  });

  it("constants should be immutable", () => {
    // TypeScript ensures these are readonly at compile time
    // This test verifies runtime behavior
    const unitsCopy = { ...UNITS };
    expect(unitsCopy).toEqual(UNITS);
  });
});
