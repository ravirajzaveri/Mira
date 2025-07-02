export enum ClientCategory {
  SAMPLE = "SAMPLE",
  ONLINE = "ONLINE",
  RETAIL = "RETAIL",
  WHOLESALE = "WHOLESALE"
}

export enum UrgencyLevel {
  NORMAL = "NORMAL",
  URGENT = "URGENT",
  RUSH = "RUSH"
}

export enum OrderStatus {
  // Head Office Stages
  RECEIVED = "RECEIVED",
  DESIGN_PENDING = "DESIGN_PENDING",
  DESIGN_APPROVED = "DESIGN_APPROVED",
  CAD_PENDING = "CAD_PENDING",
  CAD_COMPLETED = "CAD_COMPLETED",
  CAM_PENDING = "CAM_PENDING",
  CAM_COMPLETED = "CAM_COMPLETED",
  WAX_PENDING = "WAX_PENDING",
  WAX_COMPLETED = "WAX_COMPLETED",
  
  // Dispatch Stages
  DISPATCHED_TO_FACTORY = "DISPATCHED_TO_FACTORY",
  RECEIVED_AT_FACTORY = "RECEIVED_AT_FACTORY",
  
  // Factory Production Stages
  MATERIAL_ISSUED = "MATERIAL_ISSUED",
  IN_PRODUCTION = "IN_PRODUCTION",
  CASTING_PENDING = "CASTING_PENDING",
  CASTING_COMPLETED = "CASTING_COMPLETED",
  FILING_PENDING = "FILING_PENDING",
  FILING_COMPLETED = "FILING_COMPLETED",
  POLISHING_PENDING = "POLISHING_PENDING",
  POLISHING_COMPLETED = "POLISHING_COMPLETED",
  STONE_SETTING_PENDING = "STONE_SETTING_PENDING",
  STONE_SETTING_COMPLETED = "STONE_SETTING_COMPLETED",
  QUALITY_CHECK_PENDING = "QUALITY_CHECK_PENDING",
  QUALITY_APPROVED = "QUALITY_APPROVED",
  PRODUCTION_COMPLETED = "PRODUCTION_COMPLETED",
  
  // Return Journey
  DISPATCHED_TO_HEAD_OFFICE = "DISPATCHED_TO_HEAD_OFFICE",
  RECEIVED_AT_HEAD_OFFICE = "RECEIVED_AT_HEAD_OFFICE",
  FINAL_INSPECTION = "FINAL_INSPECTION",
  READY_FOR_DELIVERY = "READY_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  
  // Exception Handling
  ON_HOLD = "ON_HOLD",
  REWORK_REQUIRED = "REWORK_REQUIRED",
  CANCELLED = "CANCELLED"
}

export enum Location {
  HEAD_OFFICE = "HEAD_OFFICE",
  FACTORY = "FACTORY",
  KARIGAR = "KARIGAR"
}

export interface Order {
  id: string;
  orderNo: string;
  bagNo?: string;
  clientName: string;
  clientCategory: ClientCategory;
  designNo?: string;
  description?: string;
  quantity: number;
  stoneType?: string;
  stoneSize?: string;
  stoneQuality?: string;
  orderDate: string;
  deliveryDate?: string;
  urgencyLevel: UrgencyLevel;
  specialInstructions?: string;
  currentStatus: OrderStatus;
  currentLocation: Location;
  currentKarigarId?: string;
  currentProcessId?: string;
  progressPercentage: number;
  estimatedCompletion?: string;
  imageUrls: string[];
  documentUrls: string[];
  createdAt: string;
  updatedAt: string;
  
  // Related data
  currentKarigar?: {
    id: string;
    name: string;
    code: string;
  };
  currentProcess?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  previousStatus?: string;
  newStatus: string;
  location: string;
  karigarId?: string;
  processId?: string;
  statusDate: string;
  comments?: string;
  changedBy?: string;
  
