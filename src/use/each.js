import {
  add
} from 'date-fns'

export function each(options) {
  const endTime = options.end.getTime()
  const dates = []
  let currentDate = options.start
  while (currentDate.getTime() <= endTime) {
    dates.push(currentDate)
    currentDate = add(currentDate, options.step)
  }
  return dates
}