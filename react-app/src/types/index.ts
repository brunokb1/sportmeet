/* ============================================================
   SportMeet — TypeScript types
   ============================================================ */

export interface Participant {
  i: string      // initials
  c: string      // color class
  name: string
}

export interface SportEvent {
  id: string
  title: string
  sport: string        // emoji
  sportSlug: string
  gradient: string     // CSS gradient
  ageRange: string
  datetime: string     // ISO-like "YYYY-MM-DDTHH:MM"
  duration: string
  local: string
  address: string
  region: string
  period: 'manhã' | 'tarde' | 'noite'
  createdBy: string
  creatorInitial: string
  creatorColor: string
  description: string
  maxParticipants: number
  participants: Participant[]
  isOpen: boolean
  status?: string
  source?: 'created' | 'search' | 'invite' | 'friend'
}

export interface Friend {
  id: string
  name: string
  initial: string
  color: string
  sports: string[]
  bio: string
  location: string
  stats: {
    participated: number
    created: number
    friends: number
  }
}

export type NotifType = 'invite' | 'friend'
export type NotifStatus = 'pending' | 'accepted' | 'dismissed'

export interface Notification {
  id: string
  type: NotifType
  from: string
  fromInitial: string
  fromColor: string
  sport: string
  label?: string
  datetime?: string
  local?: string
  status: NotifStatus
  eventId?: string
}

export interface UserProfile {
  name: string
  username: string
  bio: string
  location: string
  bairro: string
  sports: string[]
  preferences: {
    activities: string[]
    bairro: string
  }
  initials: string
  colorClass: string
}

export interface Activity {
  name: string
  slug: string
  emoji: string
  gradient: string
}
