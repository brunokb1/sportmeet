import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          primary: 'bg-green-500 text-white hover:bg-green-600',
          outline: 'border-2 border-gray-200 text-gray-700 bg-transparent hover:border-gray-300',
          ghost:   'bg-transparent text-gray-600 hover:bg-gray-100',
          danger:  'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
        }[variant],
        {
          sm: 'px-4 py-2 text-xs',
          md: 'px-5 py-3 text-sm',
          lg: 'px-6 py-4 text-base',
        }[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
