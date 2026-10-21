'use client'

import config from '@config'
import { Check, Copy } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'
import { Scrollbar } from '../ui/scrollbar'

function CopyButton({
  target,
  className,
}: {
  target: () => HTMLElement | null
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timeout)
  }, [copied])

  const copy = async () => {
    const text = target()?.textContent ?? ''
    await navigator.clipboard.writeText(text.replace(/\n$/, ''))
    setCopied(true)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? config.ui.copied : config.ui.copy}
      className={cn(
        'grid size-7 place-items-center rounded-md text-subtle transition-[color,background-color,opacity] hover:bg-surface hover:text-fg',
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? 'done' : 'idle'}
          initial={{ scale: 0.4, opacity: 0, filter: 'blur(2px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ scale: 0.4, opacity: 0, filter: 'blur(2px)' }}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.35 }}
        >
          {copied ? <Check className="size-3.5 text-tip" /> : <Copy className="size-3.5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

interface PreProps extends ComponentProps<'pre'> {
  'data-title'?: string
  'data-language'?: string
  'data-tab'?: string
}

export function Pre({ className, style, children, ...props }: PreProps) {
  const ref = useRef<HTMLPreElement>(null)
  const title = props['data-title']
  const language = props['data-language']
  const target = () => ref.current?.querySelector('code') ?? null

  return (
    <figure
      data-code
      className="group/code relative my-6 overflow-hidden rounded-xl border bg-code"
    >
      {title && (
        <figcaption className="flex h-10 items-center gap-2 border-b bg-surface/50 pr-1.5 pl-4 text-[13px] text-muted">
          <span className="truncate font-mono">{title}</span>
          {language && language !== 'text' && (
            <span className="ml-auto font-mono text-[11px] text-subtle uppercase">{language}</span>
          )}
          <CopyButton
            target={target}
            className={language && language !== 'text' ? '' : 'ml-auto'}
          />
        </figcaption>
      )}
      <pre
        ref={ref}
        className={cn('scrollbar-none overflow-x-auto', className)}
        style={style}
        {...props}
      >
        {children}
      </pre>
      <Scrollbar target={ref} orientation="horizontal" />
      {!title && (
        <CopyButton
          target={target}
          className="absolute top-2 right-2 bg-code opacity-0 group-hover/code:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        />
      )}
    </figure>
  )
}
