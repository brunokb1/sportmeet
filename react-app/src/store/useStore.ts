/* ============================================================
   SportMeet — Zustand store with localStorage persistence
   TODO: replace localStorage with Supabase when backend is ready
   ============================================================ */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SportEvent, Friend, Notification, UserProfile } from '@/types'
import {
  FEED_POOL,
  SEARCH_POOL,
  ALL_EVENTS,
  DEFAULT_FRIENDS,
  DEFAULT_NOTIFICATIONS,
} from '@/data/events'

const STORE_VERSION = 1

/* ── Recommendation scoring ── */
function scoreEvent(ev: SportEvent, user: UserProfile, state: StoreState): number {
  let score = 0
  const prefs = (user.preferences?.activities || user.sports || []).map(a => a.toLowerCase())
  const slug  = (ev.sportSlug || '').toLowerCase()
  const friends = state.friends

  if (prefs.some(p => slug.includes(p) || p.includes(slug))) score += 40
  if (state.sportHistory[slug]) score += Math.min(state.sportHistory[slug] * 10, 30)

  const creatorFriend = friends.find(f => f.name.toLowerCase() === (ev.createdBy || '').toLowerCase())
  if (creatorFriend) score += 35

  const names = (ev.participants || []).map(p => p.name.toLowerCase())
  const friendsIn = friends.filter(f => names.includes(f.name.toLowerCase()))
  score += friendsIn.length * 15

  const userBairro = (user.bairro || '').toLowerCase()
  if (userBairro && (ev.region || '').toLowerCase().includes(userBairro)) score += 20

  const spots = (ev.maxParticipants || 20) - (ev.participants?.length || 0)
  if (spots > 5)              score += 5
  if (spots > 0 && spots <= 2) score -= 10
  if (spots <= 0)             score -= 50

  const daysUntil = (new Date(ev.datetime).getTime() - Date.now()) / 86_400_000
  if (daysUntil >= 0 && daysUntil <= 3) score += 15
  else if (daysUntil > 14)              score -= 5

  const fillRate = (ev.participants?.length || 0) / (ev.maxParticipants || 20)
  if (fillRate > 0.5) score += 10

  const rejections = state.rejectedSlugs[slug] || 0
  score -= rejections * 8

  return score
}

function getRecommendationReason(ev: SportEvent, user: UserProfile, state: StoreState): string {
  const prefs = (user.preferences?.activities || user.sports || []).map(a => a.toLowerCase())
  const slug  = (ev.sportSlug || '').toLowerCase()
  const friends = state.friends

  const creatorFriend = friends.find(f => f.name.toLowerCase() === (ev.createdBy || '').toLowerCase())
  if (creatorFriend) return `👥 ${creatorFriend.name.split(' ')[0]} organiza`

  const names = (ev.participants || []).map(p => p.name.toLowerCase())
  const fp = friends.filter(f => names.includes(f.name.toLowerCase()))
  if (fp.length === 1) return `👥 ${fp[0].name.split(' ')[0]} vai participar`
  if (fp.length > 1)   return `👥 ${fp.length} amigos vão participar`

  if (prefs.some(p => slug.includes(p) || p.includes(slug))) return '⭐ Combine com seus esportes'
  if (state.sportHistory[slug]) return '🔁 Você já praticou'
  return '📍 Perto de você'
}

/* ── Store state shape ── */
export interface StoreState {
  // User
  user: UserProfile

  // Events
  myEvents: SportEvent[]
  feedSeenIds: string[]
  rejectedSlugs: Record<string, number>
  sportHistory:  Record<string, number>

  // Social
  friends: Friend[]
  notifications: Notification[]

  // Actions — Events
  joinEvent:   (ev: SportEvent) => void
  leaveEvent:  (id: string) => void
  createEvent: (ev: SportEvent) => void

  // Actions — Feed
  markRejected:   (ev: SportEvent) => void
  clearFeedHistory: () => void
  getRecommendedFeed: (sportSlug?: string | null) => (SportEvent & { _reason?: string })[]

  // Actions — Notifications
  acceptNotif:  (id: string) => void
  dismissNotif: (id: string) => void

  // Actions — User
  updateUser: (patch: Partial<UserProfile>) => void

