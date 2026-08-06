<script setup lang="ts">
import { Button, Dialog } from 'primevue'
import { computed } from 'vue'

const props = defineProps<{
  betRoundName: string
  betRoundIndex: number
  round: string
}>()

const betRoundDescription = computed(() => {
  switch (props.betRoundIndex) {
    case 0:
      return 'Everyone gets 2 cards and the small and big blinds are set.'
    case 1:
      return 'Place the first 3 cards into the middle of the table by alternating between a side card and a community card.'
    case 2:
      return 'Place the fourth card in the middle of the table.'
    case 3:
      return 'Place the last card in the middle of the table and start the last bet round.'
  }
})

const isVisible = defineModel<boolean>()
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    dismissable-mask
    :header="'Start ' + props.betRoundName + ' Round? (Round ' + props.round + ')'"
  >
    <div class="flex flex-col gap-4">
      <p class="text-sm text-surface-600 mt-0 mb-0">{{ betRoundDescription }}</p>
    </div>
    <template #footer>
      <div class="w-full flex justify-center">
        <Button @click="isVisible = false" severity="success">Ready</Button>
      </div>
    </template>
  </Dialog>
</template>
