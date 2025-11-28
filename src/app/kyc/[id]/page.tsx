'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import { CheckCircle, XCircle, X, ZoomIn, ZoomOut, ArrowLeft, FileText, User, Mail, Phone, Calendar, MapPin, Briefcase, Heart, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { doc, getDoc, updateDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

interface KYCDocument {
  id: string
  documentType: string
  documentNumber: string
  frontImageUrl: string
  backImageUrl?: string | null
  expiryDate: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  technicianId: string
  uploadedAt: Timestamp | string
  rejectionReason?: string | null
}

interface KYCVerification {
  id: string
  technicianId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED'
  documentIds: string[]
  selfieImageUrl?: string
  additionalImages?: string[]
  verifiedAt?: string | null
  verifiedBy?: string | null
  rejectionReason?: string | null
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
  // Informations personnelles
  firstName?: string
  lastName?: string
  surname?: string
  dateOfBirth?: string
  placeOfBirth?: string
  gender?: string
  maritalStatus?: string
  nationality?: string
  phoneNumber?: string
  workplacePhotoUrl?: string | null
  equipmentPhotoUrl?: string | null
  // Données enrichies
  technicianName?: string
  technicianEmail?: string
  technicianPhone?: string
  documents?: KYCDocument[]
}

export default function KYCValidationPage() {
  const router = useRouter()
  const params = useParams()
  const kycId = params?.id as string

  const [verification, setVerification] = useState<KYCVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageZoom, setImageZoom] = useState(1)

  useEffect(() => {
    if (kycId) {
      fetchKYCDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kycId])

  const fetchKYCDetails = async () => {
    try {
      setLoading(true)
      console.log('🔍 Chargement KYC ID:', kycId)
      
      // Récupérer la vérification KYC
      const kycDoc = await getDoc(doc(db, 'kyc_verifications', kycId))
      
      if (!kycDoc.exists()) {
        console.error('❌ Vérification KYC non trouvée')
        toast.error('Vérification KYC non trouvée')
        router.push('/kyc')
        return
      }
      
      const kycData = { id: kycDoc.id, ...kycDoc.data() } as KYCVerification
      console.log('✅ KYC Data:', kycData)
      
      // Récupérer les infos du technicien
      if (kycData.technicianId) {
        console.log('🔍 Chargement technicien:', kycData.technicianId)
        const techDoc = await getDoc(doc(db, 'users', kycData.technicianId))
        if (techDoc.exists()) {
          const techData = techDoc.data()
          kycData.technicianName = techData.displayName || 'Technicien inconnu'
          kycData.technicianEmail = techData.email || ''
          kycData.technicianPhone = techData.phoneNumber || ''
          console.log('✅ Technicien chargé:', kycData.technicianName)
        } else {
          console.warn('⚠️ Technicien non trouvé')
        }
      }
      
      // Récupérer les documents
      console.log('📄 documentIds:', kycData.documentIds)
      console.log('👤 technicianId:', kycData.technicianId)
      
      // Toujours utiliser la méthode par technicianId car plus fiable
      console.log('🔍 Chargement documents par technicianId:', kycData.technicianId)
      try {
        const docsQuery = query(
          collection(db, 'kyc_documents'),
          where('technicianId', '==', kycData.technicianId)
        )
        console.log('📋 Exécution de la requête Firestore...')
        const docsSnapshot = await getDocs(docsQuery)
        console.log('📊 Nombre de documents trouvés:', docsSnapshot.size)
        
        const documents: KYCDocument[] = []
        docsSnapshot.forEach((docSnap) => {
          const docData = { id: docSnap.id, ...docSnap.data() } as KYCDocument
          console.log('✅ Document récupéré:', docData.id, docData)
          documents.push(docData)
        })
        
        kycData.documents = documents
        console.log('✅ Total documents chargés:', documents.length)
      } catch (error) {
        console.error('❌ Erreur chargement documents par technicianId:', error)
        console.error('❌ Détails de l\'erreur:', JSON.stringify(error, null, 2))
        kycData.documents = []
      }
      
      setVerification(kycData)
      console.log('✅ Vérification complète chargée')
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error)
      toast.error('Erreur lors du chargement des détails')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setValidating(true)
    try {
      // Mettre à jour la vérification KYC
      await updateDoc(doc(db, 'kyc_verifications', kycId), {
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'admin',
        updatedAt: Timestamp.now()
      })
      
      // Mettre à jour isVerified du technicien
      if (verification?.technicianId) {
        await updateDoc(doc(db, 'users', verification.technicianId), {
          isVerified: true,
          updatedAt: Timestamp.now()
        })
      }
      
      // Mettre à jour tous les documents KYC à VERIFIED
      if (verification?.documents && verification.documents.length > 0) {
        console.log('📝 Mise à jour des documents KYC...')
        const updatePromises = verification.documents.map(async (document) => {
          try {
            await updateDoc(doc(db, 'kyc_documents', document.id), {
              status: 'VERIFIED',
              updatedAt: Timestamp.now()
            })
            console.log('✅ Document vérifié:', document.id)
          } catch (error) {
            console.error('❌ Erreur mise à jour document:', document.id, error)
          }
        })
        await Promise.all(updatePromises)
        console.log('✅ Tous les documents ont été vérifiés')
      }
      
      toast.success('Vérification KYC approuvée avec succès')
      router.push('/kyc')
    } catch (error) {
      console.error('Erreur approbation:', error)
      toast.error('Erreur lors de l\'approbation')
    } finally {
      setValidating(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez fournir une raison de rejet')
      return
    }

    setValidating(true)
    try {
      // Mettre à jour la vérification KYC
      await updateDoc(doc(db, 'kyc_verifications', kycId), {
        status: 'REJECTED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'admin',
        rejectionReason: rejectionReason,
        updatedAt: Timestamp.now()
      })
      
      // Mettre à jour isVerified du technicien à false
      if (verification?.technicianId) {
        await updateDoc(doc(db, 'users', verification.technicianId), {
          isVerified: false,
          updatedAt: Timestamp.now()
        })
      }
      
      // Mettre à jour tous les documents KYC à REJECTED
      if (verification?.documents && verification.documents.length > 0) {
        console.log('📝 Mise à jour des documents KYC...')
        const updatePromises = verification.documents.map(async (document) => {
          try {
            await updateDoc(doc(db, 'kyc_documents', document.id), {
              status: 'REJECTED',
              rejectionReason: rejectionReason,
              updatedAt: Timestamp.now()
            })
            console.log('✅ Document rejeté:', document.id)
          } catch (error) {
            console.error('❌ Erreur mise à jour document:', document.id, error)
          }
        })
        await Promise.all(updatePromises)
        console.log('✅ Tous les documents ont été rejetés')
      }
      
      toast.success('Vérification KYC rejetée')
      router.push('/kyc')
    } catch (error) {
      console.error('Erreur rejet:', error)
      toast.error('Erreur lors du rejet')
    } finally {
      setValidating(false)
      setShowRejectForm(false)
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ID_CARD: 'Carte d\'identité',
      PASSPORT: 'Passeport',
      DRIVER_LICENSE: 'Permis de conduire',
      BUSINESS_LICENSE: 'Licence commerciale',
      ADDITIONAL: 'Document additionnel',
    }
    return labels[type] || type
  }

  const getDocumentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      VERIFIED: 'Vérifié',
      REJECTED: 'Rejeté',
    }
    return labels[status] || status
  }

  const getDocumentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      VERIFIED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getGenderLabel = (gender: string | undefined) => {
    const labels: Record<string, string> = {
      M: 'Masculin',
      F: 'Féminin',
    }
    return gender ? labels[gender] || gender : '-'
  }

  const getMaritalStatusLabel = (status: string | undefined) => {
    const labels: Record<string, string> = {
      SINGLE: 'Célibataire',
      MARRIED: 'Marié(e)',
      DIVORCED: 'Divorcé(e)',
      WIDOWED: 'Veuf/Veuve',
    }
    return status ? labels[status] || status : '-'
  }

  const formatDate = (date: Timestamp | string | null | undefined) => {
    if (!date) return '-'
    try {
      const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date)
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
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

  if (!verification) {
    return (
      <ProtectedDashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Vérification KYC non trouvée</p>
          <Link href="/kyc" className="text-primary hover:underline mt-4 inline-block">
            Retour à la liste
          </Link>
        </div>
      </ProtectedDashboardLayout>
    )
  }

  const canValidate = verification.status === 'IN_PROGRESS'

  return (
    <ProtectedDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/kyc"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Validation KYC</h1>
              <p className="text-gray-600 mt-1">Vérification #{kycId.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User size={20} />
                Informations personnelles
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Prénom</p>
                  <p className="font-medium text-gray-900">{verification.firstName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-medium text-gray-900">{verification.lastName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Surnom</p>
                  <p className="font-medium text-gray-900">{verification.surname || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de naissance</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={14} />
                    {formatDate(verification.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lieu de naissance</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin size={14} />
                    {verification.placeOfBirth || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Genre</p>
                  <p className="font-medium text-gray-900">{getGenderLabel(verification.gender)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">État civil</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Heart size={14} />
                    {getMaritalStatusLabel(verification.maritalStatus)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nationalité</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Globe size={14} />
                    {verification.nationality || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Phone size={14} />
                    {verification.phoneNumber || verification.technicianPhone || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Mail size={14} />
                    {verification.technicianEmail || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de soumission</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={14} />
                    {formatDate(verification.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dernière mise à jour</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={14} />
                    {formatDate(verification.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Documents d'identité
              </h2>
              {verification.documents && verification.documents.length > 0 ? (
                <div className="space-y-6">
                  {verification.documents.map((document) => (
                    <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {getDocumentTypeLabel(document.documentType)}
                        </h3>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getDocumentStatusColor(document.status)}`}>
                          {getDocumentStatusLabel(document.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Numéro du document</p>
                          <p className="font-medium text-gray-900 text-sm break-all">{document.documentNumber || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date d'expiration</p>
                          <p className="font-medium text-gray-900">{formatDate(document.expiryDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date d'upload</p>
                          <p className="font-medium text-gray-900">{formatDate(document.uploadedAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ID du document</p>
                          <p className="font-medium text-gray-900 text-xs">{document.id}</p>
                        </div>
                      </div>
                      {document.rejectionReason && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-gray-600">Raison du rejet</p>
                          <p className="font-medium text-red-800 text-sm">{document.rejectionReason}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Recto</p>
                          {document.frontImageUrl ? (
                            <img
                              src={document.frontImageUrl}
                              alt="Recto"
                              className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                              onClick={() => setSelectedImage(document.frontImageUrl)}
                            />
                          ) : (
                            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                              <p className="text-gray-500">Aucune image</p>
                            </div>
                          )}
                        </div>
                        {document.backImageUrl && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Verso</p>
                            <img
                              src={document.backImageUrl}
                              alt="Verso"
                              className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                              onClick={() => setSelectedImage(document.backImageUrl!)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Aucun document soumis</p>
              )}
            </div>

            {/* Photos de vérification */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User size={20} />
                Photos de vérification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selfie */}
                {verification.selfieImageUrl && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Photo selfie</p>
                    <img
                      src={verification.selfieImageUrl}
                      alt="Selfie"
                      className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition border border-gray-200"
                      onClick={() => setSelectedImage(verification.selfieImageUrl!)}
                    />
                  </div>
                )}
                
                {/* Photo du lieu de travail */}
                {verification.workplacePhotoUrl && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium flex items-center gap-2">
                      <Briefcase size={14} />
                      Photo du lieu de travail
                    </p>
                    <img
                      src={verification.workplacePhotoUrl}
                      alt="Lieu de travail"
                      className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition border border-gray-200"
                      onClick={() => setSelectedImage(verification.workplacePhotoUrl!)}
                    />
                  </div>
                )}
                
                {/* Photo de l'équipement */}
                {verification.equipmentPhotoUrl && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Photo de l'équipement</p>
                    <img
                      src={verification.equipmentPhotoUrl}
                      alt="Équipement"
                      className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition border border-gray-200"
                      onClick={() => setSelectedImage(verification.equipmentPhotoUrl!)}
                    />
                  </div>
                )}
              </div>
              
              {!verification.selfieImageUrl && !verification.workplacePhotoUrl && !verification.equipmentPhotoUrl && (
                <p className="text-gray-600 text-center py-8">Aucune photo de vérification disponible</p>
              )}
            </div>

            {/* Images supplémentaires */}
            {verification.additionalImages && verification.additionalImages.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Images supplémentaires ({verification.additionalImages.length})
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Images additionnelles uploadées par le technicien pour la vérification
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {verification.additionalImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Image supplémentaire ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition border border-gray-200"
                        onClick={() => setSelectedImage(imageUrl)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raison du rejet */}
            {verification.status === 'REJECTED' && verification.rejectionReason && (
              <div className="card bg-red-50 border-red-200">
                <h2 className="text-xl font-bold mb-2 text-red-900">Raison du rejet</h2>
                <p className="text-red-800">{verification.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Validation Panel */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6 space-y-4">
              <h3 className="text-lg font-bold">Validation</h3>

              {/* Status Badge */}
              <div className={`p-3 rounded-lg border-2 ${
                verification.status === 'VERIFIED' ? 'bg-green-50 border-green-200' :
                verification.status === 'REJECTED' ? 'bg-red-50 border-red-200' :
                verification.status === 'IN_PROGRESS' ? 'bg-yellow-50 border-yellow-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <p className="text-sm font-medium">Statut Actuel</p>
                <p className="text-lg font-semibold mt-1">
                  {verification.status === 'VERIFIED' ? 'Vérifié' :
                   verification.status === 'REJECTED' ? 'Rejeté' :
                   verification.status === 'IN_PROGRESS' ? 'En cours' :
                   'Non commencé'}
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Vérifications</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700">Documents valides</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700">Selfie correspond</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700">Données cohérentes</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700">Aucun document expiré</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              {canValidate && verification.status === 'IN_PROGRESS' ? (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleApprove}
                    disabled={validating}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={20} />
                    <span>{validating ? 'Approbation...' : 'Approuver'}</span>
                  </button>

                  {!showRejectForm ? (
                    <button
                      onClick={() => setShowRejectForm(true)}
                      disabled={validating}
                      className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={20} />
                      <span>Rejeter</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Raison du rejet..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleReject}
                          disabled={validating}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition disabled:opacity-50 text-sm font-medium"
                        >
                          {validating ? 'Rejet...' : 'Confirmer'}
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectForm(false)
                            setRejectionReason('')
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg transition text-sm font-medium"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : verification.status === 'VERIFIED' ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                    <p className="text-sm font-medium text-green-900">Vérification approuvée</p>
                    {verification.verifiedAt && (
                      <p className="text-xs text-green-700 mt-1">
                        Le {formatDate(verification.verifiedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ) : verification.status === 'REJECTED' ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <XCircle className="mx-auto text-red-600 mb-2" size={32} />
                    <p className="text-sm font-medium text-red-900">Vérification rejetée</p>
                    {verification.verifiedAt && (
                      <p className="text-xs text-red-700 mt-1">
                        Le {formatDate(verification.verifiedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Cette vérification n'est pas encore soumise.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedImage(null)
                setImageZoom(1)
              }}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition z-10"
            >
              <X size={24} />
            </button>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center overflow-auto">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Enlarged document"
                  style={{ transform: `scale(${imageZoom})` }}
                  className="max-w-full max-h-[70vh] transition-transform"
                />
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-center space-x-4 mt-4">
              <button
                onClick={() => setImageZoom(Math.max(1, imageZoom - 0.2))}
                className="bg-white hover:bg-gray-100 p-2 rounded-lg transition"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-white font-semibold">{Math.round(imageZoom * 100)}%</span>
              <button
                onClick={() => setImageZoom(Math.min(3, imageZoom + 0.2))}
                className="bg-white hover:bg-gray-100 p-2 rounded-lg transition"
              >
                <ZoomIn size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedDashboardLayout>
  )
}
