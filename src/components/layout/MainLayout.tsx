import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from '../../pages/Dashboard';
import Accounts from '../../pages/Accounts';
import Reminders from '../../pages/Reminders';
import Assistants from '../../pages/Assistants';
import Settings from '../../pages/Settings';
import { getUserSettings, toggleSidebar } from '../../utils/storage';

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!getUserSettings().sidebarCollapsed);

  // Initialize theme
  useEffect(() => {
    const userSettings = getUserSettings();
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleSidebar = () => {
    toggleSidebar();
    setSidebarOpen(!sidebarOpen);
  };

  // Render the active page
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'accounts':
        return <Accounts />;
      case 'reminders':
        return <Reminders />;
      case 'assistants':
        return <Assistants />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header toggleSidebar={handleToggleSidebar} />
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={handleToggleSidebar} 
        activePage={activePage}
        setActivePage={setActivePage}
      />
      
      <main 
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        <div className="p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;