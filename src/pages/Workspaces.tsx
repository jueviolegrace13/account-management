import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import WorkspaceCard from '../components/workspaces/WorkspaceCard';
import WorkspaceForm from '../components/workspaces/WorkspaceForm';
import WorkspaceMembers from '../components/workspaces/WorkspaceMembers';
import Input from '../components/ui/Input';
import { Workspace, WorkspaceRole } from '../types';
import { supabase } from '../lib/supabase';

const Workspaces: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members (*)
        `);

      if (error) throw error;

      setWorkspaces(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (workspace: Workspace) => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{
          name: workspace.name,
        }])
        .select()
        .single();

      if (error) throw error;

      setWorkspaces([...workspaces, data]);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateWorkspace = async (workspace: Workspace) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: workspace.name,
        })
        .eq('id', workspace.id);

      if (error) throw error;

      setWorkspaces(workspaces.map(w => 
        w.id === workspace.id ? workspace : w
      ));
      setShowForm(false);
      setEditingWorkspace(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInviteMember = async (email: string, role: WorkspaceRole) => {
    if (!editingWorkspace) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      const { error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: editingWorkspace.id,
          user_id: userData.id,
          role,
        });

      if (error) throw error;

      // Reload workspace data
      loadWorkspaces();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!editingWorkspace) return;

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', editingWorkspace.id)
        .eq('user_id', userId);

      if (error) throw error;

      // Reload workspace data
      loadWorkspaces();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter workspaces by search query
  const filteredWorkspaces = workspaces.filter(workspace => {
    if (!searchQuery) return true;
    return workspace.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!showForm && !showMembers && (
        <>
          <DashboardHeader 
            title="Workspaces" 
            subtitle="Manage your workspaces and team members"
            onAddNew={() => {
              setEditingWorkspace(null);
              setShowForm(true);
            }}
            addButtonText="Create Workspace"
          />
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-6 relative">
            <Input
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {filteredWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map(workspace => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onManage={() => {/* Navigate to workspace dashboard */}}
                  onSettings={() => {
                    setEditingWorkspace(workspace);
                    setShowMembers(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              {searchQuery ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    No workspaces found matching "{searchQuery}"
                  </p>
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    You haven't created any workspaces yet
                  </p>
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setShowForm(true)}
                  >
                    Create your first workspace
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
      
      {showForm && (
        <WorkspaceForm
          workspace={editingWorkspace || undefined}
          onSave={editingWorkspace ? handleUpdateWorkspace : handleCreateWorkspace}
          onCancel={() => {
            setShowForm(false);
            setEditingWorkspace(null);
          }}
        />
      )}
      
      {showMembers && editingWorkspace && (
        <WorkspaceMembers
          workspace={editingWorkspace}
          onInviteMember={handleInviteMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  );
};

export default Workspaces;