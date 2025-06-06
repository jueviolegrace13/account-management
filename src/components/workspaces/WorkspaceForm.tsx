import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Workspace } from '../../types';
import { generateId, createDateString } from '../../utils/helpers';

interface WorkspaceFormProps {
  workspace?: Workspace;
  onSave: (workspace: Workspace) => void;
  onCancel: () => void;
}

const WorkspaceForm: React.FC<WorkspaceFormProps> = ({
  workspace,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(workspace?.name || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setError('Workspace name is required');
      return;
    }
    
    const now = createDateString();
    
    const updatedWorkspace: Workspace = {
      id: workspace?.id || generateId(),
      name,
      ownerId: workspace?.ownerId || '', // Will be set by backend
      members: workspace?.members || [],
      createdAt: workspace?.createdAt || now,
      updatedAt: now,
    };
    
    onSave(updatedWorkspace);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">
        {workspace ? 'Edit Workspace' : 'Create New Workspace'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Workspace"
          fullWidth
          required
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
            {workspace ? 'Update Workspace' : 'Create Workspace'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceForm;