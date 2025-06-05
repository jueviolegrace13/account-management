import React from 'react';
import { Mail, Phone, Edit, Trash, Key } from 'lucide-react';
import Card, { CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Assistant } from '../../types';
import { formatDate } from '../../utils/helpers';

interface AssistantCardProps {
  assistant: Assistant;
  accountCount: number;
  onEdit: (assistant: Assistant) => void;
  onDelete: (id: string) => void;
  onView: (assistant: Assistant) => void;
}

const AssistantCard: React.FC<AssistantCardProps> = ({
  assistant,
  accountCount,
  onEdit,
  onDelete,
  onView,
}) => {
  const { id, name, email, phone, createdAt } = assistant;

  return (
    <Card hoverable onClick={() => onView(assistant)} className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{name}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Mail size={14} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
            <a
              href={`mailto:${email}`}
              className="text-blue-600 dark:text-blue-400 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {email}
            </a>
          </div>
          
          {phone && (
            <div className="flex items-center text-sm">
              <Phone size={14} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <a
                href={`tel:${phone}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {phone}
              </a>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <Key size={14} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              {accountCount} {accountCount === 1 ? 'Account' : 'Accounts'} Assigned
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Added {formatDate(createdAt)}
        </span>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(assistant);
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

export default AssistantCard;