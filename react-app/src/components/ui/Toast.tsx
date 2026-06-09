import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ToastData {
  id: number
  message: string
  type?: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastData['type']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-[min(340px,90vw)]">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              animate-slide-up flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold text-white
              ${t.type === 'error' ? 'bg-red-500' : t.type === 'info' ? 'bg-blue-500' : 'bg-green-500'}
            `}
          >
            {t.type === 'error' ? '✗' : '✓'} {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
