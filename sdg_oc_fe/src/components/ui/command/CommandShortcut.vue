<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils.recetas'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <span :class="cn('ml-auto text-xs st text-muted-foreground', props.class)">
    <slot />
  </span>
</template>
