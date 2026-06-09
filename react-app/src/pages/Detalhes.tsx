import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { ScreenHeader } from '@/components/layout/ScreenHeader'
import { AvatarRow, Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { fmt, gradientColor } from '@/lib/utils'

export default function Detalhes() {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const { showToast } = useToast()
  const { getEventById, isMyEvent, joinEvent, leaveEvent } = useStore()

  const ev = id ? getEventById(id) : null
  const alreadyIn = ev ? isMyEvent(ev.id) : false

  const mapBoxRef = useRef<HTMLDivElement>(null)

  /* Geocode map on mount */
  useEffect(() => {
    if (!ev || !mapBoxRef.current) return
    const box = mapBoxRef.current

    const gQ    = encodeURIComponent((ev.address || ev.local) + ', São Paulo, Brasil')
    const gUrl  = 'https://maps.google.com/?q=' + gQ
    const addr  = ev.address || ev.local
    const color = gradientColor(ev.gradient)

    // Instant placeholder
    box.innerHTML = `
      <a href="${gUrl}" target="_blank" rel="noopener"
         style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
                height:160px;text-decoration:none;
                background:linear-gradient(160deg,${color}22,${color}44)">
        <div style="font-size:32px">📍</div>
        <div style="font-size:12px;font-weight:700;color:#111;text-align:center;padding:0 20px">${addr}</div>
        <div style="font-size:11px;color:#666;background:rgba(255,255,255,.85);border-radius:12px;padding:2px 12px">Abrir no Maps ↗</div>
      </a>`

    // Async geocode
    fetch(
      'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(addr + ', São Paulo, Brasil') +
      '&format=json&limit=1&countrycodes=br',
      { headers: { 'Accept-Language': 'pt-BR' } }
    )
      .then(r => r.json())
      .then(data => {
        if (!data?.[0] || !mapBoxRef.current) return
        const lat   = parseFloat(data[0].lat)
        const lon   = parseFloat(data[0].lon)
        const d     = 0.006
        const bbox  = [lon - d, lat - d, lon + d, lat + d].join(',')
        box.innerHTML = `
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}"
            style="width:100%;height:160px;border:none;display:block"
            loading="lazy" title="Mapa"></iframe>
          <a href="${gUrl}" target="_blank" rel="noopener"
             style="position:absolute;bottom:8px;left:0;right:0;text-align:center;text-decoration:none">
            <span style="background:rgba(255,255,255,.92);border-radius:16px;padding:3px 12px;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.12)">
              📍 ${addr} ↗
            </span>
          </a>`
      })
      .catch(() => { /* keep placeholder */ })
  }, [ev])

  if (!ev) {
    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title="Evento" showBack />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-5xl">😕</div>
          <div className="text-lg font-bold text-gray-700">Evento não encontrado</div>
          <button onClick={() => navigate(-1)} className="text-green-500 font-semibold text-sm">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const spotsLeft = ev.maxParticipants - ev.participants.length
  const isFull    = spotsLeft <= 0
  const isPast    = new Date(ev.datetime) < new Date()

  function handleJoin() {
    joinEvent({ ...ev!, source: 'search' })
    showToast('Evento adicionado à agenda! 🎉')
    navigate('/agenda')
  }

  function handleLeave() {
    leaveEvent(ev!.id)
    showToast('Você saiu do evento.')
    navigate('/agenda')
  }

  const gMapsQ = encodeURIComponent((ev.address || ev.local) + ', São Paulo')
  const gMapsUrl = 'https://maps.google.com/?q=' + gMapsQ

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <ScreenHeader title={ev.title} showBack />

      {/* Banner */}
      <div className="h-48 flex flex-col justify-end p-4 relative flex-shrink-0" style={{ background: ev.gradient }}>
        <div className="absolute top-4 right-4 text-5xl">{ev.sport}</div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={ev.isOpen ? 'green' : 'gray'}>{ev.isOpen ? 'Aberto' : 'Privado'}</Badge>
          <span className="text-white/80 text-xs">{ev.region}</span>
        </div>
        <div className="text-white font-black text-2xl drop-shadow">{ev.title}</div>
      </div>

      {/* Map */}
      <div ref={mapBoxRef} className="relative flex-shrink-0 bg-gray-100 overflow-hidden" style={{ height: 160 }} />

      {/* Content */}
      <div className="p-4 flex flex-col gap-5">

        {/* Date / Time / Duration */}
        <InfoRow icon="🗓">
          <div className="font-semibold text-gray-800">{fmt.full(ev.datetime)}</div>
          <div className="text-sm text-gray-500">Duração: {ev.duration}</div>
        </InfoRow>

        {/* Location */}
        <InfoRow icon="📍">
          <div className="font-semibold text-gray-800">{ev.local}</div>
          {ev.address !== ev.local && <div className="text-sm text-gray-500">{ev.address}</div>}
          <a
            href={gMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-green-600 hover:underline"
          >
            Como chegar ↗
          </a>
        </InfoRow>

        {/* Description */}
        {ev.description && (
          <InfoRow icon="📋">
            <div className="text-sm text-gray-700 leading-relaxed">{ev.description}</div>
          </InfoRow>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label="Faixa etária" value={ev.ageRange} />
          <InfoCard label="Período" value={ev.period} />
          <InfoCard label="Vagas" value={isFull ? 'Esgotado' : `${spotsLeft} disponíveis`} />
          <InfoCard label="Criado por" value={ev.createdBy} />
        </div>

        {/* Participants */}
        <div>
          <div className="text-sm font-bold text-gray-800 mb-2">
            Participantes · {ev.participants.length} de {ev.maxParticipants}
          </div>
          <div className="flex items-center gap-3">
            <AvatarRow participants={ev.participants} max={6} />
            {/* Fill bar */}
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(ev.participants.length / ev.maxParticipants * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3 pb-4">
          {alreadyIn ? (
            <button
              onClick={handleLeave}
              className="flex-1 py-4 rounded-2xl border-2 border-red-200 text-red-500 font-bold hover:bg-red-50 transition-colors"
            >
              {ev.source === 'created' ? 'Cancelar evento' : 'Sair do evento'}
            </button>
          ) : isPast ? (
            <button disabled className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed">
              Evento encerrado
            </button>
          ) : isFull ? (
            <button disabled className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed">
              Vagas esgotadas
            </button>
          ) : (
            <button
              onClick={handleJoin}
              className="flex-1 py-4 rounded-2xl bg-green-500 text-white font-bold shadow-lg shadow-green-500/25 hover:bg-green-600 transition-colors"
            >
              ✓ Quero participar
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

function InfoRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">{children}</div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <div className="text-xs text-gray-400 font-medium">{label}</div>
      <div className="text-sm font-bold text-gray-800 mt-0.5">{value}</div>
    </div>
  )
}
