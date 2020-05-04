<template>
  <div class="my-calendar p-8">

    <div class="grid grid-cols-4 gap-4">
      <div>

    <pre>{{ picker.selected }}</pre>

    <p>
      Browing: <strong>{{ picker.browsing }}</strong>
    </p>

    <button class="button" @click="picker.pick(now)">
      now
    </button>


    <pre>{{
      picker.events
    }}</pre>


        <TimeInterval :picker="picker" type="millenium">
          {{ Math.floor(format(picker.browsing, "yyyy") / 1000) }} Millenium
        </TimeInterval>

        <TimeInterval :picker="picker" type="century">
          {{ Math.floor(format(picker.browsing, "yyyy") / 100) }} Century
        </TimeInterval>

        <TimeInterval :picker="picker" type="decade">
          {{ Math.floor(format(picker.browsing, "yyyy") / 10) * 10 }} Decade
        </TimeInterval>
      </div>

      <div class="border rounded">
        <TimeInterval :picker="picker" type="year">
          {{ format(picker.browsing, "yyyy") }} Year
        </TimeInterval>

        <YearMonth :picker="picker">
          <template #default="{month}">
            {{ format(month, "MMMM") }}
          </template>
        </YearMonth>
      </div>

      <div class="border rounded">
        <TimeInterval :picker="picker" type="yearQuarter">
          <span class="text-white">{{ format(picker.browsing, "QQQQ") }}</span>
          <span class="inline-block px-2 text-orange-500">{{
            format(picker.browsing, "yyyy")
          }}</span>
        </TimeInterval>

        <YearQuarter :picker="picker">
          <template #default="{yearQuarter}">
            {{ format(yearQuarter, "QQQQ") }}
          </template>
        </YearQuarter>
      </div>

      <div class="border rounded">
        <TimeInterval :picker="picker" type="month">
          <span class="text-white">{{ format(picker.browsing, "MMMM") }}</span>
          <span class="inline-block px-2 text-orange-500">{{
            format(picker.browsing, "yyyy")
          }}</span>
        </TimeInterval>

        <Month :picker="picker">
          <template #name="{day}">
            {{ format(day, "EE") }}
          </template> 
          <template #default="{day}">
            {{ format(day, "d") }}
          </template>
        </Month>
      </div>

      <div class="border rounded">
        <TimeInterval :picker="picker" type="week">
          <span class="text-white"
            >{{ format(picker.browsing, "wo") }} week</span
          >
          <span class="inline-block px-2 text-orange-500">{{
            format(picker.browsing, "yyyy")
          }}</span>
        </TimeInterval>

        <Week :picker="picker">
          <template #name="{day}">
            {{ format(day, "EE") }}
          </template>
          <template #default="{day}">
            {{ format(day, "d") }}
          </template>
        </Week>
      </div>
    </div>

    <TimeInterval :picker="picker" type="day">
      {{ format(picker.browsing, "d EEEE") }} Day
    </TimeInterval>

    <TimeInterval :picker="picker" type="hour">
      {{ format(picker.browsing, "HH") }} Hour
    </TimeInterval>

    <TimeInterval :picker="picker" type="minute">
      {{ format(picker.browsing, "mm") }} Minute
    </TimeInterval>

    <ul class="list-reset flex ">
      <li v-for="quarter in picker.hour.quarters" :key="quarter">
        <span
          class="dot"
          :class="{ highlight: picker.hourQuarter.isNow(quarter) }"
        ></span>
        <button
          class="day"
          @click="picker.pick(quarter)"
          :class="{
            selected: picker.selected && picker.hourQuarter.isSame(picker.selected, quarter)
          }"
        >
          {{ format(quarter, "mm") }}
        </button>
      </li>
    </ul>

    <ul class="list-reset flex ">
      <li v-for="second in picker.minute.seconds" :key="second">
        <span
          class="dot"
          :class="{ highlight: picker.minute.isNow(second) }"
        ></span>
        {{ format(second, "s") }}
      </li>
    </ul>

    <transition name="fade" mode="out-in">
      <ul class="list-reset month-grid" :key="picker.browsing">
        <li
          v-for="day in picker.month.weekDays"
          @click="picker.pick(day)"
          :key="day"
        >
          <button
            :disabled="!picker.isSameMonth(picker.browsing, day)"
            class="day"
            :class="{
              'bg-passive': picker.isToday(day),
              'bg-active': picker.selected && picker.isSameDay(picker.selected, day)
            }"
          >
            {{ format(day, "d") }}
          </button>
        </li>
      </ul>
    </transition>


    <div class="my-calendar-header">
      <button @click="picker.day.prev()">&larr;</button>
      <span :class="{ highlight: picker.day.isSame }"
        >day {{ format(picker.browsing, "E, d, dddd") }}</span
      >
      <button @click="picker.day.next()">&rarr;</button>
    </div>
  </div>
</template>
<script>
import TimeInterval from "./TimeInterval";

import useDatePicker from "./../use/useDatePicker.js";
import useCurrentDateTime from "./../use/useCurrentDateTime";
import Week from "./Week";
import Month from "./Month";
import YearMonth from "./YearMonth";
import YearQuarter from "./YearQuarter";

import { ref } from "vue";
import { format } from "date-fns";

export default {
  setup() {
    const { now } = useCurrentDateTime();
    const events = ref([]);
    const selected = ref('')

    const picker = useDatePicker({
      now,
      events,
      selected
    });

    return { picker, format, now };
  },
  components: {
    TimeInterval,
    Week,
    Month,
    YearMonth,
    YearQuarter
  }
};
</script>
