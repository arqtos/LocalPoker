<script setup lang="ts">
import { Card, InputNumber, Label, Button } from 'primevue'
import { Plus, Minus } from '@primeicons/vue'
import { usePokerStore } from '@/stores/poker'
import { useRouter } from 'vue-router'

const store = usePokerStore()
const router = useRouter()

function onSubmit() {
  //store.createGame()
  router.push('/game')
}
</script>

<template>
  <div class="h-full w-full flex justify-center items-center">
    <Card>
      <template #title>
        <span class="text-5xl">Setup the Game</span>
      </template>
      <template #content>
        <div class="flex flex-col items-center gap-4 mt-5">
          <div class="flex-auto">
            <Label class="font-bold! mb-2 block text-xl!" for="playerCount">Player Count</Label>
            <InputNumber
              v-model="store.playerCount"
              showButtons
              size="large"
              buttonLayout="horizontal"
              inputId="playerCount"
              :inputStyle="{ width: '5rem' }"
            >
              <template #incrementicon>
                <Plus />
              </template>
              <template #decrementicon>
                <Minus />
              </template>
            </InputNumber>
          </div>

          <div class="flex-auto">
            <Label class="font-bold! mb-2 block text-xl!" for="bigBlind">First Big Blind</Label>
            <InputNumber
              v-model="store.bigBlind"
              showButtons
              size="large"
              buttonLayout="horizontal"
              inputId="bigBlind"
              :inputStyle="{ width: '5rem' }"
            >
              <template #incrementicon>
                <Plus />
              </template>
              <template #decrementicon>
                <Minus />
              </template>
            </InputNumber>
          </div>

          <div class="flex-auto">
            <Label class="font-bold! mb-2 block text-xl!" for="chipCount">Start Chips</Label>
            <InputNumber
              v-model="store.startChips"
              showButtons
              size="large"
              buttonLayout="horizontal"
              inputId="chipCount"
              :inputStyle="{ width: '5rem' }"
            >
              <template #incrementicon>
                <Plus />
              </template>
              <template #decrementicon>
                <Minus />
              </template>
            </InputNumber>
          </div>

          <Button severity="primary" size="large" @click="onSubmit">Submit</Button>
        </div>
      </template>
    </Card>
  </div>
</template>
