<script setup lang="ts">
import { Dither, Shader, SineWave } from 'shaders/vue';

</script>

<template>
  <main class="w-dvw h-dvh place-content-center">
    <RouterView />
    <Shader class="fixed inset-0 -z-10">
      <Dither pattern="bayer8" :pixel-size="4" :threshold="1" color-mode="source">
        <SineWave :amplitude="0.5" :frequency="0.1" :angle="8" :speed="0.1" :thickness="0.8" :softness="1" :position="{'x':0.5,'y':0.9}" :color="'#1e1e2e'" />
      </Dither>
    </Shader>
  </main>
</template>
