'use client'

import { Timestamp } from 'firebase/firestore'
import { CreditCard, Smartphone, Building, Banknote } from 'lucide-react'

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

interface PaymentHistoryTableProps {
  payments: Payment[]
}

export default function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY':
        return <Smartphone size={16} className="text-blue-600" />
      case 'BANK_TRANSFER':
        return <Building size={16} className="text-purple-600" />
      case 'CASH':
        return <Banknote size={16} className="text-green-600" />
      case 'CARD':
        return <CreditCard size={16} className="text-orange-600" />
      default:
        return <CreditCard size={16} className="text-gray-600" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      MOBILE_MONEY: 'Mobile Money',
      BANK_TRANSFER: 'Virement bancaire',
      CASH: 'Espèces',
      CARD: 'Carte bancaire'
    }
    return labels[method] || method
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Aucun paiement enregistré
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Technicien
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Montant dû
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Montant payé
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Solde restant
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Méthode
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Transaction ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Commissions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatDate(payment.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.technicianName || 'Technicien inconnu'}
                  </p>
                  {payment.notes && (
                    <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-semibold text-red-600">
                  {payment.balanceBefore !== undefined ? `$${payment.balanceBefore.toFixed(2)}` : '-'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-semibold text-green-600">
                  ${payment.amount.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-semibold text-blue-600">
                  {payment.balanceAfter !== undefined ? `$${payment.balanceAfter.toFixed(2)}` : '-'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(payment.paymentMethod)}
                  <span className="text-sm text-gray-900">
                    {getPaymentMethodLabel(payment.paymentMethod)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {payment.transactionId || '-'}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {payment.commissionIds.length} commission(s)
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
