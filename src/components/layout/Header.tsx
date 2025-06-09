import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import WorkspaceSelector from '../workspaces/WorkspaceSelector';
import { useWorkspaces } from '../../contexts/WorkspaceContext';
import { Workspace } from '../../types';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedWorkspace, selectWorkspace } = useWorkspaces();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    selectWorkspace(workspace);
    navigate('/dashboard');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm fixed top-0 left-0 right-0 z-20 transition-all duration-300">
      <div className={`px-4 h-16 flex items-center justify-between transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden mr-2" 
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
          >
            <Menu size={20} />
          </Button>
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">AccountHub</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Workspace Switcher */}
          <div className="w-56">
            <WorkspaceSelector
              selectedWorkspace={selectedWorkspace}
              onWorkspaceSelect={handleWorkspaceSelect}
              onCreateWorkspace={() => {}}
            />
          </div>
          {/* Theme toggle button hidden */}
          {user && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                {user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                aria-label="Sign Out"
              >
                <LogOut size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;