import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Building } from 'lucide-react';
import Button from '../ui/Button';
import { Workspace } from '../../types';
import { getWorkspaces } from '../../lib/database';

interface WorkspaceSelectorProps {
  selectedWorkspace: Workspace | null;
  onWorkspaceSelect: (workspace: Workspace) => void;
  onCreateWorkspace: () => void;
}

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  selectedWorkspace,
  onWorkspaceSelect,
  onCreateWorkspace,
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded-md"></div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center">
          <Building size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
          <span className="font-medium">
            {selectedWorkspace ? selectedWorkspace.name : 'Select Workspace'}
          </span>
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="py-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => {
                  onWorkspaceSelect(workspace);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium">{workspace.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {workspace.workspace_members?.length || 0} members
                </div>
              </button>
            ))}
            
            <div className="border-t border-gray-200 dark:border-gray-600 mt-1 pt-1">
              <button
                onClick={() => {
                  onCreateWorkspace();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center text-blue-600 dark:text-blue-400"
              >
                <Plus size={16} className="mr-2" />
                Create New Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;