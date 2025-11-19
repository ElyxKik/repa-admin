'use client'

import { Users, FileCheck, TrendingUp, AlertCircle } from 'lucide-react'

interface StatCard {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  bgColor: string
}

export default function StatisticsPanel() {
  const stats: StatCard[] = [
    {
      title: 'Utilisateurs Totaux',
      value: '1,234',
      icon: <Users size={24} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Vérifications KYC',
      value: '856',
      icon: <FileCheck size={24} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Taux d\'Approbation',
      value: '92%',
      icon: <TrendingUp size={24} />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'En Attente de Révision',
      value: '45',
      icon: <AlertCircle size={24} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
