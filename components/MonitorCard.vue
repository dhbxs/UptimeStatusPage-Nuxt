<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-500/50"
  >
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
          {{ monitor.friendly_name }}
        </h2>

      </div>
      
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" :class="badgeClass">
        <span class="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" :class="dotClass"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="dotClass"></span>
        </span>
        <span>{{ statusText }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3 mt-6">
      <div class="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 relative">
        <div class="text-xs text-gray-500 dark:text-gray-400">平均响应时间</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {{ formatResponseTime }}
        </div>
        <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">最近24小时</div>
        <!-- Trend icon -->
        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 relative">
        <div class="text-xs text-gray-500 dark:text-gray-400">平均运行时间</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {{ monitor.uptime || '100' }}%
        </div>
        <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">最近30天</div>
        <!-- Clock icon -->
        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Uptime Bars -->
    <div class="mt-6">
      <!-- Monitor type & status line -->
      <div class="flex items-center gap-2 mb-3">
        <span class="relative flex h-2 w-2 flex-shrink-0">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" :class="dotClass"></span>
          <span class="relative inline-flex rounded-full h-2 w-2" :class="dotClass"></span>
        </span>
        <span class="text-sm text-gray-600 dark:text-gray-300">
          {{ monitorTypeText }} / {{ monitorInterval }}m
        </span>
        <span class="text-gray-300 dark:text-gray-600">·</span>
        <span class="text-sm font-medium" :class="statusColorClass">{{ statusText }}</span>
      </div>

      <!-- Day bars -->
      <div class="flex gap-[3px] h-8">
        <div
          v-for="(item, index) in displayUptimeDays"
          :key="index"
          class="flex-1 rounded-md overflow-hidden relative"
          :class="{
            'bg-gray-100 dark:bg-gray-700': item === null
          }"
        >
          <template v-if="item !== null">
            <div class="w-full h-full bg-emerald-400 dark:bg-emerald-500"></div>
            <template v-if="item.segments">
              <div
                v-for="(seg, si) in item.segments"
                :key="si"
                class="absolute left-0 right-0 bg-red-400 dark:bg-red-500"
                :style="{ top: `${seg.top}%`, height: `${seg.height}%` }"
              ></div>
            </template>
            <div
              v-else-if="item.offlinePct > 0"
              class="absolute top-0 left-0 right-0 bg-red-400 dark:bg-red-500"
              :style="{ height: `${item.offlinePct}%` }"
            ></div>
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
          <svg 
            class="w-5 h-5 transition-transform duration-300"
            :class="{ 'rotate-180': isExpanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
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
                      <span class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5"></span>
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
              <div v-else class="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                最近30天内无故障记录
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { LogType, type MonitorLog } from '~/composables/useMonitors'

const props = defineProps({
  monitor: { 
    type: Object, 
    default: () => ({}) 
  }
})

const isExpanded = ref(false)

const statusText = computed(() => {
  const map: Record<number, string> = { 2: '在线', 0: '暂停', 1: '准备中', 8: '疑似下线', 9: '离线' }
  return map[props.monitor.status] || '未知'
})

const dotClass = computed(() => {
  const map: Record<number, string> = { 2: 'bg-emerald-500', 0: 'bg-yellow-500', 1: 'bg-yellow-500', 8: 'bg-red-500', 9: 'bg-red-500' }
  return map[props.monitor.status] || 'bg-gray-500'
})

const statusColorClass = computed(() => {
  const map: Record<number, string> = { 2: 'text-emerald-500', 0: 'text-yellow-500', 1: 'text-yellow-500', 8: 'text-red-500', 9: 'text-red-500' }
  return map[props.monitor.status] || 'text-gray-500'
})

const formatResponseTime = computed(() => {
  return props.monitor.average_response_time 
    ? `${Math.round(props.monitor.average_response_time)} ms` 
    : '-'
})

const uptimeDays = computed(() => {
  const daily = props.monitor.dailyUptimes
  if (!daily || !daily.length) return []
  return daily
})

const monitorTypeText = computed(() => {
  const map: Record<number, string> = { 1: 'HTTP', 2: 'Keyword', 3: 'PING', 4: 'Port', 5: 'Cron Job', 6: 'API' }
  return map[props.monitor.type] || 'Unknown'
})

const monitorInterval = computed(() => {
  return props.monitor.interval ? Math.round(props.monitor.interval / 60) : '-'
})

const displayUptimeDays = computed(() => {
  const days = uptimeDays.value
  if (!days.length) return Array(30).fill(null)

  const now = new Date()
  const shanghaiDateStr = now.toLocaleString('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' })
  const todayStartTs = Math.floor(new Date(`${shanghaiDateStr}T00:00:00+08:00`).getTime() / 1000)
  const nowTs = Math.floor(Date.now() / 1000)
  const DAY_SEC = 86400

  // Build today's fault segments from logs (scaled to 24h)
  const todaySegments: { top: number; height: number }[] = []
  if (props.monitor.logs) {
    for (const log of props.monitor.logs) {
      if (log.type !== LogType.DOWN) continue
      const segStart = Math.max(log.datetime, todayStartTs)
      const segEnd = Math.min(log.datetime + log.duration, nowTs)
      if (segEnd <= segStart) continue
      const top = Math.round((86400 - (segEnd - todayStartTs)) / DAY_SEC * 1000) / 10
      const hgt = Math.round((segEnd - segStart) / DAY_SEC * 1000) / 10
      todaySegments.push({ top: Math.max(0, top), height: Math.min(100 - top, hgt) })
    }
  }

  return days.map((d, i) => {
    if (d === null) return null
    const isToday = i === days.length - 1
    const offlinePct = Math.round((100 - d) * 10) / 10
    if (isToday && todaySegments.length > 0) {
      return { offlinePct: 0, segments: todaySegments }
    }
    return { offlinePct, segments: undefined }
  })
})

const uptimeSummaryText = computed(() => {
  const days = uptimeDays.value
  if (!days.length) return '暂无数据'
  const validDays = days.filter(d => d !== null) as number[]
  if (!validDays.length) return '暂无数据'
  const offlineCount = validDays.filter(d => d < 100).length
  if (offlineCount === 0) return `最近${validDays.length}天运行正常`
  return `最近${validDays.length}天有 ${offlineCount} 天离线`
})

const incidentLogs = computed(() => {
  if (!props.monitor.logs) return []
  return props.monitor.logs.filter((log: MonitorLog) => log.type === LogType.DOWN).slice(0, 10)
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function getLogStatusText(type: number) {
  const map: Record<number, string> = {
    1: '服务离线',
    98: '监控启动',
    99: '服务暂停'
  }
  return map[type] || '未知状态'
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return '< 1秒'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}小时${m}分钟`
  if (m > 0) return `${m}分钟${s}秒`
  return `${s}秒`
}


function formatLogDate(timestamp: number) {
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}
</script>

