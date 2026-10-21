import config from '@config'
import {
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import type { CalloutType } from '@/lib/markdown/shared'

const ICONS: Record<CalloutType, LucideIcon> = {
  note: Info,
  tip: Lightbulb,
  important: MessageSquareWarning,
  warning: TriangleAlert,
  caution: OctagonAlert,
}

interface CalloutProps {
  type?: CalloutType
  title?: ReactNode
  children?: ReactNode
}

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const kind = type in ICONS ? type : 'note'
  const Icon = ICONS[kind]

  return (
    <div
      role="note"
      style={{ '--callout': `var(--${kind})` } as CSSProperties}
      className="my-6 flex gap-3 rounded-xl border border-[color-mix(in_oklab,var(--callout)_28%,var(--line))] bg-[color-mix(in_oklab,var(--callout)_6%,var(--bg))] px-4 py-3.5 text-[0.94em]"
    >
      <Icon className="mt-[0.3em] size-4 shrink-0 text-(--callout)" />
      <div className="min-w-0 flex-1">
        <p className="my-0 font-medium text-(--callout)">{title ?? config.ui[kind]}</p>
        {children && (
          <div className="mt-1 [&>*]:my-2.5 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
