import {
  isToday,
  isSameDay,
  isSameMonth,
  isSameHour
} from "date-fns";

import {
  ref,
  unref,
} from 'vue'


import useMillenium from "./../use/useMillenium.js";
import useCentury from "./../use/useCentury.js";
import useDecade from "./../use/useDecade.js";
import useYear from "./../use/useYear.js";
import useYearQuarter from "./../use/useYearQuarter.js";
import useMonth from "./../use/useMonth.js";
import useWeek from "./../use/useWeek.js";
import useDay from "./../use/useDay.js";
import useHour from "./../use/useHour.js";
import useHourQuarter from "./../use/useHourQuarter.js"
import useMinute from "./../use/useMinute.js";

export default function useDatePicker(options) {

  const now = ref(new Date())
  const browsing = ref(unref(now))
  const selected = ref(options.selected.value ? unref(options.selected) : unref(now))

  const weekStartsOn = ref(options.weekStartsOn)

  const events = ref(options.events)

  const millenium = useMillenium({
    browsing,
    now,
    weekStartsOn
  })

  const century = useCentury({
    browsing,
    now,
    weekStartsOn
  })

  const decade = useDecade({
    browsing,
    now,
    weekStartsOn
  })

  const year = useYear({
    browsing,
    now,
    weekStartsOn
  })

  const yearQuarter = useYearQuarter({
    browsing,
    now,
    weekStartsOn
  })

  const month = useMonth({
    events,
    browsing,
    now,
    weekStartsOn
  })

  const week = useWeek({
    events,
    browsing,
    now,
    weekStartsOn
  })

  const day = useDay({
    browsing,
    now
  })


  const hour = useHour({
    browsing,
    now
  })

  const hourQuarter = useHourQuarter({
    browsing,
    now
  })

  const minute = useMinute({
    browsing,
    now
  })

  const pick = (e) => {
    if (isSameDay(selected.value, e)) {
      selected.value = null
    } else {
      selected.value = e
    }
    browsing.value = e
  }

  const pickHour = (e) => {
    if (isSameHour(selected.value, e)) {
      selected.value = null
    } else {
      selected.value = e
    }
    browsing.value = e
  }

  const pickSecond = (e) => {
    events.value.push({
      timespan: {
        start: selected.value,
        end: e
      }
    })
    browsing.value = e
  }

  const pickSecondHour = (e) => {
    events.value.push({
      timespan: {
        start: selected.value,
        end: e
      }
    })
    browsing.value = e
  }

  return {
    isToday,
    isSameDay,
    isSameMonth,
    millenium,
    century,
    decade,
    year,
    yearQuarter,
    month,
    week,
    day,
    hour,
    hourQuarter,
    minute,
    browsing,
    pick,
    pickHour,
    pickSecond,
    pickSecondHour,
    now,
    events,
    selected
  }
}