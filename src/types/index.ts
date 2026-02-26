export type CardCategory =
  | 'outing'
  | 'gourmet'
  | 'drive'
  | 'culture'
  | 'chill'
  | 'romantic'
  | 'challenge'

export type Card = {
  id: number
  text: string
  category: CardCategory
}

export type Player = {
  id: string
  nickname: string
  is_host: boolean
}

export type RoomStatus = 'waiting' | 'playing' | 'finished'

export type Room = {
  code: string
  host_id: string
  host_nickname: string
  guest_id: string | null
  guest_nickname: string | null
  status: RoomStatus
  game_state: GameState | null
  created_at: string
}

export type GameRound = 1 | 2 | 'vote' | 'janken' | 'result'

export type JankenHand = 'rock' | 'paper' | 'scissors'

export type GameState = {
  round: GameRound
  hands: { a: number[]; b: number[] }
  selections: { a: number[] | null; b: number[] | null }
  final_picks: { a: number | null; b: number | null }
  votes: { a: number | null; b: number | null }
  janken: { a: JankenHand | null; b: JankenHand | null }
  decided_card: number | null
}

export const ROUND_CONFIG = [
  { round: 1 as const, hand_size: 20, keep_count: 5 },
  { round: 2 as const, hand_size: 5, keep_count: 1 },
] as const
