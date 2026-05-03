import { ref, computed } from 'vue'
import type { ApiResponse, ApiMonitor, Monitor, ResponseTimeEntry, CacheData } from '~/types'
import { MonitorStatus } from '~/types'
import { 
  CACHE_CONFIG, 
  API_CONFIG,
  getStatusText,
  getStatusColor
} from '~/utils/constants'
import { 
  formatCurrentTime,
  formatCountdown,
  formatRunningDays
} from '~/utils/formatters'
import { 
  generateUptimeRanges, 
  parseUptimeRanges,
  adjustByCreateDate,
  getLatestCheckTimestamp,
  calculateNextRefreshTime,
  getCurrentTimestamp
} from '~/utils/time'

// ========================
// 缓存管理
// ========================

function loadCache(): CacheData | null {
  try {
    const raw = localStorage.getItem(CACHE_CONFIG.KEY)
    if (!raw) return null
    
    const data = JSON.parse(raw)
    if (!data.monitors?.length || !data.lastCheckTime) return null
    
    return data as CacheData
  } catch {
    return null
  }
}

function saveCache(monitors: Monitor[], lastUpdate: string) {
  const lastCheckTime = getLatestCheckTimestamp(monitors)
  if (!lastCheckTime) return
  
  try {
    localStorage.setItem(CACHE_CONFIG.KEY, JSON.stringify({
      monitors,
      lastUpdate,
      lastCheckTime
    }))
  } catch { 
    // Ignore quota errors
  }
}

// ========================
// 数据处理函数
// ========================

function parseUptimeRatio(ratio?: string): { uptime_7d: string; uptime_30d: string } {
  if (!ratio) return { uptime_7d: '100', uptime_30d: '100' }
  
  const parts = ratio.split('-')
  return {
    uptime_7d: parts[0] || '100',
    uptime_30d: parts[1] || parts[0] || '100'
  }
}

function calcAverageResponseTime(times?: ResponseTimeEntry[]): number {
  if (!times?.length) return 0
  
  const sum = times.reduce((acc, t) => acc + t.value, 0)
  return Math.round(sum / times.length)
}

function processMonitors(apiMonitors: ApiMonitor[]): Monitor[] {
  const ranges = generateUptimeRanges()
  
  return apiMonitors.map((m): Monitor => {
    const { uptime_7d, uptime_30d } = parseUptimeRatio(m.custom_uptime_ratio)
    
    return {
      ...m,
      uptime: uptime_30d,
      uptime_7d,
      dailyUptimes: adjustByCreateDate(
        parseUptimeRanges(m.custom_uptime_ranges), 
        m.create_datetime, 
        ranges
      ),
      average_response_time: m.average_response_time ?? calcAverageResponseTime(m.response_times)
    }
  })
}

// ========================
// 倒计时管理
// ========================

