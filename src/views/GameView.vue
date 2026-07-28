<script setup lang="ts">
import LabelValue from '@/components/LabelValue.vue'
import PlayerCard from '@/components/PlayerCard.vue'
import type { PlayerModel } from '@/models/PlayerModel'
import { usePokerStore } from '@/stores/poker'
import { useMediaQuery } from '@vueuse/core'
import { Button, Dialog, Drawer, InputNumber, Slider, Toast, useToast } from 'primevue'
import { computed, ref } from 'vue'

const store = usePokerStore()
const toast = useToast()

const raiseVisible = ref(false)
const raiseValue = ref(store.minBet)

const selectedPlayers = ref<PlayerModel[]>([])

const isDesktop = useMediaQuery('(min-width: 640px)')
const Modal = computed(() => ({
  Root: !isDesktop.value ? Drawer : Dialog,
}))

function onSelectWinner() {
  if (selectedPlayers.value.length == 0)
    toast.add({
      summary: 'Error while selecting winner',
      detail: 'Please select at least one player as the winner.',
      severity: 'error',
      life: 3000,
    })
  else {
    store.selectWinner(selectedPlayers.value)
    selectedPlayers.value = []
  }
}
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-15">
    <Toast />
    <span class="text-3xl">{{ store.betRoundName }} Round</span>

    <div class="flex flex-row gap-10">
      <LabelValue :label="'Big Blind'" :value="store.bigBlind.toString()" />
      <LabelValue :label="'Small Blind'" :value="store.smallBlind.toString()" />
    </div>

    <!-- <span class="text-3xl max-md:hidden">
      It's
      {{ store.currentPlayer.name }}'<span
        v-if="store.currentPlayer.name.substring(store.currentPlayer.name.length - 1) != 's'"
        >s</span
      >
      turn
    </span> -->

    <div
      class="flex flex-wrap lg:max-w-4/5 border border-white/10 divide-x divide-y divide-white/10"
    >
      <div v-for="player in store.players" :key="player.id">
        <PlayerCard
          class="min-w-40 min-h-20"
          v-model="player.name"
          v-model:selected="selectedPlayers"
          :player="player"
          :is-setup="false"
          :is-dealer="store.currentDealer == player"
          :is-big-blind="store.currentBigBlind == player"
          :is-small-blind="store.currentSmallBlind == player"
          :is-current="store.currentPlayer == player"
          :is-showdown="store.isShowdown"
          :elligible-showdown-players="store.elligibleShowdownPlayers"
          @delete="store.deletePlayer(player.id)"
        />
      </div>
    </div>

    <div class="flex flex-row items-center gap-5">
      <div class="flex flex-col items-center gap-5">
        <span class="text-4xl">Pot</span>
        <span class="text-3xl">{{ store.pot }}</span>
      </div>
      <div
        v-if="!store.isShowdown"
        v-for="sidepot in store.sidePots"
        class="flex flex-col items-center gap-5"
      >
        <span class="text-4xl">Sidepot {{ store.sidePots.indexOf(sidepot) + 1 }}</span>
        <span class="text-3xl">{{ sidepot.pot }}</span>
      </div>
    </div>

    <div v-if="!store.isShowdown" class="flex flex-row gap-5 md:gap-10">
      <Button class="w-20 md:w-40 h-15" @click="store.fold()">Fold</Button>
      <Button v-if="!store.mustAllIn" class="w-20 md:w-40 h-15 font-bold" @click="store.call()"
        >Check/Call</Button
      >
      <Button
        v-if="!store.mustAllIn"
        class="w-20 md:w-40 h-15 font-bold"
        @click="raiseVisible = true"
        >Bet/Raise</Button
      >
      <Button v-else class="w-20 md:w-40 h-15 font-bold" @click="store.allIn()">All In</Button>
    </div>
    <Button v-else class="w-20 md:w-40 h-15 font-bold" @click="onSelectWinner()"
      >Select Winner</Button
    >

    <component
      :is="Modal.Root"
      header="Set your raise"
      v-model:visible="raiseVisible"
      :position="isDesktop ? 'center' : 'bottom'"
      modal
      dismissableMask
      style="height: auto"
    >
      <div class="w-full mx-auto p-3">
        <InputNumber v-model="raiseValue" :showButtons="false" fluid class="mb-4" />
        <div class="flex flex-row items-center justify-between gap-4">
          {{ store.minBet }}
          <Slider
            v-model="raiseValue"
            class="w-full"
            :min="store.minBet"
            :max="store.currentPlayer.chips"
            :step="store.bigBlind"
          />
          {{ store.currentPlayer.chips }}
        </div>
        <Button
          class="w-full mt-4"
          @click="(store.raise(raiseValue), (raiseVisible = false))"
          :disabled="raiseValue < store.minBet || raiseValue > store.currentPlayer.chips"
        >
          Bet/Raise
        </Button>
      </div>
    </component>
  </div>
</template>
