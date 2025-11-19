'use client'

import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import RealTimeStatistics from '@/components/dashboard/RealTimeStatistics'
import RecentRepairRequests from '@/components/dashboard/RecentRepairRequests'
import { FileCheck, Users, Settings } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <ProtectedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 mt-2">Bienvenue dans le tableau de bord d'administration REPA</p>
        </div>

        {/* Statistiques en temps réel */}
        <RealTimeStatistics />

        {/* Demandes de réparation récentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentRepairRequests />
          </div>
          
          {/* Raccourcis */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Raccourcis</h2>
            <div className="space-y-3">
              <Link 
                href="/kyc" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <FileCheck className="text-green-600" size={20} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Vérifications KYC</div>
                  <div className="text-xs text-gray-500">Gérer les validations</div>
                </div>
              </Link>

              <Link 
                href="/users" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Utilisateurs</div>
                  <div className="text-xs text-gray-500">Gérer les comptes</div>
                </div>
              </Link>

              <Link 
                href="/settings" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <Settings className="text-gray-600" size={20} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Paramètres</div>
                  <div className="text-xs text-gray-500">Configuration</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  )
}
