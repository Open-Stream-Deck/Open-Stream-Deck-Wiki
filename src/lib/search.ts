import type { Root, RootContent } from 'mdast'
import { toString } from 'mdast-util-to-string'
import remarkDirective from 'remark-directive'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { SKIP, visit } from 'unist-util-visit'
import { VFile } from 'vfile'
import { remarkDirectives } from './markdown/remark-directives'
import { remarkHeadings } from './markdown/remark-headings'
import { getSource, type DocPage } from './source'

export interface SearchDocument {
  id: string
  url: string
  page: string
  title: string
  content: string
}

const IGNORED = new Set(['mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression', 'html', 'yaml'])

function textOf(node: RootContent) {
  const parts: string[] = []

  visit(node, (child) => {
    if (IGNORED.has(child.type)) return SKIP
    if ('value' in child && typeof child.value === 'string') parts.push(child.value)
  })

  return parts.join(' ')
}

function parse(page: DocPage) {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDirective)
  if (page.format === 'mdx') processor.use(remarkMdx)

  const pipeline = processor.use(remarkDirectives).use(remarkEmoji).use(remarkHeadings)
  const file = new VFile({ value: page.body, path: page.file })

  return pipeline.runSync(pipeline.parse(file), file) as Root
}

function sections(page: DocPage): SearchDocument[] {
  const tree = parse(page)
  const result: SearchDocument[] = []
  let current: SearchDocument = {
    id: page.url,
    url: page.url,
    page: page.title,
    title: page.title,
    content: '',
  }

  const flush = () => {
    current.content = current.content.replace(/\s+/g, ' ').trim()
    if (current.content || current.id === page.url) result.push(current)
  }

  for (const node of tree.children) {
    const id = node.type === 'heading' ? node.data?.hProperties?.id : undefined

    if (node.type === 'heading' && node.depth <= 3 && typeof id === 'string') {
      flush()
      current = {
        id: `${page.url}#${id}`,
        url: `${page.url}#${id}`,
        page: page.title,
        title: toString(node),
        content: '',
      }
      continue
    }

    current.content += ` ${textOf(node)}`
  }

  flush()

  const [first] = result
  if (first && page.description) first.content = `${page.description} ${first.content}`.trim()

  return result
}

export function buildSearchIndex() {
  return getSource().pages.flatMap(sections)
}
