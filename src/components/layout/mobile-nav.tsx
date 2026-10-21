'use client'

import config from '@config'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TreeNode } from '@/lib/source'
import { navHref } from '@/lib/url'
import { useMounted } from '@/lib/use-mounted'
import { ScrollArea } from '../ui/scroll-area'
import { Tree } from './sidebar-tree'

export function MobileNav({ tree }: { tree?: TreeNode[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const mounted = useMounted()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const { overflow } = document.body.style
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label={config.ui.menu}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-fg lg:hidden"
      >
        <Menu className="size-[18px]" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <motion.div
                  className="absolute inset-0 bg-overlay backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                />
                <motion.aside
                  className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col border-l bg-bg shadow-float"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                >
                  <div className="flex h-header items-center justify-between border-b px-4">
                    <span className="font-display text-sm font-semibold">{config.ui.menu}</span>
                    <button
                      type="button"
                      aria-label={config.ui.close}
                      onClick={() => setOpen(false)}
                      className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface hover:text-fg"
                    >
                      <X className="size-[18px]" />
                    </button>
                  </div>

                  <ScrollArea containerClassName="min-h-0 flex-1" className="h-full p-3">
                    <ul className="mb-4 flex flex-col gap-px border-b pb-4">
                      {config.nav.map((link) => (
                        <li key={navHref(link)}>
                          <Link
                            href={navHref(link)}
                            className="flex h-9 items-center rounded-lg px-2.5 text-sm text-muted hover:bg-surface hover:text-fg"
                          >
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {tree && <Tree nodes={tree} onNavigate={() => setOpen(false)} />}
                  </ScrollArea>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
