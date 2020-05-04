import {
  computed
} from 'vue'

import {
  isSameMonth,
  add,
  sub,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  getDay,
  isWithinInterval,
  isSameDay
} from "date-fns";

import {
  each
} from './each'
export default function useMonth(options) {

  const isSame = computed(() => isSameMonth(options.now.value, options.browsing.value))
  const start = computed(() => startOfMonth(options.browsing.value))
  const end = computed(() => endOfMonth(options.browsing.value))

  const monthInterval = computed(() => ({
    start: start.value,
    end: end.value,
    step: {
      days: 1
    }
  }))

  const scheduleDay = (date) => {
    const events = options.events.value
      .filter(event => isWithinInterval(date, event)).map(({
        start,
        end
      }) => ({
        isStart: isSameDay(date, start),
        isEnd: isSameDay(date, end),
        isWithing: isWithinInterval(date, {
          start,
          end
        })
      }))

    return {
      date,
      events,
    }
  }

  const days = computed(() => each(monthInterval.value).map(scheduleDay))

  console.log(days)

  const startFirstWeek = computed(() => startOfWeek(start.value, {
    weekStartsOn: 1
  }))
  const endLastWeek = computed(() => endOfWeek(end.value, {
    weekStartsOn: 1
  }))

  const weekDays = computed(() => each({
    start: startFirstWeek.value,
    end: endLastWeek.value,
    step: {
      days: 1
    }
  }))

  const weekDay = () => {
    const day = getDay(start.value)
    return day === 0 ? 7 : day
  }

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      months: 1
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      months: 1
    })
  }

  return {
    isSameMonth,
    next,
    prev,
    isSame,
    days,
    weekDay,
    weekDays
  }
}