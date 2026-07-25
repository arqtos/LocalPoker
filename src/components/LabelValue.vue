<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
}>()
</script>

<template>
  <div class="flex flex-col">
    <span class="text-md text-slate-400">
      {{ props.label }}
    </span>
    <span class="text-2xl">
      {{ props.value }}
    </span>
  </div>
</template>
