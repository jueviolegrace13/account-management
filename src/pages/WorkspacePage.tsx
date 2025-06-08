import React, { useState } from 'react';
import WorkspaceList from '../components/workspaces/WorkspaceList';
import WorkspaceForm from '../components/workspaces/WorkspaceForm';
import WorkspaceDetail from '../components/workspaces/WorkspaceDetail';
import { Workspace } from '../types';

const WorkspacePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const handleCreateWorkspace = () => {
    setShowForm(true);
  };

  const handleSelectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
  };

  const handleSaveWorkspace = (workspace: Workspace) => {
    setShowForm(false);
    // Refresh the workspace list
    window.location.reload();
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleBackToList = () => {
    setSelectedWorkspace(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {showForm ? (
        <WorkspaceForm
          onSave={handleSaveWorkspace}
          onCancel={handleCancel}
        />
      ) : selectedWorkspace ? (
        <WorkspaceDetail workspace={selectedWorkspace} onBack={handleBackToList} />
      ) : (
        <WorkspaceList
          onSelectWorkspace={handleSelectWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
        />
      )}
    </div>
  );
};

export default WorkspacePage; 