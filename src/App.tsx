import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import { getUserSettings } from './utils/storage';
import { supabase } from './lib/supabase';
import InvitationPage from './pages/InvitationPage';

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
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        />
        <Route path="/invitations/:invitationId" element={<InvitationPage />} />
      </Routes>
    </Router>
  );
}

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = React.useState<boolean | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) {
    return <div>Loading...</div>;
  }

  return session ? <>{children}</> : <Navigate to="/" replace />;
};

export default App;