import React, { useState } from 'react';
import { ExternalLink, Copy, Edit, Clock, Users, ArrowLeft, Plus, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import NoteForm from '../notes/NoteForm';
import ReminderForm from '../reminders/ReminderForm';
import { Account, Note, Reminder } from '../../types';
import { formatDateTime, getDomainFromUrl } from '../../utils/helpers';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';

interface AccountDetailProps {
  account: Account;
  onBack: () => void;
  onEdit: (account: Account) => void;
  onAccountUpdate: () => void;
}

const AccountDetail: React.FC<AccountDetailProps> = ({
  account,
  onBack,
  onEdit,
  onAccountUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'reminders' | 'details' | 'vault'>('notes');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [vault, setVault] = useState<{ key: string; value: string }[]>([]);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultKey, setVaultKey] = useState('');
  const [vaultValue, setVaultValue] = useState('');
  const [showDecrypted, setShowDecrypted] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleNoteSuccess = () => {
    setShowNoteForm(false);
    setEditingNote(null);
    onAccountUpdate();
  };

  const handleReminderSuccess = () => {
    setShowReminderForm(false);
    setEditingReminder(null);
    onAccountUpdate();
  };

  const encrypt = (val: string) => '*'.repeat(val.length);
  const decrypt = (val: string) => val;

  const handleAddVaultEntry = () => {
    if (!vaultKey || !vaultValue) return;
    setVault([...vault, { key: vaultKey, value: vaultValue }]);
    setVaultKey('');
    setVaultValue('');
    setShowVaultModal(false);
  };

  const renderNotes = () => {
    const notes = account.notes || [];
    
    if (showNoteForm) {
      return (
        <NoteForm
          note={editingNote || undefined}
          accountId={account.id}
          onSuccess={handleNoteSuccess}
          onCancel={() => {
            setShowNoteForm(false);
            setEditingNote(null);
          }}
        />
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">Notes ({notes.length})</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNoteForm(true)}
            leftIcon={<Plus size={16} />}
          >
            Add Note
          </Button>
        </div>
        
        {notes.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No notes have been added to this account yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notes.map((note) => (
              <div key={note.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium">{note.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant={note.type === 'report' ? 'danger' : 'primary'}>
                      {note.type === 'report' ? 'Report' : 'Note'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingNote(note);
                        setShowNoteForm(true);
                      }}
                    >
                      <Edit size={14} />
                    </Button>
                  </div>
                </div>
                <div 
                  className="prose dark:prose-invert prose-sm max-w-none mb-2" 
                  dangerouslySetInnerHTML={{ __html: note.content }} 
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Added by {note.author?.email} on {formatDateTime(note.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderReminders = () => {
    const reminders = account.reminders || [];
    
    if (showReminderForm) {
      return (
        <ReminderForm
          reminder={editingReminder || undefined}
          accountId={account.id}
          onSuccess={handleReminderSuccess}
          onCancel={() => {
            setShowReminderForm(false);
            setEditingReminder(null);
          }}
        />
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">Reminders ({reminders.length})</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowReminderForm(true)}
            leftIcon={<Plus size={16} />}
          >
            Add Reminder
          </Button>
        </div>
        
        {reminders.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No reminders have been set for this account yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium">{reminder.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant={reminder.completed ? 'success' : 'warning'}>
                      {reminder.completed ? 'Completed' : 'Pending'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingReminder(reminder);
                        setShowReminderForm(true);
                      }}
                    >
                      <Edit size={14} />
                    </Button>
                  </div>
                </div>
                <div 
                  className="prose dark:prose-invert prose-sm max-w-none mb-2" 
                  dangerouslySetInnerHTML={{ __html: reminder.content }} 
                />
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Due: {formatDateTime(reminder.date)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created by {reminder.author?.email} on {formatDateTime(reminder.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAccountDetails = () => {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Account Information</h3>
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Created</td>
                  <td>{formatDateTime(account.created_at)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Updated</td>
                  <td>{formatDateTime(account.updated_at)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Notes</td>
                  <td>{account.notes?.length || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Reminders</td>
                  <td>{account.reminders?.length || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Assignment</h3>
            {account.assigned_to.length > 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                Assigned to {account.assigned_to.length} assistant{account.assigned_to.length !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Not assigned to any assistants
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderVault = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Vault ({vault.length})</h3>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowVaultModal(true)}
            leftIcon={<Plus size={16} />}
          >
            Add New Key
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDecrypted((v) => !v)}
          >
            {showDecrypted ? 'Hide Values' : 'Decrypt Values'}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Key</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody>
            {vault.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">No vault entries yet.</td>
              </tr>
            ) : (
              vault.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 font-mono text-sm">{entry.key}</td>
                  <td className="px-4 py-2 font-mono text-sm">
                    {showDecrypted ? decrypt(entry.value) : encrypt(entry.value)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showVaultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h4 className="text-lg font-semibold mb-4">Add New Vault Entry</h4>
            <Input
              label="Key"
              value={vaultKey}
              onChange={e => setVaultKey(e.target.value)}
              placeholder="Enter key name"
              required
              fullWidth
            />
            <TextArea
              label="Value"
              value={vaultValue}
              onChange={e => setVaultValue(e.target.value)}
              placeholder="Enter secret value"
              required
              fullWidth
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowVaultModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddVaultEntry}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
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
          
          <div>
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
            <MessageSquare size={16} className="inline mr-2" />
            Notes ({account.notes?.length || 0})
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reminders'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('reminders')}
          >
            <Clock size={16} className="inline mr-2" />
            Reminders ({account.reminders?.length || 0})
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
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'vault'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('vault')}
          >
            <Users size={16} className="inline mr-2" />
            Vault
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'notes' && renderNotes()}
      {activeTab === 'reminders' && renderReminders()}
      {activeTab === 'details' && renderAccountDetails()}
      {activeTab === 'vault' && renderVault()}
    </div>
  );
};

export default AccountDetail;