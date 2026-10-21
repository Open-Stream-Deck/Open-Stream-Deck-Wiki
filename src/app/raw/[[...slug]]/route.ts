import { getPage, getSource } from '@/lib/source'
import { segments } from '@/lib/url'

interface RouteContext {
  params: Promise<{ slug?: string[] }>
}

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return getSource().pages.map((page) => ({ slug: segments(page.url) }))
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug = [] } = await params
  const page = getPage(`/${slug.map(decodeURIComponent).join('/')}`)
  if (!page) return new Response('Not found', { status: 404 })

  const heading = [`# ${page.title}`, page.description].filter(Boolean).join('\n\n')

  return new Response(`${heading}\n\n${page.body.trim()}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
