import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ScreenHeaderProps {
  title: string
  showBack?: boolean
  backTo?: string
  action?: ReactNode
  className?: string
}

export function ScreenHeader({ title, showBack, backTo, action, className }: ScreenHeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  return (
    <header className={cn(
      'flex items-center h-14 px-4 flex-shrink-0',
      'bg-white border-b border-gray-100',
      className,
    )}>
      {showBack && (
        <button
          onClick={handleBack}
          className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Voltar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      <h1 className="flex-1 text-base font-bold text-gray-900 truncate ml-1">{title}</h1>
      {action}
    </header>
  )
}
