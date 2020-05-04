import {
  computed
} from 'vue'
import {
  isSameQuarter,
  add,
  sub,
  startOfQuarter,
  endOfQuarter,
  getDay
} from "date-fns";

import {
  each
} from './each'
export default function useYear(options) {

  const isSame = computed(() => isSameQuarter(options.now.value, options.browsing.value))

  const start = computed(() => startOfQuarter(options.browsing.value))
  const end = computed(() => endOfQuarter(options.browsing.value))

  const days = computed(() => each({
    start: start.value,
    end: end.value,
    step: {
      days: 1
    }
  }))

  const weekDay = () => getDay(start.value)

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      months: 3
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      months: 3
    })
  }

  return {
    next,
    prev,
    isSame,
    days,
    weekDay,
    isSameQuarter
  }
}