import { mdxComponents } from '@/components/mdx'
import { ScrollArea } from '@/components/ui/scroll-area'
import { compilePage } from '@/lib/markdown/compile'
import { getBreadcrumbs, getNeighbours, type DocPage } from '@/lib/source'
import { rawUrl } from '@/lib/url'
import { PageActions } from './page-actions'
import { Breadcrumbs, EditLink, Pager } from './page-parts'
import { Reveal } from './reveal'
import { Toc } from './toc'

export async function DocView({ page }: { page: DocPage }) {
  const { Content, toc } = await compilePage(page)
  const { previous, next } = getNeighbours(page)
  const showToc = page.frontmatter.toc !== false && toc.length > 0

  return (
    <div className="flex gap-12">
      <Reveal key={page.url} className="min-w-0 flex-1 py-8 md:py-10 lg:pl-8 xl:pl-12">
        <article className="mx-auto max-w-[46rem]">
          <Breadcrumbs items={getBreadcrumbs(page)} />
          <header className="mb-10 border-b pb-8">
            <h1 className="font-display text-[2rem] leading-tight font-semibold tracking-[-0.035em] text-balance md:text-[2.4rem]">
              {page.title}
            </h1>
            {page.description && (
              <p className="mt-3 text-[1.05rem] leading-relaxed text-pretty text-muted">
                {page.description}
              </p>
            )}
            <PageActions source={rawUrl(page.url)} />
          </header>

          <div className="prose">
            <Content components={mdxComponents} />
          </div>

          <footer data-article-end className="mt-16 flex flex-col gap-6 border-t pt-6">
            <EditLink page={page} />
            <Pager previous={previous} next={next} />
          </footer>
        </article>
      </Reveal>

      {showToc && (
        <aside className="sticky top-header hidden h-[calc(100dvh-var(--spacing-header))] w-56 shrink-0 xl:block">
          <ScrollArea containerClassName="h-full" className="h-full mask-fade-y py-10">
            <Toc items={toc} />
          </ScrollArea>
        </aside>
      )}
    </div>
  )
}
