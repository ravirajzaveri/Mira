'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Order, 
  OrderListResponse, 
  OrderCreate, 
  ClientCategory, 
  UrgencyLevel, 
  OrderStatus, 
  Location 
} from '@/types/orders';
import OrderCard from '@/components/orders/OrderCard';
import OrderForm from '@/components/orders/OrderForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { orderApi, karigarApi, processApi } from '@/lib/api';
import toast from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(12);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (locationFilter) params.location = locationFilter;
      if (categoryFilter) params.client_category = categoryFilter;
      if (urgencyFilter) params.urgency_level = urgencyFilter;

      const data = await orderApi.getAll(params);
      setOrders(data.orders);
      setTotalOrders(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, locationFilter, categoryFilter, urgencyFilter]);

  // Create order
  const handleCreateOrder = async (orderData: OrderCreate) => {
    try {
      setSubmitting(true);
      await orderApi.create(orderData);
      setShowCreateModal(false);
      await fetchOrders();
      toast.success('Order created successfully');
    } catch (error) {
      toast.error('Failed to create order');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Update order
  const handleUpdateOrder = async (orderData: OrderCreate) => {
    if (!selectedOrder) return;

    try {
      setSubmitting(true);
      await orderApi.update(selectedOrder.id, orderData);
      setShowEditModal(false);
      setSelectedOrder(null);
      await fetchOrders();
      toast.success('Order updated successfully');
    } catch (error) {
      toast.error('Failed to update order');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // View order details
  const handleViewOrder = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  // Edit order
  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  // Update order status
  const handleStatusUpdate = (order: Order) => {
    router.push(`/orders/${order.id}/status`);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setLocationFilter('');
    setCategoryFilter('');
    setUrgencyFilter('');
    setCurrentPage(1);
  };

  // Effects
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, fetchOrders]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all jewelry orders
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>

          <Select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {Object.values(Location).map(location => (
              <option key={location} value={location}>
                {location.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {Object.values(ClientCategory).map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>

          <Select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="">All Urgency</option>
            {Object.values(UrgencyLevel).map(urgency => (
              <option key={urgency} value={urgency}>
                {urgency}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {totalOrders} total orders
            {(searchTerm || statusFilter || locationFilter || categoryFilter || urgencyFilter) && (
              <span> • {orders.length} filtered results</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No orders found</div>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter || locationFilter || categoryFilter || urgencyFilter
              ? 'Try adjusting your filters'
              : 'Create your first order to get started'
            }
          </p>
          {!searchTerm && !statusFilter && !locationFilter && !categoryFilter && !urgencyFilter && (
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Order
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onView={handleViewOrder}
              onEdit={handleEditOrder}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isVisible = 
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2);

              if (!isVisible) {
                if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Order"
        size="large"
      >
        <OrderForm
          onSubmit={handleCreateOrder}
          onCancel={() => setShowCreateModal(false)}
          isLoading={submitting}
        />
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrder(null);
        }}
        title="Edit Order"
        size="large"
      >
        {selectedOrder && (
          <OrderForm
            order={selectedOrder}
            onSubmit={handleUpdateOrder}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedOrder(null);
            }}
            isLoading={submitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;