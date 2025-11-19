'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect if we're already on the login page
    if (pathname === '/login') {
      return
    }

    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/login')
    }

    // If user exists but is not admin, redirect to login
    if (!loading && user && userData && userData.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [user, userData, loading, router, pathname])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or not admin, don't render children
  if (!user || !userData || userData.role !== 'ADMIN') {
    return null
  }

  // User is authenticated and is admin, render children
  return <>{children}</>
}
