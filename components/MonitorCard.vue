<template>
  <div class="monitor-card">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <h2 class="text-lg sm:text-xl font-bold truncate text-gray-800 dark:text-gray-100">
          {{ monitor.friendly_name }}
        </h2>
      </div>
      
      <!-- Status Badge -->
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" :class="badgeClass">
        <!-- Status Dot -->
        <span class="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" :class="dotClass" />
          <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="dotClass" />
        </span>
        <span class="text-gray-900 dark:text-white">{{ statusText }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3 mt-6">
      <!-- 平均响应时间 -->
      <div class="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 relative">
        <div class="text-xs text-gray-500 dark:text-gray-400">平均响应时间</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ responseTime }}</div>
        <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">最近24小时</div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
          <Icon icon="mdi:trending-up" class="w-5 h-5" />
        </div>
      </div>
      
      <!-- 平均运行时间 -->
      <div class="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 relative">
        <div class="text-xs text-gray-500 dark:text-gray-400">平均运行时间</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ uptime }}</div>
        <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">最近30天</div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
          <Icon icon="mdi:clock-outline" class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Uptime Bars -->
    <div class="mt-6">
      <!-- Monitor type & status line -->
      <div class="flex items-center gap-2 mb-3">
        <!-- Small Status Dot -->
        <span class="relative flex h-2 w-2 flex-shrink-0">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" :class="dotClass" />
          <span class="relative inline-flex rounded-full h-2 w-2" :class="dotClass" />
        </span>
        <span class="text-sm text-gray-600 dark:text-gray-300">{{ monitorTypeText }} / {{ monitorInterval }}m</span>
      </div>

      <!-- Day bars -->
      <div class="flex gap-[3px] h-8">
        <div
          v-for="(item, index) in displayUptimeDays"
          :key="index"
          class="flex-1 rounded-md overflow-hidden relative"
          :class="{ 'bg-gray-100 dark:bg-gray-700': item === null }"
        >
          <template v-if="item !== null">
            <div class="w-full h-full bg-emerald-400 dark:bg-emerald-500" />
            <template v-if="item.segments">
              <div
                v-for="(seg, si) in item.segments"
                :key="si"
                class="absolute left-0 right-0 bg-red-400 dark:bg-red-500"
                :style="{ top: `${seg.top}%`, height: `${seg.height}%` }"
              />
            </template>
            <div
              v-else-if="item.offlinePct > 0"
              class="absolute top-0 left-0 right-0 bg-red-400 dark:bg-red-500"
              :style="{ height: `${item.offlinePct}%` }"
            />
          </template>
        </div>
      </div>

      <!-- Labels -->
      <div class="flex items-center justify-between mt-2">
        <span class="text-xs text-gray-400 dark:text-gray-500">30天前</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">{{ uptimeSummaryText }}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">今日</span>
      </div>
    </div>

    <!-- Incident Record -->
    <div class="mt-5 pt-1 border-t border-gray-100 dark:border-gray-700/50">
      <div class="mt-2 bg-gray-50 dark:bg-gray-700/40 rounded-xl overflow-hidden">
        <button 
          @click="toggleExpand"
          class="w-full flex items-center justify-between py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span>故障记录</span>
          <Icon 
            icon="mdi:chevron-down"
            class="w-5 h-5 transition-transform duration-300"
            :class="{ 'rotate-180': isExpanded }"
          />
        </button>
        
        <div
          class="grid transition-all duration-300 ease-out"
          :class="isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
        >
          <div class="overflow-hidden border-t border-gray-200 dark:border-gray-600 min-h-0">
            <div class="p-3">
              <div v-if="incidentLogs.length" class="space-y-2">
                <div
                  v-for="(log, index) in incidentLogs"
                  :key="index"
                  class="py-2 px-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-start gap-2 min-w-0">
                      <span class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                      <div class="min-w-0">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ getLogStatusText(log.type) }}</span>
                        <span v-if="log.reason?.detail" class="block text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{{ log.reason.detail }}</span>
                      </div>
                    </div>
                    <div class="flex-shrink-0 text-right">
                      <span class="text-xs text-gray-500 dark:text-gray-400 block">{{ formatLogDate(log.datetime) }}</span>
                      <span class="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">持续 {{ formatDuration(log.duration) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="py-4 text-center text-sm text-gray-400 dark:text-gray-500">最近30天内无故障记录</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Monitor, MonitorLog } from '~/types'
import { LogType } from '~/types'
import { getStatusText, getStatusColor, getMonitorTypeText, getLogStatusText } from '~/utils/constants'
import { formatResponseTime, formatDuration, formatLogDate, formatUptimeSummary, formatInterval } from '~/utils/formatters'
import { getTodayStartTimestamp, getCurrentTimestamp } from '~/utils/time'

interface Props {
  monitor: Monitor
}

const props = defineProps<Props>()

const isExpanded = ref(false)

const statusText = computed(() => getStatusText(props.monitor.status))
const badgeClass = computed(() => {
  const color = getStatusColor(props.monitor.status)
  return `bg-${color}-50 text-${color}-600 dark:bg-${color}-500/20 dark:text-${color}-400`
})
const dotClass = computed(() => `bg-${getStatusColor(props.monitor.status)}-500`)

const responseTime = computed(() => formatResponseTime(props.monitor.average_response_time))
const uptime = computed(() => `${props.monitor.uptime || '100'}%`)
const monitorTypeText = computed(() => getMonitorTypeText(props.monitor.type))
const monitorInterval = computed(() => formatInterval(props.monitor.interval))

const uptimeDays = computed(() => {
  const daily = props.monitor.dailyUptimes
  if (!daily?.length) return []
  const hasData = daily.some(d => d !== null)
  if (!hasData) {
    const arr = [...daily]
    arr[arr.length - 1] = 100
    return arr
  }
  return daily
})

interface DayData {
  offlinePct: number
  segments?: { top: number; height: number }[]
}

const displayUptimeDays = computed((): (DayData | null)[] => {
  const days = uptimeDays.value
  if (!days.length) return Array(30).fill(null)

  const padded: (number | null)[] = days.length >= 30
    ? days.slice(-30)
    : [...Array(30 - days.length).fill(null), ...days]

  const todayStartTs = getTodayStartTimestamp()
  const nowTs = getCurrentTimestamp()
  const DAY_SEC = 86400

  const todaySegments: { top: number; height: number }[] = []
  if (props.monitor.logs) {
    for (const log of props.monitor.logs) {
      if (log.type !== LogType.DOWN) continue
      const segStart = Math.max(log.datetime, todayStartTs)
      const segEnd = Math.min(log.datetime + log.duration, nowTs)
      if (segEnd <= segStart) continue
      const top = Math.round((DAY_SEC - (segEnd - todayStartTs)) / DAY_SEC * 1000) / 10
      const hgt = Math.round((segEnd - segStart) / DAY_SEC * 1000) / 10
      todaySegments.push({ top: Math.max(0, top), height: Math.min(100 - top, hgt) })
    }
  }

  return padded.map((d, i) => {
    if (d === null) return null
    const isToday = i === padded.length - 1
    const offlinePct = Math.round((100 - d) * 10) / 10
    if (isToday && todaySegments.length > 0) {
      return { offlinePct: 0, segments: todaySegments }
    }
    return { offlinePct, segments: undefined }
  })
})

const uptimeSummaryText = computed(() => formatUptimeSummary(uptimeDays.value))

const incidentLogs = computed((): MonitorLog[] => {
  if (!props.monitor.logs) return []
  return props.monitor.logs.filter(log => log.type === LogType.DOWN).slice(0, 10)
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.monitor-card {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-500/50;
}
</style>
