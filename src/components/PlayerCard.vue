<script setup lang="ts">
import { Times } from '@primeicons/vue';
import { Badge, Button, Chip, InputText } from 'primevue';
import { computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import type { PlayerModel } from '@/models/PlayerModel';

const props = defineProps<{
  isSetup: boolean,
  isDealer: boolean,
  isBigBlind: boolean,
  isSmallBlind: boolean,
  isCurrent: boolean,
  player: PlayerModel,
}>()

const isSmallScreen = useMediaQuery('(max-width: 48rem)')

const emit = defineEmits(['delete'])
const model = defineModel<string>()

const isCurrentStyle = computed(() => {
  return props.isCurrent && !props.isSetup
    ? " bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed [--pattern-fg:var(--color-gray-950)]/5 dark:[--pattern-fg:var(--color-white)]/10"
    : ""
}) 
console.log(isCurrentStyle)
</script>

<template>
  <div :class="'p-3 md:p-5 h-full' + isCurrentStyle">
    <div v-if="isSetup" class="flex gap-4">
      <InputText class="w-30" v-model="model" />
      <Button iconOnly severity="secondary" aria-label="delete player" @click="emit('delete')"><Times /></Button>
    </div>
    <div v-else class="grid grid-cols-2 h-full">
      <div class="flex flex-col">
        <div class="text-sm md:text-xl flex flex-row gap-1">
          {{ model }} 
          <Badge v-if="props.player.hasFolded" severity="danger" class="my-auto" />
          <Badge v-if="props.isCurrent" severity="success" class="my-auto" />
        </div>
        <span>
          {{ props.player.chips }} Chips
        </span>
      </div>

      <div class="flex flex-col gap-1 items-end justify-start">
        <Badge v-if="isDealer" value="Dealer" severity="secondary" class="w-fit" />
        <Badge v-if="isBigBlind" :value="isSmallScreen ? 'Big' : 'Big Blind'" severity="secondary" class="w-fit" />
        <Badge v-if="isSmallBlind" :value="isSmallScreen ? 'Small' : 'Small Blind'" severity="secondary" class="w-fit" />
      </div>
    </div>
  </div>
</template>