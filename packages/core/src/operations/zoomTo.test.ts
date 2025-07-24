import { describe, it, expect } from "vitest";
import { zoomTo } from "./zoomTo";
import { createTemporal } from "../createTemporal";
import { mockAdapter } from "../test/mockAdapter";
import { TEST_DATE } from "../test/testDates";

describe("zoomTo", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: mockAdapter,
    weekStartsOn: 1,
  });

  it("should navigate from day to month", () => {
    const dayPeriod = {
      start: new Date(2024, 5, 15, 0, 0, 0),
      end: new Date(2024, 5, 15, 23, 59, 59, 999),
      type: "day" as const,
      date: TEST_DATE,
    };

    const result = zoomTo(temporal, dayPeriod, "month");

    expect(result.type).toBe("month");
    expect(result.start).toEqual(new Date(2024, 5, 1, 0, 0, 0));
    expect(result.end).toEqual(new Date(2024, 5, 30, 23, 59, 59, 999));
    expect(result.date).toEqual(TEST_DATE);
  });

  it("should navigate from month to year", () => {
    const monthPeriod = {
      start: new Date(2024, 5, 1),
      end: new Date(2024, 5, 30, 23, 59, 59, 999),
      type: "month" as const,
      date: TEST_DATE,
    };

    const result = zoomTo(temporal, monthPeriod, "year");

    expect(result.type).toBe("year");
    expect(result.start).toEqual(new Date(2024, 0, 1, 0, 0, 0));
    expect(result.end).toEqual(new Date(2024, 11, 31, 23, 59, 59, 999));
    expect(result.date).toEqual(TEST_DATE);
  });

  it("should navigate from year to week", () => {
    const yearPeriod = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31, 23, 59, 59, 999),
      type: "year" as const,
      date: TEST_DATE,
    };

    const result = zoomTo(temporal, yearPeriod, "week");

    expect(result.type).toBe("week");
    // June 15, 2024 is a Saturday, week starts on Monday (June 10)
    expect(result.start).toEqual(new Date(2024, 5, 10, 0, 0, 0));
    expect(result.end).toEqual(new Date(2024, 5, 16, 23, 59, 59, 999));
    expect(result.date).toEqual(TEST_DATE);
  });

  it("should update browsing date", () => {
    const dayPeriod = {
      start: new Date(2024, 5, 15, 0, 0, 0),
      end: new Date(2024, 5, 15, 23, 59, 59, 999),
      type: "day" as const,
      date: TEST_DATE,
    };

    zoomTo(temporal, dayPeriod, "month");

    expect(temporal.browsing.value.date).toEqual(TEST_DATE);
  });

  it("should handle navigating to the same unit type", () => {
    const monthPeriod = {
      start: new Date(2024, 5, 1),
      end: new Date(2024, 5, 30, 23, 59, 59, 999),
      type: "month" as const,
      date: TEST_DATE,
    };

    const result = zoomTo(temporal, monthPeriod, "month");

    expect(result.type).toBe("month");
    expect(result.start).toEqual(monthPeriod.start);
    expect(result.end).toEqual(monthPeriod.end);
    expect(result.date).toEqual(TEST_DATE);
  });
});
