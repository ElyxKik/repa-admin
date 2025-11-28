'use client'

import { User, Briefcase, DollarSign } from 'lucide-react'

interface TechnicianBalance {
  technicianId: string
  technicianName: string
  technicianEmail: string
  balance: number
  jobsCount: number
}

interface TechnicianBalanceCardProps {
  technician: TechnicianBalance
  onPayClick: (technicianId: string) => void
}

export default function TechnicianBalanceCard({ technician, onPayClick }: TechnicianBalanceCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="text-primary" size={24} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{technician.technicianName}</h3>
            <p className="text-sm text-gray-600">{technician.technicianEmail}</p>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Briefcase size={14} />
                <span>{technician.jobsCount} job(s)</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm font-semibold text-red-600">
                <DollarSign size={14} />
                <span>${technician.balance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onPayClick(technician.technicianId)}
          className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium"
        >
          Payer
        </button>
      </div>
    </div>
  )
}
