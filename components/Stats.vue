<template>
  <div v-if="total > 0" class="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300">
      <div class="text-2xl sm:text-3xl font-bold text-emerald-500 text-center">{{ stats.online }}</div>
      <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">在线</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300">
      <div class="text-2xl sm:text-3xl font-bold text-yellow-500 text-center">{{ stats.paused }}</div>
      <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">暂停</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300">
      <div class="text-2xl sm:text-3xl font-bold text-red-500 text-center">{{ stats.offline }}</div>
      <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">离线</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  stats: {
    online: number
    paused: number
    offline: number
  }
}

const props = defineProps<Props>()

const total = computed(() => props.stats.online + props.stats.paused + props.stats.offline)
</script>
