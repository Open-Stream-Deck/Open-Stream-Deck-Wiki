'use client'

import dynamic from 'next/dynamic'
import { createContext, use, useEffect, useState, type ReactNode } from 'react'

const SearchDialog = dynamic(
  () => import('./search-dialog').then((module) => module.SearchDialog),
  {
    ssr: false,
  },
)

interface SearchContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearch() {
  const context = use(SearchContext)
  if (!context) throw new Error('useSearch must be used inside SearchProvider')
  return context
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)
      const isSlash =
        event.key === '/' &&
        !(event.target as HTMLElement).closest('input, textarea, [contenteditable]')
      if (!isShortcut && !isSlash) return

      event.preventDefault()
      setOpen((value) => !value)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  return (
    <SearchContext value={{ open, setOpen }}>
      {children}
      {mounted && <SearchDialog open={open} onOpenChange={setOpen} />}
    </SearchContext>
  )
}
