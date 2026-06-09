import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { fmt } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Tab = 'proximos' | 'passados' | 'criados'

const TABS: { id: Tab; label: string }[] = [
  { id: 'proximos', label: 'Próximos' },
  { id: 'passados', label: 'Passados' },
  { id: 'criados',  label: 'Criados por mim' },
]

export default function Agenda() {
  const navigate = useNavigate()
  const { myEvents } = useStore()
  const [tab, setTab] = useState<Tab>('proximos')

  const now = new Date()

  const events = useMemo(() => {
    switch (tab) {
      case 'proximos':
        return myEvents
          .filter(e => new Date(e.datetime) >= now && e.source !== 'created')
          .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
      case 'passados':
        return myEvents
          .filter(e => new Date(e.datetime) < now)
          .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
      case 'criados':
        return myEvents
          .filter(e => e.source === 'created')
          .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    }
  }, [tab, myEvents])

  const isEmpty = events.length === 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-4 pt-4 pb-0 flex-shrink-0 bg-white">
        <div className="text-lg font-black text-gray-900 mb-3">Minha agenda</div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 -mx-4 px-4 gap-0 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap -mb-px',
                tab === t.id
                  ? 'text-green-500 border-green-500'
                  : 'text-gray-400 border-transparent hover:text-gray-600',
              )}
            >
              {t.label}
              {t.id === 'proximos' && myEvents.filter(e => new Date(e.datetime) >= now && e.source !== 'created').length > 0 && (
                <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
                  {myEvents.filter(e => new Date(e.datetime) >= now && e.source !== 'created').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isEmpty ? (
          <EmptyState tab={tab} navigate={navigate} />
        ) : (
          <div className="flex flex-col gap-3">
            {events.map(ev => {
              const isPast    = new Date(ev.datetime) < now
              const spotsLeft = ev.maxParticipants - ev.participants.length

              return (
                <button
                  key={ev.id}
                  onClick={() => navigate(`/detalhes/${ev.id}`)}
                  className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-1.5 w-full" style={{ background: ev.gradient }} />
                  <div className="p-3 flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{ev.sport}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate">{ev.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">📍 {ev.local}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                          isPast ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-blue-50 text-blue-700',
                        )}>
                          {fmt.short(ev.datetime)}
                        </span>
                        {ev.source === 'created' && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Meu evento
                          </span>
                        )}
                        {ev.source !== 'created' && !isPast && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Participando
                          </span>
                        )}
                        {ev.source === 'created' && (
                          <span className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                            spotsLeft <= 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-500',
                          )}>
                            {ev.participants.length}/{ev.maxParticipants} pessoas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ tab, navigate }: { tab: Tab; navigate: ReturnType<typeof useNavigate> }) {
  const msgs: Record<Tab, { icon: string; title: string; sub: string; cta?: string; ctaTo?: string }> = {
    proximos: {
      icon:  '📅',
      title: 'Nenhum evento agendado',
      sub:   'Explore o feed e entre em eventos esportivos perto de você.',
      cta:   'Explorar feed',
      ctaTo: '/',
    },
    passados: {
      icon:  '🏁',
      title: 'Nenhum evento passado',
      sub:   'Seus eventos concluídos aparecerão aqui.',
    },
    criados: {
      icon:  '➕',
      title: 'Nenhum evento criado',
      sub:   'Que tal criar o seu próprio evento esportivo?',
      cta:   'Criar evento',
      ctaTo: '/criar',
    },
  }

  const m = msgs[tab]

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="text-5xl">{m.icon}</div>
      <div className="text-base font-bold text-gray-700">{m.title}</div>
      <p className="text-sm text-gray-500 max-w-xs">{m.sub}</p>
      {m.cta && m.ctaTo && (
        <button
          onClick={() => navigate(m.ctaTo!)}
          className="px-6 py-3 bg-green-500 text-white rounded-2xl font-bold text-sm shadow-md shadow-green-500/25 hover:bg-green-600 transition-colors"
        >
          {m.cta}
        </button>
      )}
    </div>
  )
}
