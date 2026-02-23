import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../hooks/usePlayer'
import { useRoom } from '../hooks/useRoom'
import CopyButton from '../components/CopyButton'

export default function WaitingRoom() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { playerId, nickname } = usePlayer()
  const {
    channel,
    players,
    partnerJoined,
    isHost,
    loading,
    error,
    startGame,
  } = useRoom(code!, playerId, nickname)

  const roomUrl = `${window.location.origin}/room/${code}`
  const partner = players.find((p) => p.player_id !== playerId)

  // Listen for game_start
  useEffect(() => {
    if (!channel) return
    channel.on('broadcast', { event: 'game_start' }, () => {
      navigate(`/room/${code}/game`)
    })
    // No cleanup needed — channel lifecycle is managed by useRoom
  }, [channel, code, navigate])

  const handleStart = () => {
    startGame()
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-mesh">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-mesh p-6 gap-4">
        <p className="text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white btn-liquid rounded-3xl font-medium shadow-lg shadow-pink-500/25"
        >
          トップに戻る
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-mesh p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <h1 className="text-2xl font-bold text-pink-600">待機中</h1>

        {/* Room code */}
        <div className="glass rounded-[28px] p-6 space-y-3">
          <p className="text-sm text-gray-500">ルームコード</p>
          <p className="text-5xl font-bold tracking-[0.3em] text-gray-800">{code}</p>
          <CopyButton text={roomUrl} label="URLをコピー" />
          <p className="text-xs text-gray-500">パートナーにURLを送ろう!</p>
        </div>

        {/* Player status */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-gray-700">{nickname} (あなた)</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            {partner ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-gray-700">{partner.nickname} が来ました!</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
                <span className="text-gray-400">待っています...</span>
              </>
            )}
          </div>
        </div>

        {/* Start button (host only, when partner joined) */}
        {isHost && partnerJoined && (
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl text-lg font-bold
              btn-liquid shadow-lg shadow-pink-500/25 transition-all"
          >
            はじめる
          </button>
        )}

        {!isHost && partnerJoined && (
          <p className="text-sm text-gray-500">ホストがゲームを開始するのを待っています...</p>
        )}
      </div>
    </div>
  )
}
