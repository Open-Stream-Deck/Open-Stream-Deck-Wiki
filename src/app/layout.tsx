import '@fontsource-variable/wix-madefor-text'
import '@fontsource-variable/wix-madefor-display'
import '@fontsource-variable/jetbrains-mono'
import 'katex/dist/katex.min.css'
import './globals.css'

import config from '@config'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { DocsShell } from '@/components/layout/docs-shell'
import { Header } from '@/components/layout/header'
import { Providers } from '@/components/providers'
import { Scrollbar } from '@/components/ui/scrollbar'
import { getSource } from '@/lib/source'
import { themeScript } from '@/lib/theme-script'

export const metadata: Metadata = {
  metadataBase: new URL(config.url),
  title: { default: config.title, template: `%s · ${config.name}` },
  description: config.description,
  icons: { icon: '/icon.svg' },
  openGraph: { siteName: config.title, type: 'website', locale: config.locale },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const { tree } = getSource()

  return (
    <html lang={config.locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers>
          <Header tree={tree} />
          <DocsShell tree={tree}>{children}</DocsShell>
        </Providers>
        <Scrollbar />
      </body>
    </html>
  )
}
