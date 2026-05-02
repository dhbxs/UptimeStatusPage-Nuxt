<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 cursor-pointer"
    :class="cardHoverClass"
  >
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
          {{ monitor.friendly_name }}
        </h2>
        <a :href="getUrl(monitor.url)" target="_blank" class="flex-shrink-0 p-1.5 rounded-full bg-gray-50 hover:bg-gray-200 dark:bg-gray-700/40 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </a>
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
          {{ monitor.uptime }}%
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
      <div class="flex gap-[3px] h-6 items-end">
        <div
          v-for="(day, index) in displayUptimeDays"
          :key="index"
          class="flex-1 rounded-md transition-colors duration-200"
          :class="{
            'bg-emerald-400 dark:bg-emerald-500': day === true,
            'bg-red-400 dark:bg-red-500': day === false,
            'bg-gray-100 dark:bg-gray-700': day === null
          }"
          :style="{ height: '100%' }"
          :title="day === true ? '在线' : day === false ? '离线' : '暂无数据'"
        ></div>
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
                  class="flex items-center justify-between py-2 px-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">离线</span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatLogDate(log.datetime) }}</span>
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

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  monitor: { 
    type: Object, 
    default: () => ({}) 
  }
})

const isExpanded = ref(false)

const statusText = computed(() => {
  const map = { 2: '在线', 0: '暂停', 1: '准备中', 9: '离线' }
  return map[props.monitor.status] || '未知'
})

const dotClass = computed(() => {
  const map = { 2: 'bg-emerald-500', 0: 'bg-yellow-500', 1: 'bg-yellow-500', 9: 'bg-red-500' }
  return map[props.monitor.status] || 'bg-gray-500'
})

const statusColorClass = computed(() => {
  const map = { 2: 'text-emerald-500', 0: 'text-yellow-500', 1: 'text-yellow-500', 9: 'text-red-500' }
  return map[props.monitor.status] || 'text-gray-500'
})

const cardHoverClass = computed(() => {
  return 'hover:border-emerald-300 dark:hover:border-emerald-500/50'
})

const badgeClass = computed(() => {
  const map = { 
    2: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    0: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400',
    1: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400',
    9: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400'
  }
  return map[props.monitor.status] || 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
})

const formatResponseTime = computed(() => {
  return props.monitor.average_response_time 
    ? `${Math.round(props.monitor.average_response_time)} ms` 
    : '-'
})

const uptimeDays = computed(() => {
  if (!props.monitor.create_datetime) return []
  
  const now = Date.now()
  const createTime = props.monitor.create_datetime * 1000
  const daysSinceCreation = Math.floor((now - createTime) / (24 * 60 * 60 * 1000))
  const actualDays = Math.min(daysSinceCreation, 30)
  
  if (actualDays <= 0) return []
  
  const days = Array(actualDays).fill(true)
  
  if (props.monitor.logs) {
    for (const log of props.monitor.logs) {
      const logTime = log.datetime * 1000
      if (logTime >= createTime && logTime <= now) {
        const dayIndex = Math.floor((logTime - createTime) / (24 * 60 * 60 * 1000))
        if (dayIndex >= 0 && dayIndex < actualDays) {
          if (log.type === 9) {
            days[dayIndex] = false
          } else if (log.type === 2 && days[dayIndex]) {
            days[dayIndex] = true
          }
        }
      }
    }
  }
  
  return days
})

const monitorTypeText = computed(() => {
  const map = { 1: 'HTTP', 2: 'Keyword', 3: 'PING', 4: 'Port' }
  return map[props.monitor.type] || 'Unknown'
})

const monitorInterval = computed(() => {
  return props.monitor.interval ? Math.round(props.monitor.interval / 60) : '-'
})

const displayUptimeDays = computed(() => {
  const days = uptimeDays.value
  if (days.length >= 30) return days.slice(-30)
  // Pad with null (no data) for days before creation to always show 30 bars
  const padded = Array(30 - days.length).fill(null)
  return [...padded, ...days]
})

const uptimeSummaryText = computed(() => {
  const days = uptimeDays.value
  if (!days.length) return '暂无数据'
  const offlineCount = days.filter(d => !d).length
  if (offlineCount === 0) return `最近${days.length}天运行正常`
  return `最近${days.length}天有 ${offlineCount} 天离线`
})

const incidentLogs = computed(() => {
  if (!props.monitor.logs) return []
  return props.monitor.logs.filter(log => log.type === 9).slice(0, 10)
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function getUrl(url) {
  if (!url) return '#'
  return url.startsWith('http') ? url : `http://${url}`
}

function formatLogDate(timestamp) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
