import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AssistantCard from '../components/assistants/AssistantCard';
import AssistantForm from '../components/assistants/AssistantForm';
import AssistantDetail from '../components/assistants/AssistantDetail';
import Input from '../components/ui/Input';
import { Assistant } from '../types';
import { getAssistants, saveAssistants, getAccounts, saveAccounts } from '../utils/storage';

const Assistants: React.FC = () => {
  const [assistants, setAssistants] = useState<Assistant[]>(getAssistants());
  const [accounts, setAccounts] = useState(getAccounts());
  const [showForm, setShowForm] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [viewingAssistant, setViewingAssistant] = useState<Assistant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Refresh data when component mounts
    setAssistants(getAssistants());
    setAccounts(getAccounts());
  }, []);
  
  const handleAddAssistant = () => {
    setEditingAssistant(null);
    setShowForm(true);
    setViewingAssistant(null);
  };
  
  const handleEditAssistant = (assistant: Assistant) => {
    setEditingAssistant(assistant);
    setShowForm(true);
    setViewingAssistant(null);
  };
  
  const handleSaveAssistant = (assistant: Assistant) => {
    const isEditing = !!editingAssistant;
    const updatedAssistants = isEditing
      ? assistants.map(a => (a.id === assistant.id ? assistant : a))
      : [...assistants, assistant];
    
    saveAssistants(updatedAssistants);
    setAssistants(updatedAssistants);
    
    // Update accounts with new assistant assignments
    if (isEditing) {
      const oldAssistant = editingAssistant;
      
      // Find accounts that were removed from this assistant
      const removedAccountIds = oldAssistant.accountIds.filter(
        id => !assistant.accountIds.includes(id)
      );
      
      // Find accounts that were added to this assistant
      const addedAccountIds = assistant.accountIds.filter(
        id => !oldAssistant.accountIds.includes(id)
      );
      
      if (removedAccountIds.length > 0 || addedAccountIds.length > 0) {
        const updatedAccounts = accounts.map(account => {
          if (removedAccountIds.includes(account.id)) {
            return {
              ...account,
              assistantIds: account.assistantIds.filter(id => id !== assistant.id),
            };
          }
          
          if (addedAccountIds.includes(account.id)) {
            return {
              ...account,
              assistantIds: [...account.assistantIds, assistant.id],
            };
          }
          
          return account;
        });
        
        saveAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
      }
    } else {
      // New assistant - update any accounts assigned to them
      if (assistant.accountIds.length > 0) {
        const updatedAccounts = accounts.map(account => {
          if (assistant.accountIds.includes(account.id)) {
            return {
              ...account,
              assistantIds: [...account.assistantIds, assistant.id],
            };
          }
          return account;
        });
        
        saveAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
      }
    }
    
    setShowForm(false);
    setEditingAssistant(null);
    
    // If we were editing and viewing the same assistant, update the viewing assistant
    if (viewingAssistant && viewingAssistant.id === assistant.id) {
      setViewingAssistant(assistant);
    }
  };
  
  const handleDeleteAssistant = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assistant?')) {
      const updatedAssistants = assistants.filter(assistant => assistant.id !== id);
      saveAssistants(updatedAssistants);
      setAssistants(updatedAssistants);
      
      // Also remove this assistant from any accounts
      const updatedAccounts = accounts.map(account => {
        if (account.assistantIds.includes(id)) {
          return {
            ...account,
            assistantIds: account.assistantIds.filter(assistantId => assistantId !== id),
          };
        }
        return account;
      });
      
      saveAccounts(updatedAccounts);
      setAccounts(updatedAccounts);
      
      if (viewingAssistant && viewingAssistant.id === id) {
        setViewingAssistant(null);
      }
    }
  };
  
  const handleViewAssistant = (assistant: Assistant) => {
    setViewingAssistant(assistant);
    setShowForm(false);
    setEditingAssistant(null);
  };
  
  const handleBackToList = () => {
    setViewingAssistant(null);
    setEditingAssistant(null);
    setShowForm(false);
  };
  
  // Count accounts assigned to each assistant
  const getAccountCount = (assistantId: string) => {
    return accounts.filter(account => account.assistantIds.includes(assistantId)).length;
  };
  
  // Filter assistants by search query
  const filteredAssistants = assistants.filter(assistant => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      assistant.name.toLowerCase().includes(query) ||
      assistant.email.toLowerCase().includes(query) ||
      (assistant.phone && assistant.phone.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      {!showForm && !viewingAssistant && (
        <>
          <DashboardHeader 
            title="Assistants" 
            subtitle="Manage people who help with your accounts"
            onAddNew={handleAddAssistant}
            addButtonText="Add Assistant"
          />
          
          {/* Search */}
          <div className="mb-6 relative">
            <Input
              placeholder="Search assistants by name or email..."
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
          
          {/* Assistant List */}
          {filteredAssistants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssistants.map(assistant => (
                <AssistantCard
                  key={assistant.id}
                  assistant={assistant}
                  accountCount={getAccountCount(assistant.id)}
                  onEdit={handleEditAssistant}
                  onDelete={handleDeleteAssistant}
                  onView={handleViewAssistant}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              {searchQuery ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    No assistants found matching "{searchQuery}"
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
                    You haven't added any assistants yet
                  </p>
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={handleAddAssistant}
                  >
                    Add your first assistant
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
      
      {showForm && (
        <AssistantForm
          assistant={editingAssistant || undefined}
          accounts={accounts}
          onSave={handleSaveAssistant}
          onCancel={handleBackToList}
        />
      )}
      
      {viewingAssistant && (
        <AssistantDetail
          assistant={viewingAssistant}
          accounts={accounts}
          onBack={handleBackToList}
          onEdit={handleEditAssistant}
        />
      )}
    </div>
  );
};

export default Assistants;