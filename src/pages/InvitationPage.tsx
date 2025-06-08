import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { acceptWorkspaceInvitation, getPendingInvitations } from '../lib/database';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: 'owner' | 'assistant';
  status: 'pending' | 'accepted' | 'expired';
  workspaces?: {
    id: string;
    name: string;
  };
}

const InvitationPage: React.FC = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<WorkspaceInvitation | null>(null);

  useEffect(() => {
    const checkInvitation = async () => {
      if (!invitationId) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Store the invitation ID in localStorage to handle after login
          localStorage.setItem('pendingInvitation', invitationId);
          navigate('/login');
          return;
        }

        const invitations = await getPendingInvitations(user.email!);
        const currentInvitation = invitations.find(inv => inv.id === invitationId);

        if (!currentInvitation) {
          setError('Invitation not found or has expired');
          setLoading(false);
          return;
        }

        setInvitation(currentInvitation);
        setLoading(false);
      } catch {
        setError('An error occurred while checking the invitation');
        setLoading(false);
      }
    };

    checkInvitation();
  }, [invitationId, navigate]);

  const handleAccept = async () => {
    if (!invitationId) return;

    setLoading(true);
    try {
      await acceptWorkspaceInvitation(invitationId);
      navigate('/workspaces');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while accepting the invitation');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/workspaces')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Workspaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Workspace Invitation</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You've been invited to join <span className="font-medium">{invitation?.workspaces?.name}</span> as a{' '}
            <span className="font-medium">{invitation?.role}</span>
          </p>
          
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Accepting...' : 'Accept Invitation'}
          </button>
          
          <button
            onClick={() => navigate('/workspaces')}
            className="mt-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage; 