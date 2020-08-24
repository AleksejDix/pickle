import { ref, unref, isRef } from 'vue'

import useYear  from "@/use/useYear.js"
import useMonth from "@/use/useMonth.js"
import useWeek from "@/use/useWeek.js"
import useDay from "@/use/useDay.js"

import {
  // isWithinInterval,
  isSameDay,
  isSameYear,
  isSameMonth,
  isSameWeek,
  eachWeekOfInterval, 
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval
} from 'date-fns'

const intervalMap = {
  week: eachWeekOfInterval,
  day: eachDayOfInterval,
  month: eachMonthOfInterval,
  year: eachYearOfInterval
}

const sameMap = {
  day: isSameDay,
  week: isSameWeek,
  month: isSameMonth,
  year: isSameYear,
}

const timespanMap = {
  year: useYear,
  month: useMonth,
  week: useWeek,
  day: useDay
}

export const same = (a, b, unit) =>{
  if (!a) return false
  if (!b) return false
  return sameMap[unit](a,b)
}

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


export function usePickle (options) {

  const date = isRef(options.date) ? options.date : ref(options.date)
  const now = isRef(options.now) ? options.now : ref(options.now)
  const locale = isRef(options.locale) ? options.locale : ref(options.locale)
  
  const browsing = ref(unref(date))
  const picked = date

  function divide(interval, unit) {
    return intervalMap[unit](interval.timespan.value).map(date => timespanMap[unit](usePickle({ now, date })))
  }

  function f(date, timeoptions) {
    return new Intl.DateTimeFormat(locale.value, timeoptions).format(date);
  }

  return {browsing, picked, now, divide, f}
}