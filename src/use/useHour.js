import {
  computed
} from 'vue'
import {
  isSameHour,
  add,
  sub,
  startOfHour,
  endOfHour
} from "date-fns";

import {
  each
} from './each'

export default function useHour(options) {

  const isSame = computed(() => isSameHour(options.now.value, options.browsing.value))
  const start = computed(() => startOfHour(options.browsing.value))
  const end = computed(() => endOfHour(options.browsing.value))

  const minutes = each({
    start: start.value,
    end: end.value
  })

  const quarters = each({
    start: start.value,
    end: end.value,
    step: {
      minutes: 15
    }
  })

  console.log(quarters)

  const sixth = each({
    start: start.value,
    end: end.value,
    step: {
      minutes: 10
    }
  })

  const isNow = (date) => isSameHour(options.now.value, date)

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      hours: 1
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      hours: 1
    })
  }

  return {
    next,
    prev,
    isSame,
    isNow,
    minutes,
    quarters,
    sixth
  }
}