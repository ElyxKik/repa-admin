'use client'

import { useState, useEffect } from 'react'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import { DollarSign, Users, Clock, TrendingUp, Plus, Search } from 'lucide-react'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import PaymentFormModal from '@/components/payments/PaymentFormModal'
import TechnicianBalanceCard from '@/components/payments/TechnicianBalanceCard'
import PaymentHistoryTable from '@/components/payments/PaymentHistoryTable'

interface Payment {
  id: string
  technicianId: string
  amount: number
  paymentMethod: string
  transactionId?: string
  commissionIds: string[]
  createdAt: Timestamp | string
  createdBy: string
  notes?: string
  technicianName?: string
  balanceBefore?: number
  balanceAfter?: number
}

interface TechnicianBalance {
  technicianId: string
  technicianName: string
  technicianEmail: string
  balance: number
  jobsCount: number
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'technicians' | 'history'>('dashboard')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Stats
  const [totalDue, setTotalDue] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [pendingCommissions, setPendingCommissions] = useState(0)
  const [techniciansWithBalance, setTechniciansWithBalance] = useState(0)
  
  // Data
  const [technicianBalances, setTechnicianBalances] = useState<TechnicianBalance[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchStats(),
        fetchTechnicianBalances(),
        fetchPayments()
      ])
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Commissions en attente
      const pendingQuery = query(
        collection(db, 'repa_commissions'),
        where('status', '==', 'EN_ATTENTE')
      )
      const pendingSnapshot = await getDocs(pendingQuery)
      
      let totalDueAmount = 0
      pendingSnapshot.forEach((doc) => {
        const data = doc.data()
        totalDueAmount += data.commissionAmount || 0
      })
      
      setTotalDue(totalDueAmount)
      setPendingCommissions(pendingSnapshot.size)
      
      // Commissions payées
      const paidQuery = query(
        collection(db, 'repa_commissions'),
        where('status', '==', 'PAYEE')
      )
      const paidSnapshot = await getDocs(paidQuery)
      
      let totalPaidAmount = 0
      paidSnapshot.forEach((doc) => {
        const data = doc.data()
        totalPaidAmount += data.commissionAmount || 0
      })
      
      setTotalPaid(totalPaidAmount)
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    }
  }

  const fetchTechnicianBalances = async () => {
    try {
      // Récupérer toutes les commissions en attente
      const commissionsQuery = query(
        collection(db, 'repa_commissions'),
        where('status', '==', 'EN_ATTENTE')
      )
      const commissionsSnapshot = await getDocs(commissionsQuery)
      
      // Grouper par technicien
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
      
      // Récupérer les infos des techniciens
      const technicianIds = Array.from(balanceMap.keys())
      const balances: TechnicianBalance[] = []
      
      for (const techId of technicianIds) {
        try {
          const usersQuery = query(
            collection(db, 'users'),
            where('__name__', '==', techId)
          )
          const userSnapshot = await getDocs(usersQuery)
          
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data()
            const balanceData = balanceMap.get(techId)!
            
            balances.push({
              technicianId: techId,
              technicianName: userData.displayName || 'Technicien inconnu',
              technicianEmail: userData.email || '',
              balance: balanceData.balance,
              jobsCount: balanceData.jobsCount
            })
          }
        } catch (error) {
          console.error('Erreur chargement technicien:', techId, error)
        }
      }
      
      setTechnicianBalances(balances.sort((a, b) => b.balance - a.balance))
      setTechniciansWithBalance(balances.length)
    } catch (error) {
      console.error('Erreur chargement soldes:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const paymentsQuery = query(
        collection(db, 'repa_payments'),
        orderBy('createdAt', 'desc')
      )
      const paymentsSnapshot = await getDocs(paymentsQuery)
      
      const paymentsData: Payment[] = []
      
      for (const doc of paymentsSnapshot.docs) {
        const data = doc.data()
        
        // Récupérer le nom du technicien
        let technicianName = 'Technicien inconnu'
        try {
          const userQuery = query(
            collection(db, 'users'),
            where('__name__', '==', data.technicianId)
          )
          const userSnapshot = await getDocs(userQuery)
          if (!userSnapshot.empty) {
            technicianName = userSnapshot.docs[0].data().displayName || 'Technicien inconnu'
          }
        } catch (error) {
          console.error('Erreur chargement technicien:', error)
        }
        
        paymentsData.push({
          id: doc.id,
          ...data,
          technicianName
        } as Payment)
      }
      
      setPayments(paymentsData)
    } catch (error) {
      console.error('Erreur chargement paiements:', error)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setSelectedTechnicianId(null)
    fetchData()
  }

  const filteredTechnicians = technicianBalances.filter(tech =>
    tech.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.technicianEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Paiements</h1>
            <p className="text-gray-600 mt-1">Gérez les paiements des commissions REPA</p>
          </div>
          <button
            onClick={() => setShowPaymentForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            <Plus size={20} />
            Nouveau paiement
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total dû à REPA</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  ${totalDue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-red-200 rounded-lg">
                <DollarSign className="text-red-700" size={24} />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">{pendingCommissions} commission(s) en attente</p>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total payé</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  ${totalPaid.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <TrendingUp className="text-green-700" size={24} />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Techniciens</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {techniciansWithBalance}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <Users className="text-blue-700" size={24} />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">Avec solde dû</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Paiements</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {payments.length}
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-lg">
                <Clock className="text-purple-700" size={24} />
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2">Total enregistrés</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('technicians')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'technicians'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Techniciens ({techniciansWithBalance})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historique ({payments.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Techniciens avec soldes dus</h2>
              {filteredTechnicians.length > 0 ? (
                <div className="space-y-3">
                  {filteredTechnicians.slice(0, 5).map((tech) => (
                    <TechnicianBalanceCard
                      key={tech.technicianId}
                      technician={tech}
                      onPayClick={(techId) => {
                        setSelectedTechnicianId(techId)
                        setShowPaymentForm(true)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">Aucun solde dû</p>
              )}
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Paiements récents</h2>
              <PaymentHistoryTable payments={payments.slice(0, 5)} />
            </div>
          </div>
        )}

        {activeTab === 'technicians' && (
          <div className="card">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un technicien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            {filteredTechnicians.length > 0 ? (
              <div className="space-y-3">
                {filteredTechnicians.map((tech) => (
                  <TechnicianBalanceCard
                    key={tech.technicianId}
                    technician={tech}
                    onPayClick={(techId) => {
                      setSelectedTechnicianId(techId)
                      setShowPaymentForm(true)
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">Aucun technicien trouvé</p>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Historique des paiements</h2>
            <PaymentHistoryTable payments={payments} />
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentFormModal
          technicianId={selectedTechnicianId}
          onClose={() => {
            setShowPaymentForm(false)
            setSelectedTechnicianId(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </ProtectedDashboardLayout>
  )
}
