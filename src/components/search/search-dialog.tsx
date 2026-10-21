'use client'

import config from '@config'
import { CornerDownLeft, FileText, Hash, Search } from 'lucide-react'
import MiniSearch from 'minisearch'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import type { SearchDocument } from '@/lib/search'
import { ScrollArea } from '../ui/scroll-area'

type Index = MiniSearch<SearchDocument>

let indexPromise: Promise<{ index: Index; documents: SearchDocument[] }> | undefined

function loadIndex() {
  return (indexPromise ??= fetch('/api/search')
    .then((response) => response.json() as Promise<SearchDocument[]>)
    .then((documents) => {
      const index: Index = new MiniSearch({
        fields: ['title', 'page', 'content'],
        storeFields: ['url', 'page', 'title', 'content'],
        searchOptions: {
          prefix: true,
          fuzzy: 0.2,
          boost: { title: 3, page: 1.5 },
          combineWith: 'AND',
        },
      })
      index.addAll(documents)
      return { index, documents }
    }))
}

interface Result extends SearchDocument {
  terms: string[]
}

function escape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return text

  const pattern = new RegExp(`(${terms.map(escape).join('|')})`, 'gi')
  return text.split(pattern).map((part, index) =>
    index % 2 ? (
      <mark
        key={index}
        className="rounded-sm bg-transparent font-medium text-fg underline decoration-line-strong underline-offset-2"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function snippet(content: string, terms: string[]) {
  const lower = content.toLowerCase()
  const position = Math.min(
    ...terms.map((term) => lower.indexOf(term)).filter((value) => value >= 0),
  )
  if (!Number.isFinite(position)) return content.slice(0, 140)

  const start = Math.max(0, position - 50)
  return (start > 0 ? '…' : '') + content.slice(start, start + 160)
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<Awaited<ReturnType<typeof loadIndex>>>()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const deferred = useDeferredValue(query.trim())

  useEffect(() => {
    loadIndex().then(setData)
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  const results = useMemo<Result[]>(() => {
    if (!data) return []
    if (!deferred) {
      return data.documents
        .filter((document) => !document.url.includes('#'))
        .slice(0, 6)
        .map((document) => ({ ...document, terms: [] }))
    }

    return data.index
      .search(deferred)
      .slice(0, 12)
      .map((result) => ({ ...(result as unknown as SearchDocument), terms: result.terms }))
  }, [data, deferred])

  useEffect(() => setActive(0), [deferred])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const select = (result: Result | undefined) => {
    if (!result) return
    onOpenChange(false)
    router.push(result.url)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') onOpenChange(false)
    if (event.key === 'Enter') select(results[active])
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    setActive((value) => (value + step + results.length) % Math.max(results.length, 1))
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          onKeyDown={onKeyDown}
        >
          <motion.div
            className="absolute inset-0 bg-overlay backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={config.ui.search}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-elevated shadow-float"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.15 } }}
            onAnimationComplete={() => inputRef.current?.focus()}
          >
            <label className="flex items-center gap-3 border-b px-4">
              <Search className="size-4 shrink-0 text-subtle" />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={config.ui.searchPlaceholder}
                className="h-13 w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-subtle"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-activedescendant={`search-result-${active}`}
              />
              <kbd className="rounded-md border px-1.5 py-0.5 font-mono text-[11px] text-subtle">
                Esc
              </kbd>
            </label>

            <ScrollArea
              ref={listRef}
              id="search-results"
              role="listbox"
              className="isolate max-h-[min(60vh,28rem)] p-2"
            >
              {!data && <div className="h-24 animate-pulse rounded-xl bg-surface" />}

              {data && deferred && !results.length && (
                <p className="px-3 py-10 text-center text-sm text-subtle">
                  {config.ui.searchEmpty}
                </p>
              )}

              {data && !deferred && (
                <p className="px-3 pt-2 pb-1 text-xs text-subtle">{config.ui.searchHint}</p>
              )}

              {results.map((result, index) => {
                const isSection = result.url.includes('#')
                const Icon = isSection ? Hash : FileText

                return (
                  <button
                    key={result.id}
                    id={`search-result-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={active === index}
                    onMouseMove={() => setActive(index)}
                    onClick={() => select(result)}
                    className="relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left"
                  >
                    {active === index && (
                      <motion.span
                        layoutId="search-active"
                        className="absolute inset-0 rounded-xl bg-surface"
                        transition={{ duration: 0.18 }}
                      />
                    )}
                    <Icon className="relative z-10 mt-0.5 size-4 shrink-0 text-subtle" />
                    <span className="relative z-10 min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-fg">
                        <Highlight text={result.title} terms={result.terms} />
                      </span>
                      {isSection && (
                        <span className="block truncate text-xs text-subtle">{result.page}</span>
                      )}
                      {result.terms.length > 0 && result.content && (
                        <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted">
                          <Highlight
                            text={snippet(result.content, result.terms)}
                            terms={result.terms}
                          />
                        </span>
                      )}
                    </span>
                    <CornerDownLeft
                      className={cn(
                        'relative z-10 mt-0.5 size-3.5 shrink-0 text-subtle transition-opacity',
                        active === index ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </button>
                )
              })}
            </ScrollArea>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
