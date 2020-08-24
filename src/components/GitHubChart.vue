<template>
  <div class="p-4">
    <ul
      class="github py-4"
      :style="{
        gridTemplateColumns: `repeat(${weeksCount + 1}, 6px)`,
        gridTemplateRows: `repeat(7, 6px)`
      }"
    >
      <li
        v-bind="{
          ...(index === 0 && {
            style: { 'grid-row-start': year.weekDay }
          })
        }"
        :title="day"
        v-for="(day, index) in days"
        :key="day"
        :class="`bg-gray-${random()}00`"
      ></li>
    </ul>
  </div>
</template>

<script>
import { usePickle } from "@/use/usePickle"
import useYear from "./../use/useYear"
import { getISOWeeksInYear } from "date-fns"

import { ref } from "vue"

export default {
  setup() {
    const now = ref(new Date())

    const pickle = usePickle({
      now,
      date: now
    })

    const weeksCount = getISOWeeksInYear(now.value)

    const year = useYear(pickle)

    const days = pickle.divide(year, "day")

    const random = () => {
      return Math.floor(Math.random() * 8) + 1
    }

    return { pickle, days, year, weeksCount, random }
  }
}
</script>

<style>
.github {
  display: grid;
  gap: 2px;
  grid-auto-flow: column;
}
</style>
