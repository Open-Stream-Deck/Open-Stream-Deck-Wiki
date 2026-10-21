import type { TreeNode } from '@/lib/source'
import { ScrollArea } from '../ui/scroll-area'
import { Tree } from './sidebar-tree'

export function Sidebar({ tree }: { tree: TreeNode[] }) {
  return (
    <aside className="sticky top-header hidden h-[calc(100dvh-var(--spacing-header))] w-[17rem] shrink-0 lg:block">
      <ScrollArea containerClassName="h-full" className="h-full mask-fade-y py-7 pr-5 pl-1">
        <nav>
          <Tree nodes={tree} />
        </nav>
      </ScrollArea>
    </aside>
  )
}
