import {
  computed
} from 'vue'
import {
  add,
  sub
} from "date-fns";

const getCentury = (date) => {
  var year = date.getFullYear()
  return Math.floor(year / 100) * 100
}

const isSameCentury = (dirtyDateLeft, dirtyDateRight) => getCentury(dirtyDateLeft) === getCentury(dirtyDateRight)

export default function useCentury(options) {

  const isSame = computed(() => isSameCentury(options.now.value, options.browsing.value))

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      years: 100
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      years: 100
    })
  }

  return {
    next,
    prev,
    isSame
  }
}