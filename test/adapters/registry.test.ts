import { describe, it, expect, vi } from "vitest";
import {
  createAdapter,
  registerAdapter,
  getAvailableAdapters,
  testAdapterAvailability,
} from "../../src/adapters/registry";
import { nativeAdapter } from "../../src/adapters/native";

describe("Adapter Registry", () => {
  describe("Auto-detection", () => {
    it("should return native adapter when no date libraries are available", () => {
      const adapter = createAdapter("auto");
      expect(adapter.name).toBe("native");
    });

    it("should explicitly create native adapter", () => {
      const adapter = createAdapter("native");
      expect(adapter.name).toBe("native");
      expect(adapter).toBe(nativeAdapter);
    });

    it("should fallback to native for unknown adapters", () => {
      const adapter = createAdapter("unknown" as any);
      expect(adapter.name).toBe("native");
    });
  });

  describe("Available Adapters", () => {
    it("should always include native adapter", () => {
      const available = getAvailableAdapters();
      expect(available).toContain("native");
    });

    it("should test adapter availability", () => {
      const availability = testAdapterAvailability();
      expect(availability.native).toBe(true);
      // Other adapters depend on external libraries
    });
  });

  describe("Custom Adapter Registration", () => {
    it("should register custom adapter", () => {
      const customAdapter = {
        name: "custom",
        add: vi.fn(),
        subtract: vi.fn(),
        startOf: vi.fn(),
        endOf: vi.fn(),
        isSame: vi.fn(),
        isBefore: vi.fn(),
        isAfter: vi.fn(),
        eachInterval: vi.fn(),
        getWeekday: vi.fn(),
        isWeekend: vi.fn(),
        format: vi.fn(),
      };

      registerAdapter("custom", () => customAdapter);
      const adapter = createAdapter("custom" as any);

      expect(adapter.name).toBe("custom");
    });
  });

  describe("Date-fns Adapter", () => {
    it("should fallback to native when date-fns is not available", () => {
      // Mock require to simulate missing date-fns
      vi.doMock("date-fns", () => {
        throw new Error("Module not found");
      });

      const adapter = createAdapter("date-fns");
      expect(adapter.name).toBe("native");
    });
  });

  describe("Default Behavior", () => {
    it("should use auto-detection by default", () => {
      const adapter = createAdapter();
      expect(adapter).toBeDefined();
      expect(typeof adapter.add).toBe("function");
    });
  });
});
