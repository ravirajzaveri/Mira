export interface Karigar {
  id: string
  code: string
  name: string
  contact?: string
  address?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Process {
  id: string
  name: string
  description?: string
  active: boolean
}

export interface Design {
  id: string
  code: string
  name: string
  category?: string
  description?: string
  active: boolean
}

export interface Issue {
  id: string
  issueNo: string
  issueDate: string
  karigarId: string
  processId: string
  designId?: string
  pieces: number
  grossWeight: number
  stoneWeight: number
  netWeight: number
  remarks?: string
  status: 'Pending' | 'Partial' | 'Completed'
  createdAt: string
  updatedAt: string
  karigar?: Karigar
  process?: Process
  design?: Design
}

export interface Receipt {
  id: string
  receiptNo: string
  receiptDate: string
  issueId: string
  karigarId: string
  pieces: number
  grossWeight: number
  stoneWeight: number
  wastageWeight: number
  netWeight: number
  remarks?: string
  createdAt: string
  updatedAt: string
  issue?: Issue
  karigar?: Karigar
}

export interface CreateIssueData {
  issue_no: string
  issue_date: string
  karigar_id: string
  process_id: string
  design_id?: string
  pieces: number
  gross_weight: number
  stone_weight: number
  net_weight: number
  remarks?: string
}

export interface CreateReceiptData {
  receipt_no: string
  receipt_date: string
  issue_id: string
  pieces: number
  gross_weight: number
  stone_weight: number
  wastage_weight: number
  remarks?: string
}