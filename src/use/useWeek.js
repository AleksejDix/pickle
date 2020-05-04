import {
  computed
} from 'vue'
import {
  isSameWeek,
  add,
  sub,
  startOfWeek,
  endOfWeek,
  getDay
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
  const days = computed(() => each({
    start: start.value,
    end: end.value,
    step: {
      days: 1
    }
  }))

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