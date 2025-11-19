'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { TrendingUp, TrendingDown, Users, FileCheck, CheckCircle, AlertCircle } from 'lucide-react'

interface StatisticData {
  label: string
  value: number
  change: number
  trend: 'up' | 'down'
  icon: React.ReactNode
  color: string
  bgColor: string
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(false)
  }, [router])

  const stats: StatisticData[] = [
    {
      label: 'Utilisateurs Totaux',
      value: 1234,
      change: 12,
      trend: 'up',
      icon: <Users size={24} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Vérifications KYC',
      value: 856,
      change: 8,
      trend: 'up',
      icon: <FileCheck size={24} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Approuvées',
      value: 789,
      change: 5,
      trend: 'up',
      icon: <CheckCircle size={24} />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'En Attente',
      value: 67,
      change: 3,
      trend: 'down',
      icon: <AlertCircle size={24} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const monthlyData = [
    { month: 'Jan', users: 120, kyc: 85, approved: 78 },
    { month: 'Fév', users: 150, kyc: 110, approved: 95 },
    { month: 'Mar', users: 180, kyc: 145, approved: 130 },
    { month: 'Avr', users: 220, kyc: 180, approved: 165 },
    { month: 'Mai', users: 280, kyc: 220, approved: 200 },
    { month: 'Juin', users: 350, kyc: 280, approved: 250 },
  ]

  const kycStatusData = [
    { status: 'Approuvés', count: 789, percentage: 92, color: 'bg-green-500' },
    { status: 'En attente', count: 67, percentage: 8, color: 'bg-yellow-500' },
    { status: 'Rejetés', count: 0, percentage: 0, color: 'bg-red-500' },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600 mt-2">Aperçu des performances et tendances</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
                <div className={`flex items-center space-x-1 text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{stat.change}%</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString('fr-FR')}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Growth */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Croissance Mensuelle</h2>
            <div className="space-y-4">
              {monthlyData.map((data, index) => {
                const maxValue = 350
                const userPercentage = (data.users / maxValue) * 100
                const kycPercentage = (data.kyc / maxValue) * 100
                const approvedPercentage = (data.approved / maxValue) * 100

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{data.month}</span>
                      <span className="text-sm text-gray-600">{data.users} utilisateurs</span>
                    </div>
                    <div className="flex space-x-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 rounded-full"
                        style={{ width: `${userPercentage}%` }}
                      ></div>
                      <div
                        className="bg-green-500 rounded-full"
                        style={{ width: `${kycPercentage}%` }}
                      ></div>
                      <div
                        className="bg-emerald-500 rounded-full"
                        style={{ width: `${approvedPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Utilisateurs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">KYC</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600">Approuvés</span>
              </div>
            </div>
          </div>

          {/* KYC Status Distribution */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Distribution des Statuts KYC</h2>
            <div className="space-y-4">
              {kycStatusData.map((data, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{data.status}</span>
                    <span className="text-sm font-semibold text-gray-900">{data.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${data.color} rounded-full transition-all duration-500`}
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500"></span>
                    <span className="text-xs font-semibold text-gray-700">{data.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Activité Récente</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">KYC approuvé</p>
                  <p className="text-xs text-gray-500">John Doe</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">Il y a 2 heures</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Nouvel utilisateur</p>
                  <p className="text-xs text-gray-500">Jane Smith</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">Il y a 4 heures</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">KYC en révision</p>
                  <p className="text-xs text-gray-500">Bob Johnson</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">Il y a 6 heures</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
