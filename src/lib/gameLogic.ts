import { CARDS } from '../data/cards'
import type { GameState } from '../types'

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function dealCards(): { a: number[]; b: number[] } {
  const shuffled = shuffleArray(CARDS)
  const selected = shuffled.slice(0, 24)
  return {
    a: selected.slice(0, 12).map((c) => c.id),
    b: selected.slice(12, 24).map((c) => c.id),
  }
}

export function createInitialGameState(): GameState {
  const hands = dealCards()
  return {
    round: 1,
    hands,
    selections: { a: null, b: null },
    final_picks: { a: null, b: null },
    votes: { a: null, b: null },
    decided_card: null,
  }
}

export function getCardById(id: number) {
  return CARDS.find((c) => c.id === id)
}

export function determineFinalCard(
  pickA: number,
  pickB: number,
  voteA: number | null,
  voteB: number | null,
): number {
  // Same card picked by both
  if (pickA === pickB) return pickA

  // Voting phase
  if (voteA !== null && voteB !== null) {
    // Votes match
    if (voteA === voteB) return voteA
    // Votes split — random
    return Math.random() < 0.5 ? pickA : pickB
  }

  // Fallback (shouldn't happen)
  return pickA
}
