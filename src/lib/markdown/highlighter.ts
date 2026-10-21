import config from '@config'
import type { RehypeShikiCoreOptions } from '@shikijs/rehype/core'
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers'
import { createHighlighter, type Highlighter, type ShikiTransformer } from 'shiki'
import { parseMeta } from './shared'

const themes = config.codeThemes

let highlighter: Promise<Highlighter> | undefined

export function getHighlighter() {
  return (highlighter ??= createHighlighter({
    themes: [themes.light, themes.dark],
    langs: ['bash', 'json', 'ts', 'tsx', 'md'],
  }))
}

const transformerFrame: ShikiTransformer = {
  name: 'wiki:frame',
  pre(node) {
    const meta = parseMeta(this.options.meta?.__raw)

    node.properties.dataLanguage = this.options.lang
    if (typeof meta.title === 'string') node.properties.dataTitle = meta.title
    if (typeof meta.tab === 'string') node.properties.dataTab = meta.tab
    if (meta.showLineNumbers || meta.lineNumbers) node.properties.dataLineNumbers = ''
  },
}

export const shikiOptions: RehypeShikiCoreOptions = {
  themes,
  defaultColor: false,
  lazy: true,
  defaultLanguage: 'text',
  fallbackLanguage: 'text',
  inline: 'tailing-curly-colon',
  cache: new Map(),
  transformers: [
    transformerNotationDiff({ matchAlgorithm: 'v3' }),
    transformerNotationHighlight({ matchAlgorithm: 'v3' }),
    transformerNotationWordHighlight({ matchAlgorithm: 'v3' }),
    transformerNotationFocus({ matchAlgorithm: 'v3' }),
    transformerNotationErrorLevel({ matchAlgorithm: 'v3' }),
    transformerMetaHighlight(),
    transformerMetaWordHighlight(),
    transformerFrame,
  ],
}
