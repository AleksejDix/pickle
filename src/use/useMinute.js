import {
  computed
} from 'vue'
import {
  isSameMinute,
  add,
  sub,
  startOfMinute,
  endOfMinute,
  isSameSecond
} from "date-fns";

import {
  each
} from './each'
export default function useDay(options) {

  const isSame = computed(() => isSameMinute(options.now.value, options.browsing.value))

  const start = computed(() => startOfMinute(options.browsing.value))
  const end = computed(() => endOfMinute(options.browsing.value))

  const seconds = computed(() => each({
    start: start.value,
    end: end.value,
    step: {
      seconds: 1
    }
  }))

  const isNow = (date) => isSameSecond(options.now.value, date)

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      minutes: 1
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      minutes: 1
    })
  }

  return {
    next,
    prev,
    isSame,
    seconds,
    isNow,
  }
}