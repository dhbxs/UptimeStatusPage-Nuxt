/**
 * 监控系统类型定义
 * 集中管理所有类型声明
 */

// ========================
// 枚举和常量类型
// ========================

export enum MonitorStatus {
  PAUSED = 0,
  PREPARING = 1,
  UP = 2,
  SEEMS_DOWN = 8,
  DOWN = 9
}

export enum LogType {
  DOWN = 1,
  UP = 2,
  STARTED = 98,
  PAUSED = 99
}

export enum MonitorType {
  HTTP = 1,
  KEYWORD = 2,
  PING = 3,
  PORT = 4,
  CRON = 5,
  API = 6
}

// ========================
// API 响应类型
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
  url?: string
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
// 状态映射类型
// ========================

export interface StatusInfo {
  text: string
  color: 'emerald' | 'yellow' | 'red' | 'gray'
}

export interface DailyUptimeDisplay {
  offlinePct: number
  segments?: { top: number; height: number }[]
}

// ========================
// 缓存数据类型
// ========================

export interface CacheData {
  monitors: Monitor[]
  lastUpdate: string
  lastCheckTime: number
}

// ========================
// Layout 注入数据类型
// ========================

import type { Ref } from 'vue'

export interface LayoutData {
  countdown: Ref<number>
  formattedCountdown: Ref<string>
  manualRefresh: () => Promise<void>
}
