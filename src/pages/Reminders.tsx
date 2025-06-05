import React, { useState, useEffect } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ReminderCard from '../components/reminders/ReminderCard';
import ReminderForm from '../components/reminders/ReminderForm';
import ReminderDetail from '../components/reminders/ReminderDetail';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Reminder, Account } from '../types';
import { getReminders, saveReminders, getAccounts } from '../utils/storage';

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(getReminders());
  const [accounts, setAccounts] = useState<Account[]>(getAccounts());
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [viewingReminder, setViewingReminder] = useState<Reminder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  useEffect(() => {
    // Refresh data when component mounts
    setReminders(getReminders());
    setAccounts(getAccounts());
  }, []);
  
  const handleAddReminder = () => {
    setEditingReminder(null);
    setShowForm(true);
    setViewingReminder(null);
  };
  
  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
    setViewingReminder(null);
  };
  
  const handleSaveReminder = (reminder: Reminder) => {
    const isEditing = !!editingReminder;
    const updatedReminders = isEditing
      ? reminders.map(r => (r.id === reminder.id ? reminder : r))
      : [...reminders, reminder];
    
    saveReminders(updatedReminders);
    setReminders(updatedReminders);
    setShowForm(false);
    setEditingReminder(null);
    
    // If we were editing and viewing the same reminder, update the viewing reminder
    if (viewingReminder && viewingReminder.id === reminder.id) {
      setViewingReminder(reminder);
    }
  };
  
  const handleDeleteReminder = (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      const updatedReminders = reminders.filter(reminder => reminder.id !== id);
      saveReminders(updatedReminders);
      setReminders(updatedReminders);
      
      if (viewingReminder && viewingReminder.id === id) {
        setViewingReminder(null);
      }
    }
  };
  
  const handleToggleComplete = (id: string, completed: boolean) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, completed } : reminder
    );
    saveReminders(updatedReminders);
    setReminders(updatedReminders);
    
    // If we're viewing the reminder that was toggled, update it
    if (viewingReminder && viewingReminder.id === id) {
      setViewingReminder({ ...viewingReminder, completed });
    }
  };
  
  const handleViewReminder = (reminder: Reminder) => {
    setViewingReminder(reminder);
    setShowForm(false);
    setEditingReminder(null);
  };
  
  const handleBackToList = () => {
    setViewingReminder(null);
    setEditingReminder(null);
    setShowForm(false);
  };
  
  // Get account by ID
  const getAccountById = (id: string) => {
    return accounts.find(account => account.id === id);
  };
  
  // Filter and sort reminders
  const filteredReminders = reminders
    .filter(reminder => {
      // Filter by completion status
      if (filter === 'active' && reminder.completed) return false;
      if (filter === 'completed' && !reminder.completed) return false;
      
      // Filter by search query
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        reminder.title.toLowerCase().includes(query) ||
        reminder.content.toLowerCase().includes(query) ||
        (reminder.accountId && getAccountById(reminder.accountId)?.name.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      // Sort by date (closest first for non-completed, oldest first for completed)
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      
      if (a.completed && b.completed) {
        // For completed reminders, show most recently completed first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      
      // For active reminders, show closest date first
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  
  // Calculate counts
  const activeCount = reminders.filter(r => !r.completed).length;
  const completedCount = reminders.filter(r => r.completed).length;
  const overdueCount = reminders.filter(r => !r.completed && new Date(r.date) < new Date()).length;

  return (
    <div>
      {!showForm && !viewingReminder && (
        <>
          <DashboardHeader 
            title="Reminders" 
            subtitle="Manage all your upcoming tasks and deadlines"
            onAddNew={handleAddReminder}
            addButtonText="Add Reminder"
          />
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({reminders.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active ({activeCount})
              </Button>
              <Button
                variant={filter === 'completed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed ({completedCount})
              </Button>
            </div>
            
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
          
          {/* Overdue warning */}
          {overdueCount > 0 && filter !== 'completed' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-center">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300">
                You have {overdueCount} overdue {overdueCount === 1 ? 'reminder' : 'reminders'} that {overdueCount === 1 ? 'needs' : 'need'} attention.
              </p>
            </div>
          )}
          
          {/* Reminder List */}
          {filteredReminders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  account={reminder.accountId ? getAccountById(reminder.accountId) : undefined}
                  onEdit={handleEditReminder}
                  onDelete={handleDeleteReminder}
                  onToggleComplete={handleToggleComplete}
                  onView={handleViewReminder}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              {searchQuery ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    No reminders found matching "{searchQuery}"
                  </p>
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                </>
              ) : filter !== 'all' ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    No {filter} reminders found
                  </p>
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setFilter('all')}
                  >
                    View all reminders
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    You haven't added any reminders yet
                  </p>
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={handleAddReminder}
                  >
                    Add your first reminder
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
      
      {showForm && (
        <ReminderForm
          reminder={editingReminder || undefined}
          accounts={accounts}
          onSave={handleSaveReminder}
          onCancel={handleBackToList}
        />
      )}
      
      {viewingReminder && (
        <ReminderDetail
          reminder={viewingReminder}
          account={viewingReminder.accountId ? getAccountById(viewingReminder.accountId) : undefined}
          onBack={handleBackToList}
          onEdit={handleEditReminder}
          onToggleComplete={handleToggleComplete}
        />
      )}
    </div>
  );
};

export default Reminders;