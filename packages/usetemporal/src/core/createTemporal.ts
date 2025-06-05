import { ref, unref, isRef, type Ref } from "vue";
import type {
  CreateTemporalOptions,
  TemporalCore,
  TimeUnit,
  TimeUnitType,
} from "../types";

import useYear from "../composables/useYear";
import useMonth from "../composables/useMonth";
import useWeek from "../composables/useWeek";
import useDay from "../composables/useDay";

import {
  // isWithinInterval,
  isSameDay,
  isSameYear,
  isSameMonth,
  isSameWeek,
  eachWeekOfInterval,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
} from "date-fns";

const intervalMap: Record<
  TimeUnitType,
  (interval: { start: Date; end: Date }) => Date[]
> = {
  millennium: eachYearOfInterval, // placeholder
  century: eachYearOfInterval, // placeholder
  decade: eachYearOfInterval, // placeholder
  week: eachWeekOfInterval,
  day: eachDayOfInterval,
  month: eachMonthOfInterval,
  year: eachYearOfInterval,
  yearQuarter: eachMonthOfInterval, // placeholder
  hour: eachDayOfInterval, // placeholder
  hourQuarter: eachDayOfInterval, // placeholder
  minute: eachDayOfInterval, // placeholder
};

const sameMap: Record<string, (a: Date, b: Date) => boolean> = {
  day: isSameDay,
  week: isSameWeek,
  month: isSameMonth,
  year: isSameYear,
};

const timespanMap: Record<string, any> = {
  year: useYear,
  month: useMonth,
  week: useWeek,
  day: useDay,
};

export const same = (
  a: Date | null | undefined,
  b: Date | null | undefined,
  unit: string
): boolean => {
  if (!a || !b) return false;
  return sameMap[unit]?.(a, b) ?? false;
};

// const scheduleDay = (date, events) => {
//   return {
//     date,
//     events: events.value
//       .filter(event => {
//         return isWithinInterval(date, event.timespan)
//       }).map(event => {
//         return {
//         isStart: isSameDay(date, event.timespan.start),
//         isEnd: isSameDay(date, event.timespan.end),
//         isWithing: isWithinInterval(date, {
//           start: event.timespan.start,
//           end: event.timespan.end
//         })
//       }})
//     }
//   }

export function createTemporal(options: CreateTemporalOptions): TemporalCore {
  const date: Ref<Date> = isRef(options.date)
    ? options.date
    : ref(options.date);
  const now: Ref<Date> = isRef(options.now)
    ? options.now
    : ref(options.now || new Date());
  const locale: Ref<string> = isRef(options.locale)
    ? options.locale
    : ref(options.locale || "en");

  const browsing = ref<Date>(unref(date));
  const picked = date;

  function divide(interval: TimeUnit, unit: TimeUnitType): TimeUnit[] {
    const intervalFn = intervalMap[unit];
    if (!intervalFn) {
      console.warn(`No interval function found for unit: ${unit}`);
      return [];
    }

    const timespan = interval.timespan.value;
    const dates = intervalFn(timespan);
    const composableFn = timespanMap[unit];

    if (!composableFn) {
      console.warn(`No composable function found for unit: ${unit}`);
      return [];
    }

    return dates.map((date) => composableFn(createTemporal({ now, date })));
  }

  function f(date: Date, timeoptions: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(locale.value, timeoptions).format(date);
  }

  return { browsing, picked, now, divide, f };
}
