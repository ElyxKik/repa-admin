// User Types
export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: 'ADMIN' | 'CLIENT' | 'TECHNICIAN'
  createdAt: string
  updatedAt: string
}

// KYC Types
export interface KYCDocument {
  id: string
  technicianId: string
  documentType: 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE' | 'BUSINESS_LICENSE'
  documentNumber: string
  frontImageUrl: string
  backImageUrl?: string
  expiryDate: string
  uploadedAt: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  rejectionReason?: string
}

export interface KYCVerification {
  id: string
  technicianId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED'
  documentIds: string[]
  selfieImageUrl?: string
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'KYC_APPROVED' | 'KYC_REJECTED' | 'KYC_SUBMITTED' | 'ORDER_RECEIVED' | 'ORDER_COMPLETED' | 'PAYMENT_RECEIVED' | 'MESSAGE_RECEIVED'
  data?: Record<string, any>
  read: boolean
  createdAt: string
}

// Statistics Types
export interface KYCStatistics {
  total: number
  pending: number
  verified: number
  rejected: number
  approvalRate: number
  averageVerificationTime: number
}

export interface UserStatistics {
  totalUsers: number
  totalTechnicians: number
  totalClients: number
  newUsersThisMonth: number
  activeUsers: number
}

export interface DashboardStatistics {
  kyc: KYCStatistics
  users: UserStatistics
  lastUpdated: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Filter Types
export interface KYCFilter {
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
  dateFrom?: string
  dateTo?: string
  searchTerm?: string
  page?: number
  pageSize?: number
}

export interface UserFilter {
  role?: 'CLIENT' | 'TECHNICIAN'
  status?: 'ACTIVE' | 'INACTIVE'
  searchTerm?: string
  page?: number
  pageSize?: number
}

// Form Types
export interface KYCApprovalForm {
  kycId: string
  status: 'VERIFIED' | 'REJECTED'
  rejectionReason?: string
  notes?: string
}

export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

// Admin Types
export interface AdminUser extends User {
  permissions: string[]
  lastLogin?: string
  isActive: boolean
}

// Chart Data Types
export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
  }[]
}
