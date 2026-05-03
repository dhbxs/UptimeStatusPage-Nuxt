<template>
  <footer class="mt-12 text-center">
    <div class="flex items-center justify-center gap-6 mb-4">
      <a href="https://github.com/dhbxs/UptimeStatusPage-Nuxt" target="_blank" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
        <Icon icon="mdi:github" class="w-5 h-5" />
      </a>
      <a href="https://blog.dhbxs.top" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
        <Icon icon="mdi:home" class="w-5 h-5" />
      </a>
      <a href="mailto:yao@mail.dhbxs.top" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
        <Icon icon="mdi:email" class="w-5 h-5" />
      </a>
    </div>
    <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
      <a href="https://github.com/dhbxs/UptimeStatusPage-Nuxt" target="_blank" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
        <b>UptimeStatusPage-Nuxt</b>
      </a> 
      Version {{ config.public.version }}
    </p>
    <p class="text-sm text-gray-500 dark:text-gray-500 mb-1">
      基于 
      <a href="https://uptimerobot.com/" target="_blank" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
        <b>UptimeRobot</b>
      </a> 
      接口 | 检测频率 5 分钟
    </p>
    <p class="text-sm text-gray-500 dark:text-gray-500">Copyright © 2020 - 2026 dhbxs</p>
  </footer>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

const config = useRuntimeConfig()
</script>
