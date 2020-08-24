import {
  computed,
  isRef,
  ref,
} from 'vue'
import {
  add,
  sub,
  startOfDay,
  endOfDay,
  isWeekend
} from "date-fns";

import {same} from './usePickle'

const isSame = (a,b) => same(a,b, 'day')

export default function useDay(options) {

  const now = isRef(options.now) ? options.now : ref(options.now)
  const browsing = isRef(options.browsing) ? options.browsing : ref(options.browsing)

  const isNow = computed(() => isSame(now.value, browsing.value))
  const start = computed(() => startOfDay(browsing.value))
  const end = computed(() => endOfDay(browsing.value))
  const number = computed(() => format(browsing.value))
  const raw = computed(() => browsing.value)
  const timespan = computed(() => ({start: start.value, end: end.value}))
  const name = computed(() => number.value)
  const we = computed(() => isWeekend(browsing.value))

  const format = (date) => {
    return date.getDate()
  }

  const future = () => {
    options.browsing.value = add(options.browsing.value, {
      days: 1
    })
  }

  const past = () => {
    options.browsing.value = sub(options.browsing.value, {
      days: 1
    })
  }

  return {
    future,
    past,
    timespan,
    isNow,
    number,
    name, 
    format,
    raw,
    isSame,
    browsing,
    we
  }
}