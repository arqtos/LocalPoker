export interface PlayerModel {
  id: number
  chips: number
  name: string
  currentBet: number
  hasFolded: boolean
  isInLimbo: boolean
  isBankrupt: boolean
}
