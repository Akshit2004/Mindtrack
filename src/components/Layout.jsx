import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Defensive getters: user or its fields may be undefined during initial render
  const _display = user?.displayName ?? ''
  const _email = user?.email ?? ''
  const avatarInitial = (_display || _email).charAt(0).toUpperCase()
  const shortName = _display || (_email ? _email.split('@')[0] : '')

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Calendar', path: '/calendar', icon: '📅' },
    { name: 'Habits', path: '/habits', icon: '🎯' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-x-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
            <div className="text-3xl">🧘</div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">MindTrack</h1>
              <p className="text-xs text-slate-600">Wellness Journey</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          {user && (
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {avatarInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{shortName}</p>
                  <p className="text-xs text-slate-600 truncate">{_email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden lg:block text-lg font-semibold text-slate-900">
              {navigation.find(item => isActive(item.path))?.name || 'MindTrack'}
            </div>
            <div className="lg:hidden flex items-center gap-2">
              <span className="text-2xl">🧘</span>
              <span className="font-bold text-slate-900">MindTrack</span>
            </div>
            <div className="w-10 lg:w-auto"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6">
          <div className="px-4 text-center">
            <p className="text-sm text-slate-600">
              Made with 💜 by <span className="font-bold text-slate-900">MetaLogic</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">© 2025 All rights reserved</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
