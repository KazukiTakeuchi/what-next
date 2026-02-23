import { useState, useEffect, useCallback, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { broadcast } from '../lib/realtime'
import { createInitialGameState, getCardById, determineFinalCard } from '../lib/gameLogic'
import type { GameState, GameRound } from '../types'

type PlayerRole = 'a' | 'b'

export function useGame(
  channel: RealtimeChannel | null,
  playerId: string,
  isHost: boolean,
) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [myRole, setMyRole] = useState<PlayerRole>(isHost ? 'a' : 'b')
  const [partnerDone, setPartnerDone] = useState(false)

  // Use refs to avoid stale closures in event handlers
  const myRoleRef = useRef(myRole)
  myRoleRef.current = myRole
  const isHostRef = useRef(isHost)
  isHostRef.current = isHost

  // Store received partner cards until both players have submitted
  const receivedCardsRef = useRef<number[] | null>(null)

  // Initialize game (host only broadcasts initial state)
  const initGame = useCallback(async () => {
    if (!channel || !isHost) return

    // Wait until channel is fully subscribed before broadcasting
    const waitForSubscription = () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if ((channel as unknown as { state: string }).state === 'joined') {
            resolve()
          } else {
            setTimeout(check, 100)
          }
        }
        check()
      })

    await waitForSubscription()
    const state = createInitialGameState()
    broadcast(channel, 'game_init', { state })
  }, [channel, isHost])

  // Listen for game events
  useEffect(() => {
    if (!channel) return

    channel
      .on('broadcast', { event: 'game_init' }, ({ payload }) => {
        const state = payload.state as GameState
        setGameState(state)
        setMyRole(isHostRef.current ? 'a' : 'b')
        setPartnerDone(false)
        receivedCardsRef.current = null
      })
      .on('broadcast', { event: 'cards_exchange' }, ({ payload }) => {
        const role = myRoleRef.current
        if (payload.from !== role) {
          // Partner's cards arrive — only transition if I've also submitted
          receivedCardsRef.current = payload.cards as number[]
          setGameState((prev) => {
            if (!prev) return prev
            const mySubmitted = (prev.selections[role]?.length ?? 0) > 0
            if (mySubmitted) {
              // Both done: transition to round 2
              return {
                ...prev,
                round: 2 as GameRound,
                hands: {
                  ...prev.hands,
                  [role]: payload.cards as number[],
                },
              }
            }
            // I haven't submitted yet; just mark partner as done
            return prev
          })
          setPartnerDone(true)
        }
      })
      .on('broadcast', { event: 'final_pick' }, ({ payload }) => {
        if (payload.from !== myRoleRef.current) {
          setGameState((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              final_picks: {
                ...prev.final_picks,
                [payload.from as PlayerRole]: payload.card_id as number,
              },
            }
          })
          setPartnerDone(true)
        }
      })
      .on('broadcast', { event: 'vote' }, ({ payload }) => {
        if (payload.from !== myRoleRef.current) {
          setGameState((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              votes: {
                ...prev.votes,
                [payload.from as PlayerRole]: payload.card_id as number,
              },
            }
          })
        }
      })
      .on('broadcast', { event: 'decided' }, ({ payload }) => {
        setGameState((prev) => {
          if (!prev) return prev
          if (prev.decided_card !== null) return prev
          return {
            ...prev,
            round: 'result' as GameRound,
            decided_card: payload.card_id as number,
          }
        })
      })

    // No cleanup needed — channel lifecycle is managed by useRoom
  }, [channel, playerId])

  // Submit round 1 selections (5 cards)
  const submitRound1 = useCallback(
    async (selectedCardIds: number[]) => {
      if (!channel || !gameState) return

      // Update local state — and transition to round 2 if partner's cards already arrived
      const partnerCards = receivedCardsRef.current
      setGameState((prev) => {
        if (!prev) return prev
        const updated = {
          ...prev,
          selections: {
            ...prev.selections,
            [myRole]: selectedCardIds,
          },
        }
        if (partnerCards) {
          // Partner already submitted: transition to round 2
          return {
            ...updated,
            round: 2 as GameRound,
            hands: {
              ...updated.hands,
              [myRole]: partnerCards,
            },
          }
        }
        return updated
      })

      // Single broadcast: notify partner AND send cards
      await broadcast(channel, 'cards_exchange', {
        from: myRole,
        player_id: playerId,
        cards: selectedCardIds,
      })
    },
    [channel, gameState, playerId, myRole],
  )

  // Submit round 2 pick (1 card)
  const submitRound2 = useCallback(
    async (cardId: number) => {
      if (!channel || !gameState) return

      setGameState((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          final_picks: {
            ...prev.final_picks,
            [myRole]: cardId,
          },
        }
      })

      await broadcast(channel, 'final_pick', {
        from: myRole,
        card_id: cardId,
      })
    },
    [channel, gameState, myRole],
  )

  // Submit vote
  const submitVote = useCallback(
    async (cardId: number) => {
      if (!channel || !gameState) return

      setGameState((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          votes: {
            ...prev.votes,
            [myRole]: cardId,
          },
        }
      })

      await broadcast(channel, 'vote', {
        from: myRole,
        card_id: cardId,
      })
    },
    [channel, gameState, myRole],
  )

  // Check if both final picks are done and determine next phase
  useEffect(() => {
    if (!gameState || !channel) return
    if (gameState.round !== 2) return
    if (gameState.final_picks.a === null || gameState.final_picks.b === null) return

    if (gameState.final_picks.a === gameState.final_picks.b) {
      if (isHost) {
        broadcast(channel, 'decided', { card_id: gameState.final_picks.a })
      }
    } else {
      setGameState((prev) => {
        if (!prev) return prev
        if (prev.round === 'vote') return prev
        return { ...prev, round: 'vote' as GameRound }
      })
    }
  }, [gameState?.final_picks.a, gameState?.final_picks.b, gameState?.round, channel, isHost])

  // Check if both votes are in
  useEffect(() => {
    if (!gameState || !channel || !isHost) return
    if (gameState.round !== 'vote') return
    if (gameState.votes.a === null || gameState.votes.b === null) return
    if (gameState.decided_card !== null) return

    const decided = determineFinalCard(
      gameState.final_picks.a!,
      gameState.final_picks.b!,
      gameState.votes.a,
      gameState.votes.b,
    )
    broadcast(channel, 'decided', { card_id: decided })
  }, [gameState?.votes.a, gameState?.votes.b, gameState?.round, gameState?.decided_card, channel, isHost])

  const myHand = gameState ? gameState.hands[myRole] : []
  const myCards = myHand.map((id) => getCardById(id)!).filter(Boolean)

  return {
    gameState,
    myRole,
    myCards,
    myHand,
    partnerDone,
    initGame,
    submitRound1,
    submitRound2,
    submitVote,
    getCardById,
  }
}
