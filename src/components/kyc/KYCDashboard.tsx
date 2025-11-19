'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'

interface KYCVerification {
  id: string
  userId: string
  userName: string
  status: 'pending' | 'approved' | 'rejected' | 'review'
  submittedAt: string
  reviewedAt?: string
}

export default function KYCDashboard() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: KYCVerification[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Jane Smith',
        status: 'approved',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        reviewedAt: new Date().toISOString(),
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Bob Johnson',
        status: 'review',
        submittedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ]
    setVerifications(mockData)
    setLoading(false)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />
      case 'review':
        return <AlertCircle className="text-blue-500" size={20} />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      approved: 'Approuvé',
      rejected: 'Rejeté',
      pending: 'En attente',
      review: 'En révision',
    }
    return labels[status] || status
  }

  if (loading) {
    return <div className="card">Chargement...</div>
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Vérifications KYC Récentes</h2>
        <a href="/kyc" className="text-primary hover:underline text-sm">
          Voir tout →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilisateur</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Soumis le</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {verifications.map((verification) => (
              <tr key={verification.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{verification.userName}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(verification.status)}
                    <span className="text-sm">{getStatusLabel(verification.status)}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(verification.submittedAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="py-3 px-4">
                  <button className="text-primary hover:underline text-sm">Examiner</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
