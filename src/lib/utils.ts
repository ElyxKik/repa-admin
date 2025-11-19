import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Format a date to a readable string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd MMMM yyyy', { locale: fr })
}

/**
 * Format a date to a short string
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: fr })
}

/**
 * Format a date to a time string
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'HH:mm:ss', { locale: fr })
}

/**
 * Format a date to a relative time string (e.g., "il y a 5 minutes")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

/**
 * Format a date to a full date and time string
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd MMMM yyyy HH:mm:ss', { locale: fr })
}

/**
 * Get the status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'VERIFIED':
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get the status label
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'VERIFIED':
      return 'Vérifié'
    case 'APPROVED':
      return 'Approuvé'
    case 'PENDING':
      return 'En attente'
    case 'IN_PROGRESS':
      return 'En cours'
    case 'REJECTED':
      return 'Rejeté'
    case 'NOT_STARTED':
      return 'Non commencé'
    default:
      return status
  }
}

/**
 * Get the role label
 */
export function getRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrateur'
    case 'TECHNICIAN':
      return 'Technicien'
    case 'CLIENT':
      return 'Client'
    default:
      return role
  }
}

/**
 * Get the document type label
 */
export function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case 'ID_CARD':
      return 'Carte d\'identité'
    case 'PASSPORT':
      return 'Passeport'
    case 'DRIVER_LICENSE':
      return 'Permis de conduire'
    case 'BUSINESS_LICENSE':
      return 'Licence commerciale'
    default:
      return type
  }
}

/**
 * Truncate a string
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

/**
 * Capitalize a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format a number as currency (USD by default)
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
}

/**
 * Generate a random color
 */
export function getRandomColor(): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d > new Date()
}
