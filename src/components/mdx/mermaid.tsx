'use client'

import { motion } from 'motion/react'
import { useTheme } from '@/lib/theme'
import { useEffect, useId, useState } from 'react'
import { ScrollArea } from '../ui/scroll-area'

export function Mermaid({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/[^\w-]/g, '')}`
  const { resolvedTheme } = useTheme()
  const [svg, setSvg] = useState<string>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let cancelled = false

    import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: resolvedTheme === 'dark' ? 'dark' : 'neutral',
        fontFamily: 'inherit',
      })

      try {
        const result = await mermaid.render(`${id}-${resolvedTheme}`, chart)
        if (!cancelled) setSvg(result.svg)
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason))
      }
    })

    return () => {
      cancelled = true
    }
  }, [chart, id, resolvedTheme])

  if (error) {
    return (
      <pre className="my-6 scrollbar-none overflow-x-auto rounded-xl border border-caution/40 p-4 text-xs text-caution">
        {error}
      </pre>
    )
  }

  return (
    <ScrollArea
      orientation="horizontal"
      containerClassName="my-6 overflow-hidden rounded-xl border bg-code"
      className="p-5"
    >
      {svg ? (
        <motion.div
          className="mermaid-diagram"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="h-40 animate-pulse rounded-lg bg-surface" />
      )}
    </ScrollArea>
  )
}
