import React from 'react';
import { Mail, Phone, Calendar, ArrowLeft, Edit } from 'lucide-react';
import Button from '../ui/Button';
import { Assistant, Account } from '../../types';
import { formatDateTime } from '../../utils/helpers';
import Card, { CardContent } from '../ui/Card';

interface AssistantDetailProps {
  assistant: Assistant;
  accounts: Account[];
  onBack: () => void;
  onEdit: (assistant: Assistant) => void;
}

const AssistantDetail: React.FC<AssistantDetailProps> = ({
  assistant,
  accounts,
  onBack,
  onEdit,
}) => {
  const { name, email, phone, accountIds, createdAt } = assistant;
  
  // Filter accounts assigned to this assistant
  const assignedAccounts = accounts.filter(account => 
    accountIds.includes(account.id)
  );

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
          <h2 className="text-xl font-semibold">{name}</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Mail size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
              <a
                href={`mailto:${email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {email}
              </a>
            </div>
            
            {phone && (
              <div className="flex items-center">
                <Phone size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                <a
                  href={`tel:${phone}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {phone}
                </a>
              </div>
            )}
            
            <div className="flex items-center">
              <Calendar size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                Added on {formatDateTime(createdAt)}
              </span>
            </div>
          </div>
          
          <div>
            <Button
              variant="primary"
              onClick={() => onEdit(assistant)}
              leftIcon={<Edit size={16} />}
            >
              Edit Assistant
            </Button>
          </div>
        </div>
      </div>
      
      {/* Assigned Accounts */}
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">
          Assigned Accounts ({assignedAccounts.length})
        </h3>
        
        {assignedAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedAccounts.map(account => (
              <Card key={account.id} className="h-full">
                <CardContent className="p-4">
                  <h4 className="font-medium text-lg mb-1">{account.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {account.username}
                  </p>
                  {account.website && (
                    <a
                      href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm inline-block mt-1"
                    >
                      {account.website}
                    </a>
                  )}
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {account.notes.length} {account.notes.length === 1 ? 'Note' : 'Notes'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No accounts have been assigned to this assistant yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantDetail;