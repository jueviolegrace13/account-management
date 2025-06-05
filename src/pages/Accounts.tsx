import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import AccountDetail from '../components/accounts/AccountDetail';
import Input from '../components/ui/Input';
import { Account } from '../types';
import { getAccounts, saveAccounts, getAssistants } from '../utils/storage';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(getAccounts());
  const [assistants, setAssistants] = useState(getAssistants());
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Refresh data when component mounts
    setAccounts(getAccounts());
    setAssistants(getAssistants());
  }, []);
  
  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
    setViewingAccount(null);
  };
  
  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
    setViewingAccount(null);
  };
  
  const handleSaveAccount = (account: Account) => {
    const isEditing = !!editingAccount;
    const updatedAccounts = isEditing
      ? accounts.map(a => (a.id === account.id ? account : a))
      : [...accounts, account];
    
    saveAccounts(updatedAccounts);
    setAccounts(updatedAccounts);
    setShowForm(false);
    setEditingAccount(null);
    
    // If we were editing and viewing the same account, update the viewing account
    if (viewingAccount && viewingAccount.id === account.id) {
      setViewingAccount(account);
    }
  };
  
  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      const updatedAccounts = accounts.filter(account => account.id !== id);
      saveAccounts(updatedAccounts);
      setAccounts(updatedAccounts);
      
      if (viewingAccount && viewingAccount.id === id) {
        setViewingAccount(null);
      }
    }
  };
  
  const handleViewAccount = (account: Account) => {
    setViewingAccount(account);
    setShowForm(false);
    setEditingAccount(null);
  };
  
  const handleBackToList = () => {
    setViewingAccount(null);
    setEditingAccount(null);
    setShowForm(false);
  };
  
  // Filter accounts by search query
  const filteredAccounts = accounts.filter(account => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      account.name.toLowerCase().includes(query) ||
      account.username.toLowerCase().includes(query) ||
      account.website.toLowerCase().includes(query) ||
      account.notes.some(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div>
      {!showForm && !viewingAccount && (
        <>
          <DashboardHeader 
            title="Accounts" 
            subtitle="Manage all your platform accounts"
            onAddNew={handleAddAccount}
            addButtonText="Add Account"
          />
          
          {/* Search */}
          <div className="mb-6 relative">
            <Input
              placeholder="Search accounts by name, username, or website..."
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
          
          {/* Account List */}
          {filteredAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccounts.map(account => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onView={handleViewAccount}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              {searchQuery ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    No accounts found matching "{searchQuery}"
                  </p>
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    You haven't added any accounts yet
                  </p>
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={handleAddAccount}
                  >
                    Add your first account
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
      
      {showForm && (
        <AccountForm
          account={editingAccount || undefined}
          onSave={handleSaveAccount}
          onCancel={handleBackToList}
          assistantIds={editingAccount?.assistantIds}
        />
      )}
      
      {viewingAccount && (
        <AccountDetail
          account={viewingAccount}
          assistants={assistants}
          onBack={handleBackToList}
          onEdit={handleEditAccount}
          onAddReminder={() => {/* Would handle adding reminder */}}
        />
      )}
    </div>
  );
};

export default Accounts;