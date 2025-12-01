'use client'

import { useState, useEffect } from 'react'
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'
import { Plus, Search, Edit2, Trash2, Eye, Power, X, Smartphone, Laptop, Tablet, Watch, Tv, Headphones, Camera, Printer, Gamepad, Car, AirVent, Refrigerator, LayoutGrid, Bike, Microwave } from 'lucide-react'
import Link from 'next/link'
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, getCountFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface Device {
  id: string
  name: string
  description: string
  iconName: string
  order: number
  isActive: boolean
  issuesCount?: number
}

const ICON_MAP: Record<string, any> = {
  smartphone_rounded: Smartphone,
  laptop_rounded: Laptop,
  tablet_rounded: Tablet,
  watch_rounded: Watch,
  tv_rounded: Tv,
  headset_rounded: Headphones,
  camera_alt_rounded: Camera,
  print_rounded: Printer,
  sports_esports_rounded: Gamepad,
  devices_other_rounded: Smartphone,
  car_rounded: Car,
  air_vent_rounded: AirVent,
  refrigerator_rounded: Refrigerator,
  modular_rounded: LayoutGrid,
  motorcycle_rounded: Bike,
  appliance_rounded: Microwave,
}

const AVAILABLE_ICONS = [
  { id: 'smartphone_rounded', label: 'Smartphone', Icon: Smartphone },
  { id: 'laptop_rounded', label: 'Laptop', Icon: Laptop },
  { id: 'tablet_rounded', label: 'Tablette', Icon: Tablet },
  { id: 'watch_rounded', label: 'Montre', Icon: Watch },
  { id: 'tv_rounded', label: 'TV', Icon: Tv },
  { id: 'headset_rounded', label: 'Casque', Icon: Headphones },
  { id: 'camera_alt_rounded', label: 'Caméra', Icon: Camera },
  { id: 'print_rounded', label: 'Imprimante', Icon: Printer },
  { id: 'sports_esports_rounded', label: 'Console', Icon: Gamepad },
  { id: 'car_rounded', label: 'Véhicule', Icon: Car },
  { id: 'air_vent_rounded', label: 'Climatiseur', Icon: AirVent },
  { id: 'refrigerator_rounded', label: 'Frigo', Icon: Refrigerator },
  { id: 'modular_rounded', label: 'Modulaire', Icon: LayoutGrid },
  { id: 'motorcycle_rounded', label: 'Moto', Icon: Bike },
  { id: 'appliance_rounded', label: 'Électroménager', Icon: Microwave },
  { id: 'devices_other_rounded', label: 'Autre', Icon: Smartphone },
]

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconName: 'smartphone_rounded',
    order: 1,
    isActive: true
  })

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'devices'), orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      
      const devicesData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data()
          
          let issuesCount = 0
          try {
            const issuesRef = collection(db, 'devices', docSnap.id, 'common_issues')
            const issuesSnapshot = await getCountFromServer(issuesRef)
            issuesCount = issuesSnapshot.data().count
          } catch (error) {
            console.error('Error counting issues:', error)
          }
          
          return {
            id: docSnap.id,
            ...data,
            issuesCount
          } as Device
        })
      )
      
      setDevices(devicesData)
    } catch (error) {
      console.error('Error loading devices:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setSubmitting(true)
      if (editingDevice) {
        await updateDoc(doc(db, 'devices', editingDevice.id), {
          ...formData,
          updatedAt: Timestamp.now()
        })
        toast.success('Device modifié avec succès')
      } else {
        await addDoc(collection(db, 'devices'), {
          ...formData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
        toast.success('Device ajouté avec succès')
      }
      
      resetForm()
      fetchDevices()
    } catch (error) {
      console.error('Error saving device:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (device: Device) => {
    setEditingDevice(device)
    setFormData({
      name: device.name,
      description: device.description,
      iconName: device.iconName,
      order: device.order,
      isActive: device.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce device ?')) return

    try {
      await deleteDoc(doc(db, 'devices', id))
      setDevices(devices.filter(d => d.id !== id))
      toast.success('Device supprimé')
    } catch (error) {
      console.error('Error deleting device:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleStatus = async (device: Device) => {
    try {
      await updateDoc(doc(db, 'devices', device.id), {
        isActive: !device.isActive,
        updatedAt: Timestamp.now()
      })
      
      setDevices(devices.map(d => 
        d.id === device.id ? { ...d, isActive: !d.isActive } : d
      ))
      
      toast.success(device.isActive ? 'Device désactivé' : 'Device activé')
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      iconName: 'smartphone_rounded',
      order: devices.length + 1,
      isActive: true
    })
    setEditingDevice(null)
    setShowForm(false)
  }

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && device.isActive) ||
                         (filterStatus === 'inactive' && !device.isActive)
    return matchesSearch && matchesFilter
  })

  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName] || Smartphone
    return Icon
  }

  return (
    <ProtectedDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Devices</h1>
            <p className="text-gray-600 mt-2">Types d'appareils et problèmes courants</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            <span>Ajouter un device</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Actifs</p>
            <p className="text-2xl font-bold text-green-600">{devices.filter(d => d.isActive).length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Inactifs</p>
            <p className="text-2xl font-bold text-gray-600">{devices.filter(d => !d.isActive).length}</p>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un device..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Icône</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Problèmes</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => {
                    const Icon = getIcon(device.iconName)
                    return (
                      <tr key={device.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="text-primary" size={24} />
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{device.name}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{device.description}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {device.issuesCount || 0} problème{(device.issuesCount || 0) > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            device.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {device.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/devices/${device.id}/issues`}
                              className="p-2 hover:bg-blue-50 rounded transition text-blue-600"
                              title="Voir les problèmes"
                            >
                              <Eye size={18} />
                            </Link>
                            <button
                              onClick={() => handleEdit(device)}
                              className="p-2 hover:bg-blue-50 rounded transition text-blue-600"
                              title="Modifier"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(device)}
                              className={`p-2 rounded transition ${
                                device.isActive ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-green-50 text-green-600'
                              }`}
                              title={device.isActive ? 'Désactiver' : 'Activer'}
                            >
                              <Power size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(device.id)}
                              className="p-2 hover:bg-red-50 rounded transition text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Aucun device trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDevice ? 'Modifier le device' : 'Ajouter un device'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Téléphone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: iPhone, Android, etc."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icône
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVAILABLE_ICONS.map((icon) => {
                      const IconComponent = icon.Icon
                      return (
                        <button
                          key={icon.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, iconName: icon.id })}
                          className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition ${
                            formData.iconName === icon.id
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent size={24} className={formData.iconName === icon.id ? 'text-primary' : 'text-gray-600'} />
                          <span className="text-xs text-gray-600">{icon.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordre d'affichage
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <label className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="text-gray-700">Actif</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary hover:bg-secondary text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
