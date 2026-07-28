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
    <span :class="'text-' + props.labelSize + ' text-slate-400'">
      {{ props.label }}
    </span>
    <span :class="'text-' + props.valueSize">
      {{ props.value }}
    </span>
  </div>
</template>
