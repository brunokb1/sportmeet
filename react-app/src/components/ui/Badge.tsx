import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'blue' | 'orange' | 'gray' | 'red'
  className?: string
}

export function Badge({ children, variant = 'green', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold',
        {
          green:  'bg-green-100 text-green-800',
          blue:   'bg-blue-100 text-blue-800',
          orange: 'bg-orange-100 text-orange-800',
          gray:   'bg-gray-100 text-gray-600 border border-gray-200',
          red:    'bg-red-100 text-red-700',
        }[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
