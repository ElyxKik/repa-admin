'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Wrench, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface RepairRequest {
  id: string
  clientId: string
  title: string
  category: string
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: Timestamp | string
  estimatedPrice?: number
}

export default function RecentRepairRequests() {
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestsRef = collection(db, 'repair_requests')
        const q = query(
          requestsRef,
          orderBy('createdAt', 'desc'),
          limit(10)
        )
        
        const snapshot = await getDocs(q)
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RepairRequest[]
        
        setRequests(requestsData)
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="text-green-500" size={20} />
      case 'CANCELLED':
        return <XCircle className="text-red-500" size={20} />
      case 'OPEN':
        return <Clock className="text-yellow-500" size={20} />
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return <AlertCircle className="text-blue-500" size={20} />
      default:
        return <Wrench className="text-gray-500" size={20} />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: 'Ouverte',
      ASSIGNED: 'Assignée',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      PHONE: 'Téléphone',
      LAPTOP: 'Ordinateur portable',
      TABLET: 'Tablette',
      DESKTOP: 'Ordinateur de bureau',
      SMARTWATCH: 'Montre connectée',
      CONSOLE: 'Console de jeux',
      TV: 'Téléviseur',
      AUDIO: 'Équipement audio',
      CAMERA: 'Appareil photo',
      OTHER: 'Autre',
    }
    return labels[category] || category
  }

  const formatDate = (date: Timestamp | string) => {
    if (!date) return '-'
    
    try {
      const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date)
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return '-'
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Chargement des demandes...</span>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Nouvelles Demandes de Réparation</h2>
          <Link href="/repairs" className="text-primary hover:underline text-sm">
            Voir tout →
          </Link>
        </div>
        <div className="text-center py-12">
          <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Aucune demande de réparation pour le moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Nouvelles Demandes de Réparation</h2>
        <Link href="/repairs" className="text-primary hover:underline text-sm">
          Voir tout →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Titre</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Catégorie</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Prix estimé</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{request.title}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">
                    {getCategoryLabel(request.category)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-900">
                    {request.estimatedPrice ? `$${request.estimatedPrice.toFixed(2)}` : '-'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {formatDate(request.createdAt)}
                </td>
                <td className="py-3 px-4">
                  <Link 
                    href={`/repairs/${request.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    Voir détails
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
