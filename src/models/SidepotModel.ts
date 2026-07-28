import type { PlayerModel } from './PlayerModel'

export interface SidepotModel {
  pot: number
  players: PlayerModel[]
  isDone: boolean
}
