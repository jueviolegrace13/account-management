import React, { useState } from 'react';
import { Key, Users, Clock, AlertCircle } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import UpcomingReminders from '../components/dashboard/UpcomingReminders';
import RecentReports from '../components/dashboard/RecentReports';
import ReminderDetail from '../components/reminders/ReminderDetail';
import AccountDetail from '../components/accounts/AccountDetail';
import { getAccounts, getReminders, getAssistants, saveReminders } from '../utils/storage';

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState(getAccounts());
  const [reminders, setReminders] = useState(getReminders());
  const [assistants, setAssistants] = useState(getAssistants());
  
  const [viewingAccount, setViewingAccount] = useState<string | null>(null);
  const [viewingReminder, setViewingReminder] = useState<string | null>(null);
  
  // Calculate stats
  const totalAccounts = accounts.length;
  const totalReminders = reminders.length;
  const totalAssistants = assistants.length;
  
  // Count reports
  const reportCount = accounts.reduce(
    (count, account) => count + account.notes.filter(note => note.type === 'report').length,
    0
  );
  
  // Handle toggle reminder completion
  const handleToggleReminderComplete = (id: string, completed: boolean) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, completed } : reminder
    );
    saveReminders(updatedReminders);
    setReminders(updatedReminders);
  };
  
  // Get account by ID
  const getAccountById = (id: string) => {
    return accounts.find(account => account.id === id);
  };
  
  // Get reminder by ID
  const getReminderById = (id: string) => {
    return reminders.find(reminder => reminder.id === id);
  };

  // Render viewing states
  if (viewingReminder) {
    const reminder = getReminderById(viewingReminder);
    if (!reminder) {
      setViewingReminder(null);
      return null;
    }
    
    const account = reminder.accountId ? getAccountById(reminder.accountId) : undefined;
    
    return (
      <ReminderDetail
        reminder={reminder}
        account={account}
        onBack={() => setViewingReminder(null)}
        onEdit={() => {/* Would handle editing */}}
        onToggleComplete={handleToggleReminderComplete}
      />
    );
  }
  
  if (viewingAccount) {
    const account = getAccountById(viewingAccount);
    if (!account) {
      setViewingAccount(null);
      return null;
    }
    
    return (
      <AccountDetail
        account={account}
        assistants={assistants.filter(assistant => 
          account.assistantIds.includes(assistant.id)
        )}
        onBack={() => setViewingAccount(null)}
        onEdit={() => {/* Would handle editing */}}
        onAddReminder={() => {/* Would handle adding reminder */}}
      />
    );
  }

  return (
    <div>
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Overview of your accounts and recent activity"
      />
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Accounts"
          value={totalAccounts}
          icon={<Key size={20} className="text-blue-600 dark:text-blue-400" />}
          description="Managed accounts"
        />
        
        <StatCard
          title="Reminders"
          value={totalReminders}
          icon={<Clock size={20} className="text-purple-600 dark:text-purple-400" />}
          description={`${reminders.filter(r => !r.completed).length} active`}
        />
        
        <StatCard
          title="Assistants"
          value={totalAssistants}
          icon={<Users size={20} className="text-teal-600 dark:text-teal-400" />}
          description="Helping manage accounts"
        />
        
        <StatCard
          title="Reports"
          value={reportCount}
          icon={<AlertCircle size={20} className="text-red-600 dark:text-red-400" />}
          description="Across all accounts"
        />
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-8">
          <UpcomingReminders 
            reminders={reminders}
            accounts={accounts}
            onViewReminder={(reminder) => setViewingReminder(reminder.id)}
          />
          
          <RecentReports 
            accounts={accounts}
            onViewAccount={(account) => setViewingAccount(account.id)}
          />
        </div>
        
        {/* Right column */}
        <div>
          <RecentActivity 
            accounts={accounts}
            reminders={reminders}
            onViewAccount={(account) => setViewingAccount(account.id)}
            onViewReminder={(reminder) => setViewingReminder(reminder.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;