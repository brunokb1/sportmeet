import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { SwipeCard } from '@/components/feed/SwipeCard'
import { SportFilter } from '@/components/feed/SportFilter'
import type { SportEvent } from '@/types'

const VISIBLE_CARDS = 3

export default function Feed() {
  const { user, getRecommendedFeed, markRejected, getPendingCount } = useStore()
  const pendingCount = getPendingCount()

  const [sportFilter, setSportFilter] = useState<string | null>(null)
  const [queue, setQueue]             = useState<(SportEvent & { _reason?: string })[]>([])
  const queueRef = useRef(queue)
  queueRef.current = queue

  /* Build/reset queue */
  const buildQueue = useCallback((filter: string | null) => {
    setQueue(getRecommendedFeed(filter))
  }, [getRecommendedFeed])

  useEffect(() => { buildQueue(sportFilter) }, [sportFilter]) // eslint-disable-line

  const handleReject = useCallback((ev: SportEvent) => {
    markRejected(ev)
    setQueue(q => q.filter(c => c.id !== ev.id))
  }, [markRejected])

  const handleAccept = useCallback((ev: SportEvent) => {
    setQueue(q => q.filter(c => c.id !== ev.id))
  }, [])

  const handleSportChange = (slug: string | null) => {
    setSportFilter(slug)
  }

  const visibleCards = queue.slice(0, VISIBLE_CARDS)
  const isEmpty = queue.length === 0

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bem-vindo</div>
          <div className="text-base font-black text-gray-900">
            Sport<span className="text-green-500">Meet</span>
          </div>
        </div>
        <Link
          to="/notificacoes"
          className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-600">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          {pendingCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </Link>
      </header>

      {/* Sport filter */}
      <div className="flex-shrink-0 border-b border-gray-100">
        <SportFilter active={sportFilter} onChange={handleSportChange} />
      </div>

      {/* Card area */}
      <div className="flex-1 relative overflow-hidden px-4 py-4">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="text-5xl">🎉</div>
            <div className="text-lg font-bold text-gray-800">Você viu tudo por agora!</div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Não há mais eventos{sportFilter ? ' nesse esporte' : ''} para mostrar. Volte mais tarde ou limpe o histórico.
            </p>
            <button
              onClick={() => {
                useStore.getState().clearFeedHistory()
                buildQueue(sportFilter)
              }}
              className="px-6 py-3 bg-green-500 text-white rounded-2xl font-bold text-sm shadow-md shadow-green-500/25 hover:bg-green-600 transition-colors"
            >
              🔄 Ver novamente
            </button>
          </div>
        ) : (
          <div className="relative h-full">
            {[...visibleCards].reverse().map((ev, revIdx) => {
              const depth = (visibleCards.length - 1) - revIdx
              return (
                <SwipeCard
                  key={ev.id}
                  ev={ev}
                  depth={depth}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Greeting bar */}
      <div className="flex-shrink-0 px-4 pb-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full bg-green-500`} />
        <span className="text-xs text-gray-400">{user.name.split(' ')[0]} · {user.location}</span>
        <span className="ml-auto text-xs text-gray-400">{queue.length} eventos</span>
      </div>
    </div>
  )
}
