import type { Card as CardType, CardCategory } from '../types'

const CATEGORY_BORDER_COLORS: Record<CardCategory, string> = {
  outing: 'border-green-400',
  drive: 'border-blue-400',
  gourmet: 'border-orange-400',
  culture: 'border-purple-400',
  chill: 'border-yellow-400',
  romantic: 'border-pink-400',
  challenge: 'border-red-400',
}

type Props = {
  cards: CardType[]
  onRemove: (cardId: number) => void
}

export default function HandTray({ cards, onRemove }: Props) {
  if (cards.length === 0) return null

  const count = cards.length
  const totalSpread = Math.min(count * 6, 30)

  return (
    <div className="flex justify-center items-end py-3" style={{ minHeight: '5.5rem' }}>
      {cards.map((card, i) => {
        const rotation =
          count === 1 ? 0 : -totalSpread / 2 + (i / (count - 1)) * totalSpread
        const yOffset = Math.abs(i - (count - 1) / 2) * 4

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onRemove(card.id)}
            className="fan-card-in cursor-pointer"
            style={{
              marginLeft: i > 0 ? '-12px' : '0',
              zIndex: i,
              transform: `rotate(${rotation}deg) translateY(-${yOffset}px)`,
              transformOrigin: 'bottom center',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div
              className={`relative w-18 h-14 rounded-xl glass-card border-l-3 ${CATEGORY_BORDER_COLORS[card.category]} p-1.5 shadow-md`}
            >
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-gray-400/60 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] leading-none font-bold">−</span>
              </span>
              <p className="text-xs font-medium truncate mt-1 pr-3 leading-tight">
                {card.text}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
