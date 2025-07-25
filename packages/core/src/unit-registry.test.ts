import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  defineUnit,
  getUnitDefinition,
  hasUnit,
  getRegisteredUnits,
  clearUnitRegistry,
  type UnitDefinition,
} from "./unit-registry";
import { mockAdapter } from "./test/functionalMockAdapter";

describe("unit-registry", () => {
  beforeEach(() => {
    clearUnitRegistry();
    vi.clearAllMocks();
  });

  describe("defineUnit", () => {
    it("should register a new unit", () => {
      const sprintDefinition: UnitDefinition = {
        createPeriod: (date) => ({
          start: date,
          end: new Date(date.getTime() + 13 * 24 * 60 * 60 * 1000), // 2 weeks
        }),
        divisions: ["week", "day"],
        mergesTo: "quarter",
      };

      defineUnit("sprint", sprintDefinition);
      
      expect(hasUnit("sprint")).toBe(true);
      expect(getUnitDefinition("sprint")).toBe(sprintDefinition);
    });

    it("should warn when overwriting existing unit", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      
      const definition1: UnitDefinition = {
        createPeriod: () => ({ start: new Date(), end: new Date() }),
      };
      const definition2: UnitDefinition = {
        createPeriod: () => ({ start: new Date(), end: new Date() }),
      };

      defineUnit("test", definition1);
      defineUnit("test", definition2);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Unit type "test" is already defined. Overwriting previous definition.'
      );
      expect(getUnitDefinition("test")).toBe(definition2);
    });
  });

  describe("getUnitDefinition", () => {
    it("should return undefined for non-existent unit", () => {
      expect(getUnitDefinition("nonexistent")).toBeUndefined();
    });

    it("should return the unit definition", () => {
      const definition: UnitDefinition = {
        createPeriod: (date) => ({ start: date, end: date }),
      };
      
      defineUnit("custom", definition);
      expect(getUnitDefinition("custom")).toBe(definition);
    });
  });

  describe("hasUnit", () => {
    it("should return false for non-existent unit", () => {
      expect(hasUnit("nonexistent")).toBe(false);
    });

    it("should return true for registered unit", () => {
      defineUnit("test", {
        createPeriod: () => ({ start: new Date(), end: new Date() }),
      });
      
      expect(hasUnit("test")).toBe(true);
    });
  });

  describe("getRegisteredUnits", () => {
    it("should return empty array when no units registered", () => {
      expect(getRegisteredUnits()).toEqual([]);
    });

    it("should return all registered unit types", () => {
      defineUnit("unit1", {
        createPeriod: () => ({ start: new Date(), end: new Date() }),
      });
      defineUnit("unit2", {
        createPeriod: () => ({ start: new Date(), end: new Date() }),
      });
      defineUnit("unit3", {
        createPeriod: () => ({ start: new Date(), end: new Date() }),
      });

      const units = getRegisteredUnits();
      expect(units).toHaveLength(3);
      expect(units).toContain("unit1");
      expect(units).toContain("unit2");
      expect(units).toContain("unit3");
    });
  });

  describe("clearUnitRegistry", () => {
    it("should remove all registered units", () => {
      defineUnit("test1", {
        createPeriod: () => ({ start: new Date(), end: new Date() }),
      });
      defineUnit("test2", {
        createPeriod: () => ({ start: new Date(), end: new Date() }),
      });

      expect(getRegisteredUnits()).toHaveLength(2);
      
      clearUnitRegistry();
      
      expect(getRegisteredUnits()).toHaveLength(0);
      expect(hasUnit("test1")).toBe(false);
      expect(hasUnit("test2")).toBe(false);
    });
  });

  describe("UnitDefinition", () => {
    it("should support validation function", () => {
      const definition: UnitDefinition = {
        createPeriod: (date) => ({
          start: date,
          end: new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000),
        }),
        validate: (period) => {
          const duration = period.end.getTime() - period.start.getTime();
          const days = duration / (24 * 60 * 60 * 1000);
          return days === 7; // Must be exactly 7 days
        },
      };

      defineUnit("week-strict", definition);
      const def = getUnitDefinition("week-strict");

      // Valid 7-day period
      const validPeriod = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-08"),
        type: "week-strict",
      };
      expect(def?.validate?.(validPeriod)).toBe(true);

      // Invalid 6-day period
      const invalidPeriod = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-07"),
        type: "week-strict",
      };
      expect(def?.validate?.(invalidPeriod)).toBe(false);
    });

    it("should use adapter in createPeriod", () => {
      const definition: UnitDefinition = {
        createPeriod: (date, adapter) => ({
          start: adapter.startOf(date, "month"),
          end: adapter.endOf(date, "month"),
        }),
      };

      defineUnit("fiscal-month", definition);
      const def = getUnitDefinition("fiscal-month");
      
      const testDate = new Date("2024-07-15");
      const result = def?.createPeriod(testDate, mockAdapter);
      
      // Using the helper functions to get expected values
      const expectedStart = new Date(testDate);
      expectedStart.setDate(1);
      expectedStart.setHours(0, 0, 0, 0);
      
      const expectedEnd = new Date(testDate);
      expectedEnd.setMonth(expectedEnd.getMonth() + 1, 0);
      expectedEnd.setHours(23, 59, 59, 999);
      
      expect(result?.start).toEqual(expectedStart);
      expect(result?.end).toEqual(expectedEnd);
    });
  });

  describe("Complex unit examples", () => {
    it("should support academic semester unit", () => {
      const semesterDefinition: UnitDefinition = {
        createPeriod: (date) => {
          const month = date.getMonth();
          const year = date.getFullYear();
          
          // Fall semester: Aug 15 - Dec 15
          // Spring semester: Jan 15 - May 15
          if (month >= 7 && month <= 11) {
            return {
              start: new Date(year, 7, 15), // Aug 15
              end: new Date(year, 11, 15),  // Dec 15
            };
          } else {
            const semesterYear = month === 0 ? year : year - 1;
            return {
              start: new Date(semesterYear + 1, 0, 15), // Jan 15
              end: new Date(semesterYear + 1, 4, 15),   // May 15
            };
          }
        },
        divisions: ["month", "week", "day"],
        mergesTo: "academic-year",
      };

      defineUnit("semester", semesterDefinition);
      const def = getUnitDefinition("semester");
      
      // Test fall semester
      const fallDate = new Date("2024-09-01");
      const fallResult = def?.createPeriod(fallDate, mockAdapter);
      expect(fallResult?.start).toEqual(new Date(2024, 7, 15)); // Aug 15
      expect(fallResult?.end).toEqual(new Date(2024, 11, 15));  // Dec 15
      
      // Test spring semester
      const springDate = new Date("2024-02-01");
      const springResult = def?.createPeriod(springDate, mockAdapter);
      expect(springResult?.start).toEqual(new Date(2024, 0, 15)); // Jan 15
      expect(springResult?.end).toEqual(new Date(2024, 4, 15));   // May 15
    });

    it("should support business quarter with fiscal year offset", () => {
      const fiscalQuarterDefinition: UnitDefinition = {
        createPeriod: (date) => {
          // Fiscal year starts April 1
          const month = date.getMonth();
          const year = date.getFullYear();
          
          if (month >= 3 && month <= 5) {
            // Q1: Apr-Jun
            return {
              start: new Date(year, 3, 1),
              end: new Date(year, 5, 30),
            };
          } else if (month >= 6 && month <= 8) {
            // Q2: Jul-Sep
            return {
              start: new Date(year, 6, 1),
              end: new Date(year, 8, 30),
            };
          } else if (month >= 9 && month <= 11) {
            // Q3: Oct-Dec
            return {
              start: new Date(year, 9, 1),
              end: new Date(year, 11, 31),
            };
          } else {
            // Q4: Jan-Mar
            const qYear = month === 0 || month === 1 || month === 2 ? year : year + 1;
            return {
              start: new Date(qYear, 0, 1),
              end: new Date(qYear, 2, 31),
            };
          }
        },
        divisions: ["month", "week", "day"],
        mergesTo: "fiscal-year",
      };

      defineUnit("fiscal-quarter", fiscalQuarterDefinition);
      expect(hasUnit("fiscal-quarter")).toBe(true);
    });
  });
});