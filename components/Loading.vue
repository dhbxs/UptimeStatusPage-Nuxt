<template>
  <div v-if="isLoading" class="space-y-4 animate-pulse">
    <!-- Stats Skeleton -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 h-24">
        <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 h-24">
        <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 h-24">
        <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- StatusBar Skeleton -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 mb-6 h-32">
      <div class="flex items-center justify-between mb-4">
        <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
      <div class="flex items-center justify-between">
        <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- MonitorCard Skeleton -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between mb-6">
        <div class="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 h-24">
          <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div class="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
          <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 h-24">
          <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div class="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
          <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div class="mb-3">
        <div class="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div class="flex gap-[3px] h-6">
          <div v-for="n in 30" :key="n" class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
      <div class="h-10 bg-gray-50 dark:bg-gray-700/40 rounded-xl mt-5"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoading: { type: Boolean, default: false },
  monitors: { type: Array, default: () => [] }
})
</script>
