import { defineStore } from 'pinia'
import type { PlayerModel } from '@/models/PlayerModel'

const blindSteps = [10, 20, 30, 50, 100, 150, 200, 400, 800]

export const usePokerStore = defineStore('poker', {
  state: () => ({
    isSetup: true,
    players: [] as PlayerModel[],
    round: 0,
    internalRound: 0,
    inRound: 0,
    startChips: 1000,
    bigBlind: 10,
    // blindStep: 0,
    highestBet: 0,
  }),
  getters: {
    playerCount(): number {
      return this.players.length
    },
    activePlayers(): PlayerModel[] {
      return this.players.filter((p) => p.hasFolded == false)
    },
    activePlayerCount(): number {
      return this.activePlayers.length
    },
    currentPlayer(): PlayerModel {
      let i: number = 0
      let player: PlayerModel
      do {
        const nextIndex = (this.currentBigBlind.id + 1 + this.internalRound + i) % this.playerCount
        player = this.players[nextIndex]!
        i++
      } while (player.hasFolded)

      return player
    },
    currentBigBlind(): PlayerModel {
      const nextIndex = (this.currentSmallBlind.id + 1) % this.playerCount
      return this.players[nextIndex]!
    },
    currentSmallBlind(): PlayerModel {
      const nextIndex = (this.currentDealer.id + 1) % this.playerCount
      return this.players[nextIndex]!
    },
    currentDealer(): PlayerModel {
      return this.players[this.round % this.playerCount]!
    },
    // bigBlind(): number {
    //   const index = this.blindStep >= blindSteps.length ? blindSteps.length-1 : this.blindStep
    //   return blindSteps[index]!;
    // },
    smallBlind(): number {
      return this.bigBlind / 2
    },
  },
  actions: {
    addPlayer() {
      const newPlayer: PlayerModel = {
        id: this.playerCount,
        name: '',
        chips: this.startChips,
        currentBet: 0,
        hasFolded: false,
        isBankrupt: false,
      }
      this.players.push(newPlayer)
    },
    setPlayerName(id: number, name: string) {
      if (this.players[id]) this.players[id].name = name
    },
    deletePlayer(id: number) {
      if (this.players[id]) this.players.splice(id, 1)
    },
    startGame(): string | undefined {
      if (this.players.length < 2) return 'Not enough players. Add more to start the game.'

      if (this.players.find((p) => !p.name)) return 'At least one player has no name.'

      this.players.forEach((player) => {
        player.chips = this.startChips
      })

      this.isSetup = false
      this.incrementRound()
    },
    incrementRound() {
      this.currentBigBlind.chips -= this.bigBlind
      this.currentSmallBlind.chips -= this.smallBlind
      this.currentBigBlind.currentBet += this.bigBlind
      this.currentSmallBlind.currentBet += this.smallBlind

      this.inRound += this.bigBlind + this.smallBlind

      this.highestBet = this.bigBlind
    },
    fold() {
      this.currentPlayer.hasFolded = true

      if (this.activePlayerCount <= 1) this.endRound()
      else this.internalRound++
    },
    call() {
      const neededBet = this.highestBet - this.currentPlayer.currentBet

      if (neededBet != 0) {
        this.currentPlayer.chips -= neededBet
        this.inRound += neededBet
        this.currentPlayer.currentBet += neededBet
      }

      this.internalRound++
    },
    raise(amount: number) {
      this.currentPlayer.chips -= amount
      this.inRound += amount
      this.currentPlayer.currentBet += amount
      this.highestBet += amount

      this.internalRound++
    },
    endRound() {
      if (this.activePlayerCount == 1 && this.activePlayers[0])
        this.activePlayers[0].chips += this.inRound

      this.players.forEach((player) => {
        player.hasFolded = false
        player.currentBet = 0
      })

      this.inRound = 0
      this.internalRound = 0
      this.highestBet = 0

      this.round++
      this.bigBlind *= 2
      // if (this.currentDealer.id == 0)
      //   this.blindStep++;

      this.incrementRound()
    },
  },
})
