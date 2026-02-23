import type { Card as CardType, CardCategory } from '../types'

const CATEGORY_STYLES: Record<CardCategory, string> = {
  outing: 'liquid-card bg-green-100/25 text-green-900',
  drive: 'liquid-card bg-blue-100/25 text-blue-900',
  gourmet: 'liquid-card bg-orange-100/25 text-orange-900',
  culture: 'liquid-card bg-purple-100/25 text-purple-900',
  chill: 'liquid-card bg-yellow-100/25 text-yellow-900',
  romantic: 'liquid-card bg-pink-100/25 text-pink-900',
  challenge: 'liquid-card bg-red-100/25 text-red-900',
}

const CATEGORY_LABELS: Record<CardCategory, string> = {
  outing: 'おでかけ',
  drive: 'ドライブ・旅行',
  gourmet: 'グルメ',
  culture: 'カルチャー',
  chill: 'まったり',
  romantic: 'ロマンチック',
  challenge: 'チャレンジ',
}

type Props = {
  card: CardType
  selected?: boolean
  disabled?: boolean
  size?: 'normal' | 'large'
  onTap?: () => void
}

export default function Card({ card, selected, disabled, size = 'normal', onTap }: Props) {
  const base = CATEGORY_STYLES[card.category]
  const sizeClass = size === 'large' ? 'p-5' : 'px-3 py-3.5'

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      className={`
        ${base} ${sizeClass}
        rounded-[20px] text-left transition-all duration-150
        active:scale-95
        ${selected ? 'ring-1 ring-white/50 shadow-lg shadow-pink-300/20 scale-[1.03]' : ''}
        ${disabled ? 'opacity-50' : 'cursor-pointer'}
      `}
    >
      <span className="pill-liquid rounded-full px-2 py-0.5 text-xs font-medium opacity-80 inline-block">
        {CATEGORY_LABELS[card.category]}
      </span>
      <p className={`mt-0.5 font-bold leading-tight ${size === 'large' ? 'text-lg' : 'text-base'}`}>
        {card.text}
      </p>
    </button>
  )
}
