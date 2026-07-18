import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PlayerModel } from '@/models/PlayerModel'

export const usePokerStore = defineStore('poker', () => {
  const players = ref<PlayerModel[]>([])
  const playerCount = ref(2)
  const round = ref(0)
  const currentPlayer = computed(() => round.value % playerCount.value)

  const startChips = ref(1000)
  const bigBlind = ref(10)
  const smallBlind = computed(() => bigBlind.value / 2)

  function incrementBigBlind() {
    bigBlind.value *= 2;
  }

  function createGame() {
    for (let i = 0; i < playerCount.value; i++) {
      const newPlayer: PlayerModel = {
        id: i,
        name: "",
        chips: startChips.value
      } 

      players.value.push(newPlayer)
    }
  }

  function setPlayerName(id: number, name: string) {
    if (players.value[id])
      players.value[id].name = name;
  }

  return { players, playerCount, round, currentPlayer, startChips, bigBlind, smallBlind, incrementBigBlind, createGame, setPlayerName }
})
