<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 mb-6">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="relative flex h-3 w-3">
          <span :class="['absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', statusColorClass]"></span>
          <span :class="['relative inline-flex rounded-full h-3 w-3', statusColorClass]"></span>
        </span>
        <span class="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{{ statusText }}</span>
      </div>
      <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{{ uptimePercent }}%</span>
    </div>
    <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
      <div 
        class="h-2 rounded-full transition-all duration-500" 
        :class="[progressColorClass]"
        :style="{ width: `${uptimePercent}%` }"
      ></div>
    </div>
    <div class="flex items-center justify-between mt-3">
      <span class="text-xs text-gray-500 dark:text-gray-400">在线率</span>
      <span class="text-xs text-gray-500 dark:text-gray-400">{{ runningDaysText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  monitors: { type: Array, default: () => [] }
})

const allOnline = computed(() => props.monitors.every(m => m.status === 2))
const hasOffline = computed(() => props.monitors.some(m => m.status === 9))
const hasPaused = computed(() => props.monitors.some(m => m.status === 0 || m.status === 1))

const statusText = computed(() => {
  if (allOnline.value) return '所有服务运行正常'
  if (hasOffline.value) return '有服务处于离线状态'
  if (hasPaused.value) return '有服务已暂停'
  return '服务状态异常'
})

const statusColorClass = computed(() => {
  if (allOnline.value) return 'bg-emerald-500'
  if (hasOffline.value) return 'bg-red-500'
  if (hasPaused.value) return 'bg-yellow-500'
  return 'bg-gray-500'
})

const progressColorClass = computed(() => {
  if (allOnline.value) return 'bg-emerald-500'
  if (hasOffline.value) return 'bg-red-500'
  return 'bg-yellow-500'
})

const uptimePercent = computed(() => {
  if (!props.monitors.length) return 100
  const total = props.monitors.reduce((sum, m) => sum + (parseFloat(m.uptime) || 0), 0)
  return Math.round(total / props.monitors.length)
})

const runningDaysText = computed(() => {
  if (!props.monitors.length) return ''
  const minCreateTime = Math.min(...props.monitors.map(m => m.create_datetime).filter(Boolean))
  if (!minCreateTime) return ''
  const createDay = Math.floor((minCreateTime + 28800) / 86400)
  const nowDay = Math.floor((Date.now() / 1000 + 28800) / 86400)
  const days = nowDay - createDay + 1
  return `已运行 ${days} 天`
})
</script>
