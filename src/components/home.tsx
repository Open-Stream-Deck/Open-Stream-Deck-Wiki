import config from '@config'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from './layout/reveal'
import { Card } from './mdx/cards'
import { GitHubIcon } from './ui/icons'
import { getSource, type TreeNode } from '@/lib/source'
import { docsUrl } from '@/lib/url'

function countPages(node: TreeNode): number {
  if (node.type === 'separator') return 0
  if (node.type === 'page') return 1
  return (node.url ? 1 : 0) + node.children.reduce((sum, child) => sum + countPages(child), 0)
}

function firstUrl(node: TreeNode): string | undefined {
  if (node.type === 'separator') return undefined
  if (node.url) return node.url
  return node.type === 'folder' ? node.children.map(firstUrl).find(Boolean) : undefined
}

function sections(tree: TreeNode[]) {
  return tree
    .filter((node) => node.type === 'folder')
    .map((node) => ({
      title: node.title,
      url: firstUrl(node),
      description: node.description ?? `${countPages(node)} ${config.ui.pages}`,
    }))
}

export function Home() {
  const { tree } = getSource()

  return (
    <main className="relative flex min-h-[calc(100dvh-var(--spacing-header))] flex-col justify-center overflow-hidden py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] [background-image:radial-gradient(var(--line-strong)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,#000,transparent)] [background-size:22px_22px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-18rem] left-1/2 h-[32rem] w-[60rem] -translate-x-1/2 rounded-full bg-fg/[0.045] blur-3xl"
      />

      <section className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <Reveal>
          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
            {config.title}
          </h1>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-pretty text-muted">
            {config.description}
          </p>
        </Reveal>
        <Reveal delay={0.12} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={docsUrl()}
            className="group inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-accent-fg transition-transform duration-300 hover:-translate-y-0.5"
          >
            {config.ui.openDocs}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          {config.github && (
            <a
              href={config.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl border bg-bg px-4 text-sm font-medium transition-colors hover:border-line-strong hover:bg-surface"
            >
              <GitHubIcon className="size-4" />
              GitHub
            </a>
          )}
        </Reveal>
      </section>

      <section className="relative mx-auto mt-16 w-full max-w-5xl px-4 md:px-6">
        <Reveal delay={0.18} className="flex flex-wrap justify-center gap-3">
          {sections(tree).map((section) => (
            <div
              key={section.title}
              className="w-full sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-1.5rem)/3)] [&>*]:h-full"
            >
              <Card title={section.title} href={section.url} description={section.description} />
            </div>
          ))}
        </Reveal>
      </section>
    </main>
  )
}
