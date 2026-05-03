<template>
  <div v-if="monitors.length" class="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300">
      <div class="text-2xl sm:text-3xl font-bold text-emerald-500 text-center">{{ onlineCount }}</div>
      <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">在线</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300">
      <div class="text-2xl sm:text-3xl font-bold text-yellow-500 text-center">{{ pausedCount }}</div>
      <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">暂停</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300">
      <div class="text-2xl sm:text-3xl font-bold text-red-500 text-center">{{ offlineCount }}</div>
      <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">离线</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  monitors: { type: Array, default: () => [] },
  onlineCount: { type: Number, default: 0 },
  pausedCount: { type: Number, default: 0 },
  offlineCount: { type: Number, default: 0 }
})
</script>