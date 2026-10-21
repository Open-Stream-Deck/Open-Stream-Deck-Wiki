'use client'

import config from '@config'
import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { docsUrl, navHref } from '@/lib/url'
import type { TreeNode } from '@/lib/source'
import { SearchButton, SearchIconButton } from '../search/search-button'
import { GitHubIcon } from '../ui/icons'
import { Logo } from '../ui/logo'
import { MobileNav } from './mobile-nav'
import { ThemeToggle } from './theme-toggle'

function isActive(pathname: string, href: string) {
  if (href === docsUrl() || href === '/') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Header({ tree }: { tree?: TreeNode[] }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-header border-b transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled ? 'border-line bg-bg/80 backdrop-blur-xl' : 'border-transparent bg-bg',
      )}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 md:px-6 lg:gap-6">
        <Link
          href="/"
          aria-label={config.name}
          className="shrink-0 transition-opacity duration-300 ease-out-soft hover:opacity-80"
        >
          <Logo />
        </Link>

        <nav className="isolate hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
          {config.nav.map((link) => {
            const href = navHref(link)

            return (
              <Link
                key={href}
                href={href}
                onMouseEnter={() => setHovered(href)}
                className={cn(
                  'relative px-3 py-1.5 text-sm transition-colors',
                  isActive(pathname, href) ? 'text-fg' : 'text-muted hover:text-fg',
                )}
              >
                {hovered === href && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-lg bg-surface"
                    transition={{ duration: 0.25 }}
                  />
                )}
                <span className="relative z-10">{link.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-1">
          <SearchButton className="mr-2 hidden min-w-0 md:flex md:w-44 lg:w-60" />
          <div className="md:hidden">
            <SearchIconButton />
          </div>
          <ThemeToggle />
          {config.github && (
            <a
              href={config.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hidden size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-fg sm:grid"
            >
              <GitHubIcon className="size-[17px]" />
            </a>
          )}
          <MobileNav tree={tree} />
        </div>
      </div>
    </header>
  )
}
