<template>
  <div class="grid grid-cols-7">
    <div
      :class="{'text-white': picker.day.isSameDay(day.date, picker.now)}" 
      class="day uppercase text-center text-xs" v-for="day in picker.week.days" :key="day.date">
      <slot name="name" :day="day.date"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ['picker']
}
</script>
