<template>
<div class=" p-2">
  <div class="grid grid-cols-7 gap-2">
    <div
      :class="{'text-white': picker.day.isSameDay(day, picker.now)}" 
      class="day uppercase text-center text-xs" v-for="day in picker.week.days" :key="day">
      <slot name="name" :day="day"></slot>
    </div>
    <button  
      :key="day"
      @click="picker.pick(day)" 
      class="w-full py-3 rounded" 
      :class="{
        'bg-gray-800': picker.day.isSameDay(day, picker.now),
        'bg-green-600 text-gray-900': picker.selected && picker.day.isSameDay(day, picker.selected)
      }" 
       v-bind="{
        ...(index === 0 && {style:{'grid-column-start': picker.week.weekDay(day)}})
      }"
      v-for="(day,index) in picker.week.days"
    >
      <slot :day="day"></slot>
    </button>
  </div>
</div>
</template>

<script>
export default {
  props: ['picker']
}
</script>
