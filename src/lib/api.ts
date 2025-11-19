import axios, { AxiosInstance } from 'axios'
import { ApiResponse, PaginatedResponse, KYCVerification, KYCDocument, User, Notification } from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('adminToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // KYC Methods
  async getKYCVerifications(status?: string): Promise<ApiResponse<PaginatedResponse<KYCVerification>>> {
    const response = await this.client.get('/kyc/verifications', {
      params: { status },
    })
    return response.data
  }

  async getKYCVerification(id: string): Promise<ApiResponse<KYCVerification>> {
    const response = await this.client.get(`/kyc/verifications/${id}`)
    return response.data
  }

  async approveKYC(id: string, notes?: string): Promise<ApiResponse<KYCVerification>> {
    const response = await this.client.post(`/kyc/verifications/${id}/approve`, { notes })
    return response.data
  }

  async rejectKYC(id: string, reason: string): Promise<ApiResponse<KYCVerification>> {
    const response = await this.client.post(`/kyc/verifications/${id}/reject`, { reason })
    return response.data
  }

  async getKYCDocuments(technicianId: string): Promise<ApiResponse<KYCDocument[]>> {
    const response = await this.client.get(`/kyc/documents`, {
      params: { technicianId },
    })
    return response.data
  }

  // User Methods
  async getUsers(role?: string): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await this.client.get('/users', {
      params: { role },
    })
    return response.data
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get(`/users/${id}`)
    return response.data
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put(`/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/users/${id}`)
    return response.data
  }

  // Notification Methods
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    const response = await this.client.get('/notifications')
    return response.data
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await this.client.put(`/notifications/${id}/read`)
    return response.data
  }

  // Statistics Methods
  async getStatistics(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/statistics')
    return response.data
  }

  async getKYCStatistics(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/statistics/kyc')
    return response.data
  }

  async getUserStatistics(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/statistics/users')
    return response.data
  }
}

export const apiClient = new ApiClient()
