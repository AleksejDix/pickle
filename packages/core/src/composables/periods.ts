import { createPeriod } from "../core/createPeriod";

// Export all period creators as a single object
export const periods = {
  year: createPeriod("year", (date) => date.getFullYear()),
  month: createPeriod("month", (date) => date.getMonth() + 1),
  week: createPeriod("week", (date, adapter) => {
    // Calculate week number manually
    const startOfYear = adapter.startOf(date, "year");
    const startOfWeekForDate = adapter.startOf(date, "week");
    const daysDiff = Math.floor(
      (startOfWeekForDate.getTime() - startOfYear.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return Math.floor(daysDiff / 7) + 1;
  }),
  day: createPeriod("day", (date) => date.getDate()),
  hour: createPeriod("hour", (date) => date.getHours()),
  minute: createPeriod("minute", (date) => date.getMinutes()),
  second: createPeriod("second", (date) => date.getSeconds()),
  quarter: createPeriod("quarter", (date) => {
    const month = date.getMonth();
    return Math.floor(month / 3) + 1;
  }),
};

