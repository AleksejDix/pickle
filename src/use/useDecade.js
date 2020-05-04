import {
  computed
} from 'vue'

import {
  add,
  sub,
  getDecade
} from "date-fns";

const isSameDecade = (dateLeft, dateRight) => getDecade(dateLeft) === getDecade(dateRight)
export default function useDecade(options) {

  const isSame = computed(() => isSameDecade(options.now.value, options.browsing.value))

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      years: 10
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      years: 10
    })
  }

  return {
    next,
    prev,
    isSame
  }
}