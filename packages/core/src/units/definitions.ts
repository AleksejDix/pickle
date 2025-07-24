import { defineUnit } from "../unit-registry";
import type { Adapter } from "../types";

// Define core units using the unit registry

defineUnit("year", {
  createPeriod(date: Date, adapter: Adapter) {
    return {
      start: adapter.startOf(date, "year"),
      end: adapter.endOf(date, "year"),
    };
  },
  divisions: ["quarter", "month", "week", "day"],
});

defineUnit("quarter", {
  createPeriod(date: Date, adapter: Adapter) {
    return {
      start: adapter.startOf(date, "quarter"),
      end: adapter.endOf(date, "quarter"),
    };
  },
  divisions: ["month", "week", "day"],
  mergesTo: "year",
});

defineUnit("month", {
  createPeriod(date: Date, adapter: Adapter) {
    return {
      start: adapter.startOf(date, "month"),
      end: adapter.endOf(date, "month"),
    };
  },
  divisions: ["week", "day"],
  mergesTo: "quarter",
});

defineUnit("week", {
  createPeriod(date: Date, adapter: Adapter) {
    return {
      start: adapter.startOf(date, "week"),
      end: adapter.endOf(date, "week"),
    };
  },
  divisions: ["day"],
  mergesTo: "month",
});

defineUnit("day", {
  createPeriod(date: Date, adapter: Adapter) {
    return {
      start: adapter.startOf(date, "day"),
      end: adapter.endOf(date, "day"),
    };
  },
  divisions: ["hour"],
  mergesTo: "week",
});

defineUnit("hour", {
  createPeriod(date: Date, adapter: Adapter) {
    return {
      start: adapter.startOf(date, "hour"),
      end: adapter.endOf(date, "hour"),
    };
  },
  divisions: ["minute"],
  mergesTo: "day",
});

defineUnit("minute", {
  createPeriod(date: Date, adapter: Adapter) {
    return {
      start: adapter.startOf(date, "minute"),
      end: adapter.endOf(date, "minute"),
    };
  },
  divisions: ["second"],
  mergesTo: "hour",
});

defineUnit("second", {
  createPeriod(date: Date, adapter: Adapter) {
    return {
      start: adapter.startOf(date, "second"),
      end: adapter.endOf(date, "second"),
    };
  },
  divisions: [],
  mergesTo: "minute",
});