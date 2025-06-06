import React, { useState } from 'react';
import { User, UserPlus, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Workspace, WorkspaceMember, WorkspaceRole } from '../../types';
import { formatDate } from '../../utils/helpers';

interface WorkspaceMembersProps {
  workspace: Workspace;
  onInviteMember: (email: string, role: WorkspaceRole) => void;
  onRemoveMember: (userId: string) => void;
}

const WorkspaceMembers: React.FC<WorkspaceMembersProps> = ({
  workspace,
  onInviteMember,
  onRemoveMember,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('assistant');
  const [error, setError] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    onInviteMember(email, role);
    setEmail('');
    setError('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold">Workspace Members</h2>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleInvite} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              fullWidth
              className="md:col-span-2"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-800"
              >
                <option value="assistant">Assistant</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
          
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
          )}
          
          <div className="mt-4">
            <Button
              type="submit"
              variant="primary"
              leftIcon={<UserPlus size={16} />}
            >
              Invite Member
            </Button>
          </div>
        </form>
        
        <div className="space-y-4">
          {workspace.members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="font-medium">{member.userId}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Joined {formatDate(member.createdAt)}
                </span>
                
                {member.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveMember(member.userId)}
                    aria-label="Remove member"
                  >
                    <X size={16} className="text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMembers;