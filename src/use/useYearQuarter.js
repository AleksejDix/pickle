import {
  computed,
  isRef,
  ref
} from 'vue'

import {
  isSameQuarter,
  add,
  sub,
  startOfQuarter,
  endOfQuarter,
  
} from "date-fns";

import {same} from './usePickle'

const isSame = (a,b) => same(a,b, 'yearQuarter')

export default function useYearQuarter(options) {

  const now = isRef(options.now) ? options.now : ref(options.now)
  const browsing = isRef(options.browsing) ? options.browsing : ref(options.browsing)

  const isNow = computed(() => isSameQuarter(now.value, browsing.value))
  const start = computed(() => startOfQuarter(browsing.value))
  const end = computed(() => endOfQuarter(browsing.value))
  const number = computed(() => format(browsing.value))
  const raw = computed(() => browsing.value)
  const timespan = computed(() => ({start: start.value, end: end.value}))
  const name = computed(() => `Quartal ${number.value}`)

  const format = (date) => {
    return Math.ceil(+date.toLocaleDateString('en-US', { month: "numeric" }) / 3)
  }

  const future = () => {
    browsing.value = add(browsing.value, {
      months: 3
    })
  }

  const past = () => {
    browsing.value = sub(browsing.value, {
      months: 3
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