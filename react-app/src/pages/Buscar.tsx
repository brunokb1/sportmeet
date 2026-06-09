import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEARCH_POOL, FEED_POOL } from '@/data/events'
import { fmt } from '@/lib/utils'

const ALL_SEARCH = [...SEARCH_POOL, ...FEED_POOL]

const SPORT_FILTERS = [
  { slug: 'todos',     emoji: '🏅', label: 'Todos'    },
  { slug: 'futebol',   emoji: '⚽', label: 'Futebol'  },
  { slug: 'corrida',   emoji: '🏃', label: 'Corrida'  },
  { slug: 'basquete',  emoji: '🏀', label: 'Basquete' },
  { slug: 'tênis',     emoji: '🎾', label: 'Tênis'    },
  { slug: 'natação',   emoji: '🏊', label: 'Natação'  },
  { slug: 'vôlei',     emoji: '🏐', label: 'Vôlei'    },
  { slug: 'ciclismo',  emoji: '🚴', label: 'Ciclismo' },
  { slug: 'yoga',      emoji: '🧘', label: 'Yoga'     },
]

export default function Buscar() {
  const navigate    = useNavigate()
  const [query, setQuery]   = useState('')
  const [sport, setSport]   = useState('todos')

  const results = useMemo(() => {
    let pool = ALL_SEARCH
    if (sport !== 'todos') pool = pool.filter(e => e.sportSlug === sport)
    if (query.trim()) {
      const q = query.toLowerCase()
      pool = pool.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.local.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.createdBy.toLowerCase().includes(q) ||
        e.sportSlug.toLowerCase().includes(q)
      )
    }
    return pool
  }, [query, sport])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 flex-shrink-0 bg-white">
        <div className="text-lg font-black text-gray-900 mb-3">Buscar eventos</div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Esporte, local, organizador..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:bg-white transition-colors"
          />
        </div>
      </header>

      {/* Sport chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2 border-b border-gray-100 flex-shrink-0">
        {SPORT_FILTERS.map(s => (
          <button
            key={s.slug}
            onClick={() => setSport(s.slug)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              sport === s.slug
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="text-4xl">🔍</div>
            <div className="text-base font-bold text-gray-700">Nenhum resultado</div>
            <p className="text-sm text-gray-500">Tente outro esporte ou local</p>
          </div>
        ) : (
          results.map(ev => {
            const spotsLeft = ev.maxParticipants - ev.participants.length
            return (
              <button
                key={ev.id}
                onClick={() => navigate(`/detalhes/${ev.id}`)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Color strip */}
                <div className="h-1.5 w-full" style={{ background: ev.gradient }} />

                <div className="p-3 flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{ev.sport}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{ev.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">📍 {ev.local}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {fmt.short(ev.datetime)}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        spotsLeft <= 0 ? 'bg-red-50 text-red-600' :
                        spotsLeft <= 2 ? 'bg-orange-50 text-orange-600' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {spotsLeft <= 0 ? 'Lotado' : `${spotsLeft} vaga${spotsLeft > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
