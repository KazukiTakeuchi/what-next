import type { Card as CardType } from '../types'
import Card from './Card'

type Props = {
  cards: CardType[]
  selectedIds: number[]
  maxSelections?: number
  disabled?: boolean
  size?: 'normal' | 'large'
  onToggle: (cardId: number) => void
}

export default function CardGrid({
  cards,
  selectedIds,
  maxSelections,
  disabled,
  size = 'normal',
  onToggle,
}: Props) {
  const columns = size === 'large' ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className={`grid ${columns} gap-3`}>
      {cards.map((card) => {
        const isSelected = selectedIds.includes(card.id)
        const isDisabled =
          disabled || (!isSelected && maxSelections !== undefined && selectedIds.length >= maxSelections)

        return (
          <Card
            key={card.id}
            card={card}
            selected={isSelected}
            disabled={isDisabled}
            size={size}
            onTap={() => onToggle(card.id)}
          />
        )
      })}
    </div>
  )
}
