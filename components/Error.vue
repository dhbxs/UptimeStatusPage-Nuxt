<template>
  <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl p-6 mb-6">
    <div class="flex items-center gap-3 text-red-600 dark:text-red-400">
      <Icon icon="mdi:alert-circle" class="w-6 h-6" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  error: { type: String, default: '' }
})
</script>