import React, { useEffect, useState } from 'react';
import { Workspace } from '../../types';
import { supabase } from '../../lib/supabase';

interface WorkspaceDetailProps {
  workspace: Workspace;
  onBack: () => void;
}

const WorkspaceDetail: React.FC<WorkspaceDetailProps> = ({ workspace, onBack }) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [workspace.id]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) return;
    setDeleting(true);
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspace.id);
    setDeleting(false);
    if (!error) {
      onBack();
    } else {
      setError('Failed to delete workspace');
    }
  };

  if (loading) {
    return <div className="p-4">Loading accounts...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={onBack}
        >
          ← Back to Workspaces
        </button>
        <button
          className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Workspace'}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-2">{workspace.name}</h2>
        <p className="text-gray-500">
          Created {new Date(workspace.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Accounts</h3>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {/* Add account creation logic */}}
          >
            Add Account
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No accounts found. Add your first account to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
              >
                <h4 className="font-medium text-lg mb-2">{account.name}</h4>
                <p className="text-sm text-gray-500">{account.username}</p>
                {account.website && (
                  <a
                    href={account.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {account.website}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDetail; 