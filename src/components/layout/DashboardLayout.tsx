'use client'

import { ReactNode, useState } from 'react'
import { Menu, X, LogOut, Settings, Home, Users, FileCheck, Wrench, User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { signOut, userData } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  const navItems = [
    { href: '/', label: 'Tableau de Bord', icon: Home },
    { href: '/kyc', label: 'Vérifications KYC', icon: FileCheck },
    { href: '/repairs', label: 'Réparations', icon: Wrench },
    { href: '/users', label: 'Utilisateurs', icon: Users },
    { href: '/settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="REPA" className="h-8 w-8 object-contain" />
              <h1 className="text-xl font-bold text-primary">REPA Admin</h1>
            </div>
          ) : (
            <img src="/logo.png" alt="REPA" className="h-8 w-8 object-contain" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-primary"
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <User size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">
                {userData?.displayName || userData?.email || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
