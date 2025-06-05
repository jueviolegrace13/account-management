import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Assistant, Account } from '../../types';
import { generateId, createDateString } from '../../utils/helpers';

interface AssistantFormProps {
  assistant?: Assistant;
  accounts: Account[];
  onSave: (assistant: Assistant) => void;
  onCancel: () => void;
}

const AssistantForm: React.FC<AssistantFormProps> = ({
  assistant,
  accounts,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(assistant?.name || '');
  const [email, setEmail] = useState(assistant?.email || '');
  const [phone, setPhone] = useState(assistant?.phone || '');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    assistant?.accountIds || []
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      setError('Name and email are required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    const updatedAssistant: Assistant = {
      id: assistant?.id || generateId(),
      name,
      email,
      phone: phone || undefined,
      accountIds: selectedAccountIds,
      createdAt: assistant?.createdAt || createDateString(),
    };
    
    onSave(updatedAssistant);
  };

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccountIds(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">
        {assistant ? 'Edit Assistant' : 'Add New Assistant'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Assistant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            fullWidth
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            fullWidth
            required
          />
          
          <Input
            label="Phone (Optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            fullWidth
            className="md:col-span-2"
          />
        </div>
        
        {accounts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Assign Accounts</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md max-h-60 overflow-y-auto">
              {accounts.map((account) => (
                <div key={account.id} className="mb-2 last:mb-0">
                  <label className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAccountIds.includes(account.id)}
                      onChange={() => toggleAccountSelection(account.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3">
                      <span className="block font-medium">{account.name}</span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        {account.username}
                      </span>
                    </span>
                  </label>
                </div>
              ))}
              
              {accounts.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-3">
                  No accounts available to assign.
                </p>
              )}
            </div>
          </div>
        )}
        
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
            {assistant ? 'Update Assistant' : 'Save Assistant'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssistantForm;