import { ref, computed } from 'vue'

export interface MonitorLog {
  type: number
  datetime: number
}

export interface Monitor {
  id: number
  friendly_name: string
  url: string
  status: number
  average_response_time: number
  custom_uptime_ranges?: string[]
  type: number
  interval: number
  create_datetime: number
  logs?: MonitorLog[]
}

export function useMonitors() {
  const config = useRuntimeConfig()
  const monitors = ref<Monitor[]>([])
  const error = ref('')
  const lastUpdate = ref('--:--:--')
  const isLoading = ref(false)
  const countdown = ref(0)
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  const onlineCount = computed(() => monitors.value.filter(m => m.status === 2).length)
  const pausedCount = computed(() => monitors.value.filter(m => m.status === 0 || m.status === 1).length)
  const offlineCount = computed(() => monitors.value.filter(m => m.status === 9).length)

  function startCountdown() {
    countdown.value = 300
    if (countdownTimer) clearInterval(countdownTimer)
    countdownTimer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--
      } else {
        if (countdownTimer) clearInterval(countdownTimer)
      }
    }, 1000)
  }

  async function fetchData() {
    if (isLoading.value) return
    isLoading.value = true
    
    try {
      const res = await $fetch('/api/status', {
        method: 'POST',
        body: {
          format: 'json',
          logs: 1,
          response_times: 1
        }
      }) as any
      
      if (res.stat === 'ok') {
        const monitorList = res.monitors?.monitor || res.monitors || []
        monitors.value = monitorList.map((m: Monitor) => ({
          ...m,
          uptime: m.custom_uptime_ranges?.[0]?.slice?.(2) || '100'
        }))
        
        const now = new Date()
        lastUpdate.value = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
        error.value = ''
        startCountdown()
      } else {
        error.value = res.message || '获取数据失败'
      }
    } catch (e) {
      error.value = '网络错误，请稍后重试'
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
    return `${m}:${s.toString().padStart(2, '0')}`
  })

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
    manualRefresh
  }
}

export function useStatus() {
  const STATUS_MAP = {
    2: { text: '在线', color: 'emerald' },
    0: { text: '暂停', color: 'yellow' },
    1: { text: '准备中', color: 'yellow' },
    9: { text: '离线', color: 'red' }
  } as const

  const getStatusText = (status: number) => STATUS_MAP[status as keyof typeof STATUS_MAP]?.text || '未知'
  const getStatusColor = (status: number) => STATUS_MAP[status as keyof typeof STATUS_MAP]?.color || 'gray'
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
