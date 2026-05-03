/**
 * 时间处理工具函数
 * 处理时区、时间范围生成等
 */

import { TIMEZONE } from './constants'

const SECONDS_PER_DAY = 86400
const SECONDS_PER_MINUTE = 60

/**
 * 获取上海时区今天的起始时间戳
 */
export function getTodayStartTimestamp(): number {
  const now = new Date()
  const shanghaiDateStr = now.toLocaleString('en-CA', {
    timeZone: TIMEZONE.SHANGHAI,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return Math.floor(new Date(`${shanghaiDateStr}T00:00:00+0${TIMEZONE.OFFSET_HOURS}:00`).getTime() / 1000)
}

/**
 * 获取当前时间戳（秒）
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * 生成自定义时间范围字符串
 * 格式: start_end-start_end-... (30天)
 */
export function generateUptimeRanges(days: number = 30): string {
  const ranges: string[] = []
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE.SHANGHAI,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d)
    
    const start = Math.floor(new Date(`${dateStr}T00:00:00+0${TIMEZONE.OFFSET_HOURS}:00`).getTime() / 1000)
    const end = start + SECONDS_PER_DAY - 1
    ranges.push(`${start}_${end}`)
  }
  
  return ranges.join('-')
}

/**
 * 解析时间范围字符串为可用性百分比数组
 */
export function parseUptimeRanges(ranges?: string): (number | null)[] {
  if (!ranges) {
    const arr = Array(30).fill(null)
    arr[29] = 100
    return arr
  }
  
  return ranges.split('-').map(v => {
    const num = parseFloat(v)
    return isNaN(num) ? null : Math.round(num * 10) / 10
  })
}

/**
 * 根据创建日期调整可用性数据
 * 在监控创建之前的日期设为 null
 */
export function adjustByCreateDate(
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
    
    const parts = range.split('_')
    if (parts.length === 0 || !parts[0]) return val
    
    const startStr = parts[0]
    const rangeEnd = parseInt(startStr) + SECONDS_PER_DAY - 1
    
    if (rangeEnd < createDatetime) return null
    return val
  })
}

/**
 * 获取最新的检查时间戳
 */
export function getLatestCheckTimestamp(list: { response_times?: { datetime: number }[] }[]): number {
  let latest = 0
  
  for (const item of list) {
    const rt = item.response_times
    if (rt && rt.length > 0 && rt[0] && rt[0].datetime > latest) {
      latest = rt[0].datetime
    }
  }
  
  return latest
}

/**
 * 计算倒计时目标时间
 */
export function calculateNextRefreshTime(lastCheckTime: number, interval: number = 300): number {
  const nowSec = getCurrentTimestamp()
  let nextRefresh = lastCheckTime + interval + 30 // +30秒缓冲
  
  while (nextRefresh <= nowSec) {
    nextRefresh += interval
  }
  
  return nextRefresh
}
