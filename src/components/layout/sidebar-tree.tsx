'use client'

import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { TreeNode } from '@/lib/source'

type FolderNode = Extract<TreeNode, { type: 'folder' }>

interface TreeProps {
  nodes: TreeNode[]
  depth?: number
  onNavigate?: () => void
}

function contains(node: TreeNode, pathname: string): boolean {
  if (node.type === 'separator') return false
  if (node.url === pathname) return true
  return node.type === 'folder' && node.children.some((child) => contains(child, pathname))
}

const itemClass =
  'relative flex min-h-8 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13.5px] leading-snug transition-colors'

function ActiveBackground({ active }: { active: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {active && (
        <motion.span
          key="active"
          className="absolute inset-0 rounded-lg border border-line bg-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  )
}

function Item({ title, url, onNavigate }: { title: string; url: string; onNavigate?: () => void }) {
  const active = usePathname() === url

  return (
    <Link
      href={url}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        itemClass,
        active ? 'font-medium text-fg' : 'text-muted hover:bg-surface/70 hover:text-fg',
      )}
    >
      <ActiveBackground active={active} />
      <span className="relative z-10">{title}</span>
    </Link>
  )
}

function Folder({
  node,
  depth,
  onNavigate,
}: {
  node: FolderNode
  depth: number
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const inside = contains(node, pathname)
  const [open, setOpen] = useState(node.defaultOpen || inside)
  const active = node.url === pathname

  useEffect(() => {
    if (inside) setOpen(true)
  }, [inside])

  const chevron = (
    <ChevronRight
      className={cn(
        'relative z-10 size-3.5 shrink-0 text-subtle transition-transform duration-300 ease-out-soft',
        open && 'rotate-90',
      )}
    />
  )

  return (
    <li>
      {node.url ? (
        <div className="relative flex items-center">
          <Link
            href={node.url}
            onClick={() => {
              setOpen(true)
              onNavigate?.()
            }}
            aria-current={active ? 'page' : undefined}
            className={cn(
              itemClass,
              'pr-9',
              active
                ? 'font-medium text-fg'
                : inside
                  ? 'text-fg'
                  : 'text-muted hover:bg-surface/70 hover:text-fg',
            )}
          >
            <ActiveBackground active={active} />
            <span className="relative z-10">{node.title}</span>
          </Link>
          <button
            type="button"
            aria-label={node.title}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="absolute right-0.5 z-10 grid size-7 place-items-center rounded-md hover:bg-line/60"
          >
            {chevron}
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            itemClass,
            'justify-between',
            inside ? 'text-fg' : 'text-muted hover:bg-surface/70 hover:text-fg',
          )}
        >
          <span className="relative z-10">{node.title}</span>
          {chevron}
        </button>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="relative ml-3.5 border-l py-1 pl-2">
              <Tree nodes={node.children} depth={depth + 1} onNavigate={onNavigate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export function Tree({ nodes, depth = 0, onNavigate }: TreeProps) {
  return (
    <ul className="isolate flex flex-col gap-px">
      {nodes.map((node, index) => {
        if (node.type === 'separator') {
          return (
            <li
              key={`separator-${index}`}
              className={cn(
                'relative z-10 px-2.5 pb-1.5 font-display text-xs font-semibold tracking-wide text-fg',
                index > 0 && 'mt-5',
              )}
            >
              {node.title}
            </li>
          )
        }
        if (node.type === 'folder') {
          return (
            <Folder
              key={node.url ?? `${node.title}-${index}`}
              node={node}
              depth={depth}
              onNavigate={onNavigate}
            />
          )
        }
        return (
          <li key={node.url}>
            <Item title={node.title} url={node.url} onNavigate={onNavigate} />
          </li>
        )
      })}
    </ul>
  )
}
