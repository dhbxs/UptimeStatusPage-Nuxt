import { ref, computed } from 'vue'

// ========================
// 常量定义
// ========================

export const MonitorType: Record<number, string> = {
  1: 'HTTP',
  2: 'Keyword',
  3: 'PING',
  4: 'Port'
}

export const MonitorStatus = {
  PAUSED: 0,
  PREPARING: 1,
  UP: 2,
  SEEMS_DOWN: 8,
  DOWN: 9
} as const

export const LogType = {
  DOWN: 1,
  UP: 2,
  STARTED: 98,
  PAUSED: 99
} as const

// ========================
// API 类型定义
// ========================

export interface MonitorLog {
  type: number
  datetime: number
  duration: number
  reason?: {
    code: string
    detail: string
  }
}

export interface ResponseTimeEntry {
  datetime: number
  value: number
}

export interface SSLInfo {
  expires_in_days: number
  expire_date: string
  issuer: string
  subject: string
  is_valid: number
}

export interface ApiMonitor {
  id: number
  friendly_name: string
  type: number
  sub_type: string
  keyword_type: string
  keyword_case_type: string
  keyword_value: string
  http_username: string
  http_password: string
  port: string
  interval: number
  status: number
  create_datetime: number
  monitor_group: number
  is_group_main: number
  custom_uptime_ratio?: string
  custom_uptime_ranges?: string
  custom_down_durations?: string
  logs?: MonitorLog[]
  response_times?: ResponseTimeEntry[]
  average_response_time?: number
  ssl?: SSLInfo
}

export interface ApiResponse {
  stat: string
  pagination?: {
    offset: number
    limit: number
    total: number
  }
  monitors?: ApiMonitor[]
  message?: string
}

// ========================
// 前端展示类型
// ========================

export interface Monitor extends ApiMonitor {
  uptime: string
  uptime_7d: string
  dailyUptimes: (number | null)[]
}

// ========================
// composables
// ========================

const CACHE_KEY = 'uptime-status-cache'

interface CacheData {
  monitors: Monitor[]
  lastUpdate: string
  lastCheckTime: number
}

