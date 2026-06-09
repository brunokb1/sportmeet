import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ── Date helpers ── */
const DOW = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB']
const MON = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function parseDT(dt: string): Date {
  return new Date(dt.replace(' ','T'))
}

function pad(n: number): string {
  return String(n).padStart(2,'0')
}

export const fmt = {
  short(dt: string): string {
    const d = parseDT(dt)
    return `${DOW[d.getDay()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
  },
  full(dt: string): string {
    const d = parseDT(dt)
    return `${DOW[d.getDay()]}, ${d.getDate()} de ${MON[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
  },
  date(dt: string): string {
    const d = parseDT(dt)
    return `${d.getDate()}/${pad(d.getMonth()+1)}/${d.getFullYear()}`
  },
  time(dt: string): string {
    const d = parseDT(dt)
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  },
  relative(dt: string): string {
    const d    = parseDT(dt)
    const now  = new Date()
    const diff = d.getTime() - now.getTime()
    if (diff < 0) return fmt.full(dt)
    const days = Math.floor(diff / 86_400_000)
    const hh = pad(d.getHours()), mm = pad(d.getMinutes())
    if (days === 0) return `Hoje às ${hh}:${mm}`
    if (days === 1) return `Amanhã às ${hh}:${mm}`
    if (days < 7)  return `${DOW[d.getDay()][0]}${DOW[d.getDay()].slice(1).toLowerCase()} às ${hh}:${mm}`
    return fmt.full(dt)
  },
}

/** Extract first hex color from a CSS gradient string */
export function gradientColor(g: string): string {
  const m = (g || '').match(/#[0-9a-fA-F]{6}/)
  return m ? m[0] : '#22C55E'
}

/** Generate a unique ID */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