function useCountdown() {
  const countdown = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null
  let nextRefreshTime = 0

  function start(lastCheckTime?: number) {
    if (timer) clearInterval(timer)

    const lct = lastCheckTime ?? 0

    if (!lct) {
      countdown.value = CACHE_CONFIG.REFRESH_INTERVAL
      timer = setInterval(() => {
        if (countdown.value > 0) countdown.value--
      }, 1000)
      return
    }

    nextRefreshTime = calculateNextRefreshTime(lct)
    countdown.value = nextRefreshTime - getCurrentTimestamp()

    timer = setInterval(() => {
      countdown.value = Math.max(0, nextRefreshTime - getCurrentTimestamp())
    }, 1000)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const formatted = computed(() => formatCountdown(countdown.value))

  return {
    countdown,
    formatted,
    start,
    stop
  }
}

// ========================
// 主 Composable
// ========================

export function useMonitors() {
  const config = useRuntimeConfig()
  const monitors = ref<Monitor[]>([])
  const error = ref('')
  const lastUpdate = ref('--:--:--')
  const isLoading = ref(false)
  let isFromCache = false

  const countdownManager = useCountdown()

  // 计算属性：统计数据
  const stats = computed(() => ({
    online: monitors.value.filter(m => m.status === MonitorStatus.UP).length,
    paused: monitors.value.filter(m => m.status === MonitorStatus.PAUSED || m.status === MonitorStatus.PREPARING).length,
    offline: monitors.value.filter(m => m.status === MonitorStatus.DOWN || m.status === MonitorStatus.SEEMS_DOWN).length
  }))

  // 计算属性：总体状态
  const overallStatus = computed(() => {
    const list = monitors.value
    if (!list.length) return { allOnline: false, hasOffline: false, hasPaused: false }
    
    return {
      allOnline: list.every(m => m.status === MonitorStatus.UP),
      hasOffline: list.some(m => m.status === MonitorStatus.DOWN),
      hasPaused: list.some(m => m.status === MonitorStatus.PAUSED || m.status === MonitorStatus.PREPARING)
    }
  })

  // 计算属性：平均在线率
  const averageUptime = computed(() => {
    if (!monitors.value.length) return 100
    const total = monitors.value.reduce((sum, m) => sum + (parseFloat(m.uptime) || 0), 0)
    return Math.round(total / monitors.value.length)
  })

  // 计算属性：运行天数
  const runningDays = computed(() => {
    if (!monitors.value.length) return ''
    const minCreateTime = Math.min(...monitors.value.map(m => m.create_datetime).filter(Boolean))
    return formatRunningDays(minCreateTime)
  })

  async function fetchData() {
    if (isLoading.value) return
    isLoading.value = true

    try {
      const ranges = generateUptimeRanges()
      const nowTs = getCurrentTimestamp()
      
      const res = await $fetch('/api/status', {
        method: 'POST',
        body: {
          format: 'json',
          custom_uptime_ratios: '7-30',
          custom_uptime_ranges: ranges,
          logs: 1,
          logs_limit: 50,
          response_times: 1,
          response_times_start_date: nowTs - 86400,
          response_times_end_date: nowTs,
        }
      }) as ApiResponse

      if (res.stat === 'ok') {
        monitors.value = processMonitors(res.monitors || [])
        lastUpdate.value = formatCurrentTime()
        error.value = ''
        saveCache(monitors.value, lastUpdate.value)
        countdownManager.start(getLatestCheckTimestamp(monitors.value))
      } else {
        error.value = res.message || '获取数据失败'
      }
    } catch (e: any) {
      if (e?.statusCode === 429) {
        error.value = API_CONFIG.RATE_LIMIT_MESSAGE
      } else {
        error.value = '网络错误，请稍后重试'
      }
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  async function manualRefresh() {
    if (countdownManager.countdown.value > 0 || isLoading.value) return
    await fetchData()
  }

  // 初始化：尝试从缓存加载
  const cache = loadCache()
  if (cache) {
    const nowSec = getCurrentTimestamp()
    if (nowSec < cache.lastCheckTime + CACHE_CONFIG.MAX_AGE_SECONDS) {
      monitors.value = cache.monitors
      lastUpdate.value = cache.lastUpdate
      isFromCache = true
      countdownManager.start(cache.lastCheckTime)
    }
  }

  return {
    // 数据
    monitors,
    error,
    lastUpdate,
    isLoading,
    isFromCache,
    
    // 统计
    stats,
    overallStatus,
    averageUptime,
    runningDays,
    
    // 倒计时
    countdown: countdownManager.countdown,
    formattedCountdown: countdownManager.formatted,
    
    // 方法
    fetchData,
    manualRefresh,
    cleanup: countdownManager.stop
  }
}

// ========================
// 状态管理 Composable (简化版)
// ========================

export function useStatus() {
  return {
    getStatusText,
    getStatusColor,
    getDotClass: (status: number) => `bg-${getStatusColor(status)}-500`,
    getBadgeClass: (status: number) => {
      const color = getStatusColor(status)
      return `bg-${color}-50 text-${color}-600 dark:bg-${color}-500/20 dark:text-${color}-400`
    }
  }
}
