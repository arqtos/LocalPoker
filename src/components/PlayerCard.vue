<script setup lang="ts">
import { Times } from '@primeicons/vue'
import { Badge, Button, Checkbox, InputText } from 'primevue'
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import type { PlayerModel } from '@/models/PlayerModel'

const props = defineProps<{
  isSetup: boolean
  isDealer: boolean
  isBigBlind: boolean
  isSmallBlind: boolean
  isCurrent: boolean
  isShowdown: boolean
  player: PlayerModel
  elligibleShowdownPlayers: PlayerModel[]
}>()

const isSmallScreen = useMediaQuery('(max-width: 48rem)')

const emit = defineEmits(['delete'])
const model = defineModel<string>()
const selected = defineModel<PlayerModel[]>('selected')

const isCurrentStyle = computed(() => {
  return props.isCurrent && !props.isSetup && !props.isShowdown
    ? ' after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:inset-ring after:inset-ring-gray-950/5 dark:after:inset-ring-white/10 bg-[radial-gradient(var(--pattern-fg)_1px,transparent_0)] bg-size-[10px_10px] bg-fixed [--pattern-fg:var(--color-gray-950)]/5 dark:[--pattern-fg:var(--color-white)]/10'
    : ''
})

const hasFoldedStyle = computed(() => {
  return props.player.hasFolded && !props.isSetup
    ? ' bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed [--pattern-fg:var(--color-gray-950)]/5 dark:[--pattern-fg:var(--color-white)]/10'
    : ''
})

const isBankruptStyle = computed(() => {
  return props.player.isBankrupt && !props.isSetup && !props.isShowdown ? ' line-through' : ''
})

function onSelectPlayer() {
  if (!props.isShowdown) return

  if (selected.value?.includes(props.player))
    selected.value = selected.value?.filter((p) => p.id != props.player.id)
  else selected.value = selected.value?.concat(props.player)
}
</script>

<template>
  <div
    :class="
      'p-3 md:p-5 h-full bg-slate-900/50 ' + isCurrentStyle + hasFoldedStyle + isBankruptStyle
    "
  >
    <div v-if="isSetup" class="flex gap-4">
      <InputText class="w-30" v-model="model" />
      <Button iconOnly severity="secondary" aria-label="delete player" @click="emit('delete')">
        <Times />
      </Button>
    </div>
    <div v-else class="grid grid-cols-2 h-full" @click="onSelectPlayer()">
      <div class="flex flex-col">
        <div class="text-sm md:text-xl flex flex-row gap-1">
          {{ model }}
          <div v-if="!props.isShowdown" class="flex justify-center">
            <Badge
              v-if="props.player.hasFolded && !props.player.isBankrupt"
              severity="danger"
              class="my-auto"
            />
            <Badge v-if="props.isCurrent" severity="success" class="my-auto" />
            <Badge v-if="props.player.isInLimbo" severity="info" class="my-auto" />
          </div>
        </div>
        <span>{{ props.player.chips }} Chips</span>
        <span>Current Bet: {{ props.player.currentBet }}</span>
      </div>

      <div class="flex flex-col gap-1 items-end justify-start">
        <Badge v-if="isDealer" value="Dealer" severity="secondary" class="w-fit" />
        <Badge
          v-if="isBigBlind"
          :value="isSmallScreen ? 'Big' : 'Big Blind'"
          severity="secondary"
          class="w-fit"
        />
        <Badge
          v-if="isSmallBlind"
          :value="isSmallScreen ? 'Small' : 'Small Blind'"
          severity="secondary"
          class="w-fit"
        />
        <Checkbox
          v-if="props.isShowdown && props.elligibleShowdownPlayers.includes(props.player)"
          v-model="selected"
          :value="player"
          :input-id="player.id.toString()"
          class="mt-auto"
        />
      </div>
    </div>
  </div>
</template>
