import React from 'react';
import { ExternalLink, Edit, Trash, FileText, AlertCircle, Clock } from 'lucide-react';
import Card, { CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Account } from '../../types';
import { formatDate, getDomainFromUrl, truncateText } from '../../utils/helpers';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  onView: (account: Account) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
  onView,
}) => {
  const { id, name, username, website, notes, reminders, created_at } = account;
  const domain = getDomainFromUrl(website || '');
  
  // Count reports and pending reminders
  const reportCount = notes?.filter(note => note.type === 'report').length || 0;
  const pendingReminders = reminders?.filter(reminder => !reminder.completed).length || 0;

  return (
    <Card hoverable onClick={() => onView(account)} className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="truncate">{name}</CardTitle>
          <div className="flex space-x-1">
            {reportCount > 0 && (
              <Badge variant="danger\" className="flex items-center gap-1">
                <AlertCircle size={12} />
                {reportCount}
              </Badge>
            )}
            {pendingReminders > 0 && (
              <Badge variant="warning" className="flex items-center gap-1">
                <Clock size={12} />
                {pendingReminders}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
          {username}
        </p>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {website && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
            <ExternalLink size={14} className="mr-2 flex-shrink-0" />
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {domain}
            </a>
          </div>
        )}
        
        <div className="space-y-2">
          {(notes?.length || 0) > 0 && (
            <div className="flex items-center text-sm">
              <FileText size={14} className="mr-2" />
              <span className="font-medium">{notes?.length} Notes</span>
            </div>
          )}
          
          {(reminders?.length || 0) > 0 && (
            <div className="flex items-center text-sm">
              <Clock size={14} className="mr-2" />
              <span className="font-medium">{reminders?.length} Reminders</span>
            </div>
          )}
          
          {(!notes?.length && !reminders?.length) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No notes or reminders yet
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Added {formatDate(created_at)}
        </span>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(account);
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

export default AccountCard;