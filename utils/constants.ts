/**
 * 项目常量定义
 * 所有常量集中管理，避免魔法数字和硬编码
 */

import { MonitorStatus, MonitorType, LogType, type StatusInfo } from '~/types'

// ========================
// 监控状态常量
// ========================

export const MONITOR_STATUS = {
  [MonitorStatus.PAUSED]: { text: '暂停', color: 'yellow' },
  [MonitorStatus.PREPARING]: { text: '准备中', color: 'yellow' },
  [MonitorStatus.UP]: { text: '在线', color: 'emerald' },
  [MonitorStatus.SEEMS_DOWN]: { text: '疑似离线', color: 'red' },
  [MonitorStatus.DOWN]: { text: '离线', color: 'red' }
} as const satisfies Record<MonitorStatus, StatusInfo>

// ========================
// 日志类型常量
// ========================

export const LOG_TYPE_TEXT: Record<number, string> = {
  [LogType.DOWN]: '服务离线',
  [LogType.UP]: '服务恢复',
  [LogType.STARTED]: '监控启动',
  [LogType.PAUSED]: '服务暂停'
}

// ========================
// 监控类型常量
// ========================

export const MONITOR_TYPE_TEXT: Record<number, string> = {
  [MonitorType.HTTP]: 'HTTP',
  [MonitorType.KEYWORD]: 'Keyword',
  [MonitorType.PING]: 'PING',
  [MonitorType.PORT]: 'Port',
  [MonitorType.CRON]: 'Cron Job',
  [MonitorType.API]: 'API'
}

// ========================
// 时区配置
// ========================

export const TIMEZONE = {
  SHANGHAI: 'Asia/Shanghai',
  OFFSET_HOURS: 8
} as const

// ========================
// 缓存和定时器配置
// ========================

export const CACHE_CONFIG = {
  KEY: 'uptime-status-cache',
  MAX_AGE_SECONDS: 330, // 5分30秒
  REFRESH_INTERVAL: 300 // 5分钟
} as const

export const API_CONFIG = {
  REFRESH_BUFFER_SECONDS: 30,
  RATE_LIMIT_MESSAGE: 'API请求频率已达免费版上限（10次/分钟），请稍后刷新'
} as const

// ========================
// UI 显示配置
// ========================

export const UI_CONFIG = {
  UPTIME_DAYS_COUNT: 30,
  LOGS_LIMIT: 50,
  MAX_INCIDENT_LOGS: 10
} as const

// ========================
// 辅助函数
// ========================

/**
 * 获取状态文本
 */
export function getStatusText(status: number): string {
  return MONITOR_STATUS[status as MonitorStatus]?.text ?? '未知'
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: number): StatusInfo['color'] {
  return MONITOR_STATUS[status as MonitorStatus]?.color ?? 'gray'
}

/**
 * 获取状态点样式类
 */
export function getDotClass(status: number): string {
  return `bg-${getStatusColor(status)}-500`
}

/**
 * 获取状态徽章样式类
 */
export function getBadgeClass(status: number): string {
  const color = getStatusColor(status)
  return `bg-${color}-50 text-${color}-600 dark:bg-${color}-500/20 dark:text-${color}-400`
}

/**
 * 获取监控类型文本
 */
export function getMonitorTypeText(type: number): string {
  return MONITOR_TYPE_TEXT[type] ?? 'Unknown'
}

/**
 * 获取日志状态文本
 */
export function getLogStatusText(type: number): string {
  return LOG_TYPE_TEXT[type] ?? '未知状态'
}
