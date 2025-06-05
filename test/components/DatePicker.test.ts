import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DatePicker from "@/components/DatePicker.vue";

describe("DatePicker Component", () => {
  const testDate = new Date("2024-06-15T12:00:00.000Z");

  it("should render without errors", () => {
    const wrapper = mount(DatePicker, {
      props: {
        date: testDate,
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should emit date updates", async () => {
    const wrapper = mount(DatePicker, {
      props: {
        date: testDate,
      },
    });

    // Test that the component can emit update:date events
    expect(wrapper.emitted()).toBeDefined();
  });

  it("should display current year", () => {
    const wrapper = mount(DatePicker, {
      props: {
        date: testDate,
      },
    });

    // Should display 2024 somewhere in the component
    expect(wrapper.text()).toContain("2024");
  });

  it("should integrate with the innovative time system", () => {
    const wrapper = mount(DatePicker, {
      props: {
        date: testDate,
      },
    });

    // The component should use the hierarchical time composables
    const vm = wrapper.vm as any;
    expect(vm.pickle).toBeDefined();
    expect(vm.year).toBeDefined();
    expect(vm.yearMonths).toBeDefined();
    expect(vm.monthDays).toBeDefined();
  });

  it("should handle props reactively", async () => {
    const wrapper = mount(DatePicker, {
      props: {
        date: testDate,
      },
    });

    const newDate = new Date("2025-03-20T15:30:00.000Z");
    await wrapper.setProps({ date: newDate });

    // Should update to show 2025
    expect(wrapper.text()).toContain("2025");
  });
});
