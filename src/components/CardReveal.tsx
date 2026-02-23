import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Card as CardType } from '../types'

type Props = {
  card: CardType
  onFlip?: () => void
}

export default function CardReveal({ card, onFlip }: Props) {
  const [flipped, setFlipped] = useState(false)

  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 160,
        y: -Math.random() * 100 - 30,
        delay: 0.5 + Math.random() * 0.5,
      })),
    [],
  )

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true)
      onFlip?.()
    }
  }

  return (
    <div
      className="relative w-[75vw] max-w-72 aspect-[4/5] cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
        {/* Back (card back) - glassmorphism */}
        <div
          className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-pink-400/80 to-purple-500/80
            backdrop-blur-xl border-[0.5px] border-white/30
            flex items-center justify-center shadow-xl"
          style={{ backfaceVisibility: 'hidden', filter: 'url(#liquid-distortion)' }}
        >
          <div className="text-center text-white">
            <motion.p
              className="text-5xl"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ?
            </motion.p>
            <p className="text-sm mt-3 text-white/70 tracking-wider">
              タップしてめくる
            </p>
          </div>
        </div>

        {/* Front (card face) - glassmorphism */}
        <div
          className="absolute inset-0 rounded-[20px] glass
            flex items-center justify-center shadow-xl p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
            {card.text}
          </p>
        </div>
      </motion.div>

      {/* Sparkle particles on flip */}
      {flipped &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-1/2 w-2 h-2 bg-white/70 rounded-full pointer-events-none"
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: p.x,
              y: p.y,
              scale: [0, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              delay: p.delay,
              type: 'spring',
              stiffness: 80,
              damping: 12,
            }}
          />
        ))}
    </div>
  )
}
