import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import AccountDetail from '../components/accounts/AccountDetail';
import { getAccountById } from '../lib/database';
import { Account } from '../types';
import Button from '../components/ui/Button';
import AccountForm from '../components/accounts/AccountForm';
import { useWorkspaces } from '../contexts/WorkspaceContext';

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const { workspaces } = useWorkspaces();

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
      setError('');
      try {
        if (!id) throw new Error('No account ID provided');
        const acc = await getAccountById(id);
        setAccount(acc);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAccount();
  }, [id]);

  const handleEdit = () => setShowEditModal(true);
  const handleEditCancel = () => setShowEditModal(false);
  const handleEditSave = () => {
    setShowEditModal(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!account) return null;

  // Find the workspace object for this account
  const workspace = workspaces.find(ws => ws.id === account.workspace_id);

  return (
    <div>
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full">
        <AccountDetail
          account={account}
          onEdit={handleEdit}
          onAccountUpdate={() => {}}
        />
      </div>
      {showEditModal && workspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <AccountForm
              account={account}
              workspace={workspace}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetailPage; 