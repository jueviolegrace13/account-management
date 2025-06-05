import React from 'react';
import { Calendar, Clock, Check, Edit, ExternalLink, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Reminder, Account } from '../../types';
import { formatDateTime, isToday, isFuture } from '../../utils/helpers';

interface ReminderDetailProps {
  reminder: Reminder;
  account?: Account;
  onBack: () => void;
  onEdit: (reminder: Reminder) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

const ReminderDetail: React.FC<ReminderDetailProps> = ({
  reminder,
  account,
  onBack,
  onEdit,
  onToggleComplete,
}) => {
  const { id, title, content, date, completed, createdAt } = reminder;
  
  // Determine badge variant based on date and completion status
  const getBadgeVariant = () => {
    if (completed) return 'success';
    if (isToday(date)) return 'warning';
    if (!isFuture(date)) return 'danger';
    return 'primary';
  };
  
  // Get badge text
  const getBadgeText = () => {
    if (completed) return 'Completed';
    if (isToday(date)) return 'Today';
    if (!isFuture(date)) return 'Overdue';
    return 'Upcoming';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
          </Button>
          <h2 className="text-xl font-semibold">{title}</h2>
          <Badge variant={getBadgeVariant()} className="ml-3">
            {getBadgeText()}
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Calendar size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                {new Intl.DateTimeFormat('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                }).format(new Date(date))}
              </span>
            </div>
            
            <div className="flex items-center">
              <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                {new Intl.DateTimeFormat('en-US', { 
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(new Date(date))}
              </span>
            </div>
            
            {account && (
              <div className="flex items-center">
                <ExternalLink size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-blue-600 dark:text-blue-400">
                  Related to {account.name}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={completed ? 'outline' : 'primary'}
              onClick={() => onToggleComplete(id, !completed)}
              leftIcon={<Check size={16} />}
            >
              {completed ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onEdit(reminder)}
              leftIcon={<Edit size={16} />}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div 
          className="prose dark:prose-invert max-w-none" 
          dangerouslySetInnerHTML={{ __html: content }} 
        />
        
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Created on {formatDateTime(createdAt)}
        </div>
      </div>
    </div>
  );
};

export default ReminderDetail;