import { describe, it, expect } from "vitest";
import { isSame } from "./isSame";
import { createTemporal } from "../createTemporal";
import { nativeAdapter } from "@usetemporal/adapter-native";

describe("isSame", () => {
  const temporal = createTemporal({
    date: new Date(),
    dateAdapter: nativeAdapter,
    weekStartsOn: 1,
  });

  describe("year comparison", () => {
    it("should return true for same year", () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 11, 31);

      expect(isSame(temporal, date1, date2, "year")).toBe(true);
    });

    it("should return false for different years", () => {
      const date1 = new Date(2024, 11, 31);
      const date2 = new Date(2025, 0, 1);

      expect(isSame(temporal, date1, date2, "year")).toBe(false);
    });
  });

  describe("month comparison", () => {
    it("should return true for same month", () => {
      const date1 = new Date(2024, 5, 1);
      const date2 = new Date(2024, 5, 30);

      expect(isSame(temporal, date1, date2, "month")).toBe(true);
    });

    it("should return false for different months", () => {
      const date1 = new Date(2024, 5, 30);
      const date2 = new Date(2024, 6, 1);

      expect(isSame(temporal, date1, date2, "month")).toBe(false);
    });

    it("should return false for same month in different years", () => {
      const date1 = new Date(2024, 5, 15);
      const date2 = new Date(2025, 5, 15);

      expect(isSame(temporal, date1, date2, "month")).toBe(false);
    });
  });

  describe("day comparison", () => {
    it("should return true for same day", () => {
      const date1 = new Date(2024, 5, 15, 0, 0, 0);
      const date2 = new Date(2024, 5, 15, 23, 59, 59);

      expect(isSame(temporal, date1, date2, "day")).toBe(true);
    });

    it("should return false for different days", () => {
      const date1 = new Date(2024, 5, 15, 23, 59, 59);
      const date2 = new Date(2024, 5, 16, 0, 0, 0);

      expect(isSame(temporal, date1, date2, "day")).toBe(false);
    });
  });

  describe("hour comparison", () => {
    it("should return true for same hour", () => {
      const date1 = new Date(2024, 5, 15, 14, 0, 0);
      const date2 = new Date(2024, 5, 15, 14, 59, 59);

      expect(isSame(temporal, date1, date2, "hour")).toBe(true);
    });

    it("should return false for different hours", () => {
      const date1 = new Date(2024, 5, 15, 14, 59, 59);
      const date2 = new Date(2024, 5, 15, 15, 0, 0);

      expect(isSame(temporal, date1, date2, "hour")).toBe(false);
    });
  });

  describe("quarter comparison", () => {
    it("should return true for Q1 dates", () => {
      const jan = new Date(2024, 0, 15);
      const feb = new Date(2024, 1, 20);
      const mar = new Date(2024, 2, 31);

      expect(isSame(temporal, jan, feb, "quarter")).toBe(true);
      expect(isSame(temporal, jan, mar, "quarter")).toBe(true);
      expect(isSame(temporal, feb, mar, "quarter")).toBe(true);
    });

    it("should return true for Q2 dates", () => {
      const apr = new Date(2024, 3, 1);
      const may = new Date(2024, 4, 15);
      const jun = new Date(2024, 5, 30);

      expect(isSame(temporal, apr, may, "quarter")).toBe(true);
      expect(isSame(temporal, apr, jun, "quarter")).toBe(true);
      expect(isSame(temporal, may, jun, "quarter")).toBe(true);
    });

    it("should return true for Q3 dates", () => {
      const jul = new Date(2024, 6, 1);
      const aug = new Date(2024, 7, 15);
      const sep = new Date(2024, 8, 30);

      expect(isSame(temporal, jul, aug, "quarter")).toBe(true);
      expect(isSame(temporal, jul, sep, "quarter")).toBe(true);
      expect(isSame(temporal, aug, sep, "quarter")).toBe(true);
    });

    it("should return true for Q4 dates", () => {
      const oct = new Date(2024, 9, 1);
      const nov = new Date(2024, 10, 15);
      const dec = new Date(2024, 11, 31);

      expect(isSame(temporal, oct, nov, "quarter")).toBe(true);
      expect(isSame(temporal, oct, dec, "quarter")).toBe(true);
      expect(isSame(temporal, nov, dec, "quarter")).toBe(true);
    });

    it("should return false for different quarters", () => {
      const q1 = new Date(2024, 2, 31); // March (Q1)
      const q2 = new Date(2024, 3, 1); // April (Q2)

      expect(isSame(temporal, q1, q2, "quarter")).toBe(false);
    });

    it("should return false for same quarter in different years", () => {
      const q1_2024 = new Date(2024, 0, 15);
      const q1_2025 = new Date(2025, 0, 15);

      expect(isSame(temporal, q1_2024, q1_2025, "quarter")).toBe(false);
    });
  });

  describe("null/undefined handling", () => {
    it("should return false when first date is null", () => {
      const date = new Date(2024, 5, 15);

      expect(isSame(temporal, null, date, "day")).toBe(false);
    });

    it("should return false when second date is null", () => {
      const date = new Date(2024, 5, 15);

      expect(isSame(temporal, date, null, "day")).toBe(false);
    });

    it("should return false when both dates are null", () => {
      expect(isSame(temporal, null, null, "day")).toBe(false);
    });

    it("should return false when first date is undefined", () => {
      const date = new Date(2024, 5, 15);

      expect(isSame(temporal, undefined, date, "day")).toBe(false);
    });

    it("should return false when second date is undefined", () => {
      const date = new Date(2024, 5, 15);

      expect(isSame(temporal, date, undefined, "day")).toBe(false);
    });

    it("should return false when both dates are undefined", () => {
      expect(isSame(temporal, undefined, undefined, "day")).toBe(false);
    });
  });

  describe("week comparison", () => {
    it("should return true for dates in same week", () => {
      const monday = new Date(2024, 0, 8); // Monday
      const friday = new Date(2024, 0, 12); // Friday

      expect(isSame(temporal, monday, friday, "week")).toBe(true);
    });

    it("should return false for dates in different weeks", () => {
      const sunday = new Date(2024, 0, 14); // Sunday
      const monday = new Date(2024, 0, 15); // Next Monday

      expect(isSame(temporal, sunday, monday, "week")).toBe(false);
    });
  });

  describe("minute comparison", () => {
    it("should return true for same minute", () => {
      const date1 = new Date(2024, 5, 15, 14, 30, 0);
      const date2 = new Date(2024, 5, 15, 14, 30, 59);

      expect(isSame(temporal, date1, date2, "minute")).toBe(true);
    });

    it("should return false for different minutes", () => {
      const date1 = new Date(2024, 5, 15, 14, 30, 59);
      const date2 = new Date(2024, 5, 15, 14, 31, 0);

      expect(isSame(temporal, date1, date2, "minute")).toBe(false);
    });
  });

  describe("second comparison", () => {
    it("should return true for same second", () => {
      const date1 = new Date(2024, 5, 15, 14, 30, 45, 0);
      const date2 = new Date(2024, 5, 15, 14, 30, 45, 999);

      expect(isSame(temporal, date1, date2, "second")).toBe(true);
    });

    it("should return false for different seconds", () => {
      const date1 = new Date(2024, 5, 15, 14, 30, 45);
      const date2 = new Date(2024, 5, 15, 14, 30, 46);

      expect(isSame(temporal, date1, date2, "second")).toBe(false);
    });
  });
});
