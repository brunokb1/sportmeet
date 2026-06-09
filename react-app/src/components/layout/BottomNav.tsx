import { NavLink } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const navItems = [
  {
    to: '/',
    label: 'Início',
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3z"/>
      </svg>
    ),
  },
  {
    to: '/buscar',
    label: 'Buscar',
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  { to: '/criar', label: '', icon: null, isCreate: true },
  {
    to: '/agenda',
    label: 'Agenda',
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    to: '/perfil',
    label: 'Perfil',
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export function BottomNav() {
  const pendingCount = useStore(s => s.getPendingCount())

  return (
    <nav className={cn(
      'bottom-nav flex items-stretch',
      'bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,.06)]',
    )}>
      {navItems.map(item => {
        if (item.isCreate) {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex-1 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 text-white text-2xl font-light leading-none -mt-5">
                +
              </div>
            </NavLink>
          )
        }

        const showBadge = item.to === '/perfil' && pendingCount > 0

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 text-[10px] font-semibold transition-colors relative',
                isActive ? 'text-green-500' : 'text-gray-400',
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
            {showBadge && (
              <span className="absolute top-1.5 right-1/4 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
