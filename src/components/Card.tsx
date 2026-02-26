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

export const CATEGORY_LABELS: Record<CardCategory, string> = {
  outing: 'おでかけ',
  drive: 'ドライブ・旅行',
  gourmet: 'グルメ',
  culture: 'カルチャー',
  chill: 'まったり',
  romantic: 'ロマンチック',
  challenge: 'チャレンジ',
}

export const CATEGORY_COLORS: Record<CardCategory, string> = {
  outing: 'bg-green-400/80',
  drive: 'bg-blue-400/80',
  gourmet: 'bg-orange-400/80',
  culture: 'bg-purple-400/80',
  chill: 'bg-yellow-400/80',
  romantic: 'bg-pink-400/80',
  challenge: 'bg-red-400/80',
}

type Props = {
  card: CardType
  selected?: boolean
  selectionIndex?: number
  disabled?: boolean
  dimmed?: boolean
  size?: 'normal' | 'large'
  onTap?: () => void
}

export default function Card({ card, selected, selectionIndex, disabled, dimmed, size = 'normal', onTap }: Props) {
  const base = CATEGORY_STYLES[card.category]
  const sizeClass = size === 'large' ? 'p-5' : size === 'normal' ? 'px-3 py-3.5' : 'px-2.5 py-2'

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      className={`
        ${base} ${sizeClass}
        w-full rounded-[20px] text-left transition-all duration-200 ease-out relative
        active:scale-95
        ${selected
          ? 'ring-2 ring-pink-400/80 shadow-lg shadow-pink-400/30 card-selected card-shimmer'
          : ''}
        ${dimmed ? 'opacity-40 grayscale' : ''}
        ${disabled && !dimmed ? 'opacity-50' : ''}
        ${!disabled ? 'cursor-pointer' : ''}
      `}
    >
      {selected && selectionIndex != null && (
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-md z-10 animate-card-pop-in">
          <span className="text-white text-sm font-bold leading-none">{selectionIndex}</span>
        </span>
      )}
      <span className="pill-liquid rounded-full px-2 py-0.5 text-[10px] font-medium opacity-80 inline-block">
        {CATEGORY_LABELS[card.category]}
      </span>
      <p className={`mt-0.5 font-bold leading-tight ${size === 'large' ? 'text-lg' : 'text-sm'}`}>
        {card.text}
      </p>
    </button>
  )
}
