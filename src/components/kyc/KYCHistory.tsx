'use client'

import { CheckCircle, XCircle, Clock, User } from 'lucide-react'

interface HistoryItem {
  id: string
  userName: string
  action: 'approved' | 'rejected' | 'submitted'
  timestamp: string
  reviewer?: string
  reason?: string
}

interface KYCHistoryProps {
  items?: HistoryItem[]
}

export default function KYCHistory({ items }: KYCHistoryProps) {
  const defaultItems: HistoryItem[] = [
    {
      id: '1',
      userName: 'John Doe',
      action: 'approved',
      timestamp: new Date(Date.now() - 3600000).toLocaleString('fr-FR'),
      reviewer: 'tech@repa.com',
    },
    {
      id: '2',
      userName: 'Jane Smith',
      action: 'submitted',
      timestamp: new Date(Date.now() - 7200000).toLocaleString('fr-FR'),
    },
    {
      id: '3',
      userName: 'Bob Johnson',
      action: 'rejected',
      timestamp: new Date(Date.now() - 86400000).toLocaleString('fr-FR'),
      reviewer: 'admin@repa.com',
      reason: 'Document expiré',
    },
    {
      id: '4',
      userName: 'Alice Williams',
      action: 'approved',
      timestamp: new Date(Date.now() - 172800000).toLocaleString('fr-FR'),
      reviewer: 'tech@repa.com',
    },
  ]

  const data = items || defaultItems

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={20} />
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />
      case 'submitted':
        return <Clock className="text-blue-600" size={20} />
      default:
        return null
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      approved: 'Approuvée',
      rejected: 'Rejetée',
      submitted: 'Soumise',
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approved':
        return 'bg-green-50 text-green-700'
      case 'rejected':
        return 'bg-red-50 text-red-700'
      case 'submitted':
        return 'bg-blue-50 text-blue-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-6">Historique des Validations</h3>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            {/* Timeline Dot */}
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-gray-100">{getActionIcon(item.action)}</div>
              {index !== data.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-900">{item.userName}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                    {getActionLabel(item.action)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{item.timestamp}</span>
              </div>

              {item.reviewer && (
                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                  <User size={14} />
                  <span>Par: {item.reviewer}</span>
                </div>
              )}

              {item.reason && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                  <span className="font-medium">Raison:</span> {item.reason}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun historique disponible</p>
        </div>
      )}
    </div>
  )
}
