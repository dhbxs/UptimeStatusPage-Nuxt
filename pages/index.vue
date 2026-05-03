<template>
  <AppHeader 
    :countdown="countdown"
    :formatted-countdown="formattedCountdown"
    :on-refresh="manualRefresh"
  />
  
  <Loading :is-loading="isLoading" />
  <Error :error="error" />

  <template v-if="!isLoading && monitors.length">
    <Stats :stats="stats" />

    <StatusBar 
      :all-online="overallStatus.allOnline"
      :has-offline="overallStatus.hasOffline"
      :has-paused="overallStatus.hasPaused"
      :average-uptime="averageUptime"
      :running-days="runningDays"
    />

    <!-- Monitor List -->
    <div v-if="monitors.length" class="space-y-4">
      <MonitorCard 
        v-for="monitor in monitors" 
        :key="monitor.id" 
        :monitor="monitor"
      />
    </div>
  </template>

  <AppFooter />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// 设置页面元数据
useHead({
  title: '服务状态监控',
  meta: [
    { name: 'description', content: 'UptimeStatusPage - 服务状态监控面板' }
  ]
})

// 使用监控数据 composable
const { 
  monitors, 
  error, 
  isLoading,
  countdown,
  formattedCountdown,
  stats,
  overallStatus,
  averageUptime,
  runningDays,
  fetchData,
  manualRefresh,
  isFromCache,
  cleanup
} = useMonitors()

// 生命周期钩子
onMounted(() => {
  if (!isFromCache) fetchData()
})

onUnmounted(() => {
  cleanup()
})
</script>