export function useMonitors() {
  const config = useRuntimeConfig()
  const monitors = ref<Monitor[]>([])
  const error = ref('')
  const lastUpdate = ref('--:--:--')
  const isLoading = ref(false)
  const countdown = ref(0)
  let countdownTimer: ReturnType<typeof setInterval> | null = null
  let nextRefreshTime = 0
  let isFromCache = false

  const onlineCount = computed(() => monitors.value.filter(m => m.status === MonitorStatus.UP).length)
  const pausedCount = computed(() => monitors.value.filter(m => m.status === MonitorStatus.PAUSED || m.status === MonitorStatus.PREPARING).length)
  const offlineCount = computed(() => monitors.value.filter(m => m.status === MonitorStatus.DOWN || m.status === MonitorStatus.SEEMS_DOWN).length)

  function loadCache(): CacheData | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      if (!data.monitors?.length || !data.lastCheckTime) return null
      return data
    } catch {
      return null
    }
  }

  function saveCache() {
    const lct = getLastCheckTime(monitors.value)
    if (!lct) return
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        monitors: monitors.value,
        lastUpdate: lastUpdate.value,
        lastCheckTime: lct
      }))
    } catch { /* ignore quota errors */ }
  }

  function getLastCheckTime(list: Monitor[]): number {
    let latest = 0
    for (const m of list) {
      const rt = m.response_times
      if (rt && rt.length > 0 && rt[0].datetime > latest) {
        latest = rt[0].datetime
      }
    }
    return latest
  }

  function startCountdown(lastCheckTime?: number) {
    const lct = lastCheckTime ?? getLastCheckTime(monitors.value)
    if (countdownTimer) clearInterval(countdownTimer)

    if (!lct) {
      countdown.value = 300
      countdownTimer = setInterval(() => {
        if (countdown.value > 0) countdown.value--
      }, 1000)
      return
    }

    const nowSec = Math.floor(Date.now() / 1000)
    nextRefreshTime = lct + 330
    while (nextRefreshTime <= nowSec) {
      nextRefreshTime += 300
    }
    countdown.value = nextRefreshTime - nowSec

    countdownTimer = setInterval(() => {
      countdown.value = Math.max(0, nextRefreshTime - Math.floor(Date.now() / 1000))
    }, 1000)
  }

  function cleanup() {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  function parseUptimeRatio(ratio?: string): { uptime_7d: string; uptime_30d: string } {
    if (!ratio) return { uptime_7d: '100', uptime_30d: '100' }
    const parts = ratio.split('-')
    return {
      uptime_7d: parts[0] || '100',
      uptime_30d: parts[1] || parts[0] || '100'
    }
  }

  function calcAverageResponseTime(times?: ResponseTimeEntry[]): number {
    if (!times || times.length === 0) return 0
    const sum = times.reduce((acc, t) => acc + t.value, 0)
    return Math.round(sum / times.length)
  }

  function generateUptimeRanges(): string {
    const ranges: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d)
      const start = Math.floor(new Date(`${dateStr}T00:00:00+08:00`).getTime() / 1000)
      const end = start + 86399
      ranges.push(`${start}_${end}`)
    }
    return ranges.join('-')
  }

  function parseUptimeRanges(ranges?: string): (number | null)[] {
    if (!ranges) return Array(30).fill(null)
    return ranges.split('-').map(v => {
      const num = parseFloat(v)
      return isNaN(num) ? null : Math.round(num * 10) / 10
    })
  }

  function adjustByCreateDate(
    dailyUptimes: (number | null)[],
    createDatetime: number,
    rangesStr: string
  ): (number | null)[] {
    if (!createDatetime || !rangesStr) return dailyUptimes
    const rangePairs = rangesStr.split('-')
    return dailyUptimes.map((val, i) => {
      if (val === null) return null
      const range = rangePairs[i]
      if (!range) return val
      const [startStr] = range.split('_')
      const rangeEnd = parseInt(startStr) + 86399
      if (rangeEnd < createDatetime) return null
      return val
    })
  }

  async function fetchData() {
    if (isLoading.value) return
    isLoading.value = true

    try {
      const ranges = generateUptimeRanges()
      const nowTs = Math.floor(Date.now() / 1000)
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
        const monitorList = res.monitors || []
        monitors.value = monitorList.map((m: ApiMonitor): Monitor => {
          const { uptime_7d, uptime_30d } = parseUptimeRatio(m.custom_uptime_ratio)
          return {
            ...m,
            uptime: uptime_30d,
            uptime_7d,
            dailyUptimes: adjustByCreateDate(parseUptimeRanges(m.custom_uptime_ranges), m.create_datetime, ranges),
            average_response_time: m.average_response_time ?? calcAverageResponseTime(m.response_times)
          }
        })

        const now = new Date()
        lastUpdate.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        error.value = ''
        saveCache()
        startCountdown()
      } else {
        error.value = res.message || '获取数据失败'
      }
    } catch (e: any) {
      if (e?.statusCode === 429) {
        error.value = 'API请求频率已达免费版上限（10次/分钟），请稍后刷新'
      } else {
        error.value = '网络错误，请稍后重试'
      }
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  async function manualRefresh() {
    if (countdown.value > 0 || isLoading.value) return
    await fetchData()
  }

  const formattedCountdown = computed(() => {
    const m = Math.floor(countdown.value / 60)
    const s = countdown.value % 60
    return `${m}:${String(s).padStart(2, '0')}`
  })

  // 初始化：尝试从缓存加载
  const cache = loadCache()
  if (cache) {
    const nowSec = Math.floor(Date.now() / 1000)
    if (nowSec < cache.lastCheckTime + 330) {
      monitors.value = cache.monitors
      lastUpdate.value = cache.lastUpdate
      isFromCache = true
      startCountdown(cache.lastCheckTime)
    }
  }

  return {
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
  }
}

export function useStatus() {
  const STATUS_MAP: Record<number, { text: string; color: string }> = {
    [MonitorStatus.UP]: { text: '在线', color: 'emerald' },
    [MonitorStatus.PAUSED]: { text: '暂停', color: 'yellow' },
    [MonitorStatus.PREPARING]: { text: '准备中', color: 'yellow' },
    [MonitorStatus.SEEMS_DOWN]: { text: '疑似离线', color: 'red' },
    [MonitorStatus.DOWN]: { text: '离线', color: 'red' }
  }

  const getStatusText = (status: number) => STATUS_MAP[status]?.text || '未知'
  const getStatusColor = (status: number) => STATUS_MAP[status]?.color || 'gray'
  const getDotClass = (status: number) => `bg-${getStatusColor(status)}-500`
  const getBadgeClass = (status: number) => {
    const color = getStatusColor(status)
    return `bg-${color}-50 text-${color}-600 dark:bg-${color}-500/20 dark:text-${color}-400`
  }

  return {
    getStatusText,
    getStatusColor,
    getDotClass,
    getBadgeClass
  }
}
