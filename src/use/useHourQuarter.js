import {
  add,
  sub
} from "date-fns";

const isSameHourQuarter = (start, end) => {
  const getHourQuarter = date => Math.round(date.getMinutes() / 15);
  return getHourQuarter(start) === getHourQuarter(end)
}
export default function useQuarter(options) {

  const isNow = (date) => isSameHourQuarter(options.now.value, date)
  const isSame = (selected, date) => isSameHourQuarter(selected, date)

  const prev = () => {
    options.browsing.value = sub(options.browsing.value, {
      minutes: 15
    })
  }
  const next = () => {
    options.browsing.value = add(options.browsing.value, {
      minutes: 15
    })
  }

  return {
    next,
    prev,
    isNow,
    isSame
  }
}