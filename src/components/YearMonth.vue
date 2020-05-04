<template>
<div class=" p-2">
  <div class="grid grid-cols-2 gap-2">
    <button  
      :key="month"
      @click="picker.pick(month)" 
      class="w-full py-3 border-4 rounded-full border-transparent focus:outline-none focus:shadow-outline" 
      :class="{
        'border-orange-500  text-white': picker.month.isSameMonth(month, picker.selected),
        'text-orange-500': picker.month.isSameMonth(month, picker.now),
      }" 
      v-for="month in picker.year.months"
    >
      <slot :month="month"></slot>
    </button>
  </div>
</div>
</template>

<script>
export default {
  props: ['picker']
}
</script>
