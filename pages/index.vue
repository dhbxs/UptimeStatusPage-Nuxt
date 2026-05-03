<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <AppHeader 
        :countdown="countdown"
        :formatted-countdown="formattedCountdown"
        :on-refresh="manualRefresh"
      />
      
      <Loading :is-loading="isLoading" :monitors="monitors" />
      <Error :error="error" />

      <template v-if="!isLoading && monitors.length">
        <Stats 
          :monitors="monitors" 
          :online-count="onlineCount"
          :paused-count="pausedCount"
          :offline-count="offlineCount"
        />

        <StatusBar :monitors="monitors" />

        <MonitorList :monitors="monitors" />
      </template>
      
      <AppFooter :last-update="lastUpdate" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useMonitors } from '~/composables/useMonitors'

const { 
  monitors, 
  error, 
  lastUpdate, 
  isLoading,
  countdown,
  formattedCountdown,
  onlineCount, 
  pausedCount, 
  offlineCount, 
  fetchData,
  manualRefresh,
  isFromCache,
  cleanup
} = useMonitors()

onMounted(() => {
  if (!isFromCache) fetchData()
})

onUnmounted(() => {
  cleanup()
})
</script>
