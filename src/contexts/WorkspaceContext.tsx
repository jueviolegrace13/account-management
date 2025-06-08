import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getWorkspaces } from '../lib/database';
import { Workspace } from '../types';

interface WorkspaceContextType {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  loading: true,
  error: null,
  reload: () => {},
});

export const useWorkspaces = () => useContext(WorkspaceContext);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ws = await getWorkspaces();
      setWorkspaces(ws);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return (
    <WorkspaceContext.Provider value={{ workspaces, loading, error, reload: fetchWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}; 