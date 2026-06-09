import { cn } from '@/lib/utils'

interface AvatarProps {
  initial: string
  colorClass: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  name?: string
}

const sizeMap: Record<string, string> = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-2xl',
}

export function Avatar({ initial, colorClass, size = 'sm', className, name }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold flex-shrink-0',
        colorClass,
        sizeMap[size] ?? sizeMap.sm,
        className,
      )}
      title={name}
      aria-label={name}
    >
      {initial}
    </div>
  )
}

interface AvatarRowProps {
  participants: { i: string; c: string; name: string }[]
  max?: number
}

export function AvatarRow({ participants, max = 5 }: AvatarRowProps) {
  const visible = participants.slice(0, max)
  const extra   = participants.length - max

  return (
    <div className="flex -space-x-2">
      {visible.map((p, idx) => (
        <Avatar
          key={idx}
          initial={p.i}
          colorClass={p.c}
          size="xs"
          name={p.name}
          className="ring-2 ring-white"
        />
      ))}
      {extra > 0 && (
        <div className="w-7 h-7 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-gray-500">
          +{extra}
        </div>
      )}
    </div>
  )
}
