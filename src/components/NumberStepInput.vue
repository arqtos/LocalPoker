<script setup lang="ts">
import { Minus, Plus } from '@primeicons/vue';
import { InputNumber, Label } from 'primevue';
import { ref } from 'vue';

const props = defineProps<{
  label: string,
  inputId: string
}>()

const model = defineModel<number>()
</script>

<template>
  <div class="flex-auto">
    <Label class="font-bold! mb-2 block text-xl!" :for="props.inputId">{{ props.label }}</Label>
    <InputNumber 
      v-model="model"
      showButtons
      size="large"
      buttonLayout="horizontal" 
      :inputId="props.inputId" 
      :inputStyle="{ width: '5rem' }">
        <template #incrementicon>
            <Plus />
        </template>
        <template #decrementicon>
            <Minus />
        </template>
    </InputNumber>
  </div>
</template>