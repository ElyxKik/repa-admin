'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, User, DollarSign, AlertCircle } from 'lucide-react'
import { collection, addDoc, query, where, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface PaymentFormModalProps {
  technicianId: string | null
  onClose: () => void
  onSuccess: () => void
}

interface Technician {
  id: string
  displayName: string
  email: string
  balance: number
  jobsCount: number
}

interface Commission {
  id: string
  commissionAmount: number
  createdAt: Timestamp | string
}

export default function PaymentFormModal({ technicianId, onClose, onSuccess }: PaymentFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingTechnicians, setLoadingTechnicians] = useState(true)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [pendingCommissions, setPendingCommissions] = useState<Commission[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'MOBILE_MONEY',
    notes: ''
  })

  // Générer un ID de transaction automatique
  const generateTransactionId = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `TXN${timestamp}${random}`
  }

  useEffect(() => {
    fetchTechniciansWithBalances()
    
    // Fermer les suggestions quand on clique ailleurs
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Si un technicianId est passé en prop, le sélectionner automatiquement
  useEffect(() => {
    if (technicianId && technicians.length > 0) {
      const tech = technicians.find(t => t.id === technicianId)
      if (tech) {
        handleSelectTechnician(tech)
      }
    }
  }, [technicianId, technicians])

  const fetchTechniciansWithBalances = async () => {
    try {
      setLoadingTechnicians(true)
      
      // Récupérer tous les techniciens
      const techQuery = query(
        collection(db, 'users'),
        where('role', '==', 'TECHNICIAN')
      )
      const techSnapshot = await getDocs(techQuery)
      
      // Récupérer toutes les commissions en attente
      const commissionsQuery = query(
        collection(db, 'repa_commissions'),
        where('status', '==', 'EN_ATTENTE')
      )
      const commissionsSnapshot = await getDocs(commissionsQuery)
      
      // Grouper les commissions par technicien
      const balanceMap = new Map<string, { balance: number; jobsCount: number }>()
      
      commissionsSnapshot.forEach((doc) => {
        const data = doc.data()
        const techId = data.technicianId
        const amount = data.commissionAmount || 0
        
        if (balanceMap.has(techId)) {
          const current = balanceMap.get(techId)!
          balanceMap.set(techId, {
            balance: current.balance + amount,
            jobsCount: current.jobsCount + 1
          })
        } else {
          balanceMap.set(techId, { balance: amount, jobsCount: 1 })
        }
      })
      
      // Construire la liste des techniciens avec leurs soldes
      const techList: Technician[] = []
      
      techSnapshot.forEach((doc) => {
        const data = doc.data()
        const balanceData = balanceMap.get(doc.id) || { balance: 0, jobsCount: 0 }
        
        techList.push({
          id: doc.id,
          displayName: data.displayName || 'Sans nom',
          email: data.email || '',
          balance: balanceData.balance,
          jobsCount: balanceData.jobsCount
        })
      })
      
      // Trier par solde décroissant, puis par nom
      setTechnicians(techList.sort((a, b) => {
        if (b.balance !== a.balance) return b.balance - a.balance
        return a.displayName.localeCompare(b.displayName)
      }))
    } catch (error) {
      console.error('Erreur chargement techniciens:', error)
      toast.error('Erreur lors du chargement des techniciens')
    } finally {
      setLoadingTechnicians(false)
    }
  }

  const fetchPendingCommissions = async (techId: string) => {
    try {
      const commissionsQuery = query(
        collection(db, 'repa_commissions'),
        where('technicianId', '==', techId),
        where('status', '==', 'EN_ATTENTE')
      )
      const snapshot = await getDocs(commissionsQuery)
      
      const commissions: Commission[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        commissions.push({
          id: doc.id,
          commissionAmount: data.commissionAmount || 0,
          createdAt: data.createdAt
        })
      })
      
      // Trier par date (plus ancien en premier)
      commissions.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()
        return dateA - dateB
      })
      
      setPendingCommissions(commissions)
    } catch (error) {
      console.error('Erreur chargement commissions:', error)
    }
  }

  const handleSelectTechnician = (tech: Technician) => {
    setSelectedTechnician(tech)
    setSearchTerm(tech.displayName)
    setShowSuggestions(false)
    fetchPendingCommissions(tech.id)
    // Pré-remplir le montant avec le solde dû
    setFormData(prev => ({ ...prev, amount: tech.balance.toFixed(2) }))
  }

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value)
    
    // Vérifier que le montant ne dépasse pas le solde dû
    if (selectedTechnician && !isNaN(amount) && amount > selectedTechnician.balance) {
      toast.error(`Le montant ne peut pas dépasser ${selectedTechnician.balance.toFixed(2)} $`)
      return
    }
    
    setFormData(prev => ({ ...prev, amount: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTechnician) {
      toast.error('Veuillez sélectionner un technicien')
      return
    }
    
    const amount = parseFloat(formData.amount)
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Veuillez entrer un montant valide')
      return
    }
    
    if (amount > selectedTechnician.balance) {
      toast.error(`Le montant ne peut pas dépasser ${selectedTechnician.balance.toFixed(2)} $`)
      return
    }

    setLoading(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        toast.error('Vous devez être connecté')
        return
      }

      const transactionId = generateTransactionId()
      
      // Déterminer quelles commissions seront payées
      let remainingAmount = amount
      const paidCommissionIds: string[] = []
      
      for (const commission of pendingCommissions) {
        if (remainingAmount <= 0) break
        
        if (remainingAmount >= commission.commissionAmount) {
          paidCommissionIds.push(commission.id)
          remainingAmount -= commission.commissionAmount
        }
      }
      
      // Créer le paiement
      const paymentRef = await addDoc(collection(db, 'repa_payments'), {
        id: transactionId,
        technicianId: selectedTechnician.id,
        technicianName: selectedTechnician.displayName,
        amount: amount,
        balanceBefore: selectedTechnician.balance,
        balanceAfter: selectedTechnician.balance - amount,
        paymentMethod: formData.paymentMethod,
        transactionId: transactionId,
        commissionIds: paidCommissionIds,
        createdAt: Timestamp.now(),
        createdBy: currentUser.uid,
        notes: formData.notes || null
      })
      
      // Marquer les commissions comme payées
      for (const commissionId of paidCommissionIds) {
        await updateDoc(doc(db, 'repa_commissions', commissionId), {
          status: 'PAYEE',
          paidAt: Timestamp.now(),
          paymentId: paymentRef.id
        })
      }
      
      console.log(`✅ Paiement enregistré: ${transactionId}`)
      console.log(`✅ ${paidCommissionIds.length} commission(s) marquée(s) comme payée(s)`)

      toast.success('Paiement enregistré avec succès')
      onSuccess()
    } catch (error) {
      console.error('Erreur enregistrement paiement:', error)
      toast.error('Erreur lors de l\'enregistrement du paiement')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les techniciens selon la recherche
  const filteredTechnicians = technicians.filter(tech =>
    tech.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Enregistrer un paiement</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Recherche technicien */}
          <div ref={searchRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technicien <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSuggestions(true)
                  if (!e.target.value) {
                    setSelectedTechnician(null)
                    setPendingCommissions([])
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Rechercher un technicien..."
                disabled={!!technicianId}
              />
            </div>
            
            {/* Suggestions */}
            {showSuggestions && searchTerm && !selectedTechnician && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {loadingTechnicians ? (
                  <div className="p-4 text-center text-gray-500">Chargement...</div>
                ) : filteredTechnicians.length > 0 ? (
                  filteredTechnicians.map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => handleSelectTechnician(tech)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="text-primary" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tech.displayName}</p>
                            <p className="text-xs text-gray-500">{tech.email}</p>
                          </div>
                        </div>
                        {tech.balance > 0 && (
                          <span className="text-sm font-semibold text-red-600">
                            ${tech.balance.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">Aucun technicien trouvé</div>
                )}
              </div>
            )}
          </div>

          {/* Affichage du technicien sélectionné avec montant dû */}
          {selectedTechnician && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedTechnician.displayName}</p>
                    <p className="text-sm text-gray-600">{selectedTechnician.email}</p>
                  </div>
                </div>
                {!technicianId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTechnician(null)
                      setSearchTerm('')
                      setPendingCommissions([])
                      setFormData(prev => ({ ...prev, amount: '' }))
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-800">
                    <DollarSign size={18} />
                    <span className="font-medium">Montant dû</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">
                    ${selectedTechnician.balance.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {selectedTechnician.jobsCount} job(s) en attente de paiement
                </p>
              </div>
            </div>
          )}

          {/* Montant - visible uniquement si technicien sélectionné */}
          {selectedTechnician && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedTechnician.balance}
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0.00"
                  required
                />
                {parseFloat(formData.amount) > selectedTechnician.balance && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Le montant ne peut pas dépasser le solde dû
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ${selectedTechnician.balance.toFixed(2)}
                </p>
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode de paiement <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CASH">Espèces</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                  placeholder="Ajouter des notes..."
                />
              </div>

              {/* Résumé */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Résumé du paiement</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant à payer:</span>
                    <span className="font-semibold">${parseFloat(formData.amount || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Solde restant après paiement:</span>
                    <span className="font-semibold text-green-600">
                      ${(selectedTechnician.balance - parseFloat(formData.amount || '0')).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !selectedTechnician || !formData.amount || parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > (selectedTechnician?.balance || 0)}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
