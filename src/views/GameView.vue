<script setup lang="ts">
import { usePokerStore } from '@/stores/counter';

const store = usePokerStore();
</script>

<template>
  <div class="h-full w-full flex justify-center items-center">
    <div class="octagon">test</div>
  </div>
</template>

<style>
  .octagon {
    border-radius: calc(100%/(2 + sqrt(2)));
    corner-shape: bevel;
    aspect-ratio: 1;
    background-color: white;
  } 
</style>