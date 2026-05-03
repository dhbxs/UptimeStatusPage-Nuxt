<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 mb-6">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <!-- Status Dot -->
        <span class="relative flex h-3 w-3">
          <span :class="['absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', dotClass]" />
          <span :class="['relative inline-flex rounded-full h-3 w-3', dotClass]" />
        </span>
        <span class="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{{ statusText }}</span>
      </div>
      <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{{ averageUptime }}%</span>
    </div>
    <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
      <div 
        class="h-2 rounded-full transition-all duration-500" 
        :class="progressColorClass"
        :style="{ width: `${averageUptime}%` }"
      />
    </div>
    <div class="flex items-center justify-between mt-3">
      <span class="text-xs text-gray-500 dark:text-gray-400">在线率</span>
      <span class="text-xs text-gray-500 dark:text-gray-400">{{ runningDays }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MonitorStatus } from '~/types'
import { getStatusColor } from '~/utils/constants'

interface Props {
  allOnline: boolean
  hasOffline: boolean
  hasPaused: boolean
  averageUptime: number
  runningDays: string
}

const props = defineProps<Props>()

const overallStatus = computed(() => {
  if (props.hasOffline) return MonitorStatus.DOWN
  if (props.hasPaused) return MonitorStatus.PAUSED
  if (props.allOnline) return MonitorStatus.UP
  return MonitorStatus.PREPARING
})

const statusText = computed(() => {
  if (props.allOnline) return '所有服务运行正常'
  if (props.hasOffline) return '有服务处于离线状态'
  if (props.hasPaused) return '有服务已暂停'
  return '服务状态异常'
})

const dotClass = computed(() => `bg-${getStatusColor(overallStatus.value)}-500`)

const progressColorClass = computed(() => {
  if (props.allOnline) return 'bg-emerald-500'
  if (props.hasOffline) return 'bg-red-500'
  return 'bg-yellow-500'
})
</script>
