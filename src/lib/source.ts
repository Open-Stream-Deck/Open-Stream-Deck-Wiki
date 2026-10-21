import fs from 'node:fs'
import path from 'node:path'
import { cache } from 'react'
import matter from 'gray-matter'
import config from '@config'
import { docsUrl } from './url'

export type DocFormat = 'md' | 'mdx'

export interface DocPage {
  url: string
  file: string
  format: DocFormat
  title: string
  description?: string
  frontmatter: Record<string, unknown>
  body: string
}

export type TreeNode =
  | { type: 'page'; title: string; url: string }
  | { type: 'separator'; title: string }
  | {
      type: 'folder'
      title: string
      url?: string
      description?: string
      defaultOpen: boolean
      children: TreeNode[]
    }

export interface Source {
  pages: DocPage[]
  tree: TreeNode[]
  ordered: DocPage[]
}

interface FolderMeta {
  title?: string
  description?: string
  pages?: string[]
  defaultOpen?: boolean
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs')
const EXTENSIONS = ['.mdx', '.md']
const REST = '...'
const SEPARATOR = /^---(.+)---$/

function readMeta(dir: string): FolderMeta {
  const file = path.join(dir, 'meta.json')
  if (!fs.existsSync(file)) return {}
  return JSON.parse(fs.readFileSync(file, 'utf8')) as FolderMeta
}

function humanize(name: string) {
  const words = name
    .replace(/^\d+[-_.]/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function extractTitle(body: string) {
  const match = body.match(/^\s*#\s+(.+?)\s*#*\s*$/m)
  if (!match || body.slice(0, match.index).trim()) return { title: undefined, body }
  return { title: match[1], body: body.slice((match.index ?? 0) + match[0].length) }
}

function readPage(absolute: string, slug: string[]): DocPage {
  const raw = fs.readFileSync(absolute, 'utf8')
  const { data, content } = matter(raw)
  const heading = extractTitle(content)
  const file = path.relative(CONTENT_DIR, absolute).split(path.sep).join('/')
  const fallback = slug.at(-1) ?? config.name

  return {
    url: docsUrl(slug),
    file,
    format: absolute.endsWith('.mdx') ? 'mdx' : 'md',
    title: String(data.title ?? heading.title ?? humanize(fallback)),
    description: typeof data.description === 'string' ? data.description : undefined,
    frontmatter: data,
    body: data.title ? content : heading.body,
  }
}

function listEntries(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const names = new Map<string, string>()

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue
    if (entry.isDirectory()) {
      names.set(entry.name, path.join(dir, entry.name))
      continue
    }

    const ext = path.extname(entry.name)
    if (!EXTENSIONS.includes(ext)) continue
    names.set(path.basename(entry.name, ext), path.join(dir, entry.name))
  }

  return names
}

function orderNames(names: string[], meta: FolderMeta) {
  const sorted = [...names].sort((a, b) => {
    if (a === 'index') return -1
    if (b === 'index') return 1
    return a.localeCompare(b, config.locale, { numeric: true })
  })
  if (!meta.pages) return sorted

  const listed = new Set(meta.pages.filter((name) => names.includes(name)))
  const rest = sorted.filter((name) => !listed.has(name))
  const order = meta.pages.flatMap((name) => (name === REST ? rest : [name]))

  return meta.pages.includes(REST) ? order : [...order, ...rest]
}

function walk(dir: string, slug: string[], pages: DocPage[]): TreeNode[] {
  const meta = readMeta(dir)
  const entries = listEntries(dir)
  const nodes: TreeNode[] = []

  for (const name of orderNames([...entries.keys()], meta)) {
    const separator = name.match(SEPARATOR)
    if (separator?.[1]) {
      nodes.push({ type: 'separator', title: separator[1].trim() })
      continue
    }

    const absolute = entries.get(name)
    if (!absolute) continue

    if (fs.statSync(absolute).isDirectory()) {
      const childSlug = [...slug, name]
      const childMeta = readMeta(absolute)
      const children = walk(absolute, childSlug, pages)
      const index = pages.find((page) => page.url === docsUrl(childSlug))

      nodes.push({
        type: 'folder',
        title: childMeta.title ?? index?.title ?? humanize(name),
        url: index?.url,
        description: childMeta.description ?? index?.description,
        defaultOpen: childMeta.defaultOpen ?? false,
        children: children.filter((node) => node.type !== 'page' || node.url !== index?.url),
      })
      continue
    }

    const page = readPage(absolute, name === 'index' ? slug : [...slug, name])
    pages.push(page)
    nodes.push({ type: 'page', title: page.title, url: page.url })
  }

  return nodes
}

function flatten(nodes: TreeNode[], pages: Map<string, DocPage>): DocPage[] {
  return nodes.flatMap((node) => {
    if (node.type === 'separator') return []
    const own = node.url ? pages.get(node.url) : undefined
    const nested = node.type === 'folder' ? flatten(node.children, pages) : []
    return own ? [own, ...nested] : nested
  })
}

function loadSource(): Source {
  const pages: DocPage[] = []
  const tree = fs.existsSync(CONTENT_DIR) ? walk(CONTENT_DIR, [], pages) : []
  const byUrl = new Map(pages.map((page) => [page.url, page]))
  return { pages, tree, ordered: flatten(tree, byUrl) }
}

let memo: Source | undefined

export const getSource = cache((): Source => {
  if (process.env.NODE_ENV === 'development') return loadSource()
  return (memo ??= loadSource())
})

export function getPage(url: string) {
  return getSource().pages.find((page) => page.url === url)
}

export function getNeighbours(page: DocPage) {
  const { ordered } = getSource()
  const index = ordered.findIndex((item) => item.url === page.url)
  return { previous: ordered[index - 1], next: ordered[index + 1] }
}

export function getBreadcrumbs(page: DocPage) {
  const trail: { title: string; url?: string }[] = []

  function search(nodes: TreeNode[], parents: typeof trail): boolean {
    for (const node of nodes) {
      if (node.type === 'separator') continue
      if (node.url === page.url) {
        trail.push(...parents)
        return true
      }
      if (node.type === 'folder' && search(node.children, [...parents, node])) return true
    }
    return false
  }

  search(getSource().tree, [])
  return trail
}
