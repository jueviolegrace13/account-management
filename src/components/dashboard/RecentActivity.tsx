import React from 'react';
import { Clock } from 'lucide-react';
import { Account, Note, Reminder } from '../../types';
import { formatDateTime } from '../../utils/helpers';

interface ActivityItem {
  id: string;
  type: 'account' | 'note' | 'reminder';
  title: string;
  subtext?: string;
  date: string;
}

interface RecentActivityProps {
  accounts: Account[];
  reminders: Reminder[];
  onViewAccount?: (account: Account) => void;
  onViewReminder?: (reminder: Reminder) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  accounts,
  reminders,
  onViewAccount,
  onViewReminder,
}) => {
  // Create a combined activity feed
  const createActivityFeed = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    
    // Add accounts
    accounts.forEach(account => {
      activities.push({
        id: account.id,
        type: 'account',
        title: `Account added: ${account.name}`,
        subtext: account.username,
        date: account.createdAt,
      });
      
      // Add notes
      account.notes.forEach(note => {
        activities.push({
          id: note.id,
          type: 'note',
          title: `New ${note.type} note: ${note.title}`,
          subtext: `for ${account.name}`,
          date: note.createdAt,
        });
      });
    });
    
    // Add reminders
    reminders.forEach(reminder => {
      let subtext = 'Reminder';
      if (reminder.accountId) {
        const account = accounts.find(a => a.id === reminder.accountId);
        if (account) {
          subtext = `for ${account.name}`;
        }
      }
      
      activities.push({
        id: reminder.id,
        type: 'reminder',
        title: `Reminder set: ${reminder.title}`,
        subtext,
        date: reminder.createdAt,
      });
    });
    
    // Sort by date (newest first)
    return activities.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 10); // Get only the 10 most recent activities
  };
  
  const activityFeed = createActivityFeed();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium">Recent Activity</h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activityFeed.length > 0 ? (
          activityFeed.map((activity) => (
            <div 
              key={`${activity.type}-${activity.id}`}
              className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
                (activity.type === 'account' && onViewAccount) || 
                (activity.type === 'reminder' && onViewReminder)
                  ? 'cursor-pointer'
                  : ''
              }`}
              onClick={() => {
                if (activity.type === 'account' && onViewAccount) {
                  const account = accounts.find(a => a.id === activity.id);
                  if (account) onViewAccount(account);
                } else if (activity.type === 'reminder' && onViewReminder) {
                  const reminder = reminders.find(r => r.id === activity.id);
                  if (reminder) onViewReminder(reminder);
                }
              }}
            >
              <div className="flex items-start">
                <div className={`
                  rounded-full p-2 mr-3 flex-shrink-0
                  ${activity.type === 'account' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                  ${activity.type === 'note' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : ''}
                  ${activity.type === 'reminder' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : ''}
                `}>
                  <Clock size={16} />
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {activity.title}
                  </p>
                  {activity.subtext && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {activity.subtext}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDateTime(activity.date)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No recent activity to display.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;