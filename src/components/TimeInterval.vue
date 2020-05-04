<template>
  <div class="flex justify-between p-3">
    <div>
      <span class="dot" :class="{highlight: picker[type].isSame}"></span>
      <span><slot></slot></span>
    </div>
    <div>
      <button @click="picker[type].prev()">
        <svg class="w-5 h-5 icon" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
      </button>
      <button @click="picker[type].next()">
        <svg class="w-5 h-5 icon" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['picker', 'type']
}
</script>
