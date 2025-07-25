import { describe, it, expect, vi } from "vitest";
import { getUnitDefinition, hasUnit } from "../unit-registry";
import { mockAdapter } from "../test/functionalMockAdapter";
import "../units/definitions"; // Import to register units

// Helper to create expected dates using the mock adapter logic
function createExpectedStart(date: Date, unit: string): Date {
  const result = new Date(date);
  switch (unit) {
    case "year":
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
    case "quarter":
      const month = result.getMonth();
      const quarterStartMonth = Math.floor(month / 3) * 3;
      result.setMonth(quarterStartMonth, 1);
      result.setHours(0, 0, 0, 0);
      break;
    case "month":
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case "week":
      const day = result.getDay();
      const diff = (day - 1 + 7) % 7; // weekStartsOn = 1
      result.setDate(result.getDate() - diff);
      result.setHours(0, 0, 0, 0);
      break;
    case "day":
      result.setHours(0, 0, 0, 0);
      break;
    case "hour":
      result.setMinutes(0, 0, 0);
      break;
    case "minute":
      result.setSeconds(0, 0);
      break;
    case "second":
      result.setMilliseconds(0);
      break;
  }
  return result;
}

function createExpectedEnd(date: Date, unit: string): Date {
  const result = new Date(date);
  switch (unit) {
    case "year":
      result.setMonth(11, 31);
      result.setHours(23, 59, 59, 999);
      break;
    case "quarter":
      const month = result.getMonth();
      const quarterStartMonth = Math.floor(month / 3) * 3;
      result.setMonth(quarterStartMonth + 3, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case "month":
      result.setMonth(result.getMonth() + 1, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case "week":
      const day = result.getDay();
      const diff = (day - 1 + 7) % 7; // weekStartsOn = 1
      result.setDate(result.getDate() - diff + 6);
      result.setHours(23, 59, 59, 999);
      break;
    case "day":
      result.setHours(23, 59, 59, 999);
      break;
    case "hour":
      result.setMinutes(59, 59, 999);
      break;
    case "minute":
      result.setSeconds(59, 999);
      break;
    case "second":
      result.setMilliseconds(999);
      break;
  }
  return result;
}

describe("units/definitions", () => {
  // The definitions module registers units on import, so we need to ensure
  // it's loaded before our tests run

  describe("year unit", () => {
    it("should be registered", () => {
      expect(hasUnit("year")).toBe(true);
    });

    it("should create correct period", () => {
      const definition = getUnitDefinition("year");
      expect(definition).toBeDefined();

      const testDate = new Date("2024-07-15T10:30:00");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "year"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "year"));
    });

    it("should have correct divisions", () => {
      const definition = getUnitDefinition("year");
      expect(definition?.divisions).toEqual(["quarter", "month", "week", "day"]);
    });

    it("should not have mergesTo", () => {
      const definition = getUnitDefinition("year");
      expect(definition?.mergesTo).toBeUndefined();
    });
  });

  describe("quarter unit", () => {
    it("should be registered", () => {
      expect(hasUnit("quarter")).toBe(true);
    });

    it("should create correct period for Q1", () => {
      const definition = getUnitDefinition("quarter");
      const testDate = new Date("2024-02-15");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "quarter"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "quarter"));
    });

    it("should create correct period for Q2", () => {
      const definition = getUnitDefinition("quarter");
      const testDate = new Date("2024-05-15");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "quarter"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "quarter"));
    });

    it("should create correct period for Q3", () => {
      const definition = getUnitDefinition("quarter");
      const testDate = new Date("2024-08-15");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "quarter"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "quarter"));
    });

    it("should create correct period for Q4", () => {
      const definition = getUnitDefinition("quarter");
      const testDate = new Date("2024-11-15");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "quarter"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "quarter"));
    });

    it("should have correct divisions", () => {
      const definition = getUnitDefinition("quarter");
      expect(definition?.divisions).toEqual(["month", "week", "day"]);
    });

    it("should merge to year", () => {
      const definition = getUnitDefinition("quarter");
      expect(definition?.mergesTo).toBe("year");
    });
  });

  describe("month unit", () => {
    it("should be registered", () => {
      expect(hasUnit("month")).toBe(true);
    });

    it("should create correct period", () => {
      const definition = getUnitDefinition("month");
      const testDate = new Date("2024-07-15T10:30:00");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "month"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "month"));
    });

    it("should handle February correctly", () => {
      const definition = getUnitDefinition("month");
      const testDate = new Date("2024-02-15");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "month"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "month"));
    });

    it("should have correct divisions", () => {
      const definition = getUnitDefinition("month");
      expect(definition?.divisions).toEqual(["week", "day"]);
    });

    it("should merge to quarter", () => {
      const definition = getUnitDefinition("month");
      expect(definition?.mergesTo).toBe("quarter");
    });
  });

  describe("week unit", () => {
    it("should be registered", () => {
      expect(hasUnit("week")).toBe(true);
    });

    it("should create correct period", () => {
      const definition = getUnitDefinition("week");
      // Mock adapter uses Monday as start of week (weekStartsOn = 1)
      const testDate = new Date("2024-07-15"); // Monday
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "week"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "week"));
    });

    it("should have correct divisions", () => {
      const definition = getUnitDefinition("week");
      expect(definition?.divisions).toEqual(["day"]);
    });

    it("should merge to month", () => {
      const definition = getUnitDefinition("week");
      expect(definition?.mergesTo).toBe("month");
    });
  });

  describe("day unit", () => {
    it("should be registered", () => {
      expect(hasUnit("day")).toBe(true);
    });

    it("should create correct period", () => {
      const definition = getUnitDefinition("day");
      const testDate = new Date("2024-07-15T10:30:00");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "day"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "day"));
    });

    it("should have correct divisions", () => {
      const definition = getUnitDefinition("day");
      expect(definition?.divisions).toEqual(["hour"]);
    });

    it("should merge to week", () => {
      const definition = getUnitDefinition("day");
      expect(definition?.mergesTo).toBe("week");
    });
  });

  describe("hour unit", () => {
    it("should be registered", () => {
      expect(hasUnit("hour")).toBe(true);
    });

    it("should create correct period", () => {
      const definition = getUnitDefinition("hour");
      const testDate = new Date("2024-07-15T10:30:45.123");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "hour"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "hour"));
    });

    it("should have correct divisions", () => {
      const definition = getUnitDefinition("hour");
      expect(definition?.divisions).toEqual(["minute"]);
    });

    it("should merge to day", () => {
      const definition = getUnitDefinition("hour");
      expect(definition?.mergesTo).toBe("day");
    });
  });

  describe("minute unit", () => {
    it("should be registered", () => {
      expect(hasUnit("minute")).toBe(true);
    });

    it("should create correct period", () => {
      const definition = getUnitDefinition("minute");
      const testDate = new Date("2024-07-15T10:30:45.123");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "minute"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "minute"));
    });

    it("should have correct divisions", () => {
      const definition = getUnitDefinition("minute");
      expect(definition?.divisions).toEqual(["second"]);
    });

    it("should merge to hour", () => {
      const definition = getUnitDefinition("minute");
      expect(definition?.mergesTo).toBe("hour");
    });
  });

  describe("second unit", () => {
    it("should be registered", () => {
      expect(hasUnit("second")).toBe(true);
    });

    it("should create correct period", () => {
      const definition = getUnitDefinition("second");
      const testDate = new Date("2024-07-15T10:30:45.123");
      const period = definition!.createPeriod(testDate, mockAdapter);

      expect(period.start).toEqual(createExpectedStart(testDate, "second"));
      expect(period.end).toEqual(createExpectedEnd(testDate, "second"));
    });

    it("should have empty divisions", () => {
      const definition = getUnitDefinition("second");
      expect(definition?.divisions).toEqual([]);
    });

    it("should merge to minute", () => {
      const definition = getUnitDefinition("second");
      expect(definition?.mergesTo).toBe("minute");
    });
  });

  describe("all units", () => {
    it("should use adapter methods correctly", () => {
      const units = ["year", "quarter", "month", "week", "day", "hour", "minute", "second"];
      const testDate = new Date("2024-07-15T10:30:45.123");

      units.forEach(unit => {
        const definition = getUnitDefinition(unit);
        expect(definition).toBeDefined();

        // Create a spy adapter to verify method calls
        const spyAdapter = {
          startOf: vi.fn().mockImplementation(mockAdapter.startOf),
          endOf: vi.fn().mockImplementation(mockAdapter.endOf),
          add: vi.fn().mockImplementation(mockAdapter.add),
          diff: vi.fn().mockImplementation(mockAdapter.diff),
        };

        definition!.createPeriod(testDate, spyAdapter);

        // Each unit should call startOf and endOf exactly once
        expect(spyAdapter.startOf).toHaveBeenCalledTimes(1);
        expect(spyAdapter.startOf).toHaveBeenCalledWith(testDate, unit);
        
        expect(spyAdapter.endOf).toHaveBeenCalledTimes(1);
        expect(spyAdapter.endOf).toHaveBeenCalledWith(testDate, unit);
      });
    });

    it("should form a complete hierarchy", () => {
      // Verify the unit hierarchy is complete
      const hierarchy = {
        year: { divisions: ["quarter", "month", "week", "day"], mergesTo: undefined },
        quarter: { divisions: ["month", "week", "day"], mergesTo: "year" },
        month: { divisions: ["week", "day"], mergesTo: "quarter" },
        week: { divisions: ["day"], mergesTo: "month" },
        day: { divisions: ["hour"], mergesTo: "week" },
        hour: { divisions: ["minute"], mergesTo: "day" },
        minute: { divisions: ["second"], mergesTo: "hour" },
        second: { divisions: [], mergesTo: "minute" },
      };

      Object.entries(hierarchy).forEach(([unit, expected]) => {
        const definition = getUnitDefinition(unit);
        expect(definition?.divisions).toEqual(expected.divisions);
        expect(definition?.mergesTo).toBe(expected.mergesTo);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle date boundaries correctly", () => {
      // Test year boundary
      const yearDef = getUnitDefinition("year");
      const newYear = new Date("2024-01-01T00:00:00");
      const yearPeriod = yearDef!.createPeriod(newYear, mockAdapter);
      expect(yearPeriod.start).toEqual(createExpectedStart(newYear, "year"));

      // Test month boundary
      const monthDef = getUnitDefinition("month");
      const monthStart = new Date("2024-07-01T00:00:00");
      const monthPeriod = monthDef!.createPeriod(monthStart, mockAdapter);
      expect(monthPeriod.start).toEqual(createExpectedStart(monthStart, "month"));

      // Test day boundary
      const dayDef = getUnitDefinition("day");
      const midnight = new Date("2024-07-15T00:00:00");
      const dayPeriod = dayDef!.createPeriod(midnight, mockAdapter);
      expect(dayPeriod.start).toEqual(createExpectedStart(midnight, "day"));
    });

    it("should handle different timezones correctly", () => {
      // This test verifies that the adapter is responsible for timezone handling
      const definition = getUnitDefinition("day");
      
      // Create dates in different timezone representations
      const utcDate = new Date("2024-07-15T12:00:00Z");
      const localDate = new Date("2024-07-15T12:00:00");
      
      // The mock adapter handles these the same way (as it should for testing)
      const utcPeriod = definition!.createPeriod(utcDate, mockAdapter);
      const localPeriod = definition!.createPeriod(localDate, mockAdapter);
      
      // Both should produce the same day boundaries in the adapter's timezone
      expect(utcPeriod.start.toISOString()).toBe(localPeriod.start.toISOString());
      expect(utcPeriod.end.toISOString()).toBe(localPeriod.end.toISOString());
    });
  });
});