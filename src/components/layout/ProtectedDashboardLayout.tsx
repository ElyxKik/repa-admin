'use client'

import { ReactNode } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface ProtectedDashboardLayoutProps {
  children: ReactNode
}

/**
 * Wrapper component that combines authentication protection with dashboard layout
 * Use this for all admin pages that require authentication
 */
export default function ProtectedDashboardLayout({ children }: ProtectedDashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
