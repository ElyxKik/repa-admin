'use client'

import { CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react'

interface KYCDetailViewProps {
  verification: {
    id: string
    userName: string
    email: string
    phone: string
    submittedAt: string
    documents: {
      type: string
      number: string
      expiryDate: string
      frontImage: string
      backImage?: string
      status: 'pending' | 'verified' | 'rejected'
    }[]
    selfieImage: string
    address: string
    dateOfBirth: string
    nationality: string
    status: 'pending' | 'approved' | 'rejected' | 'review'
  }
  onImageClick: (image: string) => void
}

export default function KYCDetailView({ verification, onImageClick }: KYCDetailViewProps) {
  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ID_CARD: 'Carte d\'Identité',
      PASSPORT: 'Passeport',
      DRIVER_LICENSE: 'Permis de Conduire',
      BUSINESS_LICENSE: 'Licence Commerciale',
    }
    return labels[type] || type
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="text-green-500" size={20} />
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />
      case 'pending':
        return <AlertCircle className="text-yellow-500" size={20} />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      verified: 'Vérifié',
      rejected: 'Rejeté',
      pending: 'En attente',
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Informations Personnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nom Complet</p>
            <p className="text-lg font-semibold text-gray-900">{verification.userName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold text-gray-900">{verification.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Téléphone</p>
            <p className="text-lg font-semibold text-gray-900">{verification.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date de Naissance</p>
            <p className="text-lg font-semibold text-gray-900">{verification.dateOfBirth}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Nationalité</p>
            <p className="text-lg font-semibold text-gray-900">{verification.nationality}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Adresse</p>
            <p className="text-lg font-semibold text-gray-900">{verification.address}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Documents d'Identité</h3>
        <div className="space-y-6">
          {verification.documents.map((doc, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h4 className="font-semibold text-gray-900">{getDocumentTypeLabel(doc.type)}</h4>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100">
                    {getStatusIcon(doc.status)}
                    <span className="text-xs font-medium text-gray-700">{getStatusLabel(doc.status)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Numéro du Document</p>
                  <p className="font-semibold text-gray-900">{doc.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date d'Expiration</p>
                  <p className="font-semibold text-gray-900">{doc.expiryDate}</p>
                </div>
              </div>

              {/* Document Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Recto</p>
                  <div
                    className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => onImageClick(doc.frontImage)}
                  >
                    <img
                      src={doc.frontImage}
                      alt="Document front"
                      className="w-full h-full object-cover group-hover:opacity-75 transition"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black bg-opacity-50">
                      <Eye className="text-white" size={24} />
                    </div>
                  </div>
                </div>

                {doc.backImage && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Verso</p>
                    <div
                      className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => onImageClick(doc.backImage!)}
                    >
                      <img
                        src={doc.backImage}
                        alt="Document back"
                        className="w-full h-full object-cover group-hover:opacity-75 transition"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black bg-opacity-50">
                        <Eye className="text-white" size={24} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selfie */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Photo de Vérification (Selfie)</h3>
        <div
          className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => onImageClick(verification.selfieImage)}
        >
          <img
            src={verification.selfieImage}
            alt="Selfie"
            className="w-full h-full object-cover group-hover:opacity-75 transition"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black bg-opacity-50">
            <Eye className="text-white" size={32} />
          </div>
        </div>
      </div>

      {/* Submission Info */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="font-semibold text-blue-900">Informations de Soumission</p>
            <p className="text-sm text-blue-800 mt-1">
              Soumis le: <span className="font-semibold">{verification.submittedAt}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
