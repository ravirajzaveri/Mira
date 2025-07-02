'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Order, 
  OrderCreate, 
  ClientCategory, 
  UrgencyLevel 
} from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CalendarIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface OrderFormProps {
  order?: Order;
  onSubmit: (data: OrderCreate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
  order,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [generatingOrderNo, setGeneratingOrderNo] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(order?.imageUrls || []);
  const [documentUrls, setDocumentUrls] = useState<string[]>(order?.documentUrls || []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<OrderCreate>({
    defaultValues: {
      orderNo: order?.orderNo || '',
      bagNo: order?.bagNo || '',
      clientName: order?.clientName || '',
      clientCategory: order?.clientCategory || ClientCategory.RETAIL,
      designNo: order?.designNo || '',
      description: order?.description || '',
      quantity: order?.quantity || 1,
      stoneType: order?.stoneType || '',
      stoneSize: order?.stoneSize || '',
      stoneQuality: order?.stoneQuality || '',
      orderDate: order?.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
      deliveryDate: order?.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
      urgencyLevel: order?.urgencyLevel || UrgencyLevel.NORMAL,
      specialInstructions: order?.specialInstructions || '',
      imageUrls: order?.imageUrls || [],
      documentUrls: order?.documentUrls || []
    }
  });

  const generateOrderNumber = async () => {
    try {
      setGeneratingOrderNo(true);
      const response = await fetch('/api/orders/generate/number');
      if (!response.ok) throw new Error('Failed to generate order number');
      
      const data = await response.json();
      setValue('orderNo', data.orderNo);
      toast.success('Order number generated');
    } catch (error) {
      toast.error('Failed to generate order number');
      console.error('Error generating order number:', error);
    } finally {
      setGeneratingOrderNo(false);
    }
  };

  const addImageUrl = () => {
    const newUrls = [...imageUrls, ''];
    setImageUrls(newUrls);
    setValue('imageUrls', newUrls);
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
    setValue('imageUrls', newUrls);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setValue('imageUrls', newUrls);
  };

  const addDocumentUrl = () => {
    const newUrls = [...documentUrls, ''];
    setDocumentUrls(newUrls);
    setValue('documentUrls', newUrls);
  };

  const updateDocumentUrl = (index: number, url: string) => {
    const newUrls = [...documentUrls];
    newUrls[index] = url;
    setDocumentUrls(newUrls);
    setValue('documentUrls', newUrls);
  };

  const removeDocumentUrl = (index: number) => {
    const newUrls = documentUrls.filter((_, i) => i !== index);
    setDocumentUrls(newUrls);
    setValue('documentUrls', newUrls);
  };

  const onFormSubmit = async (data: OrderCreate) => {
    try {
      await onSubmit(data);
      toast.success(order ? 'Order updated successfully' : 'Order created successfully');
    } catch (error) {
      toast.error('Failed to save order');
      console.error('Error saving order:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {order ? 'Edit Order' : 'Create New Order'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number *
              </label>
              <div className="flex gap-2">
                <Input
                  {...register('orderNo', { required: 'Order number is required' })}
                  placeholder="ORD-20250102-001"
                  className="flex-1"
                />
                {!order && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateOrderNumber}
                    disabled={generatingOrderNo}
                    className="whitespace-nowrap"
                  >
                    {generatingOrderNo ? 'Generating...' : 'Generate'}
                  </Button>
                )}
              </div>
              {errors.orderNo && (
                <p className="text-red-500 text-sm mt-1">{errors.orderNo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bag Number
              </label>
              <Input
                {...register('bagNo')}
                placeholder="Alternative reference"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <Input
                {...register('clientName', { required: 'Client name is required' })}
                placeholder="Customer name"
              />
              {errors.clientName && (
                <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Category
              </label>
              <Controller
                name="clientCategory"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <option value={ClientCategory.RETAIL}>Retail</option>
                    <option value={ClientCategory.WHOLESALE}>Wholesale</option>
                    <option value={ClientCategory.ONLINE}>Online</option>
                    <option value={ClientCategory.SAMPLE}>Sample</option>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design Number
                </label>
                <Input
                  {...register('designNo')}
                  placeholder="Design catalog reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <Input
                  type="number"
                  min="1"
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1' }
                  })}
                  placeholder="1"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Product description"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Stone Specifications */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stone Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stone Type
                </label>
                <Input
                  {...register('stoneType')}
                  placeholder="DIAMOND, RUBY, EMERALD, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stone Size
                </label>
                <Input
                  {...register('stoneSize')}
                  placeholder="Dimensions/carat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stone Quality
                </label>
                <Input
                  {...register('stoneQuality')}
                  placeholder="Grade/clarity"
                />
              </div>
            </div>
          </div>

          {/* Timeline & Priority */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline & Priority</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Date
                </label>
                <Input
                  type="date"
                  {...register('orderDate')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date
                </label>
                <Input
                  type="date"
                  {...register('deliveryDate')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency Level
                </label>
                <Controller
                  name="urgencyLevel"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <option value={UrgencyLevel.NORMAL}>Normal</option>
                      <option value={UrgencyLevel.URGENT}>Urgent</option>
                      <option value={UrgencyLevel.RUSH}>Rush</option>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h3>
            <Textarea
              {...register('specialInstructions')}
              placeholder="Any special requirements or instructions"
              rows={3}
            />
          </div>

          {/* Images */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="Image URL"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageUrl(index)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addImageUrl}
                className="w-full"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Image URL
              </Button>
            </div>
          </div>

          {/* Documents */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="space-y-2">
              {documentUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateDocumentUrl(index, e.target.value)}
                    placeholder="Document URL"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDocumentUrl(index)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addDocumentUrl}
                className="w-full"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Document URL
              </Button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t pt-6 flex justify-end gap-4">
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
              {isSubmitting || isLoading ? 'Saving...' : (order ? 'Update Order' : 'Create Order')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;