import { useRef, useEffect, useState, useMemo } from 'react'
import type { Card as CardType } from '../types'
import Card from './Card'
import { useCanvasPan } from '../hooks/useCanvasPan'

const COLS = 4
const CARD_W = 130
const CARD_H = 80
const ZONE_W = 170
const ZONE_H = 125

type Props = {
  cards: CardType[]
  selectedIds: number[]
  maxSelections?: number
  disabled?: boolean
  onToggle: (cardId: number) => void
}

function layoutCards(cards: CardType[], canvasW: number, canvasH: number, rows: number) {
  const padX = (ZONE_W - CARD_W) / 2
  const padY = (ZONE_H - CARD_H) / 2
  // Center the grid within the canvas
  const gridW = COLS * ZONE_W
  const gridH = rows * ZONE_H
  const offsetX = (canvasW - gridW) / 2
  const offsetY = (canvasH - gridH) / 2

  return cards.map((card, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    // Deterministic jitter from card id
    const seed = ((card.id * 7 + 13) % 17) / 17
    const seed2 = ((card.id * 11 + 3) % 19) / 19
    const jitterX = (seed - 0.5) * padX * 1.6
    const jitterY = (seed2 - 0.5) * padY * 1.3
    // More playful rotation: -12° to +12°, with extra twist from a 3rd seed
    const seed3 = ((card.id * 13 + 7) % 23) / 23
    const rotation = (seed - 0.5) * 16 + (seed3 - 0.5) * 8

    return {
      card,
      x: offsetX + col * ZONE_W + ZONE_W / 2 - CARD_W / 2 + jitterX,
      y: offsetY + row * ZONE_H + ZONE_H / 2 - CARD_H / 2 + jitterY,
      rotation,
      z: i,
    }
  })
}

export default function CardCanvas({ cards, selectedIds, maxSelections, disabled, onToggle }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [hintVisible, setHintVisible] = useState(true)
  const [entered, setEntered] = useState(false)

  const rows = Math.ceil(cards.length / COLS)
  const canvasW = COLS * ZONE_W + 120 // extra margin for edge peek
  const canvasH = rows * ZONE_H + 160

  const { onPointerDown, onPointerMove, onPointerUp, justPannedRef, initPosition } = useCanvasPan({
    canvasWidth: canvasW,
    canvasHeight: canvasH,
    viewportRef,
    onPanStart: () => setHintVisible(false),
  })

  const positions = useMemo(() => layoutCards(cards, canvasW, canvasH, rows), [cards, canvasW, canvasH, rows])

  useEffect(() => {
    initPosition()
  }, [initPosition])

  // Entrance animation timer
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), cards.length * 40 + 500)
    return () => clearTimeout(timer)
  }, [cards.length])

  // Auto-hide hint
  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  const handleCardTap = (cardId: number) => {
    if (justPannedRef.current) return
    onToggle(cardId)
  }

  return (
    <div
      ref={viewportRef}
      className="canvas-viewport relative flex-1"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Canvas */}
      <div
        className="will-change-transform"
        style={{ width: canvasW, height: canvasH }}
      >
        {positions.map(({ card, x, y, rotation, z }, index) => {
          const isSelected = selectedIds.includes(card.id)
          const selectionIndex = isSelected ? selectedIds.indexOf(card.id) + 1 : undefined
          const isDisabled =
            disabled || (!isSelected && maxSelections !== undefined && selectedIds.length >= maxSelections)
          const isDimmed =
            !isSelected && !disabled && maxSelections !== undefined && selectedIds.length >= maxSelections

          const transform = isSelected
            ? `rotate(0deg) scale(1.05)`
            : `rotate(${rotation}deg)`

          return (
            <div
              key={card.id}
              className={!entered ? 'card-scatter-in' : undefined}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: CARD_W,
                transform,
                zIndex: isSelected ? 100 : z,
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animationDelay: !entered ? `${index * 40}ms` : undefined,
              }}
            >
              <Card
                card={card}
                selected={isSelected}
                selectionIndex={selectionIndex}
                disabled={isDisabled}
                dimmed={isDimmed}
                size="normal"
                onTap={() => handleCardTap(card.id)}
              />
            </div>
          )
        })}
      </div>

      {/* Vignette overlays */}
      <div className="canvas-vignette canvas-vignette-top" />
      <div className="canvas-vignette canvas-vignette-bottom" />
      <div className="canvas-vignette canvas-vignette-left" />
      <div className="canvas-vignette canvas-vignette-right" />

      {/* Pan hint */}
      {hintVisible && (
        <div className="pan-hint">
          ↔ スワイプで探そう
        </div>
      )}
    </div>
  )
}
