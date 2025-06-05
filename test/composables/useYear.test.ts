import { describe, it, expect } from "vitest";
import { ref } from "vue";
import useYear from "@/use/useYear";
import type { UseTimeUnitOptions } from "@/types";

describe("useYear", () => {
  const testDate = new Date("2024-06-15T12:00:00.000Z");
  const testOptions: UseTimeUnitOptions = {
    now: ref(new Date("2024-12-25T10:30:00.000Z")),
    browsing: ref(testDate),
  };

  describe("TimeUnit Interface Consistency", () => {
    it("should implement the consistent TimeUnit interface", () => {
      const year = useYear(testOptions);

      // Every time unit should have these properties
      expect(year).toHaveProperty("raw");
      expect(year).toHaveProperty("timespan");
      expect(year).toHaveProperty("isNow");
      expect(year).toHaveProperty("number");
      expect(year).toHaveProperty("name");
      expect(year).toHaveProperty("browsing");
      expect(year).toHaveProperty("future");
      expect(year).toHaveProperty("past");
      expect(year).toHaveProperty("isSame");

      // Year-specific properties
      expect(year).toHaveProperty("weekDay");
      expect(year).toHaveProperty("format");
    });

    it("should return correct year information", () => {
      const year = useYear(testOptions);

      expect(year.raw.value).toBeInstanceOf(Date);
      expect(year.number.value).toBe(2024);
      expect(year.name.value).toBe("2024");

      // Check timespan structure
      const timespan = year.timespan.value;
      expect(timespan).toHaveProperty("start");
      expect(timespan).toHaveProperty("end");
      expect(timespan.start).toBeInstanceOf(Date);
      expect(timespan.end).toBeInstanceOf(Date);

      // Check timespan boundaries
      expect(timespan.start.getFullYear()).toBe(2024);
      expect(timespan.start.getMonth()).toBe(0); // January
      expect(timespan.start.getDate()).toBe(1);

      expect(timespan.end.getFullYear()).toBe(2024);
      expect(timespan.end.getMonth()).toBe(11); // December
      expect(timespan.end.getDate()).toBe(31);
    });

    it("should detect if it is current year", () => {
      const currentYear = useYear({
        now: ref(testDate),
        browsing: ref(testDate),
      });

      const differentYear = useYear({
        now: ref(testDate),
        browsing: ref(new Date("2023-06-15T12:00:00.000Z")),
      });

      expect(currentYear.isNow.value).toBe(true);
      expect(differentYear.isNow.value).toBe(false);
    });
  });

  describe("Navigation Methods", () => {
    it("should navigate to future year", () => {
      const browsing = ref(testDate);
      const year = useYear({
        now: ref(testDate),
        browsing,
      });

      const originalYear = browsing.value.getFullYear();
      year.future();
      expect(browsing.value.getFullYear()).toBe(originalYear + 1);
    });

    it("should navigate to past year", () => {
      const browsing = ref(testDate);
      const year = useYear({
        now: ref(testDate),
        browsing,
      });

      const originalYear = browsing.value.getFullYear();
      year.past();
      expect(browsing.value.getFullYear()).toBe(originalYear - 1);
    });
  });

  describe("Formatting and Week Day", () => {
    it("should format year correctly", () => {
      const year = useYear(testOptions);

      expect(year.format?.(testDate)).toBe(2024);
      expect(typeof year.format?.(testDate)).toBe("number");
    });

    it("should calculate week day correctly", () => {
      const year = useYear(testOptions);

      // 2024 starts on a Monday (1 in ISO week day)
      expect(year.weekDay?.value).toBe(1);
    });
  });

  describe("isSame method", () => {
    it("should compare years correctly", () => {
      const year = useYear(testOptions);

      const sameYear = new Date("2024-12-01T00:00:00.000Z");
      const differentYear = new Date("2023-12-01T00:00:00.000Z");

      expect(year.isSame(testDate, sameYear)).toBe(true);
      expect(year.isSame(testDate, differentYear)).toBe(false);
    });
  });
});
