import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { ScreenHeader } from '@/components/layout/ScreenHeader'
import { useToast } from '@/components/ui/Toast'
import { SP_ACTIVITIES, SP_BAIRROS } from '@/data/activities'
import { uid } from '@/lib/utils'
import type { SportEvent } from '@/types'

interface FormState {
  title: string
  sportSlug: string
  date: string
  time: string
  duration: string
  local: string
  address: string
  region: string
  ageRange: string
  maxParticipants: number
  isOpen: boolean
  description: string
}

const DURATIONS = ['30min','45min','1h','1h30','2h','3h','Dia inteiro']

export default function CriarEvento() {
  const navigate     = useNavigate()
  const { showToast } = useToast()
  const { user, createEvent } = useStore()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().slice(0, 10)

  const [form, setForm] = useState<FormState>({
    title:           '',
    sportSlug:       'futebol',
    date:            defaultDate,
    time:            '18:00',
    duration:        '1h',
    local:           '',
    address:         '',
    region:          '',
    ageRange:        'Todos',
    maxParticipants: 10,
    isOpen:          true,
    description:     '',
  })

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const selectedActivity = SP_ACTIVITIES.find(a => a.slug === form.sportSlug)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validateStep1(): boolean {
    const errs: typeof errors = {}
    if (!form.title.trim())    errs.title = 'Dê um nome ao evento'
    if (!form.sportSlug)       errs.sportSlug = 'Escolha um esporte'
    if (!form.date)            errs.date = 'Escolha uma data'
    if (!form.time)            errs.time = 'Escolha um horário'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2(): boolean {
    const errs: typeof errors = {}
    if (!form.local.trim())   errs.local = 'Informe o local'
    if (!form.address.trim()) errs.address = 'Informe o endereço'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    const activity = SP_ACTIVITIES.find(a => a.slug === form.sportSlug)
    if (!activity) return

    const ev: SportEvent = {
      id:             'ev-' + uid(),
      title:          form.title,
      sport:          activity.emoji,
      sportSlug:      form.sportSlug,
      gradient:       activity.gradient,
      ageRange:       form.ageRange,
      datetime:       `${form.date}T${form.time}`,
      duration:       form.duration,
      local:          form.local,
      address:        form.address,
      region:         form.region || form.local,
      period:         getPeriod(form.time),
      createdBy:      user.name,
      creatorInitial: user.initials,
      creatorColor:   user.colorClass,
      description:    form.description,
      maxParticipants: form.maxParticipants,
      participants:   [{ i: user.initials, c: user.colorClass, name: user.name }],
      isOpen:         form.isOpen,
      status:         'active',
      source:         'created',
    }

    createEvent(ev)
    showToast('Evento criado com sucesso! 🎉')
    navigate('/agenda')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScreenHeader title="Criar evento" showBack />

      {/* Progress bar */}
      <div className="flex gap-1 px-4 pt-3 pb-0 flex-shrink-0">
        {([1, 2, 3] as const).map(s => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? 'bg-green-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {step === 1 && (
          <Step1 form={form} set={set} errors={errors} activities={SP_ACTIVITIES} durations={DURATIONS} selectedActivity={selectedActivity} />
        )}
        {step === 2 && (
          <Step2 form={form} set={set} errors={errors} bairros={SP_BAIRROS} />
        )}
        {step === 3 && (
          <Step3 form={form} set={set} selectedActivity={selectedActivity} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-4 pb-4 pt-2 border-t border-gray-100 flex-shrink-0">
        {step > 1 && (
          <button
            onClick={() => setStep(s => (s - 1) as 1|2|3)}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:border-gray-300 transition-colors"
          >
            ← Voltar
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => {
              const valid = step === 1 ? validateStep1() : validateStep2()
              if (valid) setStep(s => (s + 1) as 1|2|3)
            }}
            className="flex-1 py-4 rounded-2xl bg-green-500 text-white font-bold shadow-md shadow-green-500/25 hover:bg-green-600 transition-colors"
          >
            Próximo →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 rounded-2xl bg-green-500 text-white font-bold shadow-md shadow-green-500/25 hover:bg-green-600 transition-colors"
          >
            ✓ Criar evento
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Step sub-components ── */
function Step1({ form, set, errors, activities, durations, selectedActivity }: any) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="Nome do evento" error={errors.title}>
        <input
          type="text"
          placeholder="Ex: Futebol de domingo"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          className={inputCls(!!errors.title)}
        />
      </Field>

      <Field label="Esporte" error={errors.sportSlug}>
        <div className="flex flex-wrap gap-2 mt-1">
          {activities.map((a: any) => (
            <button
              key={a.slug}
              type="button"
              onClick={() => set('sportSlug', a.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                form.sportSlug === a.slug
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {a.emoji} {a.name}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data" error={errors.date}>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className={inputCls(!!errors.date)}
          />
        </Field>
        <Field label="Horário" error={errors.time}>
          <input
            type="time"
            value={form.time}
            onChange={e => set('time', e.target.value)}
            className={inputCls(!!errors.time)}
          />
        </Field>
      </div>

      <Field label="Duração">
        <div className="flex gap-2 flex-wrap mt-1">
          {durations.map((d: string) => (
            <button
              key={d}
              type="button"
              onClick={() => set('duration', d)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                form.duration === d
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

function Step2({ form, set, errors, bairros }: any) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="Local / nome do local" error={errors.local}>
        <input
          type="text"
          placeholder="Ex: Parque Ibirapuera"
          value={form.local}
          onChange={e => set('local', e.target.value)}
          className={inputCls(!!errors.local)}
        />
      </Field>

      <Field label="Endereço" error={errors.address}>
        <input
          type="text"
          placeholder="Rua, número, bairro..."
          value={form.address}
          onChange={e => set('address', e.target.value)}
          className={inputCls(!!errors.address)}
        />
      </Field>

      <Field label="Bairro / Região">
        <select
          value={form.region}
          onChange={e => set('region', e.target.value)}
          className={inputCls(false)}
        >
          <option value="">Selecione o bairro</option>
          {bairros.map((b: string) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Vagas máximas">
          <input
            type="number"
            min={2}
            max={100}
            value={form.maxParticipants}
            onChange={e => set('maxParticipants', parseInt(e.target.value) || 10)}
            className={inputCls(false)}
          />
        </Field>
        <Field label="Faixa etária">
          <select
            value={form.ageRange}
            onChange={e => set('ageRange', e.target.value)}
            className={inputCls(false)}
          >
            {['Todos','14-25 anos','18-30 anos','20-35 anos','25-40 anos','30-50 anos','Sênior (50+)'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Visibilidade">
        <div className="flex gap-3 mt-1">
          {[
            { v: true,  label: '🌐 Público', sub: 'Qualquer um pode entrar' },
            { v: false, label: '🔒 Privado', sub: 'Somente por convite' },
          ].map(opt => (
            <button
              key={String(opt.v)}
              type="button"
              onClick={() => set('isOpen', opt.v)}
              className={`flex-1 py-3 rounded-2xl border-2 text-sm font-semibold transition-colors ${
                form.isOpen === opt.v
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              <div>{opt.label}</div>
              <div className="text-[10px] font-normal text-gray-400 mt-0.5">{opt.sub}</div>
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

function Step3({ form, set, selectedActivity }: any) {
  return (
    <div className="flex flex-col gap-5">
      {/* Preview card */}
      <div className="rounded-2xl overflow-hidden shadow-md">
        <div
          className="h-24 flex items-end p-4"
          style={{ background: selectedActivity?.gradient || 'linear-gradient(135deg,#22C55E,#15803D)' }}
        >
          <div>
            <div className="text-white font-black text-lg leading-tight">{form.title || 'Nome do evento'}</div>
            <div className="text-white/80 text-xs">{form.date} · {form.time} · {form.duration}</div>
          </div>
          <div className="ml-auto text-3xl">{selectedActivity?.emoji}</div>
        </div>
        <div className="bg-white p-3 text-sm text-gray-600">
          📍 {form.local || 'Local'} · {form.address || 'Endereço'}
        </div>
      </div>

      <Field label="Descrição (opcional)">
        <textarea
          placeholder="Conte mais sobre o evento: nível necessário, o que levar, regras especiais..."
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-400 transition-colors resize-none"
        />
      </Field>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800">
        <div className="font-bold mb-1">✓ Tudo certo para criar!</div>
        <ul className="text-xs space-y-0.5 text-green-700">
          <li>· {selectedActivity?.emoji} {selectedActivity?.name} — {form.date} às {form.time}</li>
          <li>· 📍 {form.local}, {form.region || 'São Paulo'}</li>
          <li>· 👥 Até {form.maxParticipants} pessoas · {form.ageRange}</li>
          <li>· {form.isOpen ? '🌐 Evento público' : '🔒 Evento privado'}</li>
        </ul>
      </div>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  )
}

function inputCls(hasError: boolean): string {
  return `w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none transition-colors ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:border-green-400'
  }`
}

function getPeriod(time: string): 'manhã' | 'tarde' | 'noite' {
  const h = parseInt(time.split(':')[0])
  if (h < 12) return 'manhã'
  if (h < 18) return 'tarde'
  return 'noite'
}
