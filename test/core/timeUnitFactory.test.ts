import { describe, it, expect, vi } from "vitest";
import { createTimeUnit, registerComposable, getComposable } from "../../lib/core/timeUnitFactory";
import type { TimeUnit, UseTimeUnitOptions } from "../../lib/types/reactive";
import { ref } from "@vue/reactivity";

describe("timeUnitFactory", () => {
  describe("registerComposable", () => {
    it("should register a composable for a time unit", () => {
      const mockComposable = vi.fn();
      registerComposable("year", mockComposable);
      
      const result = getComposable("year");
      expect(result).toBe(mockComposable);
    });
  });

  describe("getComposable", () => {
    it("should return undefined for unregistered units", () => {
      const result = getComposable("millennium" as any);
      expect(result).toBeUndefined();
    });
  });

  describe("createTimeUnit", () => {
    it("should create a time unit instance when composable is registered", () => {
      const mockTimeUnit: TimeUnit = {
        raw: ref(new Date()) as any,
        timespan: ref({ start: new Date(), end: new Date() }) as any,
        isNow: ref(false) as any,
        number: ref(1) as any,
        name: ref("test") as any,
        browsing: ref(new Date()),
        future: vi.fn(),
        past: vi.fn(),
        isSame: vi.fn()
      };
      
      const mockComposable = vi.fn().mockReturnValue(mockTimeUnit);
      registerComposable("quarter", mockComposable);
      
      const options: UseTimeUnitOptions = {
        now: new Date(),
        browsing: new Date(),
        adapter: {} as any
      };
      
      const result = createTimeUnit("quarter", options);
      
      expect(mockComposable).toHaveBeenCalledWith(options);
      expect(result).toBe(mockTimeUnit);
    });

    it("should return null and warn when composable is not registered", () => {
      const originalWarn = console.warn;
      const warnSpy = vi.fn();
      console.warn = warnSpy;
      
      const options: UseTimeUnitOptions = {
        now: new Date(),
        browsing: new Date(),
        adapter: {} as any
      };
      
      const result = createTimeUnit("invalidunit" as any, options);
      
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith("No composable registered for unit: invalidunit");
      
      console.warn = originalWarn;
    });
  });
});