<script setup lang="ts">
import { usePokerStore } from '@/stores/poker'
import GameView from '@/views/GameView.vue'
import SetupView from '@/views/SetupView.vue'
import { Button, Dialog } from 'primevue'

const store = usePokerStore()
</script>

<template>
  <SetupView v-if="store.isSetup" />
  <GameView v-else />

  <Dialog
    v-model:visible="store.isOver"
    modal
    header="Winner Winner Chicken Dinner"
    :closable="false"
  >
    <div class="flex flex-col gap-3 justify-center items-center">
      <span class="text-xl">{{ store.activePlayers[0]?.name }} wins the game! 🎉</span>
      <Button variant="primary" @click="store.$reset()">Play Again</Button>
    </div>
  </Dialog>
</template>
