import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isAdmin = pathname.startsWith('/admin')

  function switchConsole() {
    navigate(isAdmin ? '/' : '/admin')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex flex-1 flex-col pl-60">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            {/* Console toggle */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs font-medium">
              <button
                onClick={() => isAdmin && switchConsole()}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  !isAdmin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                User
              </button>
              <button
                onClick={() => !isAdmin && switchConsole()}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  isAdmin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Admin
              </button>
            </div>


            <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
