<template>
<div class=" p-2">
  <div class="grid gap-2">
    <button  
      :key="yearQuarter"
      @click="picker.pick(yearQuarter)" 
      class="border-4 rounded-full border-transparent w-full py-3 rounded focus:outline-none focus:shadow-outline" 
      :class="{
        'border-orange-500 text-white': picker.selected && picker.yearQuarter.isSameQuarter(yearQuarter, picker.selected),
        'text-orange-500': picker.yearQuarter.isSameQuarter(yearQuarter, picker.now),
      }" 
      v-for="yearQuarter in picker.year.quartals"
    >
      <slot :yearQuarter="yearQuarter"></slot>
    </button>
  </div>
</div>
</template>

<script>
export default {
  props: ['picker']
}
</script>
