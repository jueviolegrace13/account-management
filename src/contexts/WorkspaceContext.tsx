import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getWorkspaces } from '../lib/database';
import { Workspace } from '../types';

const SELECTED_WORKSPACE_KEY = 'selectedWorkspaceId';

interface WorkspaceContextType {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  selectWorkspace: (workspace: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  selectedWorkspace: null,
  loading: true,
  error: null,
  reload: () => {},
  selectWorkspace: () => {},
});

export const useWorkspaces = () => useContext(WorkspaceContext);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ws = await getWorkspaces();
      setWorkspaces(ws);
      
      // Handle selected workspace after fetching workspaces
      const storedId = localStorage.getItem(SELECTED_WORKSPACE_KEY);
      if (storedId && ws.length > 0) {
        const found = ws.find(w => w.id === storedId);
        if (found) {
          setSelectedWorkspace(found);
        } else {
          setSelectedWorkspace(ws[0]);
          localStorage.setItem(SELECTED_WORKSPACE_KEY, ws[0].id);
        }
      } else if (ws.length > 0) {
        setSelectedWorkspace(ws[0]);
        localStorage.setItem(SELECTED_WORKSPACE_KEY, ws[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectWorkspace = useCallback((workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    localStorage.setItem(SELECTED_WORKSPACE_KEY, workspace.id);
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return (
    <WorkspaceContext.Provider 
      value={{ 
        workspaces, 
        selectedWorkspace,
        loading, 
        error, 
        reload: fetchWorkspaces,
        selectWorkspace 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}; 