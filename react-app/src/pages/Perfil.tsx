import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { ScreenHeader } from '@/components/layout/ScreenHeader'
import { Avatar } from '@/components/ui/Avatar'
import { SP_ACTIVITIES } from '@/data/activities'
import { useToast } from '@/components/ui/Toast'
import { fmt } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { SportEvent, UserProfile } from '@/types'

type ProfileTab = 'stats' | 'amigos' | 'configurar'

export default function Perfil() {
  const navigate     = useNavigate()
  const { showToast } = useToast()
  const { user, myEvents, friends, notifications, updateUser, getPendingCount, acceptNotif, dismissNotif } = useStore()
  const [tab, setTab] = useState<ProfileTab>('stats')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<UserProfile>({ ...user })

  const pendingCount  = getPendingCount()
  const now           = new Date()
  const upcoming      = myEvents.filter(e => new Date(e.datetime) >= now && e.source !== 'created')
  const past          = myEvents.filter(e => new Date(e.datetime) < now)
  const created       = myEvents.filter(e => e.source === 'created')
  const pendingFriends = notifications.filter(n => n.type === 'friend' && n.status === 'pending')

  function saveEdit() {
    updateUser(form)
    setEditing(false)
    showToast('Perfil atualizado!')
  }

  const availableActivities = SP_ACTIVITIES.map(a => a.name)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScreenHeader
        title="Perfil"
        action={
          <button
            onClick={() => editing ? saveEdit() : setEditing(true)}
            className="text-green-500 text-sm font-bold hover:text-green-600 transition-colors"
          >
            {editing ? 'Salvar' : 'Editar'}
          </button>
        }
      />

      {/* Profile card */}
      <div className="bg-white px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            initial={user.initials}
            colorClass={user.colorClass}
            size="xl"
          />
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full font-bold text-gray-900 border-b-2 border-green-400 focus:outline-none text-lg bg-transparent"
              />
            ) : (
              <div className="font-bold text-gray-900 text-lg">{user.name}</div>
            )}
            <div className="text-gray-400 text-sm">@{user.username}</div>
            {editing ? (
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={2}
                className="w-full mt-1 text-sm text-gray-600 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-green-400 resize-none"
              />
            ) : (
              <div className="text-sm text-gray-600 mt-1">{user.bio}</div>
            )}
            <div className="text-xs text-gray-400 mt-1">📍 {user.location}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-0 border-t border-gray-100 -mx-4">
          {[
            { label: 'Participados', value: past.length + upcoming.length },
            { label: 'Criados',      value: created.length },
            { label: 'Amigos',       value: friends.length },
          ].map(s => (
            <div key={s.label} className="py-3 text-center border-r border-gray-100 last:border-0">
              <div className="text-xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex -mx-4 border-b border-gray-200 mt-0">
          {([
            { id: 'stats'      as const, label: 'Atividade' },
            { id: 'amigos'     as const, label: pendingCount > 0 ? `Amigos (${pendingCount})` : 'Amigos' },
            { id: 'configurar' as const, label: 'Configurar' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors',
                tab === t.id
                  ? 'text-green-500 border-green-500'
                  : 'text-gray-400 border-transparent',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {tab === 'stats' && (
          <div className="flex flex-col gap-6">
            <Section title="Próximos eventos" onMore={upcoming.length > 0 ? () => navigate('/agenda') : undefined}>
              {upcoming.length === 0 ? (
                <EmptyHint text="Você não tem eventos agendados." ctaLabel="Explorar feed" ctaTo="/" />
              ) : upcoming.slice(0, 3).map(ev => (
                <EventMini key={ev.id} ev={ev} onClick={() => navigate(`/detalhes/${ev.id}`)} />
              ))}
            </Section>

            <Section title="Eventos passados" onMore={past.length > 0 ? () => navigate('/agenda') : undefined}>
              {past.length === 0 ? (
                <EmptyHint text="Nenhum evento passado ainda." />
              ) : past.slice(0, 3).map(ev => (
                <EventMini key={ev.id} ev={ev} onClick={() => navigate(`/detalhes/${ev.id}`)} dimmed />
              ))}
            </Section>
          </div>
        )}

        {tab === 'amigos' && (
          <div className="flex flex-col gap-6">
            {pendingFriends.length > 0 && (
              <Section title="Pedidos pendentes">
                {pendingFriends.map(n => (
                  <div key={n.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${n.fromColor}`}>
                      {n.fromInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{n.from}</div>
                      <div className="text-xs text-gray-500 truncate">{n.sport}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { acceptNotif(n.id); showToast(`${n.from} adicionado!`) }}
                        className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => { dismissNotif(n.id); showToast('Pedido recusado.', 'info') }}
                        className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-full"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            <Section title={`${friends.length} amigos`}>
              {friends.map(f => (
                <div key={f.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${f.color}`}>
                    {f.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{f.name}</div>
                    <div className="text-xs text-gray-500 truncate">{f.bio}</div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">{f.location.split(',')[0]}</div>
                </div>
              ))}
            </Section>
          </div>
        )}

        {tab === 'configurar' && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bairro</label>
              <input
                value={form.bairro}
                onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))}
                disabled={!editing}
                placeholder="Seu bairro em São Paulo"
                className={cn(
                  'mt-1 w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none transition-colors',
                  editing ? 'border-green-400 bg-white' : 'border-gray-200 bg-gray-50',
                )}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Esportes favoritos
              </label>
              <div className="flex flex-wrap gap-2">
                {availableActivities.slice(0, 12).map(name => {
                  const active = form.preferences.activities.includes(name)
                  return (
                    <button
                      key={name}
                      disabled={!editing}
                      onClick={() => {
                        const acts = form.preferences.activities
                        const next = acts.includes(name) ? acts.filter(a => a !== name) : [...acts, name]
                        setForm(f => ({ ...f, preferences: { ...f.preferences, activities: next } }))
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                        active ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200',
                        !editing && 'opacity-70 cursor-default',
                      )}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>

            {editing && (
              <button
                onClick={saveEdit}
                className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold shadow-md shadow-green-500/25 hover:bg-green-600 transition-colors"
              >
                Salvar alterações
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

/* ── Helpers ── */
function Section({ title, children, onMore }: { title: string; children: React.ReactNode; onMore?: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-gray-800">{title}</div>
        {onMore && <button onClick={onMore} className="text-xs text-green-500 font-semibold">Ver todos</button>}
      </div>
      {children}
    </div>
  )
}

function EventMini({ ev, onClick, dimmed }: { ev: SportEvent; onClick: () => void; dimmed?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 text-left',
        dimmed && 'opacity-60',
      )}
    >
      <span className="text-2xl flex-shrink-0">{ev.sport}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm truncate">{ev.title}</div>
        <div className="text-xs text-gray-500 mt-0.5">{fmt.short(ev.datetime)} · {ev.local}</div>
      </div>
    </button>
  )
}

function EmptyHint({ text, ctaLabel, ctaTo }: { text: string; ctaLabel?: string; ctaTo?: string }) {
  const navigate = useNavigate()
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-gray-400">{text}</p>
      {ctaLabel && ctaTo && (
        <button
          onClick={() => navigate(ctaTo)}
          className="mt-2 text-sm text-green-500 font-semibold hover:underline"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
