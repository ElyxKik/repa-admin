'use client'

import { useEffect, useState } from 'react'
import { Users, FileCheck, Wrench, Clock } from 'lucide-react'
import { collection, query, where, getCountFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface StatCard {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  bgColor: string
  loading?: boolean
}

export default function RealTimeStatistics() {
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Utilisateurs Totaux',
      value: '...',
      icon: <Users size={24} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      loading: true,
    },
    {
      title: 'Techniciens Vérifiés',
      value: '...',
      icon: <FileCheck size={24} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      loading: true,
    },
    {
      title: 'Demandes Ouvertes',
      value: '...',
      icon: <Wrench size={24} />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      loading: true,
    },
    {
      title: 'KYC En Attente',
      value: '...',
      icon: <Clock size={24} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      loading: true,
    },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('📊 Chargement des statistiques...')
        
        // Compter tous les utilisateurs
        const usersRef = collection(db, 'users')
        console.log('🔍 Comptage des utilisateurs...')
        const usersSnapshot = await getCountFromServer(usersRef)
        const totalUsers = usersSnapshot.data().count
        console.log('✅ Utilisateurs totaux:', totalUsers)

        // Compter les techniciens vérifiés
        const verifiedTechsQuery = query(
          usersRef,
          where('role', '==', 'TECHNICIAN'),
          where('isVerified', '==', true)
        )
        console.log('🔍 Comptage des techniciens vérifiés...')
        const verifiedTechsSnapshot = await getCountFromServer(verifiedTechsQuery)
        const verifiedTechs = verifiedTechsSnapshot.data().count
        console.log('✅ Techniciens vérifiés:', verifiedTechs)

        // Compter les demandes de réparation ouvertes
        const repairRequestsRef = collection(db, 'repair_requests')
        console.log('🔍 Comptage des demandes ouvertes...')
        const openRequestsQuery = query(
          repairRequestsRef,
          where('status', 'in', ['OPEN', 'ASSIGNED', 'IN_PROGRESS'])
        )
        const openRequestsSnapshot = await getCountFromServer(openRequestsQuery)
        const openRequests = openRequestsSnapshot.data().count
        console.log('✅ Demandes ouvertes:', openRequests)

        // Compter les KYC en attente
        const kycRef = collection(db, 'kyc_verifications')
        console.log('🔍 Comptage des KYC en attente...')
        const pendingKycQuery = query(
          kycRef,
          where('status', '==', 'IN_PROGRESS')
        )
        const pendingKycSnapshot = await getCountFromServer(pendingKycQuery)
        const pendingKyc = pendingKycSnapshot.data().count
        console.log('✅ KYC en attente:', pendingKyc)

        // Mettre à jour les stats
        setStats([
          {
            title: 'Utilisateurs Totaux',
            value: totalUsers.toLocaleString('fr-FR'),
            icon: <Users size={24} />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            loading: false,
          },
          {
            title: 'Techniciens Vérifiés',
            value: verifiedTechs.toLocaleString('fr-FR'),
            icon: <FileCheck size={24} />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            loading: false,
          },
          {
            title: 'Demandes Ouvertes',
            value: openRequests.toLocaleString('fr-FR'),
            icon: <Wrench size={24} />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            loading: false,
          },
          {
            title: 'KYC En Attente',
            value: pendingKyc.toLocaleString('fr-FR'),
            icon: <Clock size={24} />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            loading: false,
          },
        ])
      } catch (error: any) {
        console.error('❌ Erreur lors du chargement des statistiques:', error)
        console.error('Code d\'erreur:', error?.code)
        console.error('Message:', error?.message)
        
        // Afficher un message d'erreur plus explicite
        if (error?.code === 'permission-denied') {
          console.error('🚫 Accès refusé: Vérifiez les règles de sécurité Firestore')
        } else if (error?.code === 'unavailable') {
          console.error('🌐 Firestore indisponible: Vérifiez votre connexion')
        }
        
        // En cas d'erreur, afficher 0
        setStats(prev => prev.map(stat => ({ ...stat, value: '0', loading: false })))
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stat.loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stat.value
                )}
              </p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
