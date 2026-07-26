import { defineStore } from 'pinia'
import type { PlayerModel } from '@/models/PlayerModel'

const blindSteps = [10, 20, 30, 50, 100, 150, 200, 400, 800]
const rounds = ['Pre-Flop', 'Flop', 'Turn', 'River', 'Showdown']

function getNextActivePlayer(players: PlayerModel[], startPoint: number, currentPlayer: PlayerModel): PlayerModel {
  let i: number = 0
  let player: PlayerModel
  do {
    const nextIndex = (startPoint + i) % players.length
    player = players[nextIndex]!

    if (player == currentPlayer) return player

    i++
  } while (player.hasFolded || player.isBankrupt)

  return player
}

export const usePokerStore = defineStore('poker', {
  state: () => ({
    isSetup: true,
    isShowdown: false,
    isOver: false,
    players: [] as PlayerModel[],
    roundEndPlayer: null as PlayerModel | null,
    round: 0,
    betRound: 0,
    internalRound: 0,
    pot: 0,
    sidePots: [] as number[],
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
      return this.players.filter((p) => p.hasFolded == false && p.isBankrupt == false)
    },
    activePlayerCount(): number {
      return this.activePlayers.length
    },
    currentPlayer(): PlayerModel {
      let startPoint: number
      if (this.betRound == 0) startPoint = this.currentBigBlind.id
      else startPoint = this.currentDealer.id

      return getNextActivePlayer(this.players, startPoint + this.internalRound + 1, this.currentPlayer)
    },
    currentBigBlind(): PlayerModel {
      return getNextActivePlayer(this.players, this.currentSmallBlind.id + 1, this.currentBigBlind)
    },
    currentSmallBlind(): PlayerModel {
      return getNextActivePlayer(this.players, this.currentDealer.id + 1, this.currentSmallBlind)
    },
    currentDealer(): PlayerModel {
      return getNextActivePlayer(this.players, this.round % this.playerCount, this.currentDealer)
    },
    // bigBlind(): number {
    //   const index = this.blindStep >= blindSteps.length ? blindSteps.length-1 : this.blindStep
    //   return blindSteps[index]!;
    // },
    smallBlind(): number {
      return this.bigBlind / 2
    },
    minBet(): number {
      return this.highestBet < this.bigBlind ? this.bigBlind : this.highestBet
    },
    betRoundName(): string {
      return rounds[this.betRound % rounds.length]!
    },
    mustAllIn(): boolean {
      return this.currentPlayer.chips < this.highestBet - this.currentPlayer.currentBet
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

      this.roundEndPlayer = this.currentPlayer

      this.highestBet = this.bigBlind
    },
    nextBetRound() {
      this.internalRound = 0
      this.highestBet = 0

      let betSum = 0
      this.players.forEach((player) => {
        betSum += player.currentBet
        player.currentBet = 0
      })
      this.pot += betSum

      this.betRound++
      if (this.betRound >= rounds.length-1) {
        this.isShowdown = true
        return
      }

      this.roundEndPlayer = this.currentPlayer
    },
    fold() {
      this.currentPlayer.hasFolded = true

      if (this.activePlayerCount <= 1) this.endRound()
      else if (this.nextIsEndPlayer()) this.nextBetRound()
      else this.internalRound++
    },
    call() {
      const neededBet = this.highestBet - this.currentPlayer.currentBet

      if (neededBet != 0) {
        this.currentPlayer.chips -= neededBet
        this.currentPlayer.currentBet += neededBet
      }

      if (this.nextIsEndPlayer()) this.nextBetRound()
      else this.internalRound++
    },
    raise(amount: number) {
      this.currentPlayer.chips -= amount
      this.currentPlayer.currentBet += amount
      this.highestBet += amount

      this.roundEndPlayer = this.currentPlayer

      this.internalRound++
    },
    allIn() {
      this.currentPlayer.currentBet += this.currentPlayer.chips
      this.currentPlayer.chips = 0

      if (this.nextIsEndPlayer()) this.nextBetRound()
      else this.internalRound++
    },
    nextIsEndPlayer(): boolean {
      let i: number = 1
      let player: PlayerModel
      do {
        const nextIndex = (this.currentPlayer.id + i) % this.playerCount
        player = this.players[nextIndex]!
        if (player.id == this.roundEndPlayer?.id) return true
        i++
      } while (player.hasFolded)

      return false
    },
    selectWinner(winnerPlayers: PlayerModel[]) {
      winnerPlayers.forEach((player) => {
        player.chips += Math.round(this.pot / winnerPlayers.length)
      })
      this.endRound()
    },
    endRound() {
      if (this.activePlayerCount == 1 && this.activePlayers[0])
        this.activePlayers[0].chips += this.pot

      this.players.forEach((player) => {
        if (player.chips == 0) {
          player.isBankrupt = true
          player.hasFolded = true
        } else {
          player.hasFolded = false
        }

        player.currentBet = 0
      })

      this.pot = 0
      this.betRound = 0
      this.internalRound = 0
      this.isShowdown = false
      this.highestBet = 0

      if (this.activePlayerCount <= 1) {
        this.isOver = true
        return
      }

      this.round++

      if (this.currentDealer.id == this.activePlayers.sort((a, b) => a.id - b.id)[0]!.id) {
        this.bigBlind *= 2
        // if (this.currentDealer.id == 0)
        //   this.blindStep++;
      }

      this.incrementRound()
    },
  },
})
