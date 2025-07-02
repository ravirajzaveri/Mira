'use client';

import React from 'react';
import Image from 'next/image';
import { Order, getStatusColor, getLocationColor, getUrgencyColor, formatStatus, formatLocation } from '@/types/orders';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  CalendarIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onView?: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onStatusUpdate?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onView,
  onEdit,
  onStatusUpdate
}) => {
  const isDelayed = order.deliveryDate && new Date(order.deliveryDate) < new Date() && order.currentStatus !== 'DELIVERED';

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {order.orderNo}
              {order.bagNo && (
                <span className="text-sm text-gray-500 ml-2">({order.bagNo})</span>
              )}
            </h3>
            <p className="text-sm text-gray-600">{order.clientName}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getUrgencyColor(order.urgencyLevel)}>
              {order.urgencyLevel}
            </Badge>
            <Badge variant="outline">
              {order.clientCategory}
            </Badge>
          </div>
        </div>

        {/* Status and Location */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getStatusColor(order.currentStatus)}>
            {formatStatus(order.currentStatus)}
          </Badge>
          <Badge className={getLocationColor(order.currentLocation)}>
            {formatLocation(order.currentLocation)}
          </Badge>
          {isDelayed && (
            <Badge className="bg-red-100 text-red-800">
              DELAYED
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{order.progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${order.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Design:</span>
            <p className="font-medium">{order.designNo || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-gray-500">Quantity:</span>
            <p className="font-medium">{order.quantity}</p>
          </div>
          {order.stoneType && (
            <div>
              <span className="text-gray-500">Stone:</span>
              <p className="font-medium">{order.stoneType}</p>
            </div>
          )}
          {order.stoneSize && (
            <div>
              <span className="text-gray-500">Size:</span>
              <p className="font-medium">{order.stoneSize}</p>
            </div>
          )}
        </div>

        {/* Current Assignment */}
        {(order.currentKarigar || order.currentProcess) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Assignment</h4>
            <div className="flex items-center gap-4 text-sm">
              {order.currentKarigar && (
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span>{order.currentKarigar.name}</span>
                </div>
              )}
              {order.currentProcess && (
                <div className="flex items-center gap-1">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                  <span>{order.currentProcess.name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Created: {format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
          </div>
          {order.deliveryDate && (
            <div className={`flex items-center gap-1 ${isDelayed ? 'text-red-600' : ''}`}>
              <ClockIcon className="h-4 w-4" />
              <span>Due: {format(new Date(order.deliveryDate), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {order.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">{order.description}</p>
          </div>
        )}

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</h4>
            <p className="text-sm text-yellow-700 line-clamp-2">{order.specialInstructions}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(order)}
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(order)}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
          {onStatusUpdate && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(order)}
              disabled={order.currentStatus === 'DELIVERED' || order.currentStatus === 'CANCELLED'}
            >
              Update Status
            </Button>
          )}
        </div>

        {/* Images Preview */}
        {order.imageUrls && order.imageUrls.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Images ({order.imageUrls.length})</h4>
            <div className="flex gap-2">
              {order.imageUrls.slice(0, 3).map((url, index) => (
                <div key={index} className="w-12 h-12 bg-gray-100 rounded-lg relative overflow-hidden">
                  <Image
                    src={url}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
              {order.imageUrls.length > 3 && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                  +{order.imageUrls.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;