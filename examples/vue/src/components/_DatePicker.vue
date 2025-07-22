<template>
  <div class="my-calendar p-8">
    <div class="grid grid-cols-4 gap-4">
      <!-- <div>
        <TimeUnit :picker="picker" type="millenium">
          {{ humanFormat(picker.browsing, { year: "numeric", era: "long" }) }}
        </TimeUnit>

        <TimeUnit :picker="picker" type="century">
          {{
            Math.floor(+humanFormat(picker.browsing, { year: "numeric" }) / 100)
          }}
        </TimeUnit>

        <TimeUnit :picker="picker" type="decade">
          {{ humanFormat(picker.browsing, { year: "2-digit" }) }}
        </TimeUnit>
      </div> -->

      <div class="border rounded p-2">
        <Pickle>
          <TimeUnit :picker="picker" type="yearQuarter">
            <template #default="{ unit }">
              <span class="text-white">{{ unit.number }}</span>
              <span class="inline-block px-2 text-orange-500">
                {{ humanFormat(picker.browsing, { year: "numeric" }) }}
              </span>
            </template>
          </TimeUnit>

          <TimeUnitGrid
            type="year"
            subunit="month"
            :step="1"
            :columns="3"
            :now="now"
            :selected="selected"
          >
            <template #default="{ unit }">
              {{ humanFormat(unit, { month: "long" }) }}
            </template>
          </TimeUnitGrid>
        </Pickle>
      </div>

      <!-- <div class="border rounded p-2">
        <TimeUnit :picker="picker" type="month">
          <span class="text-white">{{
            humanFormat(picker.browsing, { month: "long" })
          }}</span>
          <span class="inline-block px-2 text-orange-500">{{
            humanFormat(picker.browsing, { year: "numeric" })
          }}</span>
        </TimeUnit>

        <WeekDayNames :picker="picker">
          <template #name="{day}">
            {{ humanFormat(day, { weekday: "short" }) }}
          </template>
        </WeekDayNames>

        <Month :picker="picker">
          <template #default="{day}">
            {{ format(day, "d") }}
          </template>
        </Month>

        <TimeUnit :picker="picker" type="week">
          <template #default="{unit}">
            <span class="text-white">{{ unit.number }}</span>
            <span class="inline-block px-2 text-orange-500">{{
              humanFormat(picker.browsing, { year: "numeric" })
            }}</span>
          </template>
        </TimeUnit>

        <WeekDayNames :picker="picker">
          <template #name="{day}">
            {{ humanFormat(day, { weekday: "short" }) }}
          </template>
        </WeekDayNames>

        <Week :picker="picker">
          <template #default="{day}">
            {{ humanFormat(day, { day: "numeric" }) }}
          </template>
        </Week>
      </div> -->

      <!-- <div class="border rounded p-2">
        
        <TimeUnit :picker="picker" type="day">
          {{ humanFormat(picker.browsing, {day: "numeric"}) }} Day
        </TimeUnit>

        <DayHours :picker="picker">
          <template #default="{unit, format}">
            {{ format(unit) }}
          </template>
        </DayHours>

        <TimeUnit :picker="picker" type="hour">
          {{ humanFormat(picker.browsing, {hour: "numeric"}) }} Hour
        </TimeUnit>

        <TimeUnit :picker="picker" type="minute">
          {{ humanFormat(picker.browsing, {minute: "numeric"}) }} Minute
        </TimeUnit>
      </div> -->
    </div>
  </div>
</template>
<script>
import Pickle from "./Pickle";
import TimeUnit from "./TimeUnit";
import useDatePicker from "./../use/useDatePicker";
import TimeUnitGrid from "./TimeUnitGrid";

import { ref } from "vue";
import { format } from "date-fns";

export default {
  components: {
    Pickle,
    TimeUnit,
    TimeUnitGrid,
  },
  props: ["events"],
  setup(props) {
    const pickle = ref(new Date());
    const now = new Date();
    const events = ref(props.events || []);
    const selected = ref(new Date());

    const picker = useDatePicker({
      events,
      selected,
    });

    const locale = "de";

    function humanFormat(date, options) {
      return new Intl.DateTimeFormat(locale, options).format(date);
    }

    return { picker, format, now, selected, humanFormat, pickle };
  },
};
</script>
