<template>
  <div v-if="monitors.length" class="space-y-4">
    <MonitorCard 
      v-for="monitor in monitors" 
      :key="monitor.id" 
      :monitor="monitor"
    />
  </div>
</template>

<script setup>
defineProps({
  monitors: { type: Array, default: () => [] }
})
</script>