import type { Card as CardType } from '../types'
import Card from './Card'
import CardCanvas from './CardCanvas'

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
  const isScatter = size === 'normal' && cards.length > 5

  if (isScatter) {
    return (
      <CardCanvas
        cards={cards}
        selectedIds={selectedIds}
        maxSelections={maxSelections}
        disabled={disabled}
        onToggle={onToggle}
      />
    )
  }

  const columns = size === 'large' ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className={`grid ${columns} gap-3`}>
      {cards.map((card) => {
        const isSelected = selectedIds.includes(card.id)
        const selectionIndex = isSelected ? selectedIds.indexOf(card.id) + 1 : undefined
        const isDisabled =
          disabled || (!isSelected && maxSelections !== undefined && selectedIds.length >= maxSelections)
        const isDimmed =
          !isSelected && !disabled && maxSelections !== undefined && selectedIds.length >= maxSelections

        return (
          <div key={card.id}>
            <Card
              card={card}
              selected={isSelected}
              selectionIndex={selectionIndex}
              disabled={isDisabled}
              dimmed={isDimmed}
              size={size}
              onTap={() => onToggle(card.id)}
            />
          </div>
        )
      })}
    </div>
  )
}
