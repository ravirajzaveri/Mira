'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Order, OrderStatusHistory } from '@/types/orders';
import { orderApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import { 
  ArrowLeftIcon,
  PencilIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { 
  getStatusColor, 
  getLocationColor, 
  getUrgencyColor, 
  formatStatus, 
  formatLocation 
} from '@/types/orders';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const [orderData, historyData] = await Promise.all([
        orderApi.getById(orderId),
        orderApi.getStatusHistory(orderId)
      ]);
      
      setOrder(orderData);
      setStatusHistory(historyData);
    } catch (error) {
      toast.error('Failed to fetch order details');
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const isDelayed = order.deliveryDate && new Date(order.deliveryDate) < new Date() && order.currentStatus !== 'DELIVERED';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/orders')}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {order.orderNo}
              {order.bagNo && (
                <span className="text-lg text-gray-500 ml-2">({order.bagNo})</span>
              )}
            </h1>
            <p className="text-gray-600">{order.clientName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/orders/${order.id}/status`)}
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            Update Status
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/orders/${order.id}/edit`)}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className={getStatusColor(order.currentStatus)}>
                  {formatStatus(order.currentStatus)}
                </Badge>
                <Badge className={getLocationColor(order.currentLocation)}>
                  {formatLocation(order.currentLocation)}
                </Badge>
                <Badge className={getUrgencyColor(order.urgencyLevel)}>
                  {order.urgencyLevel}
                </Badge>
                <Badge variant="outline">
                  {order.clientCategory}
                </Badge>
                {isDelayed && (
                  <Badge className="bg-red-100 text-red-800">
                    DELAYED
                  </Badge>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{order.progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${order.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Assignment */}
              {(order.currentKarigar || order.currentProcess) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Assignment</h4>
                  <div className="flex items-center gap-6 text-sm">
                    {order.currentKarigar && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span>{order.currentKarigar.name} ({order.currentKarigar.code})</span>
                      </div>
                    )}
                    {order.currentProcess && (
                      <div className="flex items-center gap-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                        <span>{order.currentProcess.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Design Number</label>
                    <p className="text-gray-900">{order.designNo || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                    <p className="text-gray-900">{order.quantity}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stone Type</label>
                    <p className="text-gray-900">{order.stoneType || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stone Size</label>
                    <p className="text-gray-900">{order.stoneSize || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stone Quality</label>
                    <p className="text-gray-900">{order.stoneQuality || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Date</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivery Date</label>
                    <p className={`flex items-center gap-2 ${isDelayed ? 'text-red-600' : 'text-gray-900'}`}>
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      {order.deliveryDate ? format(new Date(order.deliveryDate), 'MMM dd, yyyy') : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimated Completion</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      {order.estimatedCompletion ? format(new Date(order.estimatedCompletion), 'MMM dd, yyyy') : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {order.description && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 mt-1">{order.description}</p>
                </div>
              )}

              {order.specialInstructions && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-yellow-800">Special Instructions</label>
                  <p className="text-yellow-700 mt-1">{order.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          {order.imageUrls && order.imageUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {order.imageUrls.map((url, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline Sidebar */}
        <div>
          <OrderTimeline statusHistory={statusHistory} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;