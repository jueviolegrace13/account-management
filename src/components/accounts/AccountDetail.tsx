import React, { useState } from 'react';
import { ExternalLink, Copy, Edit, Clock, Users, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Account, Assistant, Note } from '../../types';
import { formatDate, formatDateTime, getDomainFromUrl } from '../../utils/helpers';

interface AccountDetailProps {
  account: Account;
  assistants: Assistant[];
  onBack: () => void;
  onEdit: (account: Account) => void;
  onAddReminder: (accountId: string) => void;
}

const AccountDetail: React.FC<AccountDetailProps> = ({
  account,
  assistants,
  onBack,
  onEdit,
  onAddReminder,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'details'>('notes');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const renderNotes = () => {
    if (account.notes.length === 0) {
      return (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No notes have been added to this account yet.
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {account.notes.map((note) => (
          <div key={note.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">{note.title}</h3>
              <Badge variant={note.type === 'report' ? 'danger' : 'primary'}>
                {note.type === 'report' ? 'Report' : 'Note'}
              </Badge>
            </div>
            <div 
              className="prose dark:prose-invert prose-sm max-w-none" 
              dangerouslySetInnerHTML={{ __html: note.content }} 
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Added on {formatDateTime(note.createdAt)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAccountDetails = () => {
    const assignedAssistants = assistants.filter(assistant => 
      account.assistantIds.includes(assistant.id)
    );

    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Account Information</h3>
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Created</td>
                  <td>{formatDateTime(account.createdAt)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Updated</td>
                  <td>{formatDateTime(account.updatedAt)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Notes</td>
                  <td>{account.notes.length}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Reports</td>
                  <td>{account.notes.filter(note => note.type === 'report').length}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Assigned Assistants</h3>
            {assignedAssistants.length > 0 ? (
              <ul className="space-y-2">
                {assignedAssistants.map(assistant => (
                  <li key={assistant.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                      <Users size={16} className="text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <div className="font-medium">{assistant.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{assistant.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No assistants have been assigned to this account.
              </p>
            )}
          </div>
        </div>
      </div>
    );
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
          <h2 className="text-xl font-semibold">{account.name}</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300 mr-2">Username:</span>
              <span className="font-medium">{account.username}</span>
              <Button
                variant="ghost"
                size="xs"
                className="ml-2"
                onClick={() => copyToClipboard(account.username)}
                aria-label="Copy username"
              >
                <Copy size={14} />
              </Button>
            </div>
            
            {account.website && (
              <div className="flex items-center">
                <span className="text-gray-700 dark:text-gray-300 mr-2">Website:</span>
                <a
                  href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  {getDomainFromUrl(account.website)}
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onAddReminder(account.id)}
              leftIcon={<Clock size={16} />}
            >
              Add Reminder
            </Button>
            <Button
              variant="primary"
              onClick={() => onEdit(account)}
              leftIcon={<Edit size={16} />}
            >
              Edit Account
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            Notes ({account.notes.length})
          </button>
          
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'notes' ? renderNotes() : renderAccountDetails()}
    </div>
  );
};

export default AccountDetail;