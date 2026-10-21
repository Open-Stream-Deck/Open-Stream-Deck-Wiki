import config from '@config'
import Link from 'next/link'
import { Reveal } from '@/components/layout/reveal'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Reveal>
        <p className="font-mono text-sm text-subtle">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em]">
          {config.ui.notFound}
        </h1>
        <p className="mt-3 text-muted">{config.ui.notFoundText}</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-10 items-center rounded-xl border px-4 text-sm font-medium transition-colors hover:border-line-strong hover:bg-surface"
        >
          {config.ui.home}
        </Link>
      </Reveal>
    </main>
  )
}
