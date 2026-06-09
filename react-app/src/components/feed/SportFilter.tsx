import { cn } from '@/lib/utils'

const SPORTS = [
  { slug: 'futebol',    emoji: '⚽', label: 'Futebol' },
  { slug: 'corrida',    emoji: '🏃', label: 'Corrida' },
  { slug: 'basquete',   emoji: '🏀', label: 'Basquete' },
  { slug: 'tênis',      emoji: '🎾', label: 'Tênis' },
  { slug: 'natação',    emoji: '🏊', label: 'Natação' },
  { slug: 'vôlei',      emoji: '🏐', label: 'Vôlei' },
  { slug: 'ciclismo',   emoji: '🚴', label: 'Ciclismo' },
  { slug: 'yoga',       emoji: '🧘', label: 'Yoga' },
  { slug: 'escalada',   emoji: '🧗', label: 'Escalada' },
  { slug: 'capoeira',   emoji: '🥋', label: 'Capoeira' },
  { slug: 'crossfit',   emoji: '🏋️', label: 'Crossfit' },
  { slug: 'handebol',   emoji: '🤾', label: 'Handebol' },
]

interface SportFilterProps {
  active: string | null
  onChange: (slug: string | null) => void
}

export function SportFilter({ active, onChange }: SportFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2 -mx-0">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
          active === null
            ? 'bg-green-500 text-white border-green-500'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
        )}
      >
        ✨ Todos
      </button>
      {SPORTS.map(s => (
        <button
          key={s.slug}
          onClick={() => onChange(active === s.slug ? null : s.slug)}
          className={cn(
            'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
            active === s.slug
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
          )}
        >
          {s.emoji} {s.label}
        </button>
      ))}
    </div>
  )
}
