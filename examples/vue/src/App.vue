<script setup lang="ts">
import { onErrorCaptured } from 'vue'

onErrorCaptured((err) => {
  console.error('Error in Calendar:', err)
  return false
})
</script>

<template>
  <div id="calendar-app">
    <router-view />
  </div>
</template>

<style scoped>
#calendar-app {
  width: 100%;
  height: 100vh;
  background: white;
}
</style>