  // Helpers
  isMyEvent: (id: string) => boolean
  getEventById: (id: string) => SportEvent | undefined
  getMyEvents: () => SportEvent[]
  getMyCreated: () => SportEvent[]
  getPendingCount: () => number
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      /* ── initial state ── */
      user: {
        name:        'Luiz Fernando',
        username:    'luizfernando',
        bio:         'Apaixonado por esportes e vida ao ar livre 🏃‍♂️',
        location:    'Brooklin, São Paulo',
        bairro:      'Brooklin',
        sports:      ['corrida', 'futebol', 'basquete'],
        preferences: { activities: ['Futebol', 'Corrida', 'Basquete'], bairro: 'Brooklin' },
        initials:    'LF',
        colorClass:  'av-orange',
      },
      myEvents:      [],
      feedSeenIds:   [],
      rejectedSlugs: {},
      sportHistory:  {},
      friends:       DEFAULT_FRIENDS,
      notifications: DEFAULT_NOTIFICATIONS,

      /* ── event actions ── */
      joinEvent: (ev) =>
        set(s => ({
          myEvents:     [...s.myEvents, { ...ev, source: ev.source || 'search' }],
          feedSeenIds:  [...s.feedSeenIds, ev.id],
          sportHistory: { ...s.sportHistory, [ev.sportSlug]: (s.sportHistory[ev.sportSlug] || 0) + 1 },
        })),

      leaveEvent: (id) =>
        set(s => ({ myEvents: s.myEvents.filter(e => e.id !== id) })),

      createEvent: (ev) =>
        set(s => ({
          myEvents:     [...s.myEvents, { ...ev, source: 'created' }],
          sportHistory: { ...s.sportHistory, [ev.sportSlug]: (s.sportHistory[ev.sportSlug] || 0) + 1 },
        })),

      /* ── feed actions ── */
      markRejected: (ev) =>
        set(s => ({
          feedSeenIds:   [...s.feedSeenIds, ev.id],
          rejectedSlugs: { ...s.rejectedSlugs, [ev.sportSlug]: (s.rejectedSlugs[ev.sportSlug] || 0) + 1 },
        })),

      clearFeedHistory: () =>
        set({ feedSeenIds: [], rejectedSlugs: {} }),

      getRecommendedFeed: (sportSlug = null) => {
        const s = get()
        const seenIds = new Set(s.feedSeenIds)
        let pool = ALL_EVENTS.filter(ev => !seenIds.has(ev.id))

        if (sportSlug) pool = pool.filter(ev => ev.sportSlug === sportSlug)

        const scored = pool.map(ev => ({
          ev,
          score:  scoreEvent(ev, s.user, s),
          reason: getRecommendationReason(ev, s.user, s),
        }))
        scored.sort((a, b) => b.score - a.score)

        // Split into buckets and shuffle within each
        const high = scored.filter(x => x.score >= 50)
        const mid  = scored.filter(x => x.score >= 20 && x.score < 50)
        const low  = scored.filter(x => x.score < 20)

        const shuffle = <T>(arr: T[]) => arr.sort(() => Math.random() - 0.5)
        const sorted  = [...shuffle(high), ...shuffle(mid), ...shuffle(low)]

        return sorted.map(x => ({ ...x.ev, _reason: x.reason } as SportEvent & { _reason: string }))
      },

      /* ── notification actions ── */
      acceptNotif: (id) => {
        const s   = get()
        const nif = s.notifications.find(n => n.id === id)
        if (!nif) return

        if (nif.type === 'invite' && nif.eventId) {
          const ev = ALL_EVENTS.find(e => e.id === nif.eventId)
          if (ev) s.joinEvent({ ...ev, source: 'invite' })
        }
        if (nif.type === 'friend') {
          // TODO: Supabase — follow user; for now just mock
        }

        set(s2 => ({
          notifications: s2.notifications.map(n => n.id === id ? { ...n, status: 'accepted' } : n),
        }))
      },

      dismissNotif: (id) =>
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, status: 'dismissed' } : n),
        })),

      /* ── user actions ── */
      updateUser: (patch) =>
        set(s => ({ user: { ...s.user, ...patch } })),

      /* ── helpers ── */
      isMyEvent: (id) => get().myEvents.some(e => e.id === id),

      getEventById: (id) =>
        ALL_EVENTS.find(e => e.id === id) ?? get().myEvents.find(e => e.id === id),

      getMyEvents: () => get().myEvents.filter(e => new Date(e.datetime) >= new Date()),

      getMyCreated: () => get().myEvents.filter(e => e.source === 'created'),

      getPendingCount: () =>
        get().notifications.filter(n => n.status === 'pending').length,
    }),
    {
      name: 'sportmeet-store-v' + STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // TODO: when Supabase is ready, replace storage with supabase adapter
      partialize: (s) => ({
        user:          s.user,
        myEvents:      s.myEvents,
        feedSeenIds:   s.feedSeenIds,
        rejectedSlugs: s.rejectedSlugs,
        sportHistory:  s.sportHistory,
        friends:       s.friends,
        notifications: s.notifications,
      }),
    }
  )
)
