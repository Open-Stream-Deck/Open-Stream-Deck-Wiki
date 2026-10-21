import config from '@config'
import { cn } from '@/lib/cn'

export function Logo({ className }: { className?: string }) {
  const [first = '', ...rest] = config.name.split(' ')

  return (
    <span className={cn('text-[15px] whitespace-nowrap text-muted', className)}>
      <b className="font-semibold text-fg">{first}</b>
      {rest.length > 0 && ` ${rest.join(' ')}`}
    </span>
  )
}
