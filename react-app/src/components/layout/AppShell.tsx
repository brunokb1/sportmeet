import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex justify-center items-stretch min-h-screen bg-gray-100">
      <div className="w-full max-w-app bg-white flex flex-col h-screen overflow-hidden relative shadow-2xl">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
