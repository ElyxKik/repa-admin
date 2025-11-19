'use client'

import { useState, useEffect } from 'react'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import KYCStats from '@/components/kyc/KYCStats'
import KYCHistory from '@/components/kyc/KYCHistory'
import { CheckCircle, Clock, AlertCircle, XCircle, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

interface KYCVerification {
  id: string
  technicianId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED'
  documentIds: string[]
  selfieImageUrl?: string
  verifiedAt?: string | null
  verifiedBy?: string | null
  rejectionReason?: string | null
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
  // Données enrichies
  technicianName?: string
  technicianEmail?: string
}

export default function KYCPage() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchKYCVerifications()
  }, [])

  const fetchKYCVerifications = async () => {
    try {
      setLoading(true)
      
      const kycRef = collection(db, 'kyc_verifications')
      const q = query(kycRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      // Enrichir les données avec les informations des techniciens
      const kycData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() as KYCVerification
          const kyc: KYCVerification = {
            ...data,
            id: docSnap.id
          }
          
          // Récupérer les infos du technicien
          if (data.technicianId) {
            try {
              const techDoc = await getDoc(doc(db, 'users', data.technicianId))
              if (techDoc.exists()) {
                const techData = techDoc.data()
                kyc.technicianName = techData.displayName || 'Technicien inconnu'
                kyc.technicianEmail = techData.email || ''
              }
            } catch (error) {
              console.error('Erreur chargement technicien:', error)
              kyc.technicianName = 'Technicien inconnu'
            }
          }
          
          return kyc
        })
      )
      
      setVerifications(kycData)
      console.log(`✅ ${kycData.length} vérifications KYC chargées`)
    } catch (error) {
      console.error('❌ Erreur lors du chargement des KYC:', error)
      toast.error('Erreur lors du chargement des vérifications')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="text-green-500" size={20} />
      case 'REJECTED':
        return <XCircle className="text-red-500" size={20} />
      case 'NOT_STARTED':
        return <Clock className="text-gray-500" size={20} />
      case 'IN_PROGRESS':
        return <AlertCircle className="text-yellow-500" size={20} />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      VERIFIED: 'Vérifié',
      REJECTED: 'Rejeté',
      NOT_STARTED: 'Non commencé',
      IN_PROGRESS: 'En cours',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-50 text-green-700'
      case 'REJECTED':
        return 'bg-red-50 text-red-700'
      case 'NOT_STARTED':
        return 'bg-gray-50 text-gray-700'
      case 'IN_PROGRESS':
        return 'bg-yellow-50 text-yellow-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  const formatDate = (date: Timestamp | string) => {
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

  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      (v.technicianName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (v.technicianEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || v.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'kyc_verifications', id), {
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'admin',
        updatedAt: Timestamp.now()
      })
      
      setVerifications(verifications.map(v => 
        v.id === id ? { ...v, status: 'VERIFIED' as any, verifiedAt: new Date().toISOString() } : v
      ))
      
      toast.success('Vérification approuvée')
    } catch (error) {
      console.error('Erreur approbation:', error)
      toast.error('Erreur lors de l\'approbation')
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Raison du rejet:')
    if (!reason) return

    try {
      await updateDoc(doc(db, 'kyc_verifications', id), {
        status: 'REJECTED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'admin',
        rejectionReason: reason,
        updatedAt: Timestamp.now()
      })
      
      setVerifications(verifications.map(v => 
        v.id === id ? { ...v, status: 'REJECTED' as any, rejectionReason: reason } : v
      ))
      
      toast.success('Vérification rejetée')
    } catch (error) {
      console.error('Erreur rejet:', error)
      toast.error('Erreur lors du rejet')
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Vérifications KYC</h1>
            <p className="text-gray-600 mt-2">Gérez et examinez les vérifications d'identité des techniciens</p>
          </div>
        </div>

        {/* Stats */}
        <KYCStats
          stats={{
            total: verifications.length,
            pending: verifications.filter((v) => v.status === 'IN_PROGRESS').length,
            approved: verifications.filter((v) => v.status === 'VERIFIED').length,
            rejected: verifications.filter((v) => v.status === 'REJECTED').length,
            approvalRate: verifications.length > 0 ? Math.round(
              (verifications.filter((v) => v.status === 'VERIFIED').length / verifications.length) * 100
            ) : 0,
          }}
        />

        {/* Filters */}
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
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
                <option value="NOT_STARTED">Non commencé</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="VERIFIED">Vérifiées</option>
                <option value="REJECTED">Rejetées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Technicien</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Documents</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Créé le</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVerifications.length > 0 ? (
                filteredVerifications.map((verification) => (
                  <tr key={verification.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{verification.technicianName || 'Technicien inconnu'}</td>
                    <td className="py-3 px-4 text-gray-600">{verification.technicianEmail || '-'}</td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verification.status)}`}>
                        {getStatusIcon(verification.status)}
                        <span>{getStatusLabel(verification.status)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {verification.documentIds?.length || 0} document(s)
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(verification.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/kyc/${verification.id}`}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition text-sm font-medium"
                        >
                          Examiner
                        </Link>
                        {verification.status === 'IN_PROGRESS' ? (
                          <>
                            <button
                              onClick={() => handleApprove(verification.id)}
                              className="px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition text-sm font-medium"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => handleReject(verification.id)}
                              className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition text-sm font-medium"
                            >
                              Rejeter
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Aucune vérification trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* History */}
        <KYCHistory />
      </div>
    </ProtectedDashboardLayout>
  )
}
