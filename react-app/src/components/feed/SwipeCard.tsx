import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SportEvent } from '@/types'
import { fmt, gradientColor } from '@/lib/utils'
import { AvatarRow } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface SwipeCardProps {
  ev: SportEvent & { _reason?: string }
  depth: number               // 0 = top, 1 = behind-1, 2 = behind-2
  onAccept: (ev: SportEvent) => void
  onReject: (ev: SportEvent) => void
}

const SWIPE_THRESHOLD = 80

export function SwipeCard({ ev, depth, onAccept, onReject }: SwipeCardProps) {
  const navigate = useNavigate()
  const [offset, setOffset]     = useState(0)
  const [isDragging, setDragging] = useState(false)
  const startX = useRef(0)
  const card   = useRef<HTMLDivElement>(null)

  const spotsLeft  = (ev.maxParticipants || 20) - ev.participants.length
  const fillPct    = Math.round((ev.participants.length / (ev.maxParticipants || 20)) * 100)
  const accentColor = gradientColor(ev.gradient)

  /* ── touch/mouse drag handlers ── */
  const onDragStart = useCallback((clientX: number) => {
    if (depth !== 0) return
    startX.current = clientX
    setDragging(true)
  }, [depth])

  const onDragMove = useCallback((clientX: number) => {
    if (!isDragging) return
    setOffset(clientX - startX.current)
  }, [isDragging])

  const onDragEnd = useCallback(() => {
    if (!isDragging) return
    setDragging(false)

    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      const dir = offset > 0 ? 1 : -1
      setOffset(dir * window.innerWidth)
      setTimeout(() => {
        if (offset > 0) onAccept(ev)
        else onReject(ev)
        setOffset(0)
      }, 280)
    } else {
      setOffset(0)
    }
  }, [isDragging, offset, ev, onAccept, onReject])

  /* ── scale / shadow based on depth ── */
  const scaleMap  = [1, 0.96, 0.92]
  const yMap      = [0, 10, 20]
  const opacityMap = [1, 0.95, 0.9]
  const zMap      = [3, 2, 1]

  const rotation    = depth === 0 ? offset / 25 : 0
  const swipeOpacity = depth === 0 ? Math.max(0, 1 - Math.abs(offset) / 250) : opacityMap[depth] ?? 0.9

  const transform =
    `translateX(${depth === 0 ? offset : 0}px) ` +
    `rotate(${rotation}deg) ` +
    `scale(${scaleMap[depth] ?? 1}) ` +
    `translateY(${yMap[depth] ?? 0}px)`

  return (
    <div
      ref={card}
      className="absolute inset-0 rounded-[20px] overflow-hidden select-none"
      style={{
        zIndex:     zMap[depth] ?? 0,
        transform,
        opacity:    swipeOpacity,
        transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(.2,.8,.3,1), opacity 0.28s ease',
        cursor:     depth === 0 ? 'grab' : 'default',
        boxShadow:  depth === 0
          ? '0 8px 32px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.08)'
          : '0 2px 12px rgba(0,0,0,.06)',
      }}
      onMouseDown={e => onDragStart(e.clientX)}
      onMouseMove={e => onDragMove(e.clientX)}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onTouchStart={e => onDragStart(e.touches[0].clientX)}
      onTouchMove={e => onDragMove(e.touches[0].clientX)}
      onTouchEnd={onDragEnd}
    >
      {/* ── Banner ── */}
      <div
        className="h-48 flex flex-col justify-end p-4 relative"
        style={{ background: ev.gradient }}
      >
        {/* Sport emoji */}
        <div className="absolute top-4 right-4 text-4xl">{ev.sport}</div>

        {/* Accept / Reject indicators */}
        {depth === 0 && offset > 20 && (
          <div className="absolute top-4 left-4 rotate-[-20deg] border-[3px] border-green-400 rounded-lg px-3 py-1 text-green-400 font-black text-xl opacity-90">
            ENTRAR
          </div>
        )}
        {depth === 0 && offset < -20 && (
          <div className="absolute top-4 right-4 rotate-[20deg] border-[3px] border-red-400 rounded-lg px-3 py-1 text-red-400 font-black text-xl opacity-90">
            PULAR
          </div>
        )}

        {/* Fill bar */}
        <div className="mb-2">
          <div className="h-1 rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white/70 transition-all"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        <div className="text-white font-black text-xl leading-tight drop-shadow">{ev.title}</div>
        <div className="text-white/80 text-xs mt-0.5">{fmt.relative(ev.datetime)} · {ev.duration}</div>
      </div>

      {/* ── Body ── */}
      <div className="bg-white flex-1 flex flex-col p-4 gap-3">
        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-500">
          <span className="mt-0.5">📍</span>
          <span className="line-clamp-1">{ev.local}</span>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {ev.ageRange}
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: accentColor + '22', color: accentColor }}
          >
            {ev.period}
          </span>
          {ev._reason && (
            <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {ev._reason}
            </span>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between">
          <AvatarRow participants={ev.participants} max={5} />
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full',
            spotsLeft <= 0  ? 'bg-red-50 text-red-600'  :
            spotsLeft <= 2  ? 'bg-orange-50 text-orange-600' :
                              'bg-green-50 text-green-700',
          )}>
            {spotsLeft <= 0
              ? 'Lotado'
              : `${spotsLeft} vaga${spotsLeft > 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Action buttons */}
        {depth === 0 && (
          <div className="flex gap-3 mt-auto pt-1">
            <button
              onClick={e => { e.stopPropagation(); onReject(ev) }}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:border-red-300 hover:text-red-500 transition-colors"
            >
              ✕ Pular
            </button>
            <button
              onClick={e => { e.stopPropagation(); navigate(`/detalhes/${ev.id}`) }}
              className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-bold text-sm shadow-md shadow-green-500/25 hover:bg-green-600 transition-colors"
            >
              Ver detalhes →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
