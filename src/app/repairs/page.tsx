'use client'

import { useState, useEffect } from 'react'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import { Search, Filter, Plus, Wrench, CheckCircle, Clock, AlertCircle, Trash2, XCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Repair {
  id: string
  clientId: string
  technicianId?: string | null
  title: string
  description: string
  category: string
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  estimatedPrice?: number
  finalPrice?: number
  createdAt: Timestamp | string
  completedAt?: Timestamp | string | null
  // Données enrichies
  clientName?: string
  clientEmail?: string
  technicianName?: string
}

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchRepairs()
  }, [])

  const fetchRepairs = async () => {
    try {
      setLoading(true)
      
      // Récupérer toutes les demandes de réparation
      const repairsRef = collection(db, 'repair_requests')
      const q = query(repairsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      // Enrichir les données avec les informations des utilisateurs
      const repairsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() as Repair
          const repair: Repair = {
            ...data,
            id: docSnap.id
          }
          
          // Récupérer les infos du client
          if (data.clientId) {
            try {
              const clientDoc = await getDoc(doc(db, 'users', data.clientId))
              if (clientDoc.exists()) {
                const clientData = clientDoc.data()
                repair.clientName = clientData.displayName || 'Client inconnu'
                repair.clientEmail = clientData.email || ''
              }
            } catch (error) {
              console.error('Erreur chargement client:', error)
              repair.clientName = 'Client inconnu'
            }
          }
          
          // Récupérer les infos du technicien si assigné
          if (data.technicianId) {
            try {
              const techDoc = await getDoc(doc(db, 'users', data.technicianId))
              if (techDoc.exists()) {
                const techData = techDoc.data()
                repair.technicianName = techData.displayName || 'Technicien inconnu'
              }
            } catch (error) {
              console.error('Erreur chargement technicien:', error)
            }
          }
          
          return repair
        })
      )
      
      setRepairs(repairsData)
      console.log(`✅ ${repairsData.length} demandes de réparation chargées`)
    } catch (error) {
      console.error('❌ Erreur lors du chargement des réparations:', error)
      toast.error('Erreur lors du chargement des réparations')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: Timestamp.now()
      }

      if (newStatus === 'COMPLETED') {
        updateData.completedAt = Timestamp.now()
      }

      await updateDoc(doc(db, 'repair_requests', id), updateData)
      
      // Mettre à jour l'état local
      setRepairs(repairs.map(r => 
        r.id === id 
          ? { ...r, status: newStatus as any, completedAt: updateData.completedAt }
          : r
      ))
      
      toast.success('Statut mis à jour')
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'repair_requests', id))
      setRepairs(repairs.filter(r => r.id !== id))
      toast.success('Demande supprimée')
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
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

  const formatDate = (date: Timestamp | string | null | undefined) => {
    if (!date) return '-'
    
    try {
      const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date)
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      return '-'
    }
  }

  // Supprimer les anciennes données mock

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="text-green-500" size={20} />
      case 'IN_PROGRESS':
        return <Wrench className="text-blue-500" size={20} />
      case 'ASSIGNED':
        return <AlertCircle className="text-blue-500" size={20} />
      case 'OPEN':
        return <Clock className="text-yellow-500" size={20} />
      case 'CANCELLED':
        return <XCircle className="text-red-500" size={20} />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      COMPLETED: 'Terminée',
      IN_PROGRESS: 'En cours',
      ASSIGNED: 'Assignée',
      OPEN: 'Ouverte',
      CANCELLED: 'Annulée',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700'
      case 'IN_PROGRESS':
        return 'bg-purple-50 text-purple-700'
      case 'ASSIGNED':
        return 'bg-blue-50 text-blue-700'
      case 'OPEN':
        return 'bg-yellow-50 text-yellow-700'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  const filteredRepairs = repairs.filter((r) => {
    const matchesSearch =
      (r.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (r.clientEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (r.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      getCategoryLabel(r.category).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <ProtectedDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedDashboardLayout>
    )
  }

  return (
    <ProtectedDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Réparations</h1>
            <p className="text-gray-600 mt-2">Gérez et suivez les demandes de réparation</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/repairs/common-issues"
              className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition"
            >
              <AlertCircle size={20} />
              <span>Problèmes récurrents</span>
            </Link>
            <button className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition">
              <Plus size={20} />
              <span>Nouvelle Réparation</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold text-gray-900">{repairs.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Ouvertes</p>
            <p className="text-2xl font-bold text-yellow-600">{repairs.filter((r) => r.status === 'OPEN').length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">En cours</p>
            <p className="text-2xl font-bold text-blue-600">{repairs.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Terminées</p>
            <p className="text-2xl font-bold text-green-600">{repairs.filter((r) => r.status === 'COMPLETED').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou appareil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="OPEN">Ouvertes</option>
                <option value="ASSIGNED">Assignées</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminées</option>
                <option value="CANCELLED">Annulées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Titre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Catégorie</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Technicien</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Prix Estimé</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs.length > 0 ? (
                filteredRepairs.map((repair) => (
                  <tr key={repair.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{repair.clientName || 'Client inconnu'}</p>
                        <p className="text-sm text-gray-600">{repair.clientEmail || '-'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{repair.title}</p>
                      <p className="text-sm text-gray-600">{formatDate(repair.createdAt)}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{getCategoryLabel(repair.category)}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{repair.technicianName || '-'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(repair.status)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(repair.status)}`}>
                          {getStatusLabel(repair.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {repair.estimatedPrice ? `$${repair.estimatedPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={repair.status}
                          onChange={(e) => handleStatusChange(repair.id, e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded hover:border-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                          <option value="OPEN">Ouverte</option>
                          <option value="ASSIGNED">Assignée</option>
                          <option value="IN_PROGRESS">En cours</option>
                          <option value="COMPLETED">Terminée</option>
                          <option value="CANCELLED">Annulée</option>
                        </select>
                        <button
                          onClick={() => handleDelete(repair.id)}
                          className="p-2 hover:bg-red-50 rounded transition text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Aucune réparation trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedDashboardLayout>
  )
}
