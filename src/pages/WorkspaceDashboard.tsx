import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Key, Users, Clock, AlertCircle } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCard from '../components/dashboard/StatCard';
// import WorkspaceSelector from '../components/workspaces/WorkspaceSelector';
import WorkspaceForm from '../components/workspaces/WorkspaceForm';
import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import AccountDetail from '../components/accounts/AccountDetail';
import { Workspace, Account } from '../types';
import { getWorkspaceAccounts, createWorkspace, deleteAccount } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspaces } from '../contexts/WorkspaceContext';

const SELECTED_WORKSPACE_KEY = 'selectedWorkspaceId';

const WorkspaceDashboard: React.FC = () => {
  const { user } = useAuth();
  const { workspaces, loading: workspacesLoading, error: workspacesError, reload: reloadWorkspaces } = useWorkspaces();
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Set initial workspace when workspaces are loaded
  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      setSelectedWorkspace(workspaces[0]);
      localStorage.setItem(SELECTED_WORKSPACE_KEY, workspaces[0].id);
    } else {
      setSelectedWorkspace(null);
    }
  }, [workspaces]);

  // Load accounts when selectedWorkspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceAccounts();
    } else {
      setAccounts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspace]);

  // If the current route is /dashboard/account/:id, render nothing (the Outlet will render the account page)
  if (/^\/dashboard\/account\//.test(location.pathname)) {
    return null;
  }

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCreateWorkspace = async (workspace: Workspace) => {
    try {
      await createWorkspace(workspace.name);
      reloadWorkspaces();
      setShowWorkspaceForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  // Change: navigate to /account/:id instead of opening modal
  const handleViewAccount = (account: Account) => {
    navigate(`/dashboard/account/${account.id}`);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAccountForm(true);
    setViewingAccount(null);
  };

  const isWorkspaceOwner = selectedWorkspace && user && selectedWorkspace.owner_id === user.id;

  // Calculate stats
  const totalAccounts = accounts.length;
  const assignedAccounts = accounts.filter(account => user && account.assigned_to.includes(user.id)).length;
  const totalNotes = accounts.reduce((sum, account) => sum + (account.notes?.length || 0), 0);
  const totalReminders = accounts.reduce((sum, account) => sum + (account.reminders?.length || 0), 0);

  if (workspacesLoading) {
    // Show loading spinner
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!workspacesLoading && workspaces.length === 0) {
    // No workspaces: show the create workspace form
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WorkspaceForm
          onSave={async () => {
            await reloadWorkspaces();
          }}
          onCancel={() => {}}
        />
      </div>
    );
  }

  if (workspacesError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold">Error</h2>
          <p className="mt-2 text-gray-600">{workspacesError || error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader 
        title="Workspace Dashboard" 
        subtitle="Manage your accounts and workspace"
      />

      <div className="space-y-6">
        {/* Workspace Selector removed, now in header */}

        {selectedWorkspace && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Accounts"
                value={totalAccounts}
                icon={<Key className="h-6 w-6" />}
              />
              <StatCard
                title="Assigned to Me"
                value={assignedAccounts}
                icon={<Users className="h-6 w-6" />}
              />
              <StatCard
                title="Total Notes"
                value={totalNotes}
                icon={<Clock className="h-6 w-6" />}
              />
              <StatCard
                title="Total Reminders"
                value={totalReminders}
                icon={<AlertCircle className="h-6 w-6" />}
              />
            </div>

            {/* Accounts List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Accounts</h2>
                {isWorkspaceOwner && (
                  <button
                    onClick={() => setShowAccountForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Account
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts
                  .filter(account => isWorkspaceOwner || (user && account.assigned_to.includes(user.id)))
                  .map(account => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onView={() => handleViewAccount(account)}
                      onEdit={() => handleEditAccount(account)}
                      onDelete={() => handleAccountDelete(account.id)}
                    />
                  ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showWorkspaceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <WorkspaceForm
              onSave={handleCreateWorkspace}
              onCancel={() => setShowWorkspaceForm(false)}
            />
          </div>
        </div>
      )}

      {showAccountForm && selectedWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <AccountForm
              account={editingAccount || undefined}
              workspace={selectedWorkspace}
              onSave={handleAccountSave}
              onCancel={() => {
                setShowAccountForm(false);
                setEditingAccount(null);
              }}
            />
          </div>
        </div>
      )}

      {viewingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AccountDetail
              account={viewingAccount}
              onEdit={() => handleEditAccount(viewingAccount)}
              onAccountUpdate={loadWorkspaceAccounts}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDashboard;