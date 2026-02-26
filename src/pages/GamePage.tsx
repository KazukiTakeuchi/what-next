import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../hooks/usePlayer'
import { useRoom } from '../hooks/useRoom'
import { useGame } from '../hooks/useGame'
import CardGrid from '../components/CardGrid'
import Card from '../components/Card'
import SelectionCounter from '../components/SelectionCounter'
import PlayerStatus from '../components/PlayerStatus'
import Header from '../components/Header'
import { getCardById } from '../lib/gameLogic'

export default function GamePage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { playerId, nickname } = usePlayer()
  const { channel, players, partnerJoined, isHost, loading, error } = useRoom(code!, playerId, nickname)

  const { gameState, myRole, myCards, partnerDone, initGame, submitRound1, submitRound2, submitVote, submitJanken } =
    useGame(channel, playerId, isHost)

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const prevSelectionLength = useRef(0)

  const partner = players.find((p) => p.player_id !== playerId)
  const partnerNickname = partner?.nickname || 'パートナー'

  // Host initializes game once partner is connected on this channel
  useEffect(() => {
    if (isHost && channel && !gameState && partnerJoined) {
      const timer = setTimeout(() => initGame(), 500)
      return () => clearTimeout(timer)
    }
  }, [isHost, channel, gameState, initGame, partnerJoined])

  // Celebration when Round 1 max selections reached
  useEffect(() => {
    if (gameState?.round === 1 && selectedIds.length === 5 && prevSelectionLength.current < 5) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 1500)
      return () => clearTimeout(timer)
    }
    if (selectedIds.length < 5) setShowCelebration(false)
    prevSelectionLength.current = selectedIds.length
  }, [selectedIds.length, gameState?.round])

  // Reset selection state when round changes
  useEffect(() => {
    setSelectedIds([])
    setSubmitted(false)
    setShowCelebration(false)
  }, [gameState?.round])

  // Navigate to result
  useEffect(() => {
    if (gameState?.round === 'result' && gameState.decided_card !== null) {
      navigate(`/room/${code}/result`, {
        state: { cardId: gameState.decided_card },
      })
    }
  }, [gameState?.round, gameState?.decided_card, code, navigate])

  const handleToggle = (cardId: number) => {
    if (submitted) return
    setSelectedIds((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId)
      return [...prev, cardId]
    })
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-mesh">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">ゲームを準備中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-mesh p-6 gap-4">
        <p className="text-red-500">{error}</p>
        <button type="button" onClick={() => navigate('/')} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white btn-liquid rounded-3xl">
          トップに戻る
        </button>
      </div>
    )
  }

  // Round 1: Select 5 from 12
  if (gameState.round === 1) {
    const maxSelections = 5
    return (
      <div className="h-dvh flex flex-col bg-mesh">
        <Header title="やりたいこと5つ選んでね" subtitle="あなたの手札から選ぼう" />
        <div className="px-3 flex items-center justify-between mb-1">
          <PlayerStatus nickname={partnerNickname} done={partnerDone} />
          <SelectionCounter current={selectedIds.length} max={maxSelections} />
        </div>
        <CardGrid
          cards={myCards}
          selectedIds={selectedIds}
          maxSelections={maxSelections}
          disabled={submitted}
          onToggle={handleToggle}
        />
        <div className="fixed bottom-0 left-0 right-0 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] glass-strong">
          <div className="relative">
            {showCelebration && <div className="celebrate absolute inset-0 flex items-center justify-center pointer-events-none" />}
            <button
              type="button"
              onClick={() => {
                submitRound1(selectedIds)
                setSubmitted(true)
              }}
              disabled={selectedIds.length !== maxSelections || submitted}
              className={`w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl text-lg font-bold
                btn-liquid transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${selectedIds.length === maxSelections && !submitted ? 'celebrate-bounce' : ''}`}
            >
              {submitted ? `${partnerNickname}を待っています...` : selectedIds.length === maxSelections ? '🎉 決定!' : '決定'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Round 2: Select 1 from 5 (partner's selections)
  if (gameState.round === 2) {
    return (
      <div className="min-h-dvh bg-mesh flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full mx-auto text-center space-y-6">
          <div className="space-y-2">
            <p className="text-3xl">💎</p>
            <h2 className="text-xl font-bold text-gray-800">{partnerNickname}が選んだカード</h2>
            <p className="text-sm text-gray-500">一番やりたいのは?</p>
          </div>

          <div className="space-y-2.5">
            {myCards.map((card) => (
              <Card
                key={card.id}
                card={card}
                selected={selectedIds.includes(card.id)}
                disabled={submitted}
                size="large"
                onTap={() => {
                  if (submitted) return
                  setSelectedIds([card.id])
                }}
              />
            ))}
          </div>

          {submitted ? (
            <p className="text-sm text-gray-400 animate-pulse">{partnerNickname}を待っています...</p>
          ) : (
            <button
              type="button"
              onClick={() => {
                submitRound2(selectedIds[0])
                setSubmitted(true)
              }}
              disabled={selectedIds.length !== 1}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl text-lg font-bold
                btn-liquid transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              これにする!
            </button>
          )}
        </div>
      </div>
    )
  }

  // Vote phase
  if (gameState.round === 'vote') {
    const pickA = getCardById(gameState.final_picks.a!)
    const pickB = getCardById(gameState.final_picks.b!)
    const myVote = gameState.votes[myRole]
    const hasVoted = myVote !== null

    return (
      <div className="min-h-dvh bg-mesh flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full mx-auto text-center space-y-6">
          <div className="space-y-2">
            <p className="text-3xl">🤔</p>
            <h2 className="text-xl font-bold text-gray-800">どっちがいい?</h2>
            <p className="text-sm text-gray-500">ふたりの選んだカードが違ったよ</p>
          </div>

          <div className="space-y-3">
            {pickA && (
              <Card
                card={pickA}
                selected={myVote === pickA.id}
                disabled={hasVoted}
                size="large"
                onTap={() => !hasVoted && submitVote(pickA.id)}
              />
            )}
            {pickB && (
              <Card
                card={pickB}
                selected={myVote === pickB.id}
                disabled={hasVoted}
                size="large"
                onTap={() => !hasVoted && submitVote(pickB.id)}
              />
            )}
          </div>

          {hasVoted && (
            <p className="text-sm text-gray-400 animate-pulse">投票しました。結果を待っています...</p>
          )}
        </div>
      </div>
    )
  }

  // Janken phase
  if (gameState.round === 'janken') {
    const myHand = gameState.janken[myRole]
    const partnerHand = gameState.janken[myRole === 'a' ? 'b' : 'a']
    const hasChosen = myHand !== null
    const bothChosen = myHand !== null && partnerHand !== null
    const isDraw = bothChosen && myHand === partnerHand

    const hands = [
      { key: 'rock' as const, emoji: '✊', label: 'グー' },
      { key: 'paper' as const, emoji: '✋', label: 'パー' },
      { key: 'scissors' as const, emoji: '✌️', label: 'チョキ' },
    ]

    return (
      <div className="min-h-dvh bg-mesh flex flex-col items-center justify-center px-4">
        <div className="max-w-sm mx-auto text-center space-y-8">
          <div className="space-y-2">
            <p className="text-3xl janken-shake">🤜🤛</p>
            <h2 className="text-xl font-bold text-gray-800">
              {isDraw ? 'あいこで...!' : '決まらなかった!'}
            </h2>
            <p className="text-sm text-gray-500">
              {isDraw ? 'もう一回!' : 'じゃんけんで決めよう!'}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {hands.map(({ key, emoji, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => !hasChosen && submitJanken(key)}
                disabled={hasChosen}
                className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center gap-1
                  transition-all btn-liquid janken-btn-in
                  ${hasChosen && myHand === key
                    ? 'bg-gradient-to-br from-pink-400/40 to-purple-400/40 ring-2 ring-pink-400 scale-110'
                    : hasChosen
                      ? 'opacity-40 scale-95'
                      : 'glass-card hover:scale-105 active:scale-95'
                  }`}
              >
                <span className="text-4xl">{emoji}</span>
                <span className="text-xs font-bold text-gray-600">{label}</span>
              </button>
            ))}
          </div>

          {hasChosen && !bothChosen && (
            <p className="text-sm text-gray-400 animate-pulse">相手を待っています...</p>
          )}
        </div>
      </div>
    )
  }

  return null
}
