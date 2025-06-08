import React, { useState, useEffect } from 'react';
import { Key, Users, Clock, AlertCircle, Plus } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCard from '../components/dashboard/StatCard';
import WorkspaceSelector from '../components/workspaces/WorkspaceSelector';
import WorkspaceForm from '../components/workspaces/WorkspaceForm';
import WorkspaceMembers from '../components/workspaces/WorkspaceMembers';
import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import AccountDetail from '../components/accounts/AccountDetail';
import { Workspace, Account } from '../types';
import { getWorkspaces, createWorkspace, getWorkspaceAccounts, deleteAccount } from '../lib/database';
import { supabase } from '../lib/supabase';

const WorkspaceDashboard: React.FC = () => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [showMembersForm, setShowMembersForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceAccounts();
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const ws = await getWorkspaces();
      setWorkspaces(ws);
    };
    fetchWorkspaces();
  }, []);

  const loadInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      const workspaces = await getWorkspaces();
      if (workspaces.length > 0) {
        setSelectedWorkspace(workspaces[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaceAccounts = async () => {
    if (!selectedWorkspace) return;
    
    try {
      const data = await getWorkspaceAccounts(selectedWorkspace.id);
      setAccounts(data);
      
      // Update viewingAccount if it exists
      if (viewingAccount) {
        const updatedAccount = data.find(acc => acc.id === viewingAccount.id);
        if (updatedAccount) {
          setViewingAccount(updatedAccount);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateWorkspace = async (workspace: Workspace) => {
    try {
      await createWorkspace(workspace.name);
      await loadInitialData();
      setShowWorkspaceForm(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAccountSave = async () => {
    setShowAccountForm(false);
    setEditingAccount(null);
    await loadWorkspaceAccounts();
  };

  const handleAccountDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(id);
        await loadWorkspaceAccounts();
        if (viewingAccount && viewingAccount.id === id) {
          setViewingAccount(null);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleViewAccount = (account: Account) => {
    setViewingAccount(account);
    setShowAccountForm(false);
    setEditingAccount(null);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAccountForm(true);
    setViewingAccount(null);
  };

  const handleBackToList = () => {
    setViewingAccount(null);
    setEditingAccount(null);
    setShowAccountForm(false);
  };

  const isWorkspaceOwner = selectedWorkspace && currentUser && selectedWorkspace.owner_id === currentUser.id;
  const isAssistant = selectedWorkspace && currentUser && 
    selectedWorkspace.workspace_members?.some(member => 
      member.user_id === currentUser.id && member.role === 'assistant'
    );

  // Calculate stats
  const totalAccounts = accounts.length;
  const assignedAccounts = accounts.filter(account => 
    currentUser && account.assigned_to.includes(currentUser.id)
  ).length;
  const totalNotes = accounts.reduce((sum, account) => sum + (account.notes?.length || 0), 0);
  const totalReminders = accounts.reduce((sum, account) => sum + (account.reminders?.length || 0), 0);
  const reportCount = accounts.reduce((sum, account) => 
    sum + (account.notes?.filter(note => note.type === 'report').length || 0), 0
  );

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!selectedWorkspace) {
    if (workspaces.length === 0) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">No Workspaces Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You need to create or be invited to a workspace to get started.
            </p>
            <button
              onClick={() => setShowWorkspaceForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Workspace
            </button>
          </div>
          {showWorkspaceForm && (
            <WorkspaceForm
              onSave={handleCreateWorkspace}
              onCancel={() => setShowWorkspaceForm(false)}
            />
          )}
        </div>
      );
    }

    return (
      <div className="p-6">
        <WorkspaceSelector
          selectedWorkspace={selectedWorkspace}
          onWorkspaceSelect={setSelectedWorkspace}
          onCreateWorkspace={() => setShowWorkspaceForm(true)}
          workspaces={workspaces}
        />
        {showWorkspaceForm && (
          <WorkspaceForm
            onSave={handleCreateWorkspace}
            onCancel={() => setShowWorkspaceForm(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {!showAccountForm && !viewingAccount && !showWorkspaceForm && !showMembersForm && (
        <>
          <div className="mb-6">
            <WorkspaceSelector
              selectedWorkspace={selectedWorkspace}
              onWorkspaceSelect={setSelectedWorkspace}
              onCreateWorkspace={() => setShowWorkspaceForm(true)}
            />
          </div>

          <DashboardHeader 
            title={selectedWorkspace.name}
            subtitle={isWorkspaceOwner ? "Workspace Owner Dashboard" : "Assistant Dashboard"}
            onAddNew={isWorkspaceOwner || isAssistant ? () => setShowAccountForm(true) : undefined}
            addButtonText="Add Account"
          />

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Quick Actions */}
          {isWorkspaceOwner && (
            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => setShowMembersForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Users size={16} className="mr-2" />
                Manage Members
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title={isWorkspaceOwner ? "Total Accounts" : "Assigned Accounts"}
              value={isWorkspaceOwner ? totalAccounts : assignedAccounts}
              icon={<Key size={20} className="text-blue-600 dark:text-blue-400" />}
              description={isWorkspaceOwner ? "In workspace" : "To you"}
            />
            
            <StatCard
              title="Notes"
              value={totalNotes}
              icon={<AlertCircle size={20} className="text-purple-600 dark:text-purple-400" />}
              description={`${reportCount} reports`}
            />
            
            <StatCard
              title="Reminders"
              value={totalReminders}
              icon={<Clock size={20} className="text-teal-600 dark:text-teal-400" />}
              description="Total reminders"
            />
            
            <StatCard
              title="Members"
              value={selectedWorkspace.workspace_members?.length || 0}
              icon={<Users size={20} className="text-green-600 dark:text-green-400" />}
              description="In workspace"
            />
          </div>

          {/* Accounts */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">
              {isWorkspaceOwner ? 'All Accounts' : 'Your Assigned Accounts'}
            </h3>
            
            {accounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts
                  .filter(account => isWorkspaceOwner || account.assigned_to.includes(currentUser?.id))
                  .map(account => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onEdit={handleEditAccount}
                      onDelete={handleAccountDelete}
                      onView={handleViewAccount}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {isWorkspaceOwner 
                    ? "No accounts have been added to this workspace yet"
                    : "No accounts have been assigned to you yet"
                  }
                </p>
                {(isWorkspaceOwner || isAssistant) && (
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setShowAccountForm(true)}
                  >
                    Add your first account
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {showWorkspaceForm && (
        <WorkspaceForm
          onSave={handleCreateWorkspace}
          onCancel={() => setShowWorkspaceForm(false)}
        />
      )}

      {showMembersForm && selectedWorkspace && (
        <WorkspaceMembers
          workspace={selectedWorkspace}
          onInviteMember={async (email, role) => {
            // Implementation would go here
            console.log('Invite member:', email, role);
          }}
          onRemoveMember={async (userId) => {
            // Implementation would go here
            console.log('Remove member:', userId);
          }}
          onBack={() => setShowMembersForm(false)}
        />
      )}

      {showAccountForm && selectedWorkspace && (
        <AccountForm
          account={editingAccount || undefined}
          workspace={selectedWorkspace}
          onSave={handleAccountSave}
          onCancel={handleBackToList}
        />
      )}

      {viewingAccount && (
        <AccountDetail
          account={viewingAccount}
          onBack={handleBackToList}
          onEdit={handleEditAccount}
          onAccountUpdate={loadWorkspaceAccounts}
        />
      )}
    </div>
  );
};

export default WorkspaceDashboard;