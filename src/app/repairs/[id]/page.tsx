'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Wrench,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface RepairRequest {
  id: string
  clientId: string
  technicianId?: string | null
  title: string
  description: string
  category: string
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  images?: string[]
  estimatedPrice?: number
  finalPrice?: number | null
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
  completedAt?: Timestamp | string | null
}

interface UserData {
  displayName: string
  email: string
  phoneNumber?: string
  photoURL?: string
}

export default function RepairDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [repair, setRepair] = useState<RepairRequest | null>(null)
  const [clientData, setClientData] = useState<UserData | null>(null)
  const [technicianData, setTechnicianData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchRepairDetails = async () => {
      if (!params.id) return

      try {
        // Récupérer la demande de réparation
        const repairDoc = await getDoc(doc(db, 'repair_requests', params.id as string))
        
        if (!repairDoc.exists()) {
          toast.error('Demande de réparation non trouvée')
          router.push('/repairs')
          return
        }

        const repairData = { id: repairDoc.id, ...repairDoc.data() } as RepairRequest
        setRepair(repairData)

        // Récupérer les données du client
        if (repairData.clientId) {
          const clientDoc = await getDoc(doc(db, 'users', repairData.clientId))
          if (clientDoc.exists()) {
            setClientData(clientDoc.data() as UserData)
          }
        }

        // Récupérer les données du technicien si assigné
        if (repairData.technicianId) {
          const techDoc = await getDoc(doc(db, 'users', repairData.technicianId))
          if (techDoc.exists()) {
            setTechnicianData(techDoc.data() as UserData)
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        toast.error('Erreur lors du chargement des détails')
      } finally {
        setLoading(false)
      }
    }

    fetchRepairDetails()
  }, [params.id, router])

  const handleStatusChange = async (newStatus: string) => {
    if (!repair) return

    setUpdating(true)
    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: Timestamp.now()
      }

      if (newStatus === 'COMPLETED') {
        updateData.completedAt = Timestamp.now()
      }

      await updateDoc(doc(db, 'repair_requests', repair.id), updateData)
      
      setRepair({ ...repair, status: newStatus as any, ...updateData })
      toast.success('Statut mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="text-green-500" size={24} />
      case 'CANCELLED':
        return <XCircle className="text-red-500" size={24} />
      case 'OPEN':
        return <Clock className="text-yellow-500" size={24} />
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return <AlertCircle className="text-blue-500" size={24} />
      default:
        return <Wrench className="text-gray-500" size={24} />
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
      OPEN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
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
        month: 'long',
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
      <ProtectedDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedDashboardLayout>
    )
  }

  if (!repair) {
    return (
      <ProtectedDashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Demande de réparation non trouvée</p>
          <Link href="/repairs" className="text-primary hover:underline mt-4 inline-block">
            Retour à la liste
          </Link>
        </div>
      </ProtectedDashboardLayout>
    )
  }

  return (
    <ProtectedDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/repairs"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{repair.title}</h1>
              <p className="text-gray-600 mt-1">Demande #{repair.id.slice(0, 8)}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getStatusColor(repair.status)}`}>
            {getStatusIcon(repair.status)}
            <span className="font-semibold">{getStatusLabel(repair.status)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{repair.description}</p>
            </div>

            {/* Details */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Détails de la demande</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Catégorie</p>
                  <p className="font-medium text-gray-900">{getCategoryLabel(repair.category)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prix estimé</p>
                  <p className="font-medium text-gray-900">
                    {repair.estimatedPrice ? `$${repair.estimatedPrice.toFixed(2)}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prix final</p>
                  <p className="font-medium text-gray-900">
                    {repair.finalPrice ? `$${repair.finalPrice.toFixed(2)}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de création</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Calendar size={16} />
                    {formatDate(repair.createdAt)}
                  </p>
                </div>
                {repair.completedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Date de complétion</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <CheckCircle size={16} />
                      {formatDate(repair.completedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {repair.location && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Localisation
                </h2>
                <p className="text-gray-700">{repair.location.address}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Latitude: {repair.location.latitude}</p>
                  <p>Longitude: {repair.location.longitude}</p>
                </div>
              </div>
            )}

            {/* Images */}
            {repair.images && repair.images.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Photos</h2>
                <div className="grid grid-cols-3 gap-4">
                  {repair.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Actions</h2>
              <div className="space-y-2">
                <select
                  value={repair.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50"
                >
                  <option value="OPEN">Ouverte</option>
                  <option value="ASSIGNED">Assignée</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="COMPLETED">Terminée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
                {updating && (
                  <p className="text-sm text-gray-600 text-center">Mise à jour...</p>
                )}
              </div>
            </div>

            {/* Client Info */}
            {clientData && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User size={20} />
                  Client
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {clientData.photoURL ? (
                      <img 
                        src={clientData.photoURL} 
                        alt={clientData.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={24} className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{clientData.displayName}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail size={14} />
                        {clientData.email}
                      </p>
                    </div>
                  </div>
                  {clientData.phoneNumber && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={14} />
                      {clientData.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Technician Info */}
            {technicianData && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Wrench size={20} />
                  Technicien
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {technicianData.photoURL ? (
                      <img 
                        src={technicianData.photoURL} 
                        alt={technicianData.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Wrench size={24} className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{technicianData.displayName}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail size={14} />
                        {technicianData.email}
                      </p>
                    </div>
                  </div>
                  {technicianData.phoneNumber && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={14} />
                      {technicianData.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!repair.technicianId && (
              <div className="card bg-yellow-50 border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Aucun technicien assigné</strong><br />
                  Cette demande est en attente d'assignation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  )
}
