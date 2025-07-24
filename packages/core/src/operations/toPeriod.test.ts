import { describe, it, expect } from "vitest";
import { toPeriod } from "./toPeriod";
import { createTemporal } from "../createTemporal";
import { createMockAdapter } from "../test/functionalMockAdapter";
import { TEST_DATE } from "../test/testDates";

describe("toPeriod", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: createMockAdapter({ weekStartsOn: 1 }),
    weekStartsOn: 1,
  });

  it("should create a day period by default", () => {
    const date = new Date(2024, 5, 15);
    const period = toPeriod(temporal, date);

    expect(period.type).toBe("day");
    expect(period.date).toEqual(date);
  });

  it("should create a month period", () => {
    const date = new Date(2024, 5, 15);
    const period = toPeriod(temporal, date, "month");

    expect(period.type).toBe("month");
    expect(period.date).toEqual(date);
  });

  it("should create a year period", () => {
    const date = new Date(2024, 5, 15);
    const period = toPeriod(temporal, date, "year");

    expect(period.type).toBe("year");
    expect(period.date).toEqual(date);
  });

  it("should create a week period", () => {
    const date = new Date(2024, 0, 8); // January 8, 2024 (Monday)
    const period = toPeriod(temporal, date, "week");

    expect(period.type).toBe("week");
    expect(period.date).toEqual(date);
  });

  it("should create an hour period", () => {
    const date = new Date(2024, 5, 15, 14, 30);
    const period = toPeriod(temporal, date, "hour");

    expect(period.type).toBe("hour");
    expect(period.date).toEqual(date);
  });

  it("should create a quarter period", () => {
    const date = new Date(2024, 3, 15); // April 15 (Q2)
    const period = toPeriod(temporal, date, "quarter");

    expect(period.type).toBe("quarter");
    expect(period.date).toEqual(date);
  });
});