  // Related data
  karigar?: {
    id: string;
    name: string;
    code: string;
  };
  process?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface OrderCreate {
  orderNo: string;
  bagNo?: string;
  clientName: string;
  clientCategory: ClientCategory;
  designNo?: string;
  description?: string;
  quantity: number;
  stoneType?: string;
  stoneSize?: string;
  stoneQuality?: string;
  orderDate?: string;
  deliveryDate?: string;
  urgencyLevel: UrgencyLevel;
  specialInstructions?: string;
  imageUrls?: string[];
  documentUrls?: string[];
}

export interface OrderUpdate {
  bagNo?: string;
  clientName?: string;
  clientCategory?: ClientCategory;
  designNo?: string;
  description?: string;
  quantity?: number;
  stoneType?: string;
  stoneSize?: string;
  stoneQuality?: string;
  deliveryDate?: string;
  urgencyLevel?: UrgencyLevel;
  specialInstructions?: string;
  imageUrls?: string[];
  documentUrls?: string[];
}

export interface OrderStatusUpdate {
  newStatus: OrderStatus;
  location: Location;
  karigarId?: string;
  processId?: string;
  comments?: string;
  progressPercentage?: number;
  estimatedCompletion?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderStatusStats {
  status: string;
  count: number;
  percentage: number;
}

export interface OrderDashboard {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  onHoldOrders: number;
  statusStats: OrderStatusStats[];
  urgentOrders: number;
  delayedOrders: number;
}

// Helper functions
export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.RECEIVED:
    case OrderStatus.DESIGN_PENDING:
    case OrderStatus.CAD_PENDING:
    case OrderStatus.CAM_PENDING:
    case OrderStatus.WAX_PENDING:
      return "bg-blue-100 text-blue-800";
    
    case OrderStatus.DESIGN_APPROVED:
    case OrderStatus.CAD_COMPLETED:
    case OrderStatus.CAM_COMPLETED:
    case OrderStatus.WAX_COMPLETED:
      return "bg-green-100 text-green-800";
    
    case OrderStatus.DISPATCHED_TO_FACTORY:
    case OrderStatus.DISPATCHED_TO_HEAD_OFFICE:
      return "bg-purple-100 text-purple-800";
    
    case OrderStatus.RECEIVED_AT_FACTORY:
    case OrderStatus.RECEIVED_AT_HEAD_OFFICE:
      return "bg-indigo-100 text-indigo-800";
    
    case OrderStatus.MATERIAL_ISSUED:
    case OrderStatus.IN_PRODUCTION:
    case OrderStatus.CASTING_PENDING:
    case OrderStatus.FILING_PENDING:
    case OrderStatus.POLISHING_PENDING:
    case OrderStatus.STONE_SETTING_PENDING:
      return "bg-yellow-100 text-yellow-800";
    
    case OrderStatus.CASTING_COMPLETED:
    case OrderStatus.FILING_COMPLETED:
    case OrderStatus.POLISHING_COMPLETED:
    case OrderStatus.STONE_SETTING_COMPLETED:
    case OrderStatus.PRODUCTION_COMPLETED:
      return "bg-green-100 text-green-800";
    
    case OrderStatus.QUALITY_CHECK_PENDING:
    case OrderStatus.FINAL_INSPECTION:
      return "bg-orange-100 text-orange-800";
    
    case OrderStatus.QUALITY_APPROVED:
    case OrderStatus.READY_FOR_DELIVERY:
    case OrderStatus.DELIVERED:
      return "bg-green-100 text-green-800";
    
    case OrderStatus.ON_HOLD:
      return "bg-gray-100 text-gray-800";
    
    case OrderStatus.REWORK_REQUIRED:
      return "bg-red-100 text-red-800";
    
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getLocationColor = (location: Location): string => {
  switch (location) {
    case Location.HEAD_OFFICE:
      return "bg-blue-100 text-blue-800";
    case Location.FACTORY:
      return "bg-green-100 text-green-800";
    case Location.KARIGAR:
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getUrgencyColor = (urgency: UrgencyLevel): string => {
  switch (urgency) {
    case UrgencyLevel.NORMAL:
      return "bg-green-100 text-green-800";
    case UrgencyLevel.URGENT:
      return "bg-yellow-100 text-yellow-800";
    case UrgencyLevel.RUSH:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatStatus = (status: string): string => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export const formatLocation = (location: string): string => {
  return location.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};