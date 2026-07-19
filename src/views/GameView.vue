<script setup lang="ts">
import LabelValue from '@/components/LabelValue.vue';
import NumberStepInput from '@/components/NumberStepInput.vue';
import PlayerCard from '@/components/PlayerCard.vue';
import { usePokerStore } from '@/stores/poker';
import { Plus } from '@primeicons/vue';
import { Button, Toast, useToast } from 'primevue';
import { ref } from 'vue';

const isSetup = ref(true);

const store = usePokerStore();
const toast = useToast();

function onStartGame() {
  const errorMessage = store.startGame()
  console.log(errorMessage)

  if (errorMessage)
    toast.add({
      summary: 'Error while starting game',
      detail: errorMessage,
      severity: 'error',
      life: 3000
    })
  else
    isSetup.value = false;
}
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-15">
    <Toast />

    <span v-if="!isSetup" class="text-3xl">
      Round {{ store.round+1 }}
    </span>

    <div v-if="!isSetup" class="flex flex-row gap-10">
      <LabelValue :label="'Big Blind'" :value="store.bigBlind.toString()" />
      <LabelValue :label="'Small Blind'" :value="store.smallBlind.toString()" />
    </div>

    <span v-if="!isSetup" class="text-3xl max-md:hidden">
      It's 
      {{ store.currentPlayer.name }}'<span v-if="store.currentPlayer.name.substring(store.currentPlayer.name.length-1) != 's'">s</span> 
      turn
    </span>

    <div class="flex flex-wrap lg:max-w-4/5 border border-white/10 divide-x divide-y divide-white/10">
      <div v-for="player in store.players" :key="player.id">
        <PlayerCard
          class="min-w-40 min-h-20"
          v-model="player.name" 
          :player="player" 
          :is-setup="isSetup"
          :is-dealer="store.currentDealer == player"
          :is-big-blind="store.currentBigBlind == player"
          :is-small-blind="store.currentSmallBlind == player"
          :is-current="store.currentPlayer == player"
          @delete="store.deletePlayer(player.id)" />
      </div>
      <div v-if="isSetup" class="min-w-40 min-h-20">
        <Button class="w-full h-full" variant="text" @click="store.addPlayer()">
          <Plus />
        </Button>
      </div>
    </div>

    <div v-if="!isSetup" class="flex flex-col items-center gap-5">
      <span class="text-4xl">In Round</span>
      <span class="text-3xl">{{ store.inRound }}</span>
    </div>

    <div v-if="!isSetup" class="flex flex-row gap-5 md:gap-10">
      <Button class="w-20 md:w-40 h-15" @click="store.fold()">Fold</Button>
      <Button class="w-20 md:w-40 h-15" @click="store.call()">Check/Call</Button>
      <Button class="w-20 md:w-40 h-15" @click="store.raise()">Raise</Button>
    </div>
    
    <div v-if="isSetup" class="flex flex-row gap-5 md:gap-10">
      <NumberStepInput v-model="store.bigBlind" :label="'First Big Blind'" :input-id="'bigBlind'" />
      <NumberStepInput v-model="store.startChips" :label="'Start Chips'" :input-id="'chipCount'" />
    </div>

    <Button v-if="isSetup" variant="primary" @click="onStartGame()">
      Start
    </Button>
  </div>
</template>

<style>
  
</style>