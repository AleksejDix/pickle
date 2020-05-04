import {
  computed
} from 'vue'
import {
  isSameYear,
  add,
  sub,
  startOfYear,
  endOfYear
} from "date-fns";

import {
  each
} from './each'

export default function useYear(options) {

  const isSame = computed(() => isSameYear(options.now.value, options.browsing.value))

  const start = computed(() => startOfYear(options.browsing.value))
  const end = computed(() => endOfYear(options.browsing.value))

  const months = computed(() => each({
    start: start.value,
    end: end.value,
    step: {
      months: 1
    }
  }))

  const quartals = computed(() => each({
    start: start.value,
    end: end.value,
    step: {
      months: 3
    }
  }))


  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      years: 1
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      years: 1
    })
  }

  return {
    next,
    prev,
    isSame,
    months,
    quartals
  }
}