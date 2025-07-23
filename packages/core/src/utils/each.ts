import type { DateAdapter, DateDuration } from "../types/core";

interface EachOptions {
  start: Date;
  end: Date;
  step?: DateDuration;
  adapter: DateAdapter;
}

export function each(options: EachOptions): Date[] {
  const { start, end, step, adapter } = options;
  const endTime = end.getTime();
  const dates: Date[] = [];
  let currentDate = start;

  while (currentDate.getTime() <= endTime) {
    dates.push(currentDate);
    currentDate = adapter.add(currentDate, step || { months: 1 });
  }
  return dates;
}
