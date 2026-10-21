'use client'

import config from '@config'
import type { AIProvider } from '@/lib/config'
import { ArrowUpRight, ChevronDown, Copy, LoaderCircle, Sparkles } from 'lucide-react'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'
import { absoluteUrl } from '@/lib/url'
import { ClaudeIcon, MarkdownIcon, OpenAIIcon, PerplexityIcon } from '../ui/brand-icons'

interface Provider {
  name: string
  color: string
  icon: ComponentType<{ className?: string }>
  url: (prompt: string) => string
}

const PROVIDERS: Record<AIProvider, Provider> = {
  chatgpt: {
    name: 'ChatGPT',
    color: 'var(--fg)',
    icon: OpenAIIcon,
    url: (prompt) => `https://chatgpt.com/?hints=search&q=${prompt}`,
  },
  claude: {
    name: 'Claude',
    color: '#d97757',
    icon: ClaudeIcon,
    url: (prompt) => `https://claude.ai/new?q=${prompt}`,
  },
  perplexity: {
    name: 'Perplexity',
    color: '#22b8cd',
    icon: PerplexityIcon,
    url: (prompt) => `https://www.perplexity.ai/search?q=${prompt}`,
  },
}

const spring: Transition = { type: 'spring', bounce: 0, duration: 0.35 }

const buttonClass =
  'relative inline-flex h-8 items-center gap-1.5 rounded-lg border bg-bg px-2.5 text-[13px] text-muted transition-colors duration-200 hover:border-line-strong hover:bg-surface hover:text-fg'

async function copyFrom(source: string) {
  const text = fetch(source).then((response) => response.text())

  try {
    const blob = text.then((value) => new Blob([value], { type: 'text/plain' }))
    await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })])
  } catch {
    await navigator.clipboard.writeText(await text)
  }
}

function CheckMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
      aria-hidden
    >
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

type CopyState = 'idle' | 'loading' | 'copied'

const copyIcons: Record<CopyState, ReactNode> = {
  idle: <Copy className="size-3.5" />,
  loading: <LoaderCircle className="size-3.5 animate-spin" />,
  copied: <CheckMark />,
}

function CopyMarkdown({ source }: { source: string }) {
  const [state, setState] = useState<CopyState>('idle')
  const copied = state === 'copied'

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setState('idle'), 1800)
    return () => clearTimeout(timeout)
  }, [copied])

  const label = copied ? config.ui.copied : config.ui.copyMarkdown

  function copy() {
    if (state === 'loading') return
    setState('loading')
    copyFrom(source).then(
      () => setState('copied'),
      () => setState('idle'),
    )
  }

  return (
    <motion.button
      type="button"
      layout
      transition={{ layout: spring }}
      style={{ borderRadius: 8 }}
      onClick={copy}
      aria-busy={state === 'loading'}
      className={cn(
        buttonClass,
        state === 'loading' && 'cursor-progress',
        copied &&
          'border-tip/40 bg-tip/10 text-tip hover:border-tip/50 hover:bg-tip/15 hover:text-tip',
      )}
    >
      <motion.span layout="position" className="relative grid size-3.5 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={state}
            initial={{ scale: 0.3, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.3, rotate: 90, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.45 }}
            className="grid place-items-center"
          >
            {copyIcons[state]}
          </motion.span>
        </AnimatePresence>
      </motion.span>

      <motion.span
        layout="position"
        className="relative inline-grid h-5 items-center overflow-hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            initial={{ y: 12, opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -12, opacity: 0, filter: 'blur(4px)' }}
            transition={spring}
            className="whitespace-nowrap"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  )
}

interface MenuItem {
  name: string
  href: string
  color: string
  icon: ComponentType<{ className?: string }>
}

function AskMenu({ source }: { source: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const { viewMarkdown, ai } = config.pageActions
  const prompt = encodeURIComponent(config.ui.askAIPrompt.replace('{url}', absoluteUrl(source)))

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const items: MenuItem[] = [
    ...(viewMarkdown
      ? [{ name: config.ui.viewMarkdown, href: source, color: 'var(--fg)', icon: MarkdownIcon }]
      : []),
    ...ai.map((id) => ({ ...PROVIDERS[id], href: PROVIDERS[id].url(prompt) })),
  ]

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(buttonClass, open && 'border-line-strong bg-surface text-fg')}
      >
        <Sparkles className="size-3.5" />
        {ai.length ? config.ui.askAI : config.ui.viewMarkdown}
        <ChevronDown
          className={cn(
            'size-3.5 transition-transform duration-300 ease-out-soft',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -2, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
            className="absolute top-full left-0 z-30 mt-1.5 min-w-52 origin-top-left rounded-xl border bg-elevated p-1 shadow-float"
          >
            {items.map(({ name, href, color, icon: Icon }, index) => (
              <motion.a
                key={name}
                role="menuitem"
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.03 + index * 0.035 }}
                style={{ '--brand': color } as CSSProperties}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] whitespace-nowrap text-muted transition-colors duration-200 hover:bg-surface hover:text-fg"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md border bg-bg text-subtle transition-[color,border-color,transform] duration-300 ease-out-soft group-hover:scale-105 group-hover:border-line-strong group-hover:text-(--brand)">
                  <Icon className="size-3.5" />
                </span>
                <span className="flex-1">{name}</span>
                <ArrowUpRight className="size-3.5 -translate-x-1 text-subtle opacity-0 transition-[opacity,transform,color] duration-300 ease-out-soft group-hover:translate-x-0 group-hover:text-fg group-hover:opacity-100" />
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PageActions({ source }: { source: string }) {
  const { copyMarkdown, viewMarkdown, ai } = config.pageActions
  const hasMenu = viewMarkdown || ai.length > 0
  if (!copyMarkdown && !hasMenu) return null

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {copyMarkdown && <CopyMarkdown source={source} />}
      {hasMenu && <AskMenu source={source} />}
    </div>
  )
}
