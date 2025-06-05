import React, { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import { getUserSettings } from './utils/storage';

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

  return <MainLayout />;
}

export default App;