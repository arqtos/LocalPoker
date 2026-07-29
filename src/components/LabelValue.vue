<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  labelSize: string
  valueSize: string
}>()
</script>

<template>
  <div class="flex flex-col">
    <span :class="props.labelSize + ' text-slate-400'">
      {{ props.label }}
    </span>
    <span :class="props.valueSize">
      {{ props.value }}
    </span>
  </div>
</template>
