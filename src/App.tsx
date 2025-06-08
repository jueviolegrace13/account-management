import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import { getUserSettings } from './utils/storage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import InvitationPage from './pages/InvitationPage';
import AccountDetailPage from './pages/AccountDetailPage';
import WorkspaceDashboard from './pages/WorkspaceDashboard';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

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

  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <WorkspaceDashboard />,
      },
      {
        path: "account/:id",
        element: <AccountDetailPage />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/invitations/:invitationId",
    element: <InvitationPage />,
  },
]);

function App() {
  // Initialize theme from stored settings
  useEffect(() => {
    const userSettings = getUserSettings();
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <WorkspaceProvider>
        <RouterProvider router={router} />
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;