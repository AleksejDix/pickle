import {
  computed,
  isRef,
  ref,
} from 'vue'

import {
  add,
  sub,
  startOfMonth,
  endOfMonth,
  getDay,
} from "date-fns";

import {same} from './usePickle'

const isSame = (a,b) => same(a,b, 'month')
export default function useMonth(options) {

  const now = isRef(options.now) ? options.now : ref(options.now)
  const browsing = isRef(options.browsing) ? options.browsing : ref(options.browsing)

  const isNow = computed(() => isSame(now.value, browsing.value))
  const start = computed(() => startOfMonth(browsing.value))
  const end = computed(() => endOfMonth(browsing.value))
  const number = computed(() => format(browsing.value))
  const raw = computed(() => browsing.value)
  const timespan = computed(() => ({start: start.value, end: end.value}))
  const name = computed(() => number.value)

  const format = (date) => {
    return +date.getMonth() + 1
  }

  const future = () => {
    options.browsing.value = add(options.browsing.value, {
      months: 1
    })
  }

  const past = () => {
    options.browsing.value = sub(options.browsing.value, {
      months: 1
    })
  }

  const weekDay = computed(() => {
    const day = getDay(start.value)
    return day === 0 ? 7 : day
  })

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
    weekDay
  }
}