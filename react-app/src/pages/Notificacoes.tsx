import { useStore } from '@/store/useStore'
import { ScreenHeader } from '@/components/layout/ScreenHeader'
import { useToast } from '@/components/ui/Toast'
import { useNavigate } from 'react-router-dom'
import { fmt } from '@/lib/utils'
import type { Notification } from '@/types'

export default function Notificacoes() {
  const { notifications, acceptNotif, dismissNotif } = useStore()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const invites  = notifications.filter(n => n.type === 'invite')
  const friends  = notifications.filter(n => n.type === 'friend')
  const pending  = notifications.filter(n => n.status === 'pending')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScreenHeader
        title="Notificações"
        showBack
        action={
          pending.length > 0 ? (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {pending.length}
            </span>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-6">

        {/* Invites */}
        <Section title="Convites para eventos">
          {invites.length === 0 ? (
            <Empty text="Nenhum convite" />
          ) : invites.map(n => (
            <NotifCard
              key={n.id}
              notif={n}
              onAccept={() => {
                acceptNotif(n.id)
                showToast('Evento adicionado à agenda! 🎉')
                if (n.eventId) navigate(`/detalhes/${n.eventId}`)
              }}
              onDismiss={() => {
                dismissNotif(n.id)
                showToast('Convite recusado.', 'info')
              }}
            />
          ))}
        </Section>

        {/* Friend requests */}
        <Section title="Pedidos de amizade">
          {friends.length === 0 ? (
            <Empty text="Nenhum pedido" />
          ) : friends.map(n => (
            <NotifCard
              key={n.id}
              notif={n}
              onAccept={() => {
                acceptNotif(n.id)
                showToast(`${n.from} adicionado como amigo! 👋`)
              }}
              onDismiss={() => {
                dismissNotif(n.id)
                showToast('Pedido recusado.', 'info')
              }}
            />
          ))}
        </Section>

        {/* Recentes / Activity */}
        <Section title="Recentes">
          <div className="flex flex-col gap-0 border border-gray-100 rounded-2xl overflow-hidden">
            <ActivityRow icon="✓" iconBg="bg-blue-100 text-blue-600">
              <div className="font-semibold text-sm text-gray-800">Lucas confirmou presença</div>
              <div className="text-xs text-gray-500">Futebol Society Brooklin · Dom 19h00</div>
            </ActivityRow>
            <ActivityRow icon="🏃" iconBg="bg-green-100 text-green-600">
              <div className="font-semibold text-sm text-gray-800">Bruno está participando essa semana</div>
              <div className="text-xs text-gray-500">Corrida no Parque do Povo · Sáb 7h00</div>
            </ActivityRow>
            <ActivityRow icon="⭐" iconBg="bg-orange-100 text-orange-600" last>
              <div className="font-semibold text-sm text-gray-800">Evento quase cheio perto de você</div>
              <div className="text-xs text-gray-500">Tênis no Clube Pinheiros · Seg 19h30</div>
            </ActivityRow>
          </div>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</div>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-4 text-center text-sm text-gray-400">{text}</div>
  )
}

function NotifCard({
  notif,
  onAccept,
  onDismiss,
}: {
  notif: Notification
  onAccept: () => void
  onDismiss: () => void
}) {
  const isPending  = notif.status === 'pending'
  const isAccepted = notif.status === 'accepted'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${notif.fromColor}`}>
        {notif.fromInitial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900">
          {notif.type === 'invite' ? (
            <><span className="text-green-600">{notif.from}</span> te convidou</>
          ) : (
            <><span className="text-green-600">{notif.from}</span> quer ser seu amigo</>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate mt-0.5">
          {notif.type === 'invite' && notif.datetime
            ? `${notif.sport} · ${fmt.short(notif.datetime)}` + (notif.local ? ` · ${notif.local}` : '')
            : notif.sport}
        </div>
        {!isPending && (
          <div className="text-xs mt-0.5 font-semibold text-green-600">
            {isAccepted ? '✓ Aceito' : 'Recusado'}
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onAccept}
            className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full hover:bg-green-600 transition-colors"
          >
            Aceitar
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-full hover:bg-gray-50 transition-colors"
          >
            Recusar
          </button>
        </div>
      )}
    </div>
  )
}

function ActivityRow({
  icon, iconBg, children, last
}: {
  icon: string; iconBg: string; children: React.ReactNode; last?: boolean
}) {
  return (
    <div className={`flex items-start gap-3 p-3 bg-white ${!last ? 'border-b border-gray-100' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 py-0.5">{children}</div>
    </div>
  )
}
