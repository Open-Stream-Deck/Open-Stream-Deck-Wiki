'use client'

import { motion } from 'motion/react'
import { createContext, use, useId, useState, useSyncExternalStore, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

const EVENT = 'wiki:tabs'

const TabsContext = createContext<string | null>(null)

function subscribe(notify: () => void) {
  window.addEventListener(EVENT, notify)
  window.addEventListener('storage', notify)
  return () => {
    window.removeEventListener(EVENT, notify)
    window.removeEventListener('storage', notify)
  }
}

function read(key: string | undefined) {
  if (!key) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
    window.dispatchEvent(new Event(EVENT))
  } catch {
    return
  }
}

interface TabsRootProps {
  items: string[]
  id?: string
  variant?: 'default' | 'code'
  children: ReactNode
}

export function TabsRoot({ items, id, variant = 'default', children }: TabsRootProps) {
  const scope = useId()
  const key = id && `wiki-tabs:${id}`
  const [local, setLocal] = useState(items[0] ?? '')
  const stored = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  )
  const candidate = stored ?? local
  const value = items.includes(candidate) ? candidate : (items[0] ?? '')

  const select = (next: string) => {
    setLocal(next)
    if (key) write(key, next)
  }

  return (
    <div
      className={cn(
        'my-6 overflow-hidden rounded-xl border',
        variant === 'code'
          ? 'bg-code [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0'
          : 'bg-bg',
      )}
    >
      <div
        role="tablist"
        className="scrollbar-none flex gap-1 overflow-x-auto overflow-y-hidden border-b bg-surface/50 px-2"
      >
        {items.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={item === value}
            onClick={() => select(item)}
            className={cn(
              'relative shrink-0 px-2.5 py-2.5 text-[13px] whitespace-nowrap transition-colors',
              variant === 'code' && 'font-mono',
              item === value ? 'text-fg' : 'text-subtle hover:text-muted',
            )}
          >
            {item}
            {item === value && (
              <motion.span
                layoutId={`${scope}-indicator`}
                className="absolute inset-x-1 bottom-0 h-px bg-fg"
              />
            )}
          </button>
        ))}
      </div>
      <TabsContext value={value}>
        <div
          className={cn(
            variant === 'default' &&
              'px-4 py-3 [&>*>*]:my-3 [&>*>:first-child]:mt-0 [&>*>:last-child]:mb-0',
          )}
        >
          {children}
        </div>
      </TabsContext>
    </div>
  )
}

export function Tab({ value, children }: { value: string; children?: ReactNode }) {
  const active = use(TabsContext) === value

  return (
    <motion.div
      role="tabpanel"
      hidden={!active}
      initial={false}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}
