import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer, generateRoomCode } from '../hooks/usePlayer'
import { createRoom, joinRoom } from '../lib/room'
import NicknameInput from '../components/NicknameInput'

export default function TopPage() {
  const navigate = useNavigate()
  const { playerId, nickname, setNickname } = usePlayer()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const canAct = nickname.trim().length > 0 && !loading

  const handleCreate = async () => {
    if (!canAct) return
    setLoading(true)
    setError('')
    try {
      const code = generateRoomCode()
      await createRoom(code, playerId, nickname.trim())
      sessionStorage.setItem('role', 'host')
      sessionStorage.setItem('room_code', code)
      navigate(`/room/${code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!canAct) return
    const code = joinCode.trim()
    if (!/^\d{4}$/.test(code)) {
      setError('4桁の数字を入力してください')
      return
    }
    setLoading(true)
    setError('')
    try {
      await joinRoom(code, playerId, nickname.trim())
      sessionStorage.setItem('role', 'guest')
      sessionStorage.setItem('room_code', code)
      navigate(`/room/${code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-mesh p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Title */}
        <div className="glass rounded-[28px] p-6 text-center space-y-2">
          <h1 className="text-3xl font-bold text-pink-600">ときめきピック</h1>
          <p className="text-sm text-gray-500">ふたりの「やりたい」を見つけよう</p>
        </div>

        {/* Nickname */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">ニックネーム</label>
          <NicknameInput value={nickname} onChange={setNickname} />
        </div>

        {/* Create Room */}
        <button
          type="button"
          onClick={handleCreate}
          disabled={!canAct}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl text-lg font-bold
            btn-liquid shadow-lg shadow-pink-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'ルームをつくる'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/50" />
          <span className="text-xs text-gray-500">または</span>
          <div className="flex-1 h-px bg-white/50" />
        </div>

        {/* Join Room */}
        <div className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))
              setError('')
            }}
            placeholder="ルームコード(4桁)"
            className="w-full px-4 py-3 rounded-2xl input-liquid
              text-center text-base tracking-widest text-gray-700 placeholder-gray-400
              transition-all"
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="button"
            onClick={handleJoin}
            disabled={!canAct || joinCode.length !== 4}
            className="w-full py-4 glass-strong btn-liquid rounded-3xl text-lg font-bold text-pink-600
              transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'ルームに参加する'}
          </button>
        </div>
      </div>
    </div>
  )
}
