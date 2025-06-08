import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { getUserSettings, toggleSidebar } from '../../utils/storage';
import { Outlet } from 'react-router-dom';
import ReminderAlarm from '../reminders/ReminderAlarm';
import { useWorkspaces } from '../../contexts/WorkspaceContext';
import { getWorkspaceAccounts } from '../../lib/database';
import { Reminder } from '../../types';

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!getUserSettings().sidebarCollapsed);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { workspaces } = useWorkspaces();

  // Initialize theme
  useEffect(() => {
    const userSettings = getUserSettings();
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Load reminders for all workspaces
  useEffect(() => {
    const loadReminders = async () => {
      const allReminders = [];
      for (const workspace of workspaces) {
        try {
          const accounts = await getWorkspaceAccounts(workspace.id);
          for (const account of accounts) {
            if (account.reminders) {
              allReminders.push(...account.reminders.map(reminder => ({
                ...reminder,
                workspace_id: workspace.id
              })));
            }
          }
        } catch (error) {
          console.error('Error loading reminders:', error);
        }
      }
      setReminders(allReminders);
    };

    if (workspaces.length > 0) {
      loadReminders();
    }
  }, [workspaces]);

  const handleToggleSidebar = () => {
    toggleSidebar();
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header toggleSidebar={handleToggleSidebar} sidebarOpen={sidebarOpen} />
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
          <Outlet />
        </div>
      </main>

      <ReminderAlarm reminders={reminders} />
    </div>
  );
};

export default MainLayout;