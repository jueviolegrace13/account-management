import React from 'react';
import { Clock, Edit, Trash, Check, ExternalLink, AlertCircle } from 'lucide-react';
import Card, { CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Reminder, Account } from '../../types';
import { formatDate, isToday, isFuture, truncateText, htmlToPlainText } from '../../utils/helpers';

interface ReminderCardProps {
  reminder: Reminder;
  account?: Account;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onView: (reminder: Reminder) => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  account,
  onEdit,
  onDelete,
  onToggleComplete,
  onView,
}) => {
  const { id, title, content, date, completed, createdAt } = reminder;
  const reminderDate = new Date(date);
  
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
    return formatDate(date);
  };

  return (
    <Card hoverable onClick={() => onView(reminder)} className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="truncate">{title}</CardTitle>
          <Badge variant={getBadgeVariant()} className="ml-2 flex items-center gap-1">
            {!completed && !isFuture(date) && <AlertCircle size={12} />}
            {getBadgeText()}
          </Badge>
        </div>
        <div className="flex items-center mt-1">
          <Clock size={14} className="text-gray-500 dark:text-gray-400 mr-1" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Intl.DateTimeFormat('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).format(reminderDate)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {truncateText(htmlToPlainText(content), 100)}
        </p>
        
        {account && (
          <div className="mt-3 flex items-center text-sm">
            <ExternalLink size={14} className="mr-2 text-gray-500 dark:text-gray-400" />
            <span className="text-blue-600 dark:text-blue-400">
              {account.name}
            </span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <Button
          variant={completed ? 'outline' : 'primary'}
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(id, !completed);
          }}
          leftIcon={<Check size={14} />}
        >
          {completed ? 'Mark Incomplete' : 'Complete'}
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(reminder);
            }}
            aria-label="Edit"
          >
            <Edit size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            aria-label="Delete"
          >
            <Trash size={16} className="text-red-500" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReminderCard;