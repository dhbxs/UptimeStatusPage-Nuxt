<template>
  <header class="flex items-center justify-between mb-8">
    <div class="flex items-center gap-3">
      <Logo />
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">服务状态</h1>
    </div>
    <div class="flex items-center gap-3">
      <!-- Refresh Button -->
      <ClientOnly>
        <button
          @click="onRefresh"
          :disabled="countdown > 0"
          class="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="countdown > 0 ? `${formattedCountdown}后可刷新` : '立即刷新'"
        >
          <Icon icon="mdi:refresh" class="w-4 h-4 text-emerald-500" />
          <span v-if="countdown > 0" class="text-xs text-gray-500 dark:text-gray-400">{{ formattedCountdown }}后刷新</span>
        </button>
      </ClientOnly>

      <!-- Theme Toggle -->
      <ClientOnly>
        <button 
          @click="theme.toggleTheme" 
          class="flex items-center justify-center h-10 w-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300"
          :title="theme.isDark ? '切换浅色模式' : '切换深色模式'"
        >
          <Icon :icon="theme.isDark ? 'line-md:sunny' : 'line-md:moon'" class="w-5 h-5 text-amber-500" />
        </button>
        <template #fallback>
          <button class="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-gray-100 shadow-sm">
            <Icon icon="line-md:moon" class="w-5 h-5 text-amber-500" />
          </button>
        </template>
      </ClientOnly>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useTheme } from '~/composables/useTheme'

interface Props {
  countdown: number
  formattedCountdown: string
  onRefresh: () => void
}

defineProps<Props>()

const theme = useTheme()
</script>
