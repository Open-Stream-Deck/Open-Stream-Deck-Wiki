'use client'

import config from '@config'
import { Search } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/cn'
import { useSearch } from './search-provider'

const subscribe = () => () => {}
const isMac = () => /mac|iphone|ipad/i.test(navigator.userAgent)

export function SearchButton({ className }: { className?: string }) {
  const { setOpen } = useSearch()
  const mac = useSyncExternalStore(subscribe, isMac, () => false)

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        'group flex h-9 items-center gap-2.5 rounded-lg border bg-surface/60 pr-1.5 pl-3 text-sm text-subtle transition-colors hover:border-line-strong hover:text-muted',
        className,
      )}
    >
      <Search className="size-4" />
      <span className="flex-1 text-left">{config.ui.search}</span>
      <kbd className="hidden items-center gap-0.5 rounded-md border bg-bg px-1.5 py-0.5 font-mono text-[11px] sm:flex">
        {mac ? '⌘' : 'Ctrl'} K
      </kbd>
    </button>
  )
}

export function SearchIconButton() {
  const { setOpen } = useSearch()

  return (
    <button
      type="button"
      aria-label={config.ui.search}
      onClick={() => setOpen(true)}
      className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      <Search className="size-[17px]" />
    </button>
  )
}
