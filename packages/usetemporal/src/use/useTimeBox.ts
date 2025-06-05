import {
  add,
  sub,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  compareAsc,
  isWithinInterval,
  isWeekend,
  getDay,
  differenceInCalendarWeeks,
  isSameYear,
  isSameMonth,
  isSameWeek,
  isSameDay,
  isToday,
  type Duration,
} from "date-fns";

import { computed, reactive, unref, type Ref, type ComputedRef } from "vue";
import type { TimeBoxOptions, TimeSpan, Event } from "../types";

// Utility function type
type Fn<T, R> = (arg: T) => R;
type PipeFunction = <T>(...fns: Fn<any, any>[]) => (arg: T) => T;

const pipe: PipeFunction =
  (...fns) =>
  (arg) =>
    fns.reduce((prev, fn) => fn(prev), arg);

interface EachOptions {
  start: Date;
  end: Date;
}

function each(options: EachOptions, step: Duration): Date[] {
  const endTime = options.end.getTime();
  const dates: Date[] = [];
  let currentDate = options.start;

  while (currentDate.getTime() <= endTime) {
    dates.push(currentDate);
    currentDate = add(currentDate, step || { months: 1 });
  }
  return dates;
}

interface TimeUnitInfo {
  unit: string;
  raw: Date;
  start: Date;
  end: Date;
  isToday: boolean;
}

interface TimeUnitConfig {
  interval: (interval: TimeSpan) => Date[];
  start: (date: Date) => Date;
  end: (date: Date) => Date;
  isSame: (dateLeft: Date, dateRight: Date) => boolean;
  isToday: (date: Date) => boolean;
}

interface TimeBoxState {
  now: Date | Ref<Date>;
  cursor: Date;
  locale: string | Ref<string>;
  units: Record<string, TimeUnitConfig>;
}

interface TimeBoxUnit extends TimeUnitInfo {
  weekend?: boolean;
  weekOffset?: number;
  events?: Event[];
  [key: string]: any;
}

export default function useTimeBox(options: TimeBoxOptions) {
  const state = reactive<TimeBoxState>({
    now: options.now,
    cursor: unref(options.now),
    locale: options.locale || "en",
    units: {
      year: {
        interval: (interval: TimeSpan) => each(interval, { years: 1 }),
        start: startOfYear,
        end: endOfYear,
        isSame: isSameYear,
        isToday: isToday,
      },
      month: {
        interval: (interval: TimeSpan) => each(interval, { months: 1 }),
        start: startOfMonth,
        end: endOfMonth,
        isSame: isSameMonth,
        isToday: isToday,
      },
      stablemonth: {
        interval: (interval: TimeSpan) => each(interval, { months: 1 }),
        start: (date: Date) =>
          startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
        end: (date: Date) => {
          const stableWeeks = 6;

          const weeksCounts = differenceInCalendarWeeks(
            add(endOfWeek(endOfMonth(date), { weekStartsOn: 1 }), { days: 1 }),
            startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
            { weekStartsOn: 1 }
          );

          return add(endOfWeek(endOfMonth(date), { weekStartsOn: 1 }), {
            weeks: stableWeeks - weeksCounts,
          });
        },
        isSame: isSameMonth,
        isToday: isToday,
      },
      week: {
        interval: (interval: TimeSpan) => each(interval, { weeks: 1 }),
        start: (x: Date) => startOfWeek(x, { weekStartsOn: 1 }),
        end: (x: Date) => endOfWeek(x, { weekStartsOn: 1 }),
        isSame: isSameWeek,
        isToday: isToday,
      },
      day: {
        interval: (interval: TimeSpan) => each(interval, { days: 1 }),
        start: startOfDay,
        end: endOfDay,
        isSame: isSameDay,
        isToday: isToday,
      },
    },
  });

  const units: ComputedRef<string[]> = computed(() => Object.keys(state.units));
  const date: ComputedRef<Date> = computed(() => state.cursor);

  const info =
    (unit: string) =>
    (x: Date | TimeUnitInfo): TimeUnitInfo => {
      const raw = typeof x === "object" && "raw" in x ? x.raw : (x as Date);
      const unitConfig = state.units[unit];
      if (!unitConfig) {
        throw new Error(`Unknown time unit: ${unit}`);
      }
      return {
        unit,
        raw,
        start: unitConfig.start(raw),
        end: unitConfig.end(raw),
        isToday: unitConfig.isToday(raw),
      };
    };

  function future(): void {
    state.cursor = add(state.cursor, { months: 1 });
  }

  function past(): void {
    state.cursor = sub(state.cursor, { months: 1 });
  }

  function f(date: Date, timeoptions: Intl.DateTimeFormatOptions): string {
    const locale =
      typeof state.locale === "string" ? state.locale : unref(state.locale);
    return new Intl.DateTimeFormat(locale, timeoptions).format(date);
  }

  function schedule(events: Event[]) {
    const copy = [...events].sort((a, b) =>
      compareAsc(a.timespan.start, b.timespan.start)
    );
    return (x: TimeUnitInfo): TimeBoxUnit => {
      return {
        ...x,
        events: copy.filter((event) => isWithinInterval(x.raw, event.timespan)),
      };
    };
  }

  function weekend(x: TimeUnitInfo): TimeBoxUnit {
    return {
      ...x,
      weekend: isWeekend(x.raw),
    };
  }

  const isSame =
    (unit: string) =>
    (x: TimeUnitInfo): TimeBoxUnit => {
      console.log(unit, x);
      return {
        ...x,
      };
    };

  function offset(x: TimeUnitInfo): TimeBoxUnit {
    const weekOffSet = getDay(x.start);
    return {
      ...x,
      weekOffset: weekOffSet === 0 ? 7 : weekOffSet,
    };
  }

  const divide =
    (unit: string, ...fns: Fn<any, any>[]) =>
    (x: TimeUnitInfo): TimeBoxUnit => {
      const hasFns = fns && fns.length;
      const unitConfig = state.units[unit];
      if (!unitConfig) {
        throw new Error(`Unknown time unit: ${unit}`);
      }

      const interval = unitConfig.interval({
        start: x.start,
        end: x.end,
      });

      return {
        ...x,
        [x.unit]: hasFns
          ? interval.map(pipe(info(unit), offset, ...fns))
          : interval,
      };
    };

  function inspect(x: any): any {
    console.log(x);
    return x;
  }

  function weekday(x: TimeUnitInfo): TimeBoxUnit {
    const dayConfig = state.units.day;
    const weekConfig = state.units.week;
    if (!dayConfig || !weekConfig) {
      throw new Error("Day or week unit configuration is missing");
    }

    const interval = dayConfig.interval({
      start: weekConfig.start(x.raw),
      end: weekConfig.end(x.raw),
    });
    return {
      ...x,
      weekday: interval.map(pipe(info("day"))),
    };
  }

  return {
    units,
    date,
    past,
    future,
    divide,
    info,
    pipe,
    schedule,
    f,
    weekend,
    inspect,
    weekday,
    isSame,
  };
}
