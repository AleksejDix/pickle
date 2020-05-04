import {
  computed
} from 'vue'
import {
  isSameWeek,
  add,
  sub,
  startOfWeek,
  endOfWeek,
  getDay,
  isWithinInterval,
  isSameDay
} from "date-fns";

import {
  each
} from './each'
export default function useWeek(options = {
  weekStartsOn: 1
}) {

  const isSame = computed(() => isSameWeek(options.now.value, options.browsing.value))

  const start = computed(() => startOfWeek(options.browsing.value, {
    weekStartsOn: 1
  }))
  const end = computed(() => endOfWeek(options.browsing.value, {
    weekStartsOn: 1
  }))

  const weekInterval = computed(() => ({
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

  const days = computed(() => each(weekInterval.value).map(scheduleDay))

  const weekDay = (day) => getDay(day)

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      weeks: 1
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      weeks: 1
    })
  }

  return {
    next,
    prev,
    isSame,
    weekDay,
    days
  }
}