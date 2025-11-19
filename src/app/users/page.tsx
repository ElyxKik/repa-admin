'use client'

import { useState, useEffect } from 'react'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import { Search, Filter, Edit2, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { collection, query, orderBy, getDocs, doc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface User {
  id: string
  displayName: string
  email: string
  phoneNumber?: string
  role: 'CLIENT' | 'TECHNICIAN' | 'ADMIN'
  isVerified: boolean
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
  // Champs optionnels
  photoURL?: string
  ville?: string
  rating?: number
  reviewCount?: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const usersRef = collection(db, 'users')
      const q = query(usersRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const usersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as User[]
      
      setUsers(usersData)
      console.log(`✅ ${usersData.length} utilisateurs chargés`)
    } catch (error) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const getVerificationIcon = (isVerified: boolean) => {
    return isVerified 
      ? <CheckCircle className="text-green-500" size={18} />
      : <XCircle className="text-gray-400" size={18} />
  }

  const getVerificationLabel = (isVerified: boolean) => {
    return isVerified ? 'Vérifié' : 'Non vérifié'
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      CLIENT: 'Client',
      TECHNICIAN: 'Technicien',
      ADMIN: 'Administrateur',
    }
    return labels[role] || role
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700'
      case 'TECHNICIAN':
        return 'bg-blue-50 text-blue-700'
      case 'CLIENT':
        return 'bg-gray-50 text-gray-700'
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRole === 'all' || u.role === filterRole
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'users', id))
      setUsers(users.filter((u) => u.id !== id))
      toast.success('Utilisateur supprimé')
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur lors de la suppression')
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-2">Gérez les utilisateurs et leurs statuts KYC</p>
          </div>
          <button className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition">
            <Plus size={20} />
            <span>Ajouter un utilisateur</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Clients</p>
            <p className="text-2xl font-bold text-gray-600">{users.filter((u) => u.role === 'CLIENT').length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Techniciens</p>
            <p className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === 'TECHNICIAN').length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Vérifiés</p>
            <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.isVerified).length}</p>
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
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="all">Tous les rôles</option>
                <option value="CLIENT">Clients</option>
                <option value="TECHNICIAN">Techniciens</option>
                <option value="ADMIN">Administrateurs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilisateur</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Téléphone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rôle</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vérifié</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Inscrit le</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">{user.displayName?.charAt(0) || '?'}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.displayName || 'Sans nom'}</p>
                          {user.ville && <p className="text-xs text-gray-500">{user.ville}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{user.phoneNumber || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getVerificationIcon(user.isVerified)}
                        <span className="text-sm">{getVerificationLabel(user.isVerified)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-blue-50 rounded transition text-blue-600">
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-50 rounded transition text-red-600"
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
                    Aucun utilisateur trouvé
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
