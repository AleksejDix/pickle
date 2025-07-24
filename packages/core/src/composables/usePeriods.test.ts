import { describe, it, expect } from "vitest";
import { ref, computed } from "@vue/reactivity";
import { usePeriod } from "./usePeriods";
import { createTemporal } from "../createTemporal";
import { createMockAdapter } from "../test/functionalMockAdapter";
import { TEST_DATE } from "../test/testDates";
import type { Unit } from "../types";

describe("usePeriod", () => {
  const temporal = createTemporal({
    date: TEST_DATE,
    adapter: createMockAdapter({ weekStartsOn: 1 }),
    weekStartsOn: 1,
  });

  it("should create a year period", () => {
    const year = usePeriod(temporal, "year");
    expect(year.value.type).toBe("year");
    expect(year.value.start.getFullYear()).toBe(2024);
    expect(year.value.end.getFullYear()).toBe(2024);
  });

  it("should create a month period", () => {
    const month = usePeriod(temporal, "month");
    expect(month.value.type).toBe("month");
    expect(month.value.start.getMonth()).toBe(5); // June
    expect(month.value.end.getMonth()).toBe(5);
  });

  it("should create a week period", () => {
    const week = usePeriod(temporal, "week");
    expect(week.value.type).toBe("week");
  });

  it("should create a day period", () => {
    const day = usePeriod(temporal, "day");
    expect(day.value.type).toBe("day");
    expect(day.value.start.getDate()).toBe(15);
    expect(day.value.end.getDate()).toBe(15);
  });

  it("should handle reactive unit parameter", () => {
    const unit = ref<Unit>("year");
    const period = usePeriod(temporal, unit);

    expect(period.value.type).toBe("year");

    // Change unit
    unit.value = "month";
    expect(period.value.type).toBe("month");

    // Change to day
    unit.value = "day";
    expect(period.value.type).toBe("day");
  });

  it("should handle computed unit parameter", () => {
    const isYearView = ref(true);
    const unit = computed(() => (isYearView.value ? "year" : "month"));
    const period = usePeriod(temporal, unit);

    expect(period.value.type).toBe("year");

    // Toggle view
    isYearView.value = false;
    expect(period.value.type).toBe("month");
  });

  it("should support all unit types", () => {
    const units: Unit[] = [
      "year",
      "month",
      "week",
      "day",
      "hour",
      "minute",
      "second",
      "quarter",
      "stableMonth",
    ];

    units.forEach((unit) => {
      const period = usePeriod(temporal, unit);
      expect(period.value.type).toBe(unit);
    });
  });

  it("should be reactive to browsing changes", () => {
    const month = usePeriod(temporal, "month");
    const initialMonth = month.value.start.getMonth();

    // Change browsing date
    temporal.browsing.value = {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 1),
      type: "day",
      date: new Date(2024, 0, 1),
    };

    expect(month.value.start.getMonth()).toBe(0); // January
    expect(month.value.start.getMonth()).not.toBe(initialMonth);
  });
});
