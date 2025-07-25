import { describe, it, expect, beforeEach } from "vitest";
import { isWeekend } from "../isWeekend";
import { isWeekday } from "../isWeekday";
import { isToday } from "../isToday";
import { createTemporal } from "../../../createTemporal";
import { createMockAdapter } from "../../../test/functionalMockAdapter";
import type { Period, Temporal } from "../../../types";

describe("Utility Functions", () => {
  let temporal: Temporal;

  beforeEach(() => {
    temporal = createTemporal({
      adapter: createMockAdapter(),
      date: new Date("2024-01-15"), // Monday
      now: new Date("2024-01-15"), // Set now to the same date
    });
  });

  describe("isWeekend", () => {
    it("should return true for Saturday", () => {
      const saturday: Period = {
        start: new Date("2024-01-13"),
        end: new Date("2024-01-13T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-13"),
      };
      expect(isWeekend(saturday)).toBe(true);
    });

    it("should return true for Sunday", () => {
      const sunday: Period = {
        start: new Date("2024-01-14"),
        end: new Date("2024-01-14T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-14"),
      };
      expect(isWeekend(sunday)).toBe(true);
    });

    it("should return false for weekdays", () => {
      const monday: Period = {
        start: new Date("2024-01-15"),
        end: new Date("2024-01-15T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-15"),
      };
      expect(isWeekend(monday)).toBe(false);

      const friday: Period = {
        start: new Date("2024-01-19"),
        end: new Date("2024-01-19T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-19"),
      };
      expect(isWeekend(friday)).toBe(false);
    });
  });

  describe("isWeekday", () => {
    it("should return false for Saturday", () => {
      const saturday: Period = {
        start: new Date("2024-01-13"),
        end: new Date("2024-01-13T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-13"),
      };
      expect(isWeekday(saturday)).toBe(false);
    });

    it("should return false for Sunday", () => {
      const sunday: Period = {
        start: new Date("2024-01-14"),
        end: new Date("2024-01-14T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-14"),
      };
      expect(isWeekday(sunday)).toBe(false);
    });

    it("should return true for weekdays", () => {
      const monday: Period = {
        start: new Date("2024-01-15"),
        end: new Date("2024-01-15T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-15"),
      };
      expect(isWeekday(monday)).toBe(true);

      const wednesday: Period = {
        start: new Date("2024-01-17"),
        end: new Date("2024-01-17T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-17"),
      };
      expect(isWeekday(wednesday)).toBe(true);
    });
  });

  describe("isToday", () => {
    it("should return true for today's period", () => {
      const todayPeriod: Period = {
        start: new Date("2024-01-15"),
        end: new Date("2024-01-15T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-15"),
      };
      expect(isToday(todayPeriod, temporal)).toBe(true);
    });

    it("should return false for yesterday's period", () => {
      const yesterdayPeriod: Period = {
        start: new Date("2024-01-14"),
        end: new Date("2024-01-14T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-14"),
      };
      expect(isToday(yesterdayPeriod, temporal)).toBe(false);
    });

    it("should return false for tomorrow's period", () => {
      const tomorrowPeriod: Period = {
        start: new Date("2024-01-16"),
        end: new Date("2024-01-16T23:59:59.999"),
        type: "day",
        date: new Date("2024-01-16"),
      };
      expect(isToday(tomorrowPeriod, temporal)).toBe(false);
    });

    it("should work with month periods", () => {
      const currentMonth: Period = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31T23:59:59.999"),
        type: "month",
        date: new Date("2024-01-15"),
      };
      // Month containing today should return true when compared at day level
      expect(isToday(currentMonth, temporal)).toBe(true);

      const nextMonth: Period = {
        start: new Date("2024-02-01"),
        end: new Date("2024-02-29T23:59:59.999"),
        type: "month",
        date: new Date("2024-02-15"),
      };
      expect(isToday(nextMonth, temporal)).toBe(false);
    });
  });
});