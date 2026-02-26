import { useRef, useCallback, useEffect } from 'react'

type Position = { x: number; y: number }

type UseCanvasPanOptions = {
  canvasWidth: number
  canvasHeight: number
  viewportRef: React.RefObject<HTMLDivElement | null>
  onPanStart?: () => void
}

const TAP_THRESHOLD = 8
const FRICTION = 0.92
const RUBBER_BAND = 30
const MIN_VELOCITY = 0.5

export function useCanvasPan({ canvasWidth, canvasHeight, viewportRef, onPanStart }: UseCanvasPanOptions) {
  const posRef = useRef<Position>({ x: 0, y: 0 })
  const startPointerRef = useRef<Position>({ x: 0, y: 0 })
  const startPosRef = useRef<Position>({ x: 0, y: 0 })
  const velocityRef = useRef<Position>({ x: 0, y: 0 })
  const lastPointerRef = useRef<Position>({ x: 0, y: 0 })
  const lastTimeRef = useRef(0)
  const isDraggingRef = useRef(false)
  const isPanningRef = useRef(false)
  const justPannedRef = useRef(false)
  const rafRef = useRef<number>(0)

  const getBounds = useCallback(() => {
    const vp = viewportRef.current
    if (!vp) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    const vpW = vp.clientWidth
    const vpH = vp.clientHeight
    return {
      minX: -(canvasWidth - vpW),
      maxX: 0,
      minY: -(canvasHeight - vpH),
      maxY: 0,
    }
  }, [canvasWidth, canvasHeight, viewportRef])

  const clampWithRubber = useCallback((val: number, min: number, max: number) => {
    if (val > max) return max + (val - max) * (RUBBER_BAND / (RUBBER_BAND + (val - max)))
    if (val < min) return min + (val - min) * (RUBBER_BAND / (RUBBER_BAND + (min - val)))
    return val
  }, [])

  const clamp = useCallback((val: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, val))
  }, [])

  const applyPosition = useCallback((x: number, y: number) => {
    const vp = viewportRef.current
    if (!vp) return
    const canvas = vp.firstElementChild as HTMLElement | null
    if (!canvas) return
    canvas.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }, [viewportRef])

  const snapToBounds = useCallback(() => {
    const bounds = getBounds()
    const target = {
      x: clamp(posRef.current.x, bounds.minX, bounds.maxX),
      y: clamp(posRef.current.y, bounds.minY, bounds.maxY),
    }
    if (target.x === posRef.current.x && target.y === posRef.current.y) return

    const startPos = { ...posRef.current }
    let progress = 0
    const animate = () => {
      progress += 0.08
      if (progress >= 1) {
        posRef.current = target
        applyPosition(target.x, target.y)
        return
      }
      const ease = 1 - Math.pow(1 - progress, 3)
      posRef.current.x = startPos.x + (target.x - startPos.x) * ease
      posRef.current.y = startPos.y + (target.y - startPos.y) * ease
      applyPosition(posRef.current.x, posRef.current.y)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [getBounds, clamp, applyPosition])

  const startInertia = useCallback(() => {
    const tick = () => {
      velocityRef.current.x *= FRICTION
      velocityRef.current.y *= FRICTION

      if (Math.abs(velocityRef.current.x) < MIN_VELOCITY && Math.abs(velocityRef.current.y) < MIN_VELOCITY) {
        snapToBounds()
        return
      }

      const bounds = getBounds()
      posRef.current.x += velocityRef.current.x
      posRef.current.y += velocityRef.current.y

      // Dampen velocity when out of bounds
      if (posRef.current.x > bounds.maxX || posRef.current.x < bounds.minX) {
        velocityRef.current.x *= 0.5
      }
      if (posRef.current.y > bounds.maxY || posRef.current.y < bounds.minY) {
        velocityRef.current.y *= 0.5
      }

      posRef.current.x = clampWithRubber(posRef.current.x, bounds.minX, bounds.maxX)
      posRef.current.y = clampWithRubber(posRef.current.y, bounds.minY, bounds.maxY)

      applyPosition(posRef.current.x, posRef.current.y)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [getBounds, clampWithRubber, applyPosition, snapToBounds])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    cancelAnimationFrame(rafRef.current)
    isDraggingRef.current = true
    isPanningRef.current = false
    justPannedRef.current = false
    startPointerRef.current = { x: e.clientX, y: e.clientY }
    startPosRef.current = { ...posRef.current }
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    lastTimeRef.current = Date.now()
    velocityRef.current = { x: 0, y: 0 }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return

    const dx = e.clientX - startPointerRef.current.x
    const dy = e.clientY - startPointerRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (!isPanningRef.current && dist > TAP_THRESHOLD) {
      isPanningRef.current = true
      justPannedRef.current = true
      onPanStart?.()
    }

    if (isPanningRef.current) {
      const bounds = getBounds()
      const rawX = startPosRef.current.x + dx
      const rawY = startPosRef.current.y + dy
      posRef.current.x = clampWithRubber(rawX, bounds.minX, bounds.maxX)
      posRef.current.y = clampWithRubber(rawY, bounds.minY, bounds.maxY)
      applyPosition(posRef.current.x, posRef.current.y)

      // Track velocity
      const now = Date.now()
      const dt = now - lastTimeRef.current
      if (dt > 0) {
        velocityRef.current.x = (e.clientX - lastPointerRef.current.x) / dt * 16
        velocityRef.current.y = (e.clientY - lastPointerRef.current.y) / dt * 16
      }
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      lastTimeRef.current = now
    }
  }, [getBounds, clampWithRubber, applyPosition, onPanStart])

  const onPointerUp = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false

    if (isPanningRef.current) {
      startInertia()
      // Keep justPannedRef true for a short time to prevent card tap
      setTimeout(() => { justPannedRef.current = false }, 50)
    }
  }, [startInertia])

  // Set initial position to center
  const initPosition = useCallback(() => {
    const vp = viewportRef.current
    if (!vp) return
    const vpW = vp.clientWidth
    const vpH = vp.clientHeight
    const x = -(canvasWidth - vpW) / 2
    const y = -(canvasHeight - vpH) / 2
    posRef.current = { x, y }
    applyPosition(x, y)
  }, [canvasWidth, canvasHeight, viewportRef, applyPosition])

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    justPannedRef,
    initPosition,
  }
}
