import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import RichTextEditor from '../ui/RichTextEditor';
import { Account, Note } from '../../types';
import { generateId, createDateString } from '../../utils/helpers';

interface AccountFormProps {
  account?: Account;
  onSave: (account: Account) => void;
  onCancel: () => void;
  assistantIds?: string[];
}

const AccountForm: React.FC<AccountFormProps> = ({
  account,
  onSave,
  onCancel,
  assistantIds = [],
}) => {
  const [name, setName] = useState(account?.name || '');
  const [username, setUsername] = useState(account?.username || '');
  const [website, setWebsite] = useState(account?.website || '');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'regular' | 'report'>('regular');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !username) {
      setError('Name and username are required');
      return;
    }
    
    const now = createDateString();
    
    const updatedAccount: Account = {
      id: account?.id || generateId(),
      name,
      username,
      website,
      notes: account?.notes || [],
      assistantIds: account?.assistantIds || assistantIds,
      createdAt: account?.createdAt || now,
      updatedAt: now,
    };
    
    onSave(updatedAccount);
  };

  const handleAddNote = () => {
    if (!noteTitle || !noteContent) {
      setError('Note title and content are required');
      return;
    }

    if (!account) return;
    
    const newNote: Note = {
      id: generateId(),
      title: noteTitle,
      content: noteContent,
      type: noteType,
      createdAt: createDateString(),
    };
    
    const updatedAccount: Account = {
      ...account,
      notes: [...account.notes, newNote],
      updatedAt: createDateString(),
    };
    
    onSave(updatedAccount);
    
    // Reset note form
    setNoteTitle('');
    setNoteContent('');
    setNoteType('regular');
    setError('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">
        {account ? 'Edit Account' : 'Add New Account'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Google, Twitter, etc."
            fullWidth
            required
          />
          
          <Input
            label="Username / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username or email@example.com"
            fullWidth
            required
          />
          
          <Input
            label="Website URL"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            fullWidth
            className="md:col-span-2"
          />
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            leftIcon={<X size={16} />}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save size={16} />}
          >
            {account ? 'Update Account' : 'Save Account'}
          </Button>
        </div>
      </form>
      
      {account && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Add Note</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              label="Note Title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Title"
              fullWidth
              className="md:col-span-2"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note Type
              </label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as 'regular' | 'report')}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-800"
              >
                <option value="regular">Regular Note</option>
                <option value="report">Report</option>
              </select>
            </div>
          </div>
          
          <RichTextEditor
            label="Note Content"
            initialValue={noteContent}
            onChange={setNoteContent}
            placeholder="Write your note..."
          />
          
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="primary"
              onClick={handleAddNote}
            >
              Add Note
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountForm;