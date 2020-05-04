import {
  computed
} from 'vue'

import {
  add,
  sub
} from "date-fns";

const getMillenium = (date) => {
  var year = date.getFullYear()
  return Math.floor(year / 1000) * 1000
}

const isSameMillenium = (dirtyDateLeft, dirtyDateRight) => getMillenium(dirtyDateLeft) === getMillenium(dirtyDateRight)

export default function useMillenium(options) {

  const isSame = computed(() => isSameMillenium(options.now.value, options.browsing.value))

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      years: 1000
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      years: 1000
    })
  }

  return {
    next,
    prev,
    isSame
  }
}