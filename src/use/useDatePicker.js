import {
  isToday,
  isSameDay,
  isSameMonth
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

  const weekStartsOn = ref(options.weekStartsOn)

  const browsing = ref(unref(options.now))

  const selected = ref(options.selected.value ? unref(options.selected) : unref(options.now))


  const now = options.now
  const events = ref([{
      start: new Date(2020, 4, 8),
      end: new Date(2020, 4, 20),
    },
    {
      start: new Date(2020, 4, 12),
      end: new Date(2020, 4, 22)
    }, {
      start: new Date(2020, 4, 10),
      end: new Date(2020, 4, 13)
    }
  ])

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

  const pickSecond = (e) => {
    events.value.push({
      start: selected.value,
      end: e
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
    pickSecond,
    now,
    events,
    selected
  }
}