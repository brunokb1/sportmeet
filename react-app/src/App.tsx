import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/Toast'

// Lazy-loaded pages for code splitting
const Feed         = lazy(() => import('@/pages/Feed'))
const Buscar       = lazy(() => import('@/pages/Buscar'))
const Agenda       = lazy(() => import('@/pages/Agenda'))
const Perfil       = lazy(() => import('@/pages/Perfil'))
const Detalhes     = lazy(() => import('@/pages/Detalhes'))
const CriarEvento  = lazy(() => import('@/pages/CriarEvento'))
const Notificacoes = lazy(() => import('@/pages/Notificacoes'))

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index        element={<Feed />} />
              <Route path="buscar"        element={<Buscar />} />
              <Route path="agenda"        element={<Agenda />} />
              <Route path="perfil"        element={<Perfil />} />
              <Route path="criar"         element={<CriarEvento />} />
              <Route path="notificacoes"  element={<Notificacoes />} />
              <Route path="detalhes/:id"  element={<Detalhes />} />
              {/* Fallback */}
              <Route path="*" element={<Feed />} />
            </Route>
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  )
}
