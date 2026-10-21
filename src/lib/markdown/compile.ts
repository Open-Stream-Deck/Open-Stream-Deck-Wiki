import { evaluate, type EvaluateOptions } from '@mdx-js/mdx'
import rehypeShiki from '@shikijs/rehype/core'
import config from '@config'
import type { MDXContent } from 'mdx/types'
import * as runtime from 'react/jsx-runtime'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkDirective from 'remark-directive'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import type { Pluggable, PluggableList } from 'unified'
import { VFile } from 'vfile'
import type { DocPage } from '../source'
import { getHighlighter, shikiOptions } from './highlighter'
import { rehypeCodeMeta, rehypeComponents } from './rehype-components'
import { remarkAlerts } from './remark-alerts'
import { remarkCode } from './remark-code'
import { remarkDirectives } from './remark-directives'
import { remarkHeadings, type TocItem } from './remark-headings'
import { remarkLinks } from './remark-links'

export type { TocItem }

const MDX_NODES = [
  'mdxFlowExpression',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxTextExpression',
  'mdxjsEsm',
]

const raw: Pluggable = [rehypeRaw, { passThrough: MDX_NODES }]

export interface CompiledPage {
  Content: MDXContent
  toc: TocItem[]
}

export async function compilePage(page: DocPage): Promise<CompiledPage> {
  const highlighter = await getHighlighter()
  const file = new VFile({ value: page.body, path: page.file })

  const remarkPlugins: PluggableList = [
    remarkGfm,
    remarkMath,
    remarkDirective,
    remarkDirectives,
    remarkAlerts,
    remarkEmoji,
    remarkCode,
    remarkLinks,
    remarkHeadings,
  ]

  const rehypePlugins: PluggableList = [
    ...(page.format === 'md' ? [raw] : []),
    rehypeComponents,
    rehypeKatex,
    rehypeCodeMeta,
    [rehypeShiki, highlighter, shikiOptions],
  ]

  const options: EvaluateOptions = {
    ...runtime,
    format: page.format,
    remarkPlugins,
    rehypePlugins,
    remarkRehypeOptions: {
      footnoteLabel: config.ui.footnotes,
      footnoteBackLabel: config.ui.backToFootnote,
    },
  }

  const { default: Content } = await evaluate(file, options)

  return { Content, toc: file.data.toc ?? [] }
}
