import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Reminder, Account } from '../../types';
import { formatDate, isToday, isWithinDays, isFuture } from '../../utils/helpers';
import Badge from '../ui/Badge';

interface UpcomingRemindersProps {
  reminders: Reminder[];
  accounts: Account[];
  onViewReminder: (reminder: Reminder) => void;
}

const UpcomingReminders: React.FC<UpcomingRemindersProps> = ({
  reminders,
  accounts,
  onViewReminder,
}) => {
  // Filter to get only upcoming reminders (not completed)
  const upcomingReminders = reminders
    .filter(reminder => !reminder.completed && isFuture(reminder.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Get only the 5 closest upcoming reminders
  
  // Get overdue reminders (not completed and date is in the past)
  const overdueReminders = reminders
    .filter(reminder => !reminder.completed && !isFuture(reminder.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first
    .slice(0, 3); // Limit to 3

  const getAccountName = (accountId?: string): string => {
    if (!accountId) return '';
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium">Upcoming Reminders</h3>
      </div>
      
      {overdueReminders.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-200 dark:border-red-900/30">
          <div className="flex items-center mb-3">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 mr-2" />
            <h4 className="font-medium text-red-700 dark:text-red-400">
              Overdue Reminders
            </h4>
          </div>
          
          <div className="space-y-3">
            {overdueReminders.map(reminder => (
              <div 
                key={reminder.id}
                className="flex items-start bg-white dark:bg-gray-800 p-3 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => onViewReminder(reminder)}
              >
                <div className="mr-3 mt-1">
                  <Clock size={16} className="text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium truncate">{reminder.title}</p>
                  {reminder.accountId && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {getAccountName(reminder.accountId)}
                    </p>
                  )}
                  <div className="flex items-center mt-1">
                    <Badge variant="danger">
                      Overdue: {formatDate(reminder.date)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {upcomingReminders.length > 0 ? (
          upcomingReminders.map(reminder => (
            <div 
              key={reminder.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
              onClick={() => onViewReminder(reminder)}
            >
              <div className="flex items-start">
                <div className="rounded-full p-2 mr-3 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Clock size={16} />
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {reminder.title}
                  </p>
                  {reminder.accountId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {getAccountName(reminder.accountId)}
                    </p>
                  )}
                  <div className="flex items-center mt-1">
                    <Badge 
                      variant={isToday(reminder.date) ? 'warning' : isWithinDays(reminder.date, 3) ? 'primary' : 'default'}
                    >
                      {isToday(reminder.date) 
                        ? 'Today' 
                        : formatDate(reminder.date)
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : overdueReminders.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No upcoming reminders.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UpcomingReminders;