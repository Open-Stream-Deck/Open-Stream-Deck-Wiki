'use client'

import config from '@config'
import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from '@/lib/theme'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const Icon = isDark ? Moon : Sun

  return (
    <button
      type="button"
      aria-label={config.ui.theme}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative grid size-9 place-items-center overflow-hidden rounded-lg text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={resolvedTheme ?? 'pending'}
          initial={{ y: 14, rotate: -60, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 60, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.45 }}
        >
          <Icon className="size-[17px]" />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
