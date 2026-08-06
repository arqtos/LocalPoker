<script setup lang="ts">
import LabelValue from '@/components/LabelValue.vue'
import PlayerCard from '@/components/PlayerCard.vue'
import RoundConfirmationDialog from '@/components/RoundConfirmationDialog.vue'
import type { PlayerModel } from '@/models/PlayerModel'
import { usePokerStore } from '@/stores/poker'
import { ExclamationTriangle } from '@primeicons/vue'
import { useMediaQuery } from '@vueuse/core'
import { Button, ConfirmPopup, Dialog, Drawer, InputNumber, Slider, Toast, useConfirm, useDialog, useToast } from 'primevue'
import { computed, ref, watch } from 'vue'

const store = usePokerStore()
const toast = useToast()
const confirm = useConfirm()

const raiseVisible = ref(false)
const raiseValue = ref(store.minBet)
watch(
  () => store.minBet,
  (bet) => {
    raiseValue.value = bet
  },
)

const isRoundConfirmationDialogVisible = ref(true)
watch([() => store.betRound, () => store.round], ([newBetRound, newRound]) => {
  console.log(newBetRound)
  if (newBetRound != undefined && newBetRound >= 4) return
  isRoundConfirmationDialogVisible.value = true
})

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

const confirmFold = (event: any) => {
  confirm.require({
    group: 'popup',
    target: event.currentTarget,
    message: 'Are you sure you want to proceed?',
    icon: ExclamationTriangle,
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Fold'
    },
    accept: () => {
      store.fold()
    },
});
};

const confirmCall = (event: any) => {
  if ((store.highestBet - store.currentPlayer.currentBet) == 0) {
    store.call()
    return
  }

  confirm.require({
    group: 'popup',
    target: event.currentTarget,
    message: 'Are you sure you want to proceed?',
    icon: ExclamationTriangle,
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Call',
    },
    accept: () => {
      store.call()
    },
  });
};
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-7 md:gap-15">
    <Toast />
    <ConfirmPopup group="popup" />
    <RoundConfirmationDialog
      v-model="isRoundConfirmationDialogVisible"
      :bet-round-name="store.betRoundName"
      :bet-round-index="store.betRound"
      :round="(store.round + 1).toString()"
    />

    <span class="text-3xl">{{ store.betRoundName }} Round</span>

    <div class="flex flex-row gap-10">
      <LabelValue
        :label="'Big Blind'"
        label-size="text-md"
        :value="store.bigBlind.toString()"
        value-size="text-2xl"
      />
      <LabelValue
        :label="'Small Blind'"
        label-size="text-md"
        :value="store.smallBlind.toString()"
        value-size="text-2xl"
      />
    </div>

    <!-- <span class="text-3xl max-md:hidden">
      It's
      {{ store.currentPlayer.name }}'<span
        v-if="store.currentPlayer.name.substring(store.currentPlayer.name.length - 1) != 's'"
        >s</span
      >
      turn
    </span> -->

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:max-w-4/5 gap-1">
      <div v-for="player in store.players" :key="player.id">
        <PlayerCard
          class="min-w-40 min-h-20 border border-white/10"
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
        <LabelValue
          label="Pot"
          label-size="text-xl"
          :value="store.pot.toString()"
          value-size="text-4xl"
        />
      </div>
      <div
        v-if="!store.isShowdown"
        v-for="sidepot in store.sidePots"
        class="flex flex-col items-center gap-5"
      >
        <LabelValue
          :label="'Sidepot ' + (store.sidePots.indexOf(sidepot) + 1)"
          label-size="text-xl"
          :value="sidepot.pot.toString()"
          value-size="text-4xl"
        />
      </div>
    </div>

    <div v-if="!store.isShowdown" class="flex flex-row gap-5 md:gap-10">
      <Button class="w-20 md:w-40 h-15" @click="confirmFold($event)">Fold</Button>
      <Button v-if="!store.mustAllIn" class="w-20 md:w-40 h-15 font-bold" @click="confirmCall($event)"
        >{{ (store.highestBet - store.currentPlayer.currentBet) == 0 ? 'Check' : 'Call' }}</Button
      >
      <Button
        v-if="!store.mustAllIn"
        class="w-20 md:w-40 h-15 font-bold"
        @click="raiseVisible = true"
        >{{ store.highestBet <= store.bigBlind ? 'Bet' : 'Raise' }}</Button
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
          {{ store.highestBet <= store.bigBlind ? 'Bet' : 'Raise' }}
        </Button>
      </div>
    </component>
  </div>
</template>
