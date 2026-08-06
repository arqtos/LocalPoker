<script setup lang="ts">
import { usePokerStore } from '@/stores/poker'
import GameView from '@/views/GameView.vue'
import SetupView from '@/views/SetupView.vue'
import { InfoCircle, Refresh } from '@primeicons/vue'
import { Button, ConfirmDialog, Dialog, useConfirm } from 'primevue'

const store = usePokerStore()
const confirm = useConfirm()

const resetGame = () => {
  confirm.require({
    group: 'dialog',
    message: 'Do you want to reset the game?',
    header: 'Danger Zone',
    icon: InfoCircle,
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Reset',
      severity: 'danger',
    },
    accept: () => {
      store.$reset()
    },
  })
}
</script>

<template>
  <div class="w-dvw md:w-4/5 mx-auto">
    <div class="fixed right-5 top-5">
      <Button icon-only severity="danger" rounded variant="outlined" @click="resetGame()"
        ><Refresh
      /></Button>
    </div>
    <ConfirmDialog group="dialog" />

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
  </div>
</template>
