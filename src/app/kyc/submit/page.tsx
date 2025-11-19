'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SubmitKYCPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<'admin' | 'technician' | 'client'>('client')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    documentType: 'ID_CARD',
    documentNumber: '',
    expiryDate: '',
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }

    // Get user role from localStorage (demo)
    const role = localStorage.getItem('userRole') || 'client'
    setUserRole(role as 'admin' | 'technician' | 'client')

    setLoading(false)
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userRole !== 'technician') {
      toast.error('Seul un technicien peut soumettre des vérifications KYC')
      return
    }

    // Validate form
    if (!formData.fullName || !formData.email || !formData.documentNumber) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success('Vérification KYC soumise avec succès pour validation')
      router.push('/kyc')
    } catch (error) {
      toast.error('Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const canSubmit = userRole === 'technician'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Soumettre une Vérification KYC</h1>
          <p className="text-gray-600 mt-2">Soumettez une nouvelle vérification d'identité pour validation</p>
        </div>

        {/* Permission Warning */}
        {!canSubmit && (
          <div className="card bg-red-50 border border-red-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-red-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-red-900">Accès Refusé</p>
                <p className="text-sm text-red-800 mt-1">
                  Seuls les techniciens peuvent soumettre des vérifications KYC. Votre rôle actuel est: <span className="font-semibold capitalize">{userRole}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {canSubmit && (
          <>
            {/* Info Banner */}
            <div className="card bg-blue-50 border border-blue-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="text-blue-600 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-blue-900">Soumission pour Validation</p>
                  <p className="text-sm text-blue-800 mt-1">
                    Remplissez le formulaire ci-dessous pour soumettre une vérification KYC. Un administrateur examinera et validera votre soumission.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="card space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-bold mb-4">Informations Personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom Complet *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="jean@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+33612345678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Naissance *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationalité *
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      placeholder="Française"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de Document *
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="ID_CARD">Carte d'Identité</option>
                      <option value="PASSPORT">Passeport</option>
                      <option value="DRIVER_LICENSE">Permis de Conduire</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Rue de la Paix, 75000 Paris"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              {/* Document Information */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold mb-4">Informations du Document</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro du Document *
                    </label>
                    <input
                      type="text"
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleInputChange}
                      placeholder="AB123456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'Expiration *
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/kyc')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary hover:bg-secondary text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Upload size={20} />
                  <span>{submitting ? 'Soumission...' : 'Soumettre pour Validation'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
