<template>
  <div class="p-2 bg-white h-screen">
    <div class="container mx-auto border-2 rounded-lg  p-8">
      <div class="flex justify-between">
        <div class="text-gray-800">
          {{ f(timebox.raw, { month: "short", year: "numeric" }) }}
        </div>
        <div>
          <button @click="past">past</button>
          <button @click="future">next</button>
        </div>
      </div>
      <div class="py-4">
        <ul class="grid gap-2 border-b-2 grid-cols-7">
          <li
            class="uppercase py-4 leading-none"
            v-for="weekDay in timebox.weekday"
            :key="weekDay.raw"
          >
            {{ f(weekDay.raw, { weekday: "short" }) }}
          </li>
        </ul>
      </div>
      <div class="timebox">
        <div
          v-bind="{
            ...(index === 0 && {
              style: { 'grid-column-start': day.weekOffset }
            })
          }"
          :class="{
            'bg-gray-200': !day.weekend,
            'bg-red-200': day.weekend,
            'bg-yellow-200': day.isToday
          }"
          class="relative rounded py-4 px-5"
          v-for="(day, index) in timebox.stablemonth"
          :key="day.raw"
        >
          <div
            class="font-menibold"
            :class="{
              'text-gray-600': !day.weekend,
              'text-red-600': day.weekend
            }"
          >
            {{ f(day.raw, { day: "numeric" }) }}
          </div>
          <div class="pt-4" v-if="day.events.length > 0">
            {{ day.events.length }} tasks
          </div>
        </div>
      </div>
    </div>
    <!-- <div>
      {{f(timebox.raw, {year: 'numeric'})}}
      <button @click="future">next</button>
      <button @click="past">past</button>
    </div>
    <ul>
      <li v-for="month in timebox.month" :key="month.raw">
        {{f(month.raw, {month: 'long', year: 'numeric'})}}
        <ul class="flex">
          <li class="p-2" v-for="day in month.day" :key="day.raw">
            {{f(day.raw, {day: 'numeric'})}}
          </li>
        </ul>
      </li>
    </ul> -->
    <!-- <pre>{{timebox}}</pre> -->

    <h1>{{ f(timebox.raw, { month: "long", year: "numeric" }) }}</h1>
    <ul class="">
      <li class="p-2" v-for="week in timebox.week" :key="week.raw">
        {{ f(week.start, { week: "numeric" }) }}-{{
          f(week.end, { week: "numeric" })
        }}
        <ul class="flex">
          <li class="day text-center" v-for="day in week.day" :key="day.raw">
            {{ f(day.raw, { day: "numeric" }) }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import useTimeBox from "./../use/useTimeBox"

import { ref, computed } from "vue"

export default {
  setup() {
    const now = ref(new Date())

    const {
      date,
      future,
      past,
      divide,
      info,
      pipe,
      schedule,
      f,
      units,
      weekend,
      inspect,
      weekday,
      isSame
    } = useTimeBox({ now, locale: "en" })

    const events = [
      {
        date: new Date(2020, 4, 1),
        data: "1 May",
        repeat: "year"
      },
      {
        date: new Date(2020, 11, 24),
        data: "x mas",
        repeat: "year"
      },
      {
        date: new Date(2020, 10, 20),
        data: "Aleksej Birthday",
        repeat: "year"
      },
      {
        date: new Date(2020, 5, 24),
        data: "Lidia Birthday",
        repeat: "year"
      },
      {
        date: new Date(2020, 11, 31),
        data: "nowyi god",
        repeat: "year"
      }
    ]

    const timebox = computed(() =>
      pipe(
        info("stablemonth"),
        weekday,
        divide("day", schedule(events), weekend, isSame("month")),
        inspect
      )(date.value)
    )

    return { future, past, timebox, f, units }
  }
}
</script>

<style>
.day {
  width: calc(100% / 7);
}

.timebox {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
}
</style>
