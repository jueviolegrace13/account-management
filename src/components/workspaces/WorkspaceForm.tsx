import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Workspace } from '../../types';
import { supabase } from '../../lib/supabase';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Workspace name is required');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');
      if (workspace) {
        // Update existing workspace
        const { data, error: updateError } = await supabase
          .from('workspaces')
          .update({ name })
          .eq('id', workspace.id)
          .eq('owner_id', user.id)
          .select()
          .single();
        if (updateError) throw updateError;
        onSave(data);
      } else {
        // Create new workspace
        const { data, error: insertError } = await supabase
          .from('workspaces')
          .insert([
            {
              name,
              owner_id: user.id,
            }
          ])
          .select()
          .single();
        if (insertError) throw insertError;
        onSave(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
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
          disabled={isLoading}
        />
        <div className="flex justify-end mt-6 space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            leftIcon={<X size={16} />}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save size={16} />}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : workspace ? 'Update Workspace' : 'Create Workspace'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceForm;