import { add, type Duration } from "date-fns";

interface EachOptions {
  start: Date;
  end: Date;
  step?: Duration;
}

export function each(options: EachOptions): Date[] {
  const endTime = options.end.getTime();
  const dates: Date[] = [];
  let currentDate = options.start;

  while (currentDate.getTime() <= endTime) {
    dates.push(currentDate);
    currentDate = add(currentDate, options.step || { months: 1 });
  }
  return dates;
}
