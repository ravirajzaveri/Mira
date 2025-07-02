'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  OrderStatusUpdate, 
  OrderStatus, 
  Location, 
  Order,
  formatStatus,
  formatLocation
} from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CalendarIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { karigarApi, processApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Karigar {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

interface Process {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

interface OrderStatusFormProps {
  order: Order;
  onSubmit: (data: OrderStatusUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const OrderStatusForm: React.FC<OrderStatusFormProps> = ({
  order,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [karigars, setKarigars] = useState<Karigar[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loadingMasterData, setLoadingMasterData] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<OrderStatusUpdate>({
    defaultValues: {
      newStatus: order.currentStatus as OrderStatus,
      location: order.currentLocation as Location,
      karigarId: order.currentKarigarId || '',
      processId: order.currentProcessId || '',
      comments: '',
      progressPercentage: order.progressPercentage,
      estimatedCompletion: order.estimatedCompletion ? 
        new Date(order.estimatedCompletion).toISOString().split('T')[0] : ''
    }
  });

  const watchedLocation = watch('location');
  const watchedStatus = watch('newStatus');

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      setLoadingMasterData(true);
      
      const [karigarData, processData] = await Promise.all([
        karigarApi.getAll({ active: true }),
        processApi.getAll({ active: true })
      ]);

      setKarigars(karigarData);
      setProcesses(processData);
    } catch (error) {
      toast.error('Failed to load form data');
      console.error('Error fetching master data:', error);
    } finally {
      setLoadingMasterData(false);
    }
  };

  // Get suggested progress percentage based on status
  const getSuggestedProgress = (status: OrderStatus): number => {
    const progressMap: Record<string, number> = {
      [OrderStatus.RECEIVED]: 5,
      [OrderStatus.DESIGN_PENDING]: 10,
      [OrderStatus.DESIGN_APPROVED]: 15,
      [OrderStatus.CAD_PENDING]: 20,
      [OrderStatus.CAD_COMPLETED]: 25,
      [OrderStatus.CAM_PENDING]: 30,
      [OrderStatus.CAM_COMPLETED]: 35,
      [OrderStatus.WAX_PENDING]: 40,
      [OrderStatus.WAX_COMPLETED]: 45,
      [OrderStatus.DISPATCHED_TO_FACTORY]: 50,
      [OrderStatus.RECEIVED_AT_FACTORY]: 55,
      [OrderStatus.MATERIAL_ISSUED]: 60,
      [OrderStatus.IN_PRODUCTION]: 65,
      [OrderStatus.CASTING_PENDING]: 70,
      [OrderStatus.CASTING_COMPLETED]: 75,
      [OrderStatus.FILING_PENDING]: 80,
      [OrderStatus.FILING_COMPLETED]: 82,
      [OrderStatus.POLISHING_PENDING]: 85,
      [OrderStatus.POLISHING_COMPLETED]: 87,
      [OrderStatus.STONE_SETTING_PENDING]: 90,
      [OrderStatus.STONE_SETTING_COMPLETED]: 92,
      [OrderStatus.QUALITY_CHECK_PENDING]: 95,
      [OrderStatus.QUALITY_APPROVED]: 97,
      [OrderStatus.PRODUCTION_COMPLETED]: 98,
      [OrderStatus.DISPATCHED_TO_HEAD_OFFICE]: 99,
      [OrderStatus.RECEIVED_AT_HEAD_OFFICE]: 99,
      [OrderStatus.FINAL_INSPECTION]: 99,
      [OrderStatus.READY_FOR_DELIVERY]: 99,
      [OrderStatus.DELIVERED]: 100,
    };
    
    return progressMap[status] || order.progressPercentage;
  };

  // Update progress when status changes
  useEffect(() => {
    if (watchedStatus) {
      const suggestedProgress = getSuggestedProgress(watchedStatus);
      setValue('progressPercentage', suggestedProgress);
    }
  }, [watchedStatus, setValue]);

  // Clear karigar when location is not KARIGAR
  useEffect(() => {
    if (watchedLocation !== Location.KARIGAR) {
      setValue('karigarId', '');
    }
  }, [watchedLocation, setValue]);

  const onFormSubmit = async (data: OrderStatusUpdate) => {
    try {
      // Clean up data based on location
      const cleanedData = { ...data };
      
      if (data.location !== Location.KARIGAR) {
        cleanedData.karigarId = undefined;
      }
      
      if (!cleanedData.estimatedCompletion) {
        cleanedData.estimatedCompletion = undefined;
      }

      await onSubmit(cleanedData);
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  if (loadingMasterData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Update Order Status - {order.orderNo}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Current: {formatStatus(order.currentStatus)} • {formatLocation(order.currentLocation)}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Status and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status *
              </label>
              <Controller
                name="newStatus"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select {...field}>
                    {Object.values(OrderStatus).map(status => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.newStatus && (
                <p className="text-red-500 text-sm mt-1">{errors.newStatus.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <Controller
                name="location"
                control={control}
                rules={{ required: 'Location is required' }}
                render={({ field }) => (
                  <Select {...field}>
                    {Object.values(Location).map(location => (
                      <option key={location} value={location}>
                        {formatLocation(location)}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Progress Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress Percentage
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              {...register('progressPercentage', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Progress cannot be negative' },
                max: { value: 100, message: 'Progress cannot exceed 100%' }
              })}
              placeholder="0-100"
            />
            {errors.progressPercentage && (
              <p className="text-red-500 text-sm mt-1">{errors.progressPercentage.message}</p>
            )}
          </div>

          {/* Karigar Assignment (only when location is KARIGAR) */}
          {watchedLocation === Location.KARIGAR && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Assign to Karigar
              </label>
              <Controller
                name="karigarId"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <option value="">Select Karigar</option>
                    {karigars.map(karigar => (
                      <option key={karigar.id} value={karigar.id}>
                        {karigar.name} ({karigar.code})
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>
          )}

          {/* Process Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
              Current Process
            </label>
            <Controller
              name="processId"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <option value="">Select Process</option>
                  {processes.map(process => (
                    <option key={process.id} value={process.id}>
                      {process.name}
                      {process.description && ` - ${process.description}`}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          {/* Estimated Completion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Estimated Completion Date
            </label>
            <Input
              type="date"
              {...register('estimatedCompletion')}
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments
            </label>
            <Textarea
              {...register('comments')}
              placeholder="Add any comments about this status change..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderStatusForm;