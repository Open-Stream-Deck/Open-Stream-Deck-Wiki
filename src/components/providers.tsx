'use client'

import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { SearchProvider } from './search/search-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
      <SearchProvider>{children}</SearchProvider>
    </MotionConfig>
  )
}
