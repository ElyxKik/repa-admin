'use client'

import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'

export default function RoleSelector() {
  const [currentRole, setCurrentRole] = useState<'admin' | 'technician' | 'client'>('admin')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'admin'
    setCurrentRole(role as 'admin' | 'technician' | 'client')
  }, [])

  const getRoleIcon = () => {
    return <Shield size={16} />
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur'
      case 'technician':
        return 'Technicien'
      case 'client':
        return 'Client'
      default:
        return role
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-700"
      >
        {getRoleIcon()}
        <span>{getRoleLabel(currentRole)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 bg-blue-50 border-b border-blue-200">
            <p className="text-sm font-semibold text-blue-900">Rôle Administrateur</p>
            <p className="text-xs text-blue-700 mt-1">Seul l'administrateur peut valider les vérifications KYC</p>
          </div>
          <div className="p-3">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary text-white">
              {getRoleIcon()}
              <span className="text-sm font-medium">{getRoleLabel('admin')}</span>
            </div>
          </div>
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
            <p className="font-semibold mb-1">Système:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Pas de compte client</li>
              <li>• Pas de compte technicien</li>
              <li>• Admin valide les KYC</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
