'use client'

import config from '@config'
import { TextAlignStart } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import type { TocItem } from '@/lib/markdown/compile'

const OFFSET = 96

function useActiveHeadings(items: TocItem[]) {
  const [active, setActive] = useState<string[]>([])

  useEffect(() => {
    let frame = 0

    const update = () => {
      const headings = items
        .map((item) => document.getElementById(item.id))
        .filter((element): element is HTMLElement => Boolean(element))
      const bottom =
        document.querySelector('[data-article-end]')?.getBoundingClientRect().top ?? Infinity
      const viewport = window.innerHeight

      const visible = headings.filter((heading, index) => {
        const top = heading.getBoundingClientRect().top
        const end = headings[index + 1]?.getBoundingClientRect().top ?? bottom
        return end > OFFSET && top < viewport
      })

      const fallback = headings.findLast((heading) => heading.getBoundingClientRect().top < OFFSET)
      const ids = (visible.length ? visible : fallback ? [fallback] : []).map(
        (heading) => heading.id,
      )

      setActive((previous) => (previous.join() === ids.join() ? previous : ids))
    }

    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [items])

  return active
}

export function Toc({ items }: { items: TocItem[] }) {
  const active = useActiveHeadings(items)
  const listRef = useRef<HTMLUListElement>(null)
  const [thumb, setThumb] = useState({ top: 0, height: 0 })

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || !active.length) return setThumb((value) => ({ ...value, height: 0 }))

    const first = list.querySelector<HTMLElement>(`[data-id="${CSS.escape(active[0]!)}"]`)
    const last = list.querySelector<HTMLElement>(`[data-id="${CSS.escape(active.at(-1)!)}"]`)
    if (!first || !last) return

    setThumb({ top: first.offsetTop, height: last.offsetTop + last.offsetHeight - first.offsetTop })
  }, [active])

  if (!items.length) return null

  const minDepth = Math.min(...items.map((item) => item.depth))

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-xs font-medium text-fg">
        <TextAlignStart className="size-3.5 text-subtle" />
        {config.ui.onThisPage}
      </p>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-px bg-line" />
        <motion.div
          className="absolute left-0 w-px bg-fg"
          initial={false}
          animate={{ top: thumb.top, height: thumb.height, opacity: thumb.height ? 1 : 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        />
        <ul ref={listRef} className="flex flex-col">
          {items.map((item) => (
            <li key={item.id} data-id={item.id}>
              <a
                href={`#${item.id}`}
                style={{ paddingLeft: `${0.85 + (item.depth - minDepth) * 0.8}rem` }}
                className={cn(
                  'block py-1.5 text-[13px] leading-snug transition-colors duration-200',
                  active.includes(item.id) ? 'text-fg' : 'text-subtle hover:text-muted',
                )}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
