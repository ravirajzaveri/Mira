import axios from 'axios'
import { CreateIssueData, CreateReceiptData, Issue, Receipt, Karigar, Process, Design } from '@/types'
import { OrderCreate, OrderUpdate, OrderStatusUpdate, Order, OrderListResponse, OrderDashboard } from '@/types/orders'

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Issue API
export const issueApi = {
  create: async (data: CreateIssueData): Promise<Issue> => {
    const response = await api.post('/issues/', data)
    return response.data
  },

  getAll: async (params?: { skip?: number; limit?: number; status?: string; karigar_id?: string }): Promise<Issue[]> => {
    const response = await api.get('/issues/', { params })
    return response.data
  },

  getById: async (id: string): Promise<Issue> => {
    const response = await api.get(`/issues/${id}`)
    return response.data
  },

  generateNumber: async (): Promise<{ issue_number: string }> => {
    const response = await api.get('/issues/generate/number')
    return response.data
  },

  getPendingByKarigar: async (karigarId: string): Promise<Issue[]> => {
    const response = await api.get(`/issues/pending/by-karigar/${karigarId}`)
    return response.data
  },
}

// Receipt API
export const receiptApi = {
  create: async (data: CreateReceiptData): Promise<Receipt> => {
    const response = await api.post('/receipts/', data)
    return response.data
  },

  getAll: async (params?: { skip?: number; limit?: number; issue_id?: string; karigar_id?: string }): Promise<Receipt[]> => {
    const response = await api.get('/receipts/', { params })
    return response.data
  },

  getById: async (id: string): Promise<Receipt> => {
    const response = await api.get(`/receipts/${id}`)
    return response.data
  },

  generateNumber: async (): Promise<{ receipt_number: string }> => {
    const response = await api.get('/receipts/generate/number')
    return response.data
  },

  getIssueSummary: async (issueId: string) => {
    const response = await api.get(`/receipts/issue/${issueId}/summary`)
    return response.data
  },
}

// Karigar API
export const karigarApi = {
  getAll: async (params?: { skip?: number; limit?: number; active?: boolean }): Promise<Karigar[]> => {
    const response = await api.get('/karigars/', { params })
    return response.data
  },

  getById: async (id: string): Promise<Karigar> => {
    const response = await api.get(`/karigars/${id}`)
    return response.data
  },
}

// Process API
export const processApi = {
  getAll: async (params?: { active?: boolean }): Promise<Process[]> => {
    const response = await api.get('/processes/', { params })
    return response.data
  },
}

// Design API
export const designApi = {
  getAll: async (params?: { active?: boolean; category?: string }): Promise<Design[]> => {
    const response = await api.get('/designs/', { params })
    return response.data
  },
}

// Order API
export const orderApi = {
  create: async (data: OrderCreate): Promise<Order> => {
    const response = await api.post('/orders/', data)
    return response.data
  },

  getAll: async (params?: { 
    page?: number; 
    page_size?: number; 
    status?: string; 
    location?: string; 
    client_category?: string; 
    urgency_level?: string; 
    search?: string; 
  }): Promise<OrderListResponse> => {
    const response = await api.get('/orders/', { params })
    return response.data
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  update: async (id: string, data: OrderUpdate): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, data)
    return response.data
  },

  updateStatus: async (id: string, data: OrderStatusUpdate): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, data)
    return response.data
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/orders/${id}`)
    return response.data
  },

  generateNumber: async (): Promise<{ orderNo: string }> => {
    const response = await api.get('/orders/generate/number')
    return response.data
  },

  getStatusHistory: async (id: string): Promise<any[]> => {
    const response = await api.get(`/orders/${id}/status-history`)
    return response.data
  },

  getDashboard: async (): Promise<OrderDashboard> => {
    const response = await api.get('/orders/dashboard/stats')
    return response.data
  },
}

export default api