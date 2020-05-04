import {
  computed
} from 'vue'
import {
  isSameDay,
  add,
  sub,
  startOfDay,
  endOfDay,
} from "date-fns";
export default function useDay(options) {

  const isSame = computed(() => isSameDay(options.now.value, options.browsing.value))

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      days: 1
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      days: 1
    })
  }

  return {
    next,
    prev,
    isSame,
    isSameDay,
    startOfDay,
    endOfDay
  }
}