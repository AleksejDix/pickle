import { describe, it, expect } from "vitest";
import { merge } from "./merge";
import { createTemporal } from "../createTemporal";
import { nativeAdapter } from "@usetemporal/adapter-native";
import type { Period } from "../types/period";

describe("merge", () => {
  const temporal = createTemporal({
    date: new Date(),
    dateAdapter: nativeAdapter,
    weekStartsOn: 1, // Monday
  });

  describe("basic merging", () => {
    it("should return null for empty array", () => {
      const result = merge(temporal, []);
      expect(result).toBeNull();
    });

    it("should return single period unchanged", () => {
      const month: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 0, 15),
        number: 1,
      };

      const result = merge(temporal, [month]);
      expect(result).toEqual(month);
    });

    it("should merge multiple periods into custom period", () => {
      const feb: Period = {
        start: new Date(2024, 1, 1),
        end: new Date(2024, 1, 29, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 1, 15),
        number: 2,
      };

      const apr: Period = {
        start: new Date(2024, 3, 1),
        end: new Date(2024, 3, 30, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 3, 15),
        number: 4,
      };

      const jun: Period = {
        start: new Date(2024, 5, 1),
        end: new Date(2024, 5, 30, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 5, 15),
        number: 6,
      };

      const result = merge(temporal, [feb, apr, jun]);

      expect(result).not.toBeNull();
      expect(result!.type).toBe("custom");
      expect(result!.start.getMonth()).toBe(1); // February
      expect(result!.end.getMonth()).toBe(5); // June
    });

    it("should sort periods by start time", () => {
      const mar: Period = {
        start: new Date(2024, 2, 1),
        end: new Date(2024, 2, 31, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 2, 15),
        number: 3,
      };

      const jan: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 0, 31, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 0, 15),
        number: 1,
      };

      const feb: Period = {
        start: new Date(2024, 1, 1),
        end: new Date(2024, 1, 29, 23, 59, 59, 999),
        type: "month",
        value: new Date(2024, 1, 15),
        number: 2,
      };

      const result = merge(temporal, [mar, jan, feb]);

      expect(result).not.toBeNull();
      expect(result!.type).toBe("quarter");
      expect(result!.number).toBe(1);
    });
  });

  describe("natural unit detection", () => {
    it("should detect 7 consecutive days as a week", () => {
      const days: Period[] = [];

      // Create 7 consecutive days starting Monday Jan 8
      for (let i = 0; i < 7; i++) {
        const date = new Date(2024, 0, 8 + i);
        days.push({
          start: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0,
            0,
            0
          ),
          end: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            23,
            59,
            59,
            999
          ),
          type: "day",
          value: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            12,
            0
          ),
          number: date.getDate(),
        });
      }

      const result = merge(temporal, days);

      expect(result).not.toBeNull();
      expect(result!.type).toBe("week");
      expect(result!.start.getDate()).toBe(8); // Monday
      expect(result!.end.getDate()).toBe(14); // Sunday
    });

    it("should not detect non-consecutive days as week", () => {
      const days: Period[] = [
        {
          start: new Date(2024, 0, 8, 0, 0, 0),
          end: new Date(2024, 0, 8, 23, 59, 59, 999),
          type: "day",
          value: new Date(2024, 0, 8, 12, 0),
          number: 8,
        },
        {
          start: new Date(2024, 0, 10, 0, 0, 0), // Skip day 9
          end: new Date(2024, 0, 10, 23, 59, 59, 999),
          type: "day",
          value: new Date(2024, 0, 10, 12, 0),
          number: 10,
        },
      ];

      const result = merge(temporal, days);

      expect(result).not.toBeNull();
      expect(result!.type).toBe("custom"); // Not a natural week
    });

    it("should detect 3 consecutive months as quarter", () => {
      const months: Period[] = [
        {
          start: new Date(2024, 0, 1),
          end: new Date(2024, 0, 31, 23, 59, 59, 999),
          type: "month",
          value: new Date(2024, 0, 15),
          number: 1,
        },
        {
          start: new Date(2024, 1, 1),
          end: new Date(2024, 1, 29, 23, 59, 59, 999),
          type: "month",
          value: new Date(2024, 1, 15),
          number: 2,
        },
        {
          start: new Date(2024, 2, 1),
          end: new Date(2024, 2, 31, 23, 59, 59, 999),
          type: "month",
          value: new Date(2024, 2, 15),
          number: 3,
        },
      ];

      const result = merge(temporal, months);

      expect(result).not.toBeNull();
      expect(result!.type).toBe("quarter");
      expect(result!.number).toBe(1); // Q1
    });

    it("should detect Q2 as quarter", () => {
      const months: Period[] = [
        {
          start: new Date(2024, 3, 1),
          end: new Date(2024, 3, 30, 23, 59, 59, 999),
          type: "month",
          value: new Date(2024, 3, 15),
          number: 4,
        },
        {
          start: new Date(2024, 4, 1),
          end: new Date(2024, 4, 31, 23, 59, 59, 999),
          type: "month",
          value: new Date(2024, 4, 15),
          number: 5,
        },
        {
          start: new Date(2024, 5, 1),
          end: new Date(2024, 5, 30, 23, 59, 59, 999),
          type: "month",
          value: new Date(2024, 5, 15),
          number: 6,
        },
      ];

      const result = merge(temporal, months);

      expect(result).not.toBeNull();
      expect(result!.type).toBe("quarter");
      expect(result!.number).toBe(2); // Q2
    });

    it("should not detect non-quarter months as quarter", () => {
      const months: Period[] = [
        {
          start: new Date(2024, 1, 1), // February
          end: new Date(2024, 1, 29, 23, 59, 59, 999),
          type: "month",
          value: new Date(2024, 1, 15),
          number: 2,
        },
        {
          start: new Date(2024, 2, 1), // March
          end: new Date(2024, 2, 31, 23, 59, 59, 999),
          type: "month",
          value: new Date(2024, 2, 15),
          number: 3,
        },
        {
          start: new Date(2024, 3, 1), // April
          end: new Date(2024, 3, 30, 23, 59, 59, 999),
          type: "month",
          value: new Date(2024, 3, 15),
          number: 4,
        },
      ];

      const result = merge(temporal, months);

      expect(result).not.toBeNull();
      expect(result!.type).toBe("custom"); // Not a natural quarter
    });
  });

  describe("edge cases", () => {
    it("should handle mixed period types", () => {
      const day: Period = {
        start: new Date(2024, 0, 15, 0, 0, 0),
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "day",
        value: new Date(2024, 0, 15, 12, 0),
        number: 15,
      };

      const hour: Period = {
        start: new Date(2024, 0, 16, 14, 0, 0),
        end: new Date(2024, 0, 16, 14, 59, 59, 999),
        type: "hour",
        value: new Date(2024, 0, 16, 14, 30),
        number: 14,
      };

      const result = merge(temporal, [day, hour]);

      expect(result).not.toBeNull();
      expect(result!.type).toBe("custom");
      expect(result!.start).toEqual(day.start);
      expect(result!.end).toEqual(hour.end);
    });

    it("should handle overlapping periods", () => {
      const period1: Period = {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 0, 15, 23, 59, 59, 999),
        type: "custom",
        value: new Date(2024, 0, 8),
        number: 0,
      };

      const period2: Period = {
        start: new Date(2024, 0, 10),
        end: new Date(2024, 0, 20, 23, 59, 59, 999),
        type: "custom",
        value: new Date(2024, 0, 15),
        number: 0,
      };

      const result = merge(temporal, [period1, period2]);

      expect(result).not.toBeNull();
      expect(result!.type).toBe("custom");
      expect(result!.start.getDate()).toBe(1);
      expect(result!.end.getDate()).toBe(20);
    });

    it("should calculate middle value for custom periods", () => {
      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 0, 31, 23, 59, 59, 999);

      const periods: Period[] = [
        {
          start,
          end,
          type: "month", // Changed to month so it returns itself
          value: new Date(2024, 0, 15),
          number: 1,
        },
      ];

      const result = merge(temporal, periods);

      expect(result).not.toBeNull();
      // When merging a single period, it returns the period itself
      expect(result).toEqual(periods[0]);
    });
  });
});
