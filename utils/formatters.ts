/**
 * 格式化工具函数
 * 所有格式化逻辑集中管理
 */

// ========================
// 时间格式化
// ========================

/**
 * 格式化持续时间为可读文本
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '< 1秒'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) return `${hours}小时${minutes}分钟`
  if (minutes > 0) return `${minutes}分钟${secs}秒`
  return `${secs}秒`
}

/**
 * 格式化日志日期时间
 */
export function formatLogDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ]
  const timeParts = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0')
  ]
  return `${parts.join('-')} ${timeParts.join(':')}`
}

/**
 * 格式化当前时间为 HH:MM:SS
 */
export function formatCurrentTime(): string {
  const now = new Date()
  return [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join(':')
}

/**
 * 格式化倒计时为 M:SS
 */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ========================
// 数字和单位格式化
// ========================

/**
 * 格式化响应时间
 */
export function formatResponseTime(ms: number | undefined): string {
  return ms ? `${Math.round(ms)} ms` : '-'
}

/**
 * 格式化运行时间为天数
 */
export function formatRunningDays(minCreateTime: number): string {
  if (!minCreateTime) return ''
  
  const createDay = Math.floor((minCreateTime + 28800) / 86400)
  const nowDay = Math.floor((Date.now() / 1000 + 28800) / 86400)
  const days = nowDay - createDay + 1
  
  return `已运行 ${days} 天`
}

/**
 * 格式化在线率
 */
export function formatUptimePercent(uptime: string | number): string {
  const value = typeof uptime === 'string' ? parseFloat(uptime) : uptime
  return isNaN(value) ? '0' : String(Math.round(value))
}

/**
 * 格式化监控间隔（秒转分钟）
 */
export function formatInterval(seconds: number | undefined): string {
  return seconds ? String(Math.round(seconds / 60)) : '-'
}

// ========================
// 文本格式化
// ========================

/**
 * 生成在线率摘要文本
 */
export function formatUptimeSummary(days: (number | null)[]): string {
  const validDays = days.filter((d): d is number => d !== null)
  if (!validDays.length) return '暂无数据'
  
  const offlineCount = validDays.filter(d => d < 100).length
  if (offlineCount === 0) return `最近${validDays.length}天运行正常`
  return `最近${validDays.length}天有 ${offlineCount} 天离线`
}
