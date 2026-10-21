import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Home } from '@/components/home'
import { DocView } from '@/components/layout/doc-view'
import { getPage, getSource } from '@/lib/source'
import { docsUrl, homeEnabled, segments } from '@/lib/url'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

function toPath(slug: string[] = []) {
  return `/${slug.map(decodeURIComponent).join('/')}`
}

export const dynamicParams = false

export function generateStaticParams() {
  const params = getSource().pages.map((page) => ({ slug: segments(page.url) }))
  if (!params.some(({ slug }) => slug.length === 0)) params.push({ slug: [] })
  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = getPage(toPath((await params).slug))
  if (!page) return {}

  return {
    title: page.title,
    description: page.description,
    openGraph: { title: page.title, description: page.description },
  }
}

export default async function CatchAllPage({ params }: PageProps) {
  const path = toPath((await params).slug)
  if (path === '/' && homeEnabled) return <Home />

  const page = getPage(path)
  if (page) return <DocView page={page} />
  if (path === '/') redirect(docsUrl())

  notFound()
}
