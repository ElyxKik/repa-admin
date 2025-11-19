'use client'

import { useState, useEffect } from 'react'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import { Plus, Trash2, ArrowLeft, Save, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface CommonIssue {
  id: string
  title: string
  category: string[]
  order: number
}

const AVAILABLE_CATEGORIES = [
  { id: 'PHONE', label: 'Téléphone' },
  { id: 'LAPTOP', label: 'Ordinateur Portable' },
  { id: 'TABLET', label: 'Tablette' },
  { id: 'ALL', label: 'Tous' }
]

export default function CommonIssuesPage() {
  const [issues, setIssues] = useState<CommonIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [order, setOrder] = useState(1)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'common_issues'), orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommonIssue[]
      setIssues(issuesData)
    } catch (error) {
      console.error('Erreur chargement problèmes:', error)
      toast.error('Erreur lors du chargement des problèmes')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (catId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(catId)) {
        return prev.filter(id => id !== catId)
      } else {
        return [...prev, catId]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Le titre est requis')
      return
    }
    if (selectedCategories.length === 0) {
      toast.error('Au moins une catégorie est requise')
      return
    }

    try {
      setSubmitting(true)
      await addDoc(collection(db, 'common_issues'), {
        title,
        category: selectedCategories,
        order: Number(order)
      })
      
      toast.success('Problème ajouté avec succès')
      // Reset form
      setTitle('')
      setSelectedCategories([])
      setOrder(prev => prev + 1)
      // Refresh list
      fetchIssues()
    } catch (error) {
      console.error('Erreur ajout problème:', error)
      toast.error("Erreur lors de l'ajout")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce problème récurrent ?')) return

    try {
      await deleteDoc(doc(db, 'common_issues', id))
      setIssues(prev => prev.filter(item => item.id !== id))
      toast.success('Problème supprimé')
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <ProtectedDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/repairs" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Problèmes Récurrents</h1>
            <p className="text-gray-600 mt-2">Gérez la liste des problèmes fréquents pour les réparations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire d'ajout */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary" />
                Ajouter un problème
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du problème
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Écran cassé"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégories concernées
                  </label>
                  <div className="space-y-2">
                    {AVAILABLE_CATEGORIES.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => handleCategoryToggle(cat.id)}
                          className="rounded text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="text-gray-700">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-secondary text-white py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Liste des problèmes */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 w-16">Ordre</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Titre</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Catégories</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        </td>
                      </tr>
                    ) : issues.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle size={24} className="text-gray-400" />
                            <p>Aucun problème récurrent configuré</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      issues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600 font-medium">
                            #{issue.order}
                          </td>
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {issue.title}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {issue.category.map((cat) => (
                                <span 
                                  key={cat}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {AVAILABLE_CATEGORIES.find(c => c.id === cat)?.label || cat}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDelete(issue.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  )
}
