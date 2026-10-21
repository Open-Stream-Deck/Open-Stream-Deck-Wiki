import config from '@config'
import { ArrowLeft, ArrowRight, ChevronRight, SquarePen } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { DocPage } from '@/lib/source'

export function Breadcrumbs({ items }: { items: { title: string; url?: string }[] }) {
  if (!items.length) return null

  return (
    <nav
      aria-label="Breadcrumbs"
      className="mb-4 flex flex-wrap items-center gap-1 text-[13px] text-subtle"
    >
      {items.map((item, index) => (
        <span key={`${item.title}-${index}`} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="size-3.5 opacity-60" />}
          {item.url ? (
            <Link href={item.url} className="transition-colors hover:text-fg">
              {item.title}
            </Link>
          ) : (
            <span>{item.title}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

function PagerCard({ page, direction }: { page: DocPage; direction: 'previous' | 'next' }) {
  const next = direction === 'next'
  const Icon = next ? ArrowRight : ArrowLeft

  return (
    <Link
      href={page.url}
      className={cn(
        'group flex flex-col gap-1.5 rounded-xl border p-4 transition-[border-color,background-color] duration-300 hover:border-line-strong hover:bg-surface',
        next ? 'items-end text-right sm:col-start-2' : 'items-start',
      )}
    >
      <span className="flex items-center gap-1.5 text-xs text-subtle">
        {!next && (
          <Icon className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
        )}
        {next ? config.ui.next : config.ui.previous}
        {next && (
          <Icon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        )}
      </span>
      <span className="font-display text-[15px] font-medium text-fg">{page.title}</span>
    </Link>
  )
}

export function Pager({ previous, next }: { previous?: DocPage; next?: DocPage }) {
  if (!previous && !next) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {previous && <PagerCard page={previous} direction="previous" />}
      {next && <PagerCard page={next} direction="next" />}
    </div>
  )
}

export function EditLink({ page }: { page: DocPage }) {
  if (!config.editUrl) return null

  return (
    <a
      href={`${config.editUrl}/${page.file}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 text-[13px] text-subtle transition-colors hover:text-fg"
    >
      <SquarePen className="size-3.5" />
      {config.ui.editPage}
    </a>
  )
}
