'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { cn } from '@/lib/cn'

const IDLE_DELAY = 1000
const MIN_THUMB = 32
const EDGE = 20

export type Orientation = 'vertical' | 'horizontal'

interface Scroller {
  events: Window | HTMLElement
  observed: Element[]
  total: () => number
  viewport: () => number
  position: () => number
  scrollTo: (offset: number, smooth?: boolean) => void
}

function behavior(smooth?: boolean): ScrollBehavior {
  return smooth ? 'smooth' : 'instant'
}

function windowScroller(): Scroller {
  return {
    events: window,
    observed: [document.body],
    total: () => document.documentElement.scrollHeight,
    viewport: () => window.innerHeight,
    position: () => window.scrollY,
    scrollTo: (top, smooth) => window.scrollTo({ top, behavior: behavior(smooth) }),
  }
}

function elementScroller(element: HTMLElement, orientation: Orientation): Scroller {
  const vertical = orientation === 'vertical'

  return {
    events: element,
    observed: [element, ...Array.from(element.children)],
    total: () => (vertical ? element.scrollHeight : element.scrollWidth),
    viewport: () => (vertical ? element.clientHeight : element.clientWidth),
    position: () => (vertical ? element.scrollTop : element.scrollLeft),
    scrollTo: (offset, smooth) =>
      element.scrollTo({ [vertical ? 'top' : 'left']: offset, behavior: behavior(smooth) }),
  }
}

interface ScrollbarProps {
  target?: RefObject<HTMLElement | null>
  orientation?: Orientation
  className?: string
}

export function Scrollbar({ target, orientation = 'vertical', className }: ScrollbarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const vertical = orientation === 'vertical'

  useEffect(() => {
    const track = trackRef.current
    const thumb = thumbRef.current
    const node = target?.current
    if (!track || !thumb || (target && !node)) return

    const scroller = node ? elementScroller(node, orientation) : windowScroller()
    const pointer = (event: PointerEvent) => (vertical ? event.clientY : event.clientX)
    let idle = 0

    const metrics = () => {
      const total = scroller.total()
      const visible = scroller.viewport()
      const length = vertical ? track.clientHeight : track.clientWidth
      const size = Math.max(MIN_THUMB, (length * visible) / total)
      return { range: total - visible, size, travel: length - size }
    }

    const render = () => {
      const { range, size, travel } = metrics()
      const offset = range > 0 ? (scroller.position() / range) * travel : 0

      track.toggleAttribute('data-hidden', range <= 1)
      thumb.style[vertical ? 'height' : 'width'] = `${size}px`
      thumb.style.transform = vertical
        ? `translate3d(0, ${offset}px, 0)`
        : `translate3d(${offset}px, 0, 0)`
    }

    const hide = () => {
      if (track.matches(':hover, [data-dragging]')) return
      track.removeAttribute('data-visible')
    }

    const show = () => {
      track.setAttribute('data-visible', '')
      clearTimeout(idle)
      idle = window.setTimeout(hide, IDLE_DELAY)
    }

    const onScroll = () => {
      render()
      show()
    }

    const onEdge = (event: PointerEvent) => {
      if (event.clientX >= window.innerWidth - EDGE) show()
    }

    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault()
      event.stopPropagation()
      const { range, size, travel } = metrics()

      if (event.target !== thumb) {
        const rect = track.getBoundingClientRect()
        const offset = pointer(event) - (vertical ? rect.top : rect.left) - size / 2
        scroller.scrollTo((offset / travel) * range, true)
        return
      }

      const start = pointer(event)
      const startScroll = scroller.position()

      const onMove = (move: PointerEvent) => {
        scroller.scrollTo(startScroll + ((pointer(move) - start) / travel) * range)
      }

      const onUp = () => {
        track.removeAttribute('data-dragging')
        track.removeEventListener('pointermove', onMove)
        show()
      }

      track.setPointerCapture(event.pointerId)
      track.setAttribute('data-dragging', '')
      track.addEventListener('pointermove', onMove)
      track.addEventListener('pointerup', onUp, { once: true })
      track.addEventListener('pointercancel', onUp, { once: true })
    }

    const resize = new ResizeObserver(render)
    const mutations = new MutationObserver(render)
    scroller.observed.forEach((element) => resize.observe(element))
    mutations.observe(scroller.observed[0]!, { childList: true, subtree: true })

    render()
    scroller.events.addEventListener('scroll', onScroll, { passive: true })
    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointerleave', show)
    if (node) node.addEventListener('pointerenter', show)
    else window.addEventListener('pointermove', onEdge, { passive: true })

    return () => {
      clearTimeout(idle)
      resize.disconnect()
      mutations.disconnect()
      scroller.events.removeEventListener('scroll', onScroll)
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointerleave', show)
      if (node) node.removeEventListener('pointerenter', show)
      else window.removeEventListener('pointermove', onEdge)
    }
  }, [target, orientation, vertical])

  return (
    <div
      ref={trackRef}
      aria-hidden
      className={cn(
        'group/scrollbar z-[45] touch-none opacity-0 transition-opacity duration-500 select-none hover:opacity-100 hover:duration-150 data-[dragging]:opacity-100 data-[hidden]:hidden data-[visible]:opacity-100 data-[visible]:duration-150',
        vertical ? 'w-3.5' : 'h-3.5',
        !target && 'fixed top-[calc(var(--spacing-header)+0.25rem)] right-0 bottom-1',
        target && (vertical ? 'absolute inset-y-1 right-0' : 'absolute inset-x-1 bottom-0'),
        className,
      )}
    >
      <div
        ref={thumbRef}
        className={cn(
          'absolute rounded-full bg-line-strong duration-300 ease-out-soft will-change-transform group-hover/scrollbar:bg-subtle group-data-[dragging]/scrollbar:bg-muted',
          vertical
            ? 'top-0 right-[3px] w-1.5 transition-[width,background-color] group-hover/scrollbar:w-2.5 group-data-[dragging]/scrollbar:w-2.5'
            : 'bottom-[3px] left-0 h-1.5 transition-[height,background-color] group-hover/scrollbar:h-2.5 group-data-[dragging]/scrollbar:h-2.5',
        )}
      />
    </div>
  )
}
