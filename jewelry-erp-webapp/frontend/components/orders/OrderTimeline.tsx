'use client';

import React from 'react';
import { OrderStatusHistory, formatStatus } from '@/types/orders';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface OrderTimelineProps {
  statusHistory: OrderStatusHistory[];
  className?: string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({
  statusHistory,
  className = ''
}) => {
  const getStatusIcon = (status: string, isLatest: boolean) => {
    if (isLatest) {
      return <ClockIcon className="h-5 w-5 text-blue-600" />;
    }
    return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
  };

  const getStatusColor = (status: string, isLatest: boolean) => {
    if (isLatest) {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-green-100 text-green-800";
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'HEAD_OFFICE':
        return "bg-blue-100 text-blue-800";
      case 'FACTORY':
        return "bg-green-100 text-green-800";
      case 'KARIGAR':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          Order Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {statusHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No status history available
          </div>
        ) : (
          <div className="space-y-4">
            {statusHistory.map((entry, index) => {
              const isLatest = index === 0;
              
              return (
                <div key={entry.id} className="relative">
                  {/* Timeline line */}
                  {index < statusHistory.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isLatest ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {getStatusIcon(entry.newStatus, isLatest)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge className={getStatusColor(entry.newStatus, isLatest)}>
                          {formatStatus(entry.newStatus)}
                        </Badge>
                        <Badge className={getLocationColor(entry.location)}>
                          {entry.location.replace(/_/g, ' ')}
                        </Badge>
                        {isLatest && (
                          <Badge variant="outline" className="text-xs">
                            CURRENT
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        {format(new Date(entry.statusDate), 'MMM dd, yyyy • h:mm a')}
                      </div>
                      
                      {/* Assignment Details */}
                      {(entry.karigar || entry.process) && (
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                          {entry.karigar && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              <span>{entry.karigar.name} ({entry.karigar.code})</span>
                            </div>
                          )}
                          {entry.process && (
                            <div className="flex items-center gap-1">
                              <BuildingOfficeIcon className="h-4 w-4" />
                              <span>{entry.process.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Comments */}
                      {entry.comments && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                          <div className="flex items-start gap-2">
                            <ChatBubbleBottomCenterTextIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-700">{entry.comments}</p>
                              {entry.changedBy && (
                                <p className="text-xs text-gray-500 mt-1">
                                  by {entry.changedBy}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Previous Status */}
                      {entry.previousStatus && (
                        <div className="text-xs text-gray-400 mt-1">
                          Changed from: {formatStatus(entry.previousStatus)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;