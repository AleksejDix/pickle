import { createComposable } from "../core/createComposable";

export default createComposable("week", (date, adapter) => {
  // Calculate week number manually
  const startOfYear = adapter.startOf(date, "year");
  const startOfWeekForDate = adapter.startOf(date, "week");
  const daysDiff = Math.floor((startOfWeekForDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7) + 1;
});