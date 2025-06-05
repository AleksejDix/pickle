import { isToday, isSameDay, isSameMonth, isSameHour } from "date-fns";

import { ref, unref, type Ref } from "vue";

import type { Event, UseDatePickerOptions } from "../types";
import useMillenium from "./useMillenium";
import useCentury from "./useCentury";
import useDecade from "./useDecade";
import useYear from "./useYear";
import useYearQuarter from "./useYearQuarter";
import useMonth from "./useMonth";
import useWeek from "./useWeek";
import useDay from "./useDay";
import useHour from "./useHour";
import useHourQuarter from "./useHourQuarter";
import useMinute from "./useMinute";

export default function useDatePicker(options: UseDatePickerOptions) {
  const now = ref(new Date());
  const browsing = ref(unref(now));
  const selected: Ref<Date | null> = ref(
    options.selected ? unref(options.selected) : unref(now)
  );

  const weekStartsOn = ref(options.weekStartsOn || 1);
  const events: Ref<Event[]> = ref(options.events || []);

  const millenium = useMillenium({
    browsing,
    now,
    weekStartsOn,
  });

  const century = useCentury({
    browsing,
    now,
    weekStartsOn,
  });

  const decade = useDecade({
    browsing,
    now,
    weekStartsOn,
  });

  const year = useYear({
    browsing,
    now,
    weekStartsOn,
  });

  const yearQuarter = useYearQuarter({
    browsing,
    now,
    weekStartsOn,
  });

  const month = useMonth({
    browsing,
    now,
    weekStartsOn,
  });

  const week = useWeek({
    browsing,
    now,
    weekStartsOn,
  });

  const day = useDay({
    browsing,
    now,
  });

  const hour = useHour({
    browsing,
    now,
  });

  const hourQuarter = useHourQuarter({
    browsing,
    now,
  });

  const minute = useMinute({
    browsing,
    now,
  });

  const pick = (e: Date): void => {
    if (selected.value && isSameDay(selected.value, e)) {
      selected.value = null;
    } else {
      selected.value = e;
    }
    browsing.value = e;
  };

  const pickHour = (e: Date): void => {
    if (selected.value && isSameHour(selected.value, e)) {
      selected.value = null;
    } else {
      selected.value = e;
    }
    browsing.value = e;
  };

  const pickSecond = (e: Date): void => {
    if (selected.value) {
      events.value.push({
        title: "Event",
        timespan: {
          start: selected.value,
          end: e,
        },
      });
    }
    browsing.value = e;
  };

  const pickSecondHour = (e: Date): void => {
    if (selected.value) {
      events.value.push({
        title: "Event",
        timespan: {
          start: selected.value,
          end: e,
        },
      });
    }
    browsing.value = e;
  };

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
    selected,
  };
}
