'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Cards({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('my-6 grid gap-3 sm:grid-cols-2', className)}>{children}</div>
}

interface CardProps {
  title: ReactNode
  href?: string
  icon?: ReactNode
  description?: ReactNode
  children?: ReactNode
}

function track(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--x', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--y', `${event.clientY - rect.top}px`)
}

export function Card({ title, href, icon, description, children }: CardProps) {
  const external = href?.startsWith('http')

  const body = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            'radial-gradient(22rem circle at var(--x) var(--y), color-mix(in oklab, var(--fg) 6%, transparent), transparent 70%)',
        }}
      />
      <span className="relative flex items-start gap-3">
        {icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-surface text-muted transition-colors group-hover/card:text-fg [&_svg]:size-4">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 font-display text-[15px] font-semibold text-fg">
            {title}
            {href && (
              <ArrowUpRight className="size-3.5 text-subtle opacity-0 transition-all duration-300 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 group-hover/card:opacity-100" />
            )}
          </span>
          {(description ?? children) && (
            <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">
              {description ?? children}
            </span>
          )}
        </span>
      </span>
    </>
  )

  const className =
    'group/card relative block overflow-hidden rounded-xl border bg-bg p-4 no-underline transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float'

  if (!href) {
    return (
      <div className={className} onMouseMove={track}>
        {body}
      </div>
    )
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        data-card
        className={className}
        onMouseMove={track}
      >
        {body}
      </a>
    )
  }

  return (
    <Link href={href} data-card className={className} onMouseMove={track}>
      {body}
    </Link>
  )
}
