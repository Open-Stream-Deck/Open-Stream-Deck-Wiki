import { ChevronRight, Link as LinkIcon } from 'lucide-react'
import { Children, isValidElement, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ScrollArea } from '../ui/scroll-area'

export function Steps({ children }: { children: ReactNode }) {
  return <div className="steps">{children}</div>
}

export function Step({ children }: { children: ReactNode }) {
  return <div data-step>{children}</div>
}

export function Details({
  summary,
  open,
  children,
}: {
  summary?: ReactNode
  open?: boolean
  children?: ReactNode
}) {
  return (
    <details open={open}>
      <Summary>{summary}</Summary>
      <div className="details-body [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </details>
  )
}

export function DetailsElement({ children, ...props }: ComponentProps<'details'>) {
  const nodes = Children.toArray(children)
  const summary = nodes.filter((node) => isValidElement(node) && node.type === Summary)
  const body = nodes.filter((node) => !summary.includes(node))

  return (
    <details {...props}>
      {summary}
      <div className="details-body [&>:first-child]:mt-0 [&>:last-child]:mb-0">{body}</div>
    </details>
  )
}

export function Summary({ className, children, ...props }: ComponentProps<'summary'>) {
  return (
    <summary className={className} {...props}>
      <ChevronRight className="details-chevron size-4 shrink-0 text-subtle" />
      <span className="min-w-0 flex-1">{children}</span>
    </summary>
  )
}

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <ScrollArea
      orientation="horizontal"
      containerClassName="my-6 overflow-hidden rounded-xl border"
    >
      <table className={cn('my-0', className)} {...props} />
    </ScrollArea>
  )
}

type HeadingProps = ComponentProps<'h2'> & { as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }

export function Heading({ as: Tag, id, children, className, ...props }: HeadingProps) {
  if (!id) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    )
  }

  return (
    <Tag id={id} className={cn('group/heading flex items-center gap-2', className)} {...props}>
      <span>{children}</span>
      <a
        href={`#${id}`}
        aria-label={typeof children === 'string' ? children : id}
        data-heading-anchor
        className="grid size-6 shrink-0 place-items-center rounded-md text-subtle opacity-0 transition-opacity duration-200 group-hover/heading:opacity-100 hover:text-fg focus-visible:opacity-100"
      >
        <LinkIcon className="size-3.5" />
      </a>
    </Tag>
  )
}
