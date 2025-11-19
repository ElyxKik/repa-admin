'use client'

import { CheckCircle, Clock, AlertCircle, XCircle, TrendingUp } from 'lucide-react'

interface KYCStatsProps {
  stats?: {
    total: number
    pending: number
    approved: number
    rejected: number
    approvalRate: number
  }
}

export default function KYCStats({ stats }: KYCStatsProps) {
  const defaultStats = {
    total: 856,
    pending: 67,
    approved: 789,
    rejected: 0,
    approvalRate: 92,
  }

  const data = stats || defaultStats

  const statCards = [
    {
      label: 'Total',
      value: data.total,
      icon: <Clock className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-50',
      trend: '+12%',
    },
    {
      label: 'Approuvées',
      value: data.approved,
      icon: <CheckCircle className="text-green-600" size={24} />,
      bgColor: 'bg-green-50',
      trend: '+8%',
    },
    {
      label: 'En Attente',
      value: data.pending,
      icon: <AlertCircle className="text-yellow-600" size={24} />,
      bgColor: 'bg-yellow-50',
      trend: '-3%',
    },
    {
      label: 'Rejetées',
      value: data.rejected,
      icon: <XCircle className="text-red-600" size={24} />,
      bgColor: 'bg-red-50',
      trend: '0%',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>{card.icon}</div>
              <span className="text-sm font-semibold text-green-600">{card.trend}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{card.value.toLocaleString('fr-FR')}</p>
          </div>
        ))}
      </div>

      {/* Approval Rate */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Taux d'Approbation</h3>
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp size={20} />
            <span className="font-semibold">{data.approvalRate}%</span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${data.approvalRate}%` }}
          ></div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Approuvées</p>
            <p className="text-lg font-bold text-green-600">{data.approved}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-900">{data.total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Taux</p>
            <p className="text-lg font-bold text-blue-600">{data.approvalRate}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
