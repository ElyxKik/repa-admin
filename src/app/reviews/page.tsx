'use client'

import { useState, useEffect } from 'react'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import { Star, Search, User, MessageSquare, ThumbsUp, Calendar } from 'lucide-react'
import { collection, query, orderBy, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface Review {
  id: string
  comment: string
  rating: number
  requestId: string
  revieweeId: string  // Technicien évalué
  reviewerId: string  // Client qui évalue
  tags: string[]
  createdAt: Timestamp | string
  // Données enrichies
  reviewerName?: string
  revieweeName?: string
  requestTitle?: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState<string>('all')

  // Stats
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({})

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      
      const reviewsRef = collection(db, 'reviews')
      let reviewsSnapshot
      
      try {
        const q = query(reviewsRef, orderBy('createdAt', 'desc'))
        reviewsSnapshot = await getDocs(q)
      } catch (indexError) {
        console.warn('⚠️ Index manquant, récupération sans tri:', indexError)
        reviewsSnapshot = await getDocs(reviewsRef)
      }
      
      console.log(`📊 Avis trouvés: ${reviewsSnapshot.size}`)
      
      const reviewsData: Review[] = []
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let totalRating = 0
      
      for (const docSnap of reviewsSnapshot.docs) {
        const data = docSnap.data()
        const review: Review = {
          id: docSnap.id,
          comment: data.comment || '',
          rating: data.rating || 0,
          requestId: data.requestId || '',
          revieweeId: data.revieweeId || '',
          reviewerId: data.reviewerId || '',
          tags: data.tags || [],
          createdAt: data.createdAt
        }
        
        // Compter la distribution des notes
        if (review.rating >= 1 && review.rating <= 5) {
          distribution[review.rating]++
          totalRating += review.rating
        }
        
        // Récupérer le nom du reviewer (client)
        if (data.reviewerId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.reviewerId))
            if (userDoc.exists()) {
              review.reviewerName = userDoc.data().displayName || 'Client inconnu'
            }
          } catch (error) {
            console.error('Erreur chargement reviewer:', error)
          }
        }
        
        // Récupérer le nom du reviewee (technicien)
        if (data.revieweeId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.revieweeId))
            if (userDoc.exists()) {
              review.revieweeName = userDoc.data().displayName || 'Technicien inconnu'
            }
          } catch (error) {
            console.error('Erreur chargement reviewee:', error)
          }
        }
        
        // Récupérer le titre de la demande
        if (data.requestId) {
          try {
            const requestDoc = await getDoc(doc(db, 'repair_requests', data.requestId))
            if (requestDoc.exists()) {
              review.requestTitle = requestDoc.data().title || 'Demande inconnue'
            }
          } catch (error) {
            console.error('Erreur chargement request:', error)
          }
        }
        
        reviewsData.push(review)
      }
      
      // Trier côté client si nécessaire
      reviewsData.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
      
      setReviews(reviewsData)
      setTotalReviews(reviewsData.length)
      setRatingDistribution(distribution)
      setAverageRating(reviewsData.length > 0 ? totalRating / reviewsData.length : 0)
      
    } catch (error) {
      console.error('❌ Erreur chargement avis:', error)
      toast.error('Erreur lors du chargement des avis')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Timestamp | string) => {
    try {
      const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date)
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return '-'
    }
  }

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.revieweeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating)
    
    return matchesSearch && matchesRating
  })

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'Professionnel': 'bg-blue-100 text-blue-800',
      'Rapide': 'bg-green-100 text-green-800',
      'Ponctuel': 'bg-purple-100 text-purple-800',
      'Sympathique': 'bg-pink-100 text-pink-800',
      'Compétent': 'bg-indigo-100 text-indigo-800',
      'Soigneux': 'bg-teal-100 text-teal-800',
    }
    return colors[tag] || 'bg-gray-100 text-gray-800'
  }

  return (
    <ProtectedDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Avis & Évaluations</h1>
          <p className="text-gray-600 mt-1">Consultez les avis des clients sur les techniciens</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Note moyenne</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-yellow-900">
                    {averageRating.toFixed(1)}
                  </p>
                  {renderStars(Math.round(averageRating), 18)}
                </div>
              </div>
              <div className="p-3 bg-yellow-200 rounded-lg">
                <Star className="text-yellow-700 fill-yellow-700" size={24} />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total avis</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{totalReviews}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <MessageSquare className="text-blue-700" size={24} />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">5 étoiles</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{ratingDistribution[5] || 0}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <ThumbsUp className="text-green-700" size={24} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">
              {totalReviews > 0 ? ((ratingDistribution[5] || 0) / totalReviews * 100).toFixed(0) : 0}% des avis
            </p>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Ce mois</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {reviews.filter(r => {
                    const date = r.createdAt instanceof Timestamp ? r.createdAt.toDate() : new Date(r.createdAt)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-lg">
                <Calendar className="text-purple-700" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Distribution des notes</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">{count} avis</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un avis, client, technicien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="all">Toutes les notes</option>
              <option value="5">5 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="2">2 étoiles</option>
              <option value="1">1 étoile</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="card hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="text-primary" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {review.reviewerName || 'Client anonyme'}
                        </h3>
                        {renderStars(review.rating)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Avis pour <span className="font-medium text-primary">{review.revieweeName || 'Technicien'}</span>
                        {review.requestTitle && (
                          <span className="text-gray-400"> • {review.requestTitle}</span>
                        )}
                      </p>
                      
                      {review.comment && (
                        <p className="text-gray-700 mb-3">"{review.comment}"</p>
                      )}
                      
                      {review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {review.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Aucun avis trouvé</p>
          </div>
        )}
      </div>
    </ProtectedDashboardLayout>
  )
}
