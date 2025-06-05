import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import RichTextEditor from '../ui/RichTextEditor';
import { Reminder, Account } from '../../types';
import { generateId, createDateString } from '../../utils/helpers';

interface ReminderFormProps {
  reminder?: Reminder;
  accounts: Account[];
  onSave: (reminder: Reminder) => void;
  onCancel: () => void;
  preSelectedAccountId?: string;
}

const ReminderForm: React.FC<ReminderFormProps> = ({
  reminder,
  accounts,
  onSave,
  onCancel,
  preSelectedAccountId,
}) => {
  const [title, setTitle] = useState(reminder?.title || '');
  const [content, setContent] = useState(reminder?.content || '');
  const [date, setDate] = useState(
    reminder?.date 
      ? new Date(reminder.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [accountId, setAccountId] = useState(reminder?.accountId || preSelectedAccountId || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !date) {
      setError('Title, content, and date are required');
      return;
    }
    
    const now = createDateString();
    const reminderDate = new Date(date).toISOString();
    
    const updatedReminder: Reminder = {
      id: reminder?.id || generateId(),
      title,
      content,
      date: reminderDate,
      completed: reminder?.completed || false,
      accountId: accountId || undefined,
      createdAt: reminder?.createdAt || now,
    };
    
    onSave(updatedReminder);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">
        {reminder ? 'Edit Reminder' : 'Add New Reminder'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Reminder Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reminder title"
            fullWidth
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reminder Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-800"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Related Account (Optional)
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-800"
          >
            <option value="">None</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.username})
              </option>
            ))}
          </select>
        </div>
        
        <RichTextEditor
          label="Reminder Content"
          initialValue={content}
          onChange={setContent}
          placeholder="Write your reminder details..."
        />
        
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
            {reminder ? 'Update Reminder' : 'Save Reminder'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;