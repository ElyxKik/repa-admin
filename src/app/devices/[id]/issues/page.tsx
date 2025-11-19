'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import { Plus, Trash2, ArrowLeft, Save, Edit2, X } from 'lucide-react'
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface CommonIssue {
  id: string
  title: string
  order: number
}

interface Device {
  name: string
  description: string
  iconName: string
}

export default function DeviceIssuesPage() {
  const params = useParams()
  const router = useRouter()
  const deviceId = params?.id as string

  const [device, setDevice] = useState<Device | null>(null)
  const [issues, setIssues] = useState<CommonIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingIssue, setEditingIssue] = useState<CommonIssue | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    order: 1
  })

  useEffect(() => {
    if (deviceId) {
      fetchDeviceAndIssues()
    }
  }, [deviceId])

  const fetchDeviceAndIssues = async () => {
    try {
      setLoading(true)
      
      const deviceDoc = await getDoc(doc(db, 'devices', deviceId))
      if (deviceDoc.exists()) {
        setDevice(deviceDoc.data() as Device)
      }
      
      const q = query(
        collection(db, 'devices', deviceId, 'common_issues'),
        orderBy('order', 'asc')
      )
      const snapshot = await getDocs(q)
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommonIssue[]
      
      setIssues(issuesData)
    } catch (error) {
      console.error('Error loading:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    try {
      setSubmitting(true)
      if (editingIssue) {
        await updateDoc(
          doc(db, 'devices', deviceId, 'common_issues', editingIssue.id),
          { ...formData, updatedAt: Timestamp.now() }
        )
        toast.success('Problème modifié')
      } else {
        await addDoc(
          collection(db, 'devices', deviceId, 'common_issues'),
          { ...formData, createdAt: Timestamp.now() }
        )
        toast.success('Problème ajouté')
      }
      
      resetForm()
      fetchDeviceAndIssues()
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (issue: CommonIssue) => {
    setEditingIssue(issue)
    setFormData({ title: issue.title, order: issue.order })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce problème ?')) return

    try {
      await deleteDoc(doc(db, 'devices', deviceId, 'common_issues', id))
      setIssues(issues.filter(i => i.id !== id))
      toast.success('Problème supprimé')
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({ title: '', order: issues.length + 1 })
    setEditingIssue(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <ProtectedDashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedDashboardLayout>
    )
  }

  return (
    <ProtectedDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/devices')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Problèmes courants - {device?.name || 'Device'}
            </h1>
            <p className="text-gray-600 mt-2">{device?.description}</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="ml-auto flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
          >
            <Plus size={20} />
            Ajouter
          </button>
        </div>

        <div className="card">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {issues.length} problème{issues.length > 1 ? 's' : ''} au total
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 w-20">Ordre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Titre</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length > 0 ? (
                  issues.map((issue) => (
                    <tr key={issue.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600 font-medium">#{issue.order}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{issue.title}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(issue)}
                            className="p-2 hover:bg-blue-50 rounded transition text-blue-600"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(issue.id)}
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
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      Aucun problème courant. Ajoutez-en un!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingIssue ? 'Modifier' : 'Ajouter'} un problème
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Écran cassé"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    min="1"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={18} />
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ProtectedDashboardLayout>
  )
}
