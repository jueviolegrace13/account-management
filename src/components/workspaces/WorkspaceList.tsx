import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import { Workspace } from '../../types';
import { getWorkspaces } from '../../lib/database';

interface WorkspaceListProps {
  onSelectWorkspace: (workspace: Workspace) => void;
  onCreateWorkspace: () => void;
}

const WorkspaceList: React.FC<WorkspaceListProps> = ({
  onSelectWorkspace,
  onCreateWorkspace,
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading workspaces...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workspaces</h2>
        <Button
          variant="primary"
          onClick={onCreateWorkspace}
          leftIcon={<Plus size={16} />}
        >
          New Workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No workspaces found. Create your first workspace to get started.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectWorkspace(workspace)}
            >
              <h3 className="font-medium text-lg mb-2">{workspace.name}</h3>
              <p className="text-sm text-gray-500">
                Created {new Date(workspace.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceList; 