import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayer } from '../hooks/usePlayer'
import { useRoom } from '../hooks/useRoom'
import { getCardById } from '../lib/gameLogic'
import { broadcast } from '../lib/realtime'
import CardReveal from '../components/CardReveal'

export default function ResultPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { playerId, nickname } = usePlayer()
  const { channel } = useRoom(code!, playerId, nickname)
  const [revealed, setRevealed] = useState(false)

  // Prefer location.state, fall back to sessionStorage for reload resilience
  const stateCardId = (location.state as { cardId?: number })?.cardId
  const cardId = stateCardId ?? (Number(sessionStorage.getItem('decided_card_id')) || null)
  const card = cardId ? getCardById(cardId) : null

  // Persist cardId so it survives page reloads
  useEffect(() => {
    if (cardId !== null) {
      sessionStorage.setItem('decided_card_id', String(cardId))
    }
  }, [cardId])

  // Listen for play_again
  useEffect(() => {
    if (!channel) return
    channel.on('broadcast', { event: 'play_again' }, () => {
      navigate(`/room/${code}`)
    })
  }, [channel, code, navigate])

  const handlePlayAgain = () => {
    if (!channel) return
    broadcast(channel, 'play_again', {})
  }

  if (!card) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-mesh p-6 gap-4">
        <p className="text-red-500">カード情報が見つかりません</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 glass rounded-3xl text-gray-800 font-bold"
        >
          トップに戻る
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-mesh px-6 pb-[env(safe-area-inset-bottom)] gap-6">
      <CardReveal card={card} onFlip={() => setRevealed(true)} />

      {revealed && (
        <motion.div
          className="text-center space-y-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-base text-gray-500">ときめきピック、</p>
          <p className="text-3xl font-bold text-gray-800">{card.text}</p>
        </motion.div>
      )}

      {revealed && (
        <motion.div
          className="w-full px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
        <button
          type="button"
          onClick={handlePlayAgain}
          className="w-full py-4 glass rounded-3xl
            text-gray-800 text-lg font-bold
            active:scale-[0.97] transition-all min-h-12"
        >
          もういっかい
        </button>
      </motion.div>
      )}
    </div>
  )
}
