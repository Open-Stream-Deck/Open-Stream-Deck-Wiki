'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import type { TreeNode } from '@/lib/source'
import { isDocsPath } from '@/lib/url'
import { Sidebar } from './sidebar'

export function DocsShell({ tree, children }: { tree: TreeNode[]; children: ReactNode }) {
  const pathname = usePathname()
  if (!isDocsPath(pathname)) return children

  return (
    <div className="mx-auto flex max-w-[1440px] px-4 md:px-6">
      <Sidebar tree={tree} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
