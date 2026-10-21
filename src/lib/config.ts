import type { BundledTheme } from 'shiki'

export type NavLink = { title: string } & ({ href: string } | { page: string })

export type AIProvider = 'chatgpt' | 'claude' | 'perplexity'

export interface PageActions {
  copyMarkdown: boolean
  viewMarkdown: boolean
  ai: AIProvider[]
}

export type CodeThemes = {
  light: BundledTheme
  dark: BundledTheme
}

export interface WikiConfig {
  name: string
  title: string
  description: string
  url: string
  locale: string
  home: boolean
  docsRoute: string
  github?: string
  editUrl?: string
  nav: NavLink[]
  pageActions: PageActions
  codeThemes: CodeThemes
  ui: Record<
    | 'onThisPage'
    | 'search'
    | 'searchPlaceholder'
    | 'searchEmpty'
    | 'searchHint'
    | 'previous'
    | 'next'
    | 'editPage'
    | 'copy'
    | 'copied'
    | 'copyMarkdown'
    | 'viewMarkdown'
    | 'askAI'
    | 'askAIPrompt'
    | 'footnotes'
    | 'backToFootnote'
    | 'theme'
    | 'menu'
    | 'close'
    | 'zoomIn'
    | 'zoomOut'
    | 'resetZoom'
    | 'notFound'
    | 'notFoundText'
    | 'home'
    | 'openDocs'
    | 'pages'
    | 'note'
    | 'tip'
    | 'important'
    | 'warning'
    | 'caution',
    string
  >
}
