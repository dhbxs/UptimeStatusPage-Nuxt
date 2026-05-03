<template>
  <div class="logo">
    <Icon icon="mdi:shield-check" class="w-6 h-6 text-white" />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<style scoped>
.logo {
  @apply w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center;
}
</style>
