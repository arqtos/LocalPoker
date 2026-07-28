import { defineStore } from 'pinia'
import type { PlayerModel } from '@/models/PlayerModel'
import type { SidepotModel } from '@/models/SidepotModel'
import _ from 'lodash'

const blindSteps = [10, 20, 30, 50, 100, 150, 200, 400, 800]
const rounds = ['Pre-Flop', 'Flop', 'Turn', 'River', 'Showdown']

function getNextActivePlayer(
  players: PlayerModel[],
  startPoint: number,
  currentPlayer: PlayerModel,
): [PlayerModel, number] {
  let i: number = 0
  let player: PlayerModel
  do {
    const nextIndex = (startPoint + i) % players.length
    player = players[nextIndex]!
    if (player == currentPlayer) return [player, i]

    i++
  } while (player.hasFolded || player.isBankrupt || player.isInLimbo)

  return [player, i - 1]
}

export const usePokerStore = defineStore('poker', {
  state: () => ({
    isSetup: true,
    isShowdown: false,
    isOver: false,
    players: [] as PlayerModel[],
    elligibleShowdownPlayers: [] as PlayerModel[],
    roundEndPlayer: null as PlayerModel | null,
    round: 0,
    betRound: 0,
    internalRound: 0,
    pot: 0,
    sidePots: [] as SidepotModel[],
    startChips: 1000,
    bigBlind: 10,
    // blindStep: 0,
    highestBet: 0,
    splitPotRemainder: 0,
  }),
  getters: {
    playerCount(): number {
      return this.players.length
    },
    activePlayers(): PlayerModel[] {
      return this.players.filter((p) => !p.hasFolded && !p.isBankrupt && !p.isInLimbo)
    },
    activePlayerCount(): number {
      return this.activePlayers.length
    },
    currentPlayer(): PlayerModel {
      let startPoint: number
      if (this.betRound == 0) startPoint = this.currentBigBlind.id
      else startPoint = this.currentDealer.id

      const response = getNextActivePlayer(
        this.players,
        startPoint + this.internalRound + 1,
        this.currentPlayer,
      )
      this.internalRound += response[1]
      return response[0]
    },
    currentBigBlind(): PlayerModel {
      return getNextActivePlayer(
        this.players,
        this.currentSmallBlind.id + 1,
        this.currentBigBlind,
      )[0]
    },
    currentSmallBlind(): PlayerModel {
      return getNextActivePlayer(this.players, this.currentDealer.id + 1, this.currentSmallBlind)[0]
    },
    currentDealer(): PlayerModel {
      return getNextActivePlayer(this.players, this.round % this.playerCount, this.currentDealer)[0]
    },
    playersInLimboWithoutSidepot(): PlayerModel[] {
      return this.players.filter(
        (p) =>
          p.isInLimbo &&
          this.sidePots.every((sidepot) => !sidepot.players.includes(p)) &&
          p.currentBet == 0,
      )
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
      return this.currentPlayer.chips <= this.highestBet - this.currentPlayer.currentBet
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
        isInLimbo: false,
        isBankrupt: false,
      }
      this.players.push(newPlayer)
    },
    setPlayerName(id: number, name: string) {
      const playerIndex = this.players.findIndex((p) => p.id == id)
      if (this.players[playerIndex]) this.players[playerIndex].name = name
    },
    deletePlayer(id: number) {
      const playerIndex = this.players.findIndex((p) => p.id == id)
      if (this.players[playerIndex]) this.players.splice(playerIndex, 1)
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
      if (this.currentBigBlind.chips <= this.bigBlind) {
        this.currentBigBlind.currentBet += this.currentBigBlind.chips
        this.currentBigBlind.chips = 0
        this.currentBigBlind.isInLimbo = true
      } else {
        this.currentBigBlind.chips -= this.bigBlind
        this.currentBigBlind.currentBet += this.bigBlind
      }

      if (this.currentSmallBlind.chips <= this.smallBlind) {
        this.currentSmallBlind.currentBet += this.currentSmallBlind.chips
        this.currentSmallBlind.chips = 0
        this.currentSmallBlind.isInLimbo = true
      } else {
        this.currentSmallBlind.chips -= this.smallBlind
        this.currentSmallBlind.currentBet += this.smallBlind
      }

      this.roundEndPlayer = this.currentPlayer

      this.highestBet = this.bigBlind
    },
    nextBetRound() {
      this.internalRound = 0
      this.highestBet = 0

      const newSidePots = this.getSidepots()
      this.sidePots = newSidePots.concat(this.sidePots)

      if (newSidePots.length == 0) {
        let betSum = 0
        this.players.forEach((player) => {
          betSum += player.currentBet
          player.currentBet = 0
        })
        this.pot += betSum
      }

      this.betRound++
      if (this.betRound >= rounds.length - 1 || this.activePlayerCount <= 1) {
        this.elligibleShowdownPlayers = this.activePlayers.concat(this.playersInLimboWithoutSidepot)
        this.isShowdown = true
        return
      }

      this.roundEndPlayer = this.currentPlayer
    },
    fold() {
      this.currentPlayer.hasFolded = true

      if (this.activePlayerCount <= 1 && this.players.every((p) => !p.isInLimbo)) this.endRound()
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

      if (this.currentPlayer.chips == 0) this.currentPlayer.isInLimbo = true

      this.roundEndPlayer = this.currentPlayer

      this.internalRound++
    },
    allIn() {
      this.currentPlayer.currentBet += this.currentPlayer.chips
      this.currentPlayer.chips = 0
      this.currentPlayer.isInLimbo = true

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
      } while (player.hasFolded || player.isInLimbo)

      return false
    },
    selectWinner(winnerPlayers: PlayerModel[]) {
      const chipsPerPlayer = Math.floor(this.pot / winnerPlayers.length)
      winnerPlayers.forEach((player) => {
        player.chips += chipsPerPlayer
      })

      if (this.pot != chipsPerPlayer * winnerPlayers.length)
        this.splitPotRemainder += this.pot - chipsPerPlayer * winnerPlayers.length

      if (this.sidePots.filter((sp) => !sp.isDone).length == 0) this.endRound()
      else {
        this.sidePots.some((sidepot) => {
          if (sidepot.isDone) return false

          this.elligibleShowdownPlayers = this.elligibleShowdownPlayers.concat(sidepot.players)
          this.pot = sidepot.pot
          sidepot.isDone = true
          return true
        })
      }
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

        player.isInLimbo = false
        player.currentBet = 0
      })

      this.pot = this.splitPotRemainder
      this.splitPotRemainder = 0
      this.betRound = 0
      this.internalRound = 0
      this.isShowdown = false
      this.highestBet = 0
      this.sidePots = []

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
    getSidepots(): SidepotModel[] {
      const sidepots: SidepotModel[] = []

      const bettingPlayers = this.players.filter((p) => p.currentBet != 0 && !p.hasFolded)
      if (!bettingPlayers || bettingPlayers.length == 0) return sidepots

      let remainingPot = this.pot

      const playersBetSorted = bettingPlayers.sort((a, b) => b.currentBet - a.currentBet)
      const highestBet = playersBetSorted[0]?.currentBet!

      const uniqueLowerBets = _.uniq(
        _.filter(bettingPlayers, function (p) {
          return p.currentBet < highestBet
        }).map((p) => p.currentBet),
      ).sort()

      if (this.playersInLimboWithoutSidepot.length != 0) {
        sidepots.push({
          pot: remainingPot,
          players: this.playersInLimboWithoutSidepot,
          isDone: false,
        })
        remainingPot = 0
      }

      if (uniqueLowerBets.length == 0) {
        this.pot = remainingPot
        return sidepots
      }

      const betsGrouped = _.groupBy(
        bettingPlayers.filter((p) => p.currentBet < highestBet),
        'currentBet',
      )

      uniqueLowerBets.forEach((bet) => {
        const playersWithBet = betsGrouped[bet] ?? []

        const playersWithHigherBet = bettingPlayers.filter((p) => p.currentBet > bet)

        const nextHighestBet =
          uniqueLowerBets
            .concat(highestBet)
            .filter((b) => b > bet)
            .sort()[0] ?? highestBet

        sidepots.push({
          pot: remainingPot + (playersWithHigherBet.length + playersWithBet.length) * bet,
          players: playersWithBet,
          isDone: false,
        })

        playersWithBet.forEach((player) => {
          player.isInLimbo = true
        })
        remainingPot = playersWithHigherBet.length * (nextHighestBet - bet)
      })

      bettingPlayers.forEach((player) => (player.currentBet = 0))

      this.pot = remainingPot
      return sidepots.reverse()
    },
  },
})
