<template>
  <footer class="mt-12 text-center text-sm text-gray-400 dark:text-gray-500">
    <p>Powered by UptimeRobot &bull; {{ lastUpdate }}</p>
  </footer>
</template>

<script setup>
defineProps({
  lastUpdate: { type: String, default: '--:--:--' }
})
</script>