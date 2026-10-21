'use client'

import config from '@config'
import { Minus, Plus, X } from 'lucide-react'
import { motion } from 'motion/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

interface Point {
  x: number
  y: number
}

interface View extends Point {
  scale: number
}

const MIN_SCALE = 1
const MAX_SCALE = 8
const STEP = 1.5
const IDENTITY: View = { scale: 1, x: 0, y: 0 }

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      {children}
    </button>
  )
}

interface ImageViewerProps {
  src: string
  alt: string
  onClose: () => void
}

export function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef({ start: { x: 0, y: 0 }, moved: false, distance: 0 })
  const [view, setView] = useState(IDENTITY)
  const [dragging, setDragging] = useState(false)

  const clamp = useCallback((next: View): View => {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale))
    const image = imageRef.current
    const frame = frameRef.current
    if (!image || !frame || scale === MIN_SCALE) return { ...IDENTITY, scale }

    const limitX = Math.max(0, (image.offsetWidth * scale - frame.clientWidth) / 2)
    const limitY = Math.max(0, (image.offsetHeight * scale - frame.clientHeight) / 2)

    return {
      scale,
      x: Math.min(limitX, Math.max(-limitX, next.x)),
      y: Math.min(limitY, Math.max(-limitY, next.y)),
    }
  }, [])

  const toStage = useCallback((client: Point): Point => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: client.x - rect.left - rect.width / 2, y: client.y - rect.top - rect.height / 2 }
  }, [])

  const zoom = useCallback(
    (factor: number, origin: Point = { x: 0, y: 0 }) => {
      setView((current) => {
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * factor))
        const ratio = scale / current.scale

        return clamp({
          scale,
          x: origin.x - (origin.x - current.x) * ratio,
          y: origin.y - (origin.y - current.y) * ratio,
        })
      })
    },
    [clamp],
  )

  const reset = useCallback(() => setView(IDENTITY), [])

  useEffect(() => {
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === '+' || event.key === '=') zoom(STEP)
      if (event.key === '-') zoom(1 / STEP)
      if (event.key === '0') reset()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, reset, zoom])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const sensitivity = event.ctrlKey ? 0.01 : 0.0015
      zoom(Math.exp(-event.deltaY * sensitivity), toStage({ x: event.clientX, y: event.clientY }))
    }

    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [toStage, zoom])

  useEffect(() => {
    const onResize = () => setView((current) => clamp(current))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clamp])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointers.current.size === 1) {
      gesture.current = { start: { x: event.clientX, y: event.clientY }, moved: false, distance: 0 }
    }
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId)
    if (!previous) return

    const current = { x: event.clientX, y: event.clientY }
    pointers.current.set(event.pointerId, current)

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [Point, Point]
      const span = distance(a, b)
      if (gesture.current.distance) zoom(span / gesture.current.distance, toStage(midpoint(a, b)))
      gesture.current.distance = span
      gesture.current.moved = true
      return
    }

    if (distance(current, gesture.current.start) > 4) gesture.current.moved = true
    setView((view) =>
      clamp({ ...view, x: view.x + current.x - previous.x, y: view.y + current.y - previous.y }),
    )
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) gesture.current.distance = 0
    if (!pointers.current.size) setDragging(false)
  }

  const onDoubleClick = (event: MouseEvent<HTMLImageElement>) => {
    if (view.scale > MIN_SCALE) reset()
    else zoom(2.5, toStage({ x: event.clientX, y: event.clientY }))
  }

  const zoomed = view.scale > MIN_SCALE

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={alt || config.ui.close}
      className="fixed inset-0 z-50 bg-overlay backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        ref={stageRef}
        className="absolute inset-0 cursor-zoom-out touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(event) => {
          if (!gesture.current.moved && event.target === event.currentTarget) onClose()
        }}
      >
        <motion.div
          ref={frameRef}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
          className="pointer-events-none absolute inset-x-0 top-0 bottom-16 flex items-center justify-center"
        >
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            draggable={false}
            onDoubleClick={onDoubleClick}
            style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
            className={cn(
              'pointer-events-auto h-auto max-h-[calc(100dvh-7rem)] w-auto max-w-[calc(100vw-2rem)] rounded-xl border bg-bg object-contain shadow-float select-none',
              !dragging && 'transition-transform duration-200 ease-out-soft',
              zoomed ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in',
            )}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-elevated/90 p-1 shadow-float backdrop-blur"
      >
        <ToolbarButton label={config.ui.zoomOut} onClick={() => zoom(1 / STEP)}>
          <Minus className="size-4" />
        </ToolbarButton>
        <button
          type="button"
          aria-label={config.ui.resetZoom}
          onClick={reset}
          className="h-9 min-w-16 rounded-full px-2 font-mono text-xs text-muted tabular-nums transition-colors hover:bg-surface hover:text-fg"
        >
          {Math.round(view.scale * 100)}%
        </button>
        <ToolbarButton label={config.ui.zoomIn} onClick={() => zoom(STEP)}>
          <Plus className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-line" />
        <ToolbarButton label={config.ui.close} onClick={onClose}>
          <X className="size-4" />
        </ToolbarButton>
      </motion.div>
    </motion.div>
  )
}
