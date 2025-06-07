import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Account, Workspace, WorkspaceMember } from '../../types';
import { createAccount, updateAccount, getWorkspaces } from '../../lib/database';

interface AccountFormProps {
  account?: Account;
  workspace: Workspace;
  onSave: () => void;
  onCancel: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({
  account,
  workspace,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(account?.name || '');
  const [username, setUsername] = useState(account?.username || '');
  const [website, setWebsite] = useState(account?.website || '');
  const [assignedTo, setAssignedTo] = useState<string[]>(account?.assigned_to || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const assistants = workspace.workspace_members?.filter(member => member.role === 'assistant') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !username) {
      setError('Name and username are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (account) {
        await updateAccount(account.id, {
          name,
          username,
          website: website || undefined,
          assigned_to: assignedTo,
        });
      } else {
        await createAccount({
          user_id: workspace.owner_id,
          workspace_id: workspace.id,
          name,
          username,
          website: website || undefined,
          assigned_to: assignedTo,
        });
      }
      
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignment = (userId: string) => {
    setAssignedTo(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
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
        
        {assistants.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Assign to Assistants</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md max-h-60 overflow-y-auto">
              {assistants.map((member) => (
                <div key={member.user_id} className="mb-2 last:mb-0">
                  <label className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignedTo.includes(member.user_id)}
                      onChange={() => toggleAssignment(member.user_id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3">
                      <span className="block font-medium">{member.user?.email}</span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {member.role}
                      </span>
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-6 space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            leftIcon={<X size={16} />}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save size={16} />}
            isLoading={loading}
          >
            {account ? 'Update Account' : 'Save Account'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;