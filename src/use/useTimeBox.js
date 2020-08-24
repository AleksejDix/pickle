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
} from 'date-fns'

const pipe = (...fns) => (arg) => fns.reduce((prev, fn) => fn(prev), arg)

import { computed, reactive, unref } from "vue";

function each(options, step) {
  const endTime = options.end.getTime()
  const dates = []
  let currentDate = options.start

  while (currentDate.getTime() <= endTime) {
    dates.push(currentDate)
    currentDate = add(currentDate, step || { months: 1 })
  }
  return dates
}
export default function useTimeLeap ({now, locale}) {
  
  const state = reactive({
    now,
    cursor: unref(now),
    locale,
    units: {
      year: {
        interval: (interval) => each(interval, {years: 1}),
        start: startOfYear,
        end: endOfYear,
        isSame: isSameYear,
        isToday: isToday
      },
      month: {
        interval: (interval) => each(interval, {months: 1}),
        start: startOfMonth,
        end: endOfMonth,
        isSame: isSameMonth,
        isToday: isToday
      },
      stablemonth: {
        interval: (interval) => each(interval, {months: 1}),
        start: (date) => startOfWeek(startOfMonth(date), {weekStartsOn: 1}),
        end: (date) => {
          const stableWeeks = 6

          const weeksCounts = differenceInCalendarWeeks(
            add(endOfWeek(endOfMonth(date), {weekStartsOn: 1}), {days: 1}),
            startOfWeek(startOfMonth(date), {weekStartsOn: 1}),
            {weekStartsOn: 1}
          )

          return add(endOfWeek(endOfMonth(date), {weekStartsOn: 1}), {weeks: stableWeeks - weeksCounts})
        },
        isSame: isSameMonth,
        isToday: isToday
      },
      week: {
        interval: (interval) => each(interval, {weeks: 1}),
        start: (x) => startOfWeek(x, {weekStartsOn: 1}),
        end: (x) => endOfWeek(x, {weekStartsOn: 1}),
        isSame: isSameWeek,
        isToday: isToday
      },
      day: {
        interval: (interval) => each(interval, {days: 1}),
        start: startOfDay,
        end: endOfDay,
        isSame: isSameDay,
        isToday: isToday
      }
    }
  })
  
  const units = computed(() => Object.keys(state.units))
  const date = computed(() => state.cursor)

  const info = (unit) => (x) => {
    const raw = 'raw' in x ? x.raw : x
    return {
      unit,
      raw, 
      start: state.units[unit].start(raw),
      end: state.units[unit].end(raw),
      isToday: state.units[unit].isToday(raw)
    }
  }
  
  function future() {
    state.cursor = add(state.cursor, {months: 1})
  }
  
  function past() {
    state.cursor = sub(state.cursor, {months: 1})
  }
  

  function f(date, timeoptions) {
    return new Intl.DateTimeFormat(state.locale, timeoptions).format(date);
  }

  function schedule (events) {
    const copy = [...events].sort((a,b) => compareAsc(a.date, b.date))
    return x => {
      return {
        ...x,
        events: copy.filter(({date}) => isWithinInterval(date, x))
      }
    }
  }

  function weekend (x) {
    return {
      ...x,
      weekend: isWeekend(x.raw)
    }
  }

  const isSame = (unit) => (x) => {
    // state.units[unit].isSame(x)
    console.log(unit, x)
    return {
      ...x
    }
  }

  function offset (x) {
    const weekOffSet = getDay(x.start)
    return {
      ...x,
      weekOffset: weekOffSet === 0 ? 7 : weekOffSet,
    }
  }

  const divide = (unit, ...fns) => (x) => {
    const hasFns = fns && fns.length

    const interval = state.units[unit].interval({
      start: x.start,
      end: x.end
    })
    
    return {
      ...x,
      [x.unit]: hasFns 
        ? interval.map(pipe(info(unit), offset, ...fns)) 
        : interval
    }
  }

  function inspect(x) {
    console.log(x)
    return x
  }

  function weekday (x) { 
    const interval = state.units.day.interval({
      start: state.units.week.start(x.raw),
      end: state.units.week.end(x.raw)
    })
    return {
      ...x,
      weekday: interval.map(pipe(info('day')))
    }
  }


  return { units, date, past, future, divide, info, pipe, schedule, f, weekend, inspect, weekday, isSame }
}