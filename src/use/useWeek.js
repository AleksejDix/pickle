import {
  computed,
  isRef,
  ref,
} from 'vue'

import {
  add,
  sub,
  startOfWeek,
  endOfWeek,
  getWeek
} from "date-fns";

import {same} from './usePickle'

const isSame = (a,b) => same(a,b, 'week')

export default function useWeek(options) {

  const now = isRef(options.now) ? options.now : ref(options.now)
  const browsing = isRef(options.browsing) ? options.browsing : ref(options.browsing)

  const isNow = computed(() => isSame(now.value, browsing.value))
  const start = computed(() => startOfWeek(options.browsing.value, { weekStartsOn: 1 }))
  const end = computed(() => endOfWeek(options.browsing.value, { weekStartsOn: 1 }))
  const number = computed(() => format(browsing.value))
  const raw = computed(() => browsing.value)
  const timespan = computed(() => ({start: start.value, end: end.value}))
  const name = computed(() => number.value)

  const format = (date) => {
    return getWeek(date, { weekStartsOn: 1 })
  }

  const future = () => {
    options.browsing.value = add(options.browsing.value, {
      weeks: 1
    })
  }

  const past = () => {
    options.browsing.value = sub(options.browsing.value, {
      weeks: 1
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
    browsing
  }
}