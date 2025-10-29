import React, { useState, useEffect } from 'react';
import { FileText, Package, Clock } from 'lucide-react';
import { api } from '../../services/api';

interface ReviewQueueProps {
  onItemClick: (item: any) => void;
}

interface ReviewItem {
  id: string;
  type: 'device' | 'report';
  itemDescription: string;
  jobTitle: string;
  technicianName: string;
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
  taskId: number;
  jobId?: string;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({ onItemClick }) => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks that need supervisor review (completed tasks)
      const tasks = await api.tasks.getTasks();
      const [jobOrders, users] = await Promise.all([
        api.jobOrders.getJobOrders(),
        api.users.getUsers(),
      ]);
      
      // Filter tasks that are completed and awaiting review
      const tasksAwaitingReview = tasks.filter(
        task => task.status === 'pending-approval' || task.status === 'done'
      );
      
      // Create lookup maps
      const jobOrderMap = new Map(jobOrders.map(jo => [jo.id, jo]));
      const userMap = new Map(users.map(u => [u.id, u]));
      
      // Convert tasks to review items
      const reviewItems: ReviewItem[] = tasksAwaitingReview
        .filter(task => task.job_order) // Only include tasks with valid job_order
        .map(task => {
          const jobOrder = jobOrderMap.get(task.job_order);
          const technician = task.technician ? userMap.get(task.technician) : null;
          
          // Determine priority based on efficiency and status
          let priority: 'high' | 'medium' | 'low' = 'medium';
          if (task.efficiency && task.efficiency < 70) {
            priority = 'high';
          } else if (task.efficiency && task.efficiency > 90) {
            priority = 'low';
          }
          
          return {
            id: task.id.toString(),
            type: 'device' as const,
            itemDescription: task.operation_name || 'Task',
            jobTitle: jobOrder?.title || jobOrder?.order_code || 'N/A',
            technicianName: technician?.full_name || technician?.username || 'Unknown',
            submittedAt: task.end_time || task.updated_at,
            priority,
            taskId: task.id,
            jobId: task.job_order.toString(),
          };
        });
      
      setItems(reviewItems);
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.priority === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Review Queue</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Review Queue</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 text-sm rounded-full transition ${
              filter === 'high' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            High
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-3 py-1 text-sm rounded-full transition ${
              filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Medium
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No items in queue</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => onItemClick(item)}
              className={`p-3 rounded-lg border-l-4 cursor-pointer transition hover:shadow-md ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start gap-2">
                {item.type === 'device' ? (
                  <Package className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-800 truncate">{item.itemDescription}</h4>
                  <p className="text-xs text-gray-600 mt-1">{item.jobTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">By: {item.technicianName}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(item.submittedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
