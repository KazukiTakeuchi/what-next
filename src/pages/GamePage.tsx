import { useState, useEffect } from 'react'
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

  const { gameState, myRole, myCards, partnerDone, initGame, submitRound1, submitRound2, submitVote } =
    useGame(channel, playerId, isHost)

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)

  const partner = players.find((p) => p.player_id !== playerId)
  const partnerNickname = partner?.nickname || 'パートナー'

  // Host initializes game once partner is connected on this channel
  useEffect(() => {
    if (isHost && channel && !gameState && partnerJoined) {
      const timer = setTimeout(() => initGame(), 500)
      return () => clearTimeout(timer)
    }
  }, [isHost, channel, gameState, initGame, partnerJoined])

  // Reset selection state when round changes
  useEffect(() => {
    setSelectedIds([])
    setSubmitted(false)
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
      <div className="min-h-dvh bg-mesh pb-24">
        <Header title="やりたいこと5つ選んでね" subtitle="あなたの手札から選ぼう" />
        <div className="px-3">
          <div className="flex items-center justify-between mb-1">
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
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] glass-strong">
          <button
            type="button"
            onClick={() => {
              submitRound1(selectedIds)
              setSubmitted(true)
            }}
            disabled={selectedIds.length !== maxSelections || submitted}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl text-lg font-bold
              btn-liquid transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitted ? `${partnerNickname}を待っています...` : '決定'}
          </button>
        </div>
      </div>
    )
  }

  // Round 2: Select 1 from 5 (partner's selections)
  if (gameState.round === 2) {
    const maxSelections = 1
    return (
      <div className="min-h-dvh bg-mesh pb-24">
        <Header
          title={`${partnerNickname}が選んだカード`}
          subtitle="一番やりたいのは?"
        />
        <div className="px-3">
          <PlayerStatus nickname={partnerNickname} done={partnerDone} />
          <CardGrid
            cards={myCards}
            selectedIds={selectedIds}
            maxSelections={maxSelections}
            disabled={submitted}
            size="large"
            onToggle={(cardId) => {
              if (submitted) return
              setSelectedIds([cardId])
            }}
          />
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] glass-strong">
          <button
            type="button"
            onClick={() => {
              submitRound2(selectedIds[0])
              setSubmitted(true)
            }}
            disabled={selectedIds.length !== 1 || submitted}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl text-lg font-bold
              btn-liquid transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitted ? `${partnerNickname}を待っています...` : 'これにする!'}
          </button>
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
      <div className="min-h-dvh bg-mesh px-4 py-4">
        <div className="max-w-sm mx-auto space-y-4">
          <Header title="どっちがいい?" subtitle="ふたりの選んだカードが違ったよ" />
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
            <p className="text-center text-sm text-gray-400">投票しました。結果を待っています...</p>
          )}
        </div>
      </div>
    )
  }

  return null
}
