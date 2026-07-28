<script setup lang="ts">
import NumberStepInput from '@/components/NumberStepInput.vue'
import PlayerCard from '@/components/PlayerCard.vue'
import { usePokerStore } from '@/stores/poker'
import { Plus } from '@primeicons/vue'
import { Button, Toast, useToast } from 'primevue'

const store = usePokerStore()
const toast = useToast()

function onStartGame() {
  const errorMessage = store.startGame()

  if (errorMessage)
    toast.add({
      summary: 'Error while starting game',
      detail: errorMessage,
      severity: 'error',
      life: 3000,
    })
}
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-15">
    <Toast />

    <div
      class="flex flex-wrap lg:max-w-4/5 border border-white/10 divide-x divide-y divide-white/10"
    >
      <div v-for="player in store.players" :key="player.id">
        <PlayerCard
          class="min-w-40 min-h-20"
          v-model="player.name"
          :player="player"
          :is-setup="true"
          :is-dealer="store.currentDealer == player"
          :is-big-blind="store.currentBigBlind == player"
          :is-small-blind="store.currentSmallBlind == player"
          :is-current="store.currentPlayer == player"
          :is-showdown="store.isShowdown"
          :elligible-showdown-players="store.elligibleShowdownPlayers"
          @delete="store.deletePlayer(player.id)"
        />
      </div>
      <div class="min-w-40 min-h-20 bg-slate-900/50">
        <Button class="w-full h-full rounded-none!" variant="text" @click="store.addPlayer()">
          <Plus />
        </Button>
      </div>
    </div>

    <div class="flex flex-row gap-5 md:gap-10">
      <NumberStepInput v-model="store.bigBlind" :label="'First Big Blind'" :input-id="'bigBlind'" />
      <NumberStepInput v-model="store.startChips" :label="'Start Chips'" :input-id="'chipCount'" />
    </div>

    <Button variant="primary" @click="onStartGame()"> Start </Button>
  </div>
</template>
