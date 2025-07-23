import { describe, test, expect, beforeEach } from "vitest";
import { createTemporal } from "../../src/core/createTemporal";
import { nativeAdapter } from "../../../adapter-native/src";
import { periods } from "../../src/composables/periods";
// Import composables to trigger registration
import "../../src/composables";

describe("Unified Time Navigation", () => {
  let temporal: any;

  beforeEach(() => {
    temporal = createTemporal({
      date: new Date(2024, 0, 15), // January 15, 2024
      now: new Date(2024, 0, 15),
      dateAdapter: nativeAdapter,
      weekStartsOn: 1, // Monday
    });
  });

  describe("split()", () => {
    test("split by unit (equivalent to divide)", () => {
      const year = periods.year(temporal);
      const months = temporal.split(year, { by: "month" });

      expect(months).toHaveLength(12);
      expect(months[0].start.value.getMonth()).toBe(0); // January
      expect(months[11].start.value.getMonth()).toBe(11); // December
    });

    test("split by count", () => {
      const year = periods.year(temporal);
      const quarters = temporal.split(year, { count: 4 });

      expect(quarters).toHaveLength(4);

      // Each quarter should be 3 months
      const q1Duration =
        quarters[0].end.value.getTime() - quarters[0].start.value.getTime();
      const q2Duration =
        quarters[1].end.value.getTime() - quarters[1].start.value.getTime();

      // Roughly equal (accounting for different month lengths)
      expect(Math.abs(q1Duration - q2Duration)).toBeLessThan(
        5 * 24 * 60 * 60 * 1000
      ); // Within 5 days
    });

    test("split by duration - weeks", () => {
      const month = periods.month(temporal);
      const twoWeekPeriods = temporal.split(month, { duration: { weeks: 2 } });

      expect(twoWeekPeriods.length).toBeGreaterThanOrEqual(2);

      // First period should be 2 weeks
      const firstPeriod = twoWeekPeriods[0];
      const duration =
        firstPeriod.end.value.getTime() - firstPeriod.start.value.getTime();
      const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

      expect(duration).toBe(twoWeeksMs);
    });

    test("split by duration - days and hours", () => {
      const week = periods.week(temporal);
      const splitPeriods = temporal.split(week, {
        duration: { days: 2, hours: 12 },
      });

      expect(splitPeriods.length).toBe(3); // 7 days / 2.5 days = ~3 periods

      // Check first period duration
      const firstDuration =
        splitPeriods[0].end.value.getTime() -
        splitPeriods[0].start.value.getTime();
      const expectedDuration = 2.5 * 24 * 60 * 60 * 1000;

      expect(firstDuration).toBe(expectedDuration);
    });

    test("throws error without valid options", () => {
      const month = periods.month(temporal);

      expect(() => temporal.split(month, {})).toThrow(
        "Split options must specify 'by', 'count', or 'duration'"
      );
    });
  });

  describe("merge()", () => {
    test("merge 7 consecutive days into week", () => {
      const week = periods.week(temporal);
      const days = temporal.divide(week, "day");

      expect(days).toHaveLength(7);

      const mergedWeek = temporal.merge(days);

      expect(mergedWeek).not.toBeNull();
      expect(mergedWeek!.start.value.getTime()).toBe(
        week.start.value.getTime()
      );
      expect(mergedWeek!.end.value.getTime()).toBe(week.end.value.getTime());

      // Should detect as natural week unit
      // (This will work once detectNaturalUnit is fully implemented)
    });

    test("merge non-consecutive periods creates custom period", () => {
      const jan = periods.month({
        ...temporal,
        browsing: new Date(2024, 0, 1),
      });
      const mar = periods.month({
        ...temporal,
        browsing: new Date(2024, 2, 1),
      });
      const may = periods.month({
        ...temporal,
        browsing: new Date(2024, 4, 1),
      });

      const merged = temporal.merge([jan, mar, may]);

      expect(merged).not.toBeNull();
      expect(merged!.start.value.getMonth()).toBe(0); // January
      expect(merged!.end.value.getMonth()).toBe(4); // May end
      expect(merged!._type).toBe("customPeriod");
    });

    test("merge empty array returns null", () => {
      const result = temporal.merge([]);
      expect(result).toBeNull();
    });

    test("merge sorts periods by start time", () => {
      const mar = periods.month({
        ...temporal,
        browsing: new Date(2024, 2, 1),
      });
      const jan = periods.month({
        ...temporal,
        browsing: new Date(2024, 0, 1),
      });
      const feb = periods.month({
        ...temporal,
        browsing: new Date(2024, 1, 1),
      });

      const merged = temporal.merge([mar, jan, feb]);

      expect(merged).not.toBeNull();
      expect(merged!.start.value.getMonth()).toBe(0); // January
      expect(merged!.end.value.getMonth()).toBe(2); // March end
    });
  });

  describe("createPeriod()", () => {
    test("creates custom period with TimeUnit interface", () => {
      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 0, 14);

      const sprint = temporal.createPeriod(start, end);

      expect(sprint.start.value).toEqual(start);
      expect(sprint.end.value).toEqual(end);
      expect(sprint.period.value).toEqual({ start, end });
      expect(sprint._type).toBe("customPeriod");
    });

    test("custom period navigation", () => {
      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 0, 14);
      const sprint = temporal.createPeriod(start, end);

      // Test next()
      const initialBrowsing = sprint.browsing.value.getTime();
      sprint.next();
      const duration = end.getTime() - start.getTime();
      expect(sprint.browsing.value.getTime()).toBe(initialBrowsing + duration);

      // Test previous()
      sprint.previous();
      expect(sprint.browsing.value.getTime()).toBe(initialBrowsing);

      // Test go()
      sprint.go(2);
      expect(sprint.browsing.value.getTime()).toBe(
        initialBrowsing + duration * 2
      );
    });

    test("custom period contains()", () => {
      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 0, 14);
      const sprint = temporal.createPeriod(start, end);

      const insideDate = new Date(2024, 0, 7);
      const outsideDate = new Date(2024, 0, 20);

      expect(sprint.contains(insideDate)).toBe(true);
      expect(sprint.contains(outsideDate)).toBe(false);
    });

    test("custom period isNow", () => {
      const now = new Date();
      const start = new Date(now.getTime() - 1000); // 1 second ago
      const end = new Date(now.getTime() + 1000); // 1 second from now

      const period = temporal.createPeriod(start, end);

      // Since temporal.now is set to Jan 15, 2024, this should be false
      expect(period.isNow.value).toBe(false);
    });
  });

  describe("Integration with existing API", () => {
    test("divide still works alongside split", () => {
      const year = periods.year(temporal);

      const monthsViaDivide = temporal.divide(year, "month");
      const monthsViaSplit = temporal.split(year, { by: "month" });

      expect(monthsViaDivide).toHaveLength(12);
      expect(monthsViaSplit).toHaveLength(12);

      // Should produce identical results
      monthsViaDivide.forEach((month, i) => {
        expect(month.start.value.getTime()).toBe(
          monthsViaSplit[i].start.value.getTime()
        );
      });
    });

    test("custom periods work with existing methods", () => {
      const sprint = temporal.createPeriod(
        new Date(2024, 0, 1),
        new Date(2024, 0, 14)
      );

      // Can use split on custom period
      const days = temporal.split(sprint, { by: "day" });
      expect(days).toHaveLength(14);

      // Can check contains with other TimeUnits
      const jan7 = periods.day({ ...temporal, browsing: new Date(2024, 0, 7) });
      expect(sprint.contains(jan7)).toBe(true);
    });
  });

  describe("Complex scenarios", () => {
    test("fiscal year quarters", () => {
      // Fiscal year: April 1 - March 31
      const fiscalYear = temporal.createPeriod(
        new Date(2024, 3, 1), // April 1, 2024
        new Date(2025, 2, 31) // March 31, 2025
      );

      const quarters = temporal.split(fiscalYear, { count: 4 });

      expect(quarters).toHaveLength(4);
      expect(quarters[0].start.value.getMonth()).toBe(3); // Q1 starts in April
      expect(quarters[3].end.value.getMonth()).toBe(2); // Q4 ends in March
    });

    test("academic semester system", () => {
      const academicYear = temporal.createPeriod(
        new Date(2024, 8, 1), // September 1
        new Date(2025, 5, 30) // June 30
      );

      const semesters = temporal.split(academicYear, { count: 2 });

      expect(semesters).toHaveLength(2);

      // Check a date falls in fall semester
      const november = new Date(2024, 10, 15);
      expect(semesters[0].contains(november)).toBe(true);
      expect(semesters[1].contains(november)).toBe(false);
    });

    test("sprint planning with 2-week sprints", () => {
      // Create a quarter period (Jan-Mar 2024)
      const quarterStart = new Date(2024, 0, 1);
      const quarterEnd = new Date(2024, 2, 31);
      const quarter = temporal.createPeriod(quarterStart, quarterEnd);

      const sprints = temporal.split(quarter, { duration: { weeks: 2 } });

      expect(sprints.length).toBeGreaterThanOrEqual(6); // At least 6 2-week sprints in a quarter

      // All sprints should be 2 weeks except possibly the last
      for (let i = 0; i < sprints.length - 1; i++) {
        const duration =
          sprints[i].end.value.getTime() - sprints[i].start.value.getTime();
        const twoWeeks = 14 * 24 * 60 * 60 * 1000;
        expect(duration).toBe(twoWeeks);
      }
    });
  });

  describe("Zoom navigation (placeholders for now)", () => {
    test("zoom methods exist but throw helpful errors", () => {
      const month = periods.month(temporal);

      expect(() => month.zoomIn("day")).toThrow(
        "zoomIn requires temporal context. Use temporal.divide() for now."
      );

      expect(() => month.zoomOut("year")).toThrow(
        "zoomOut requires temporal context. This will be implemented soon."
      );

      expect(() => month.zoomTo("year")).toThrow(
        "zoomTo requires temporal context. This will be implemented soon."
      );
    });
  });
});
