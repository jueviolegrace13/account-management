import React, { useState } from 'react';
import { Moon, Sun, Save, Trash, AlertTriangle } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { getUserSettings, toggleTheme, getAccounts, saveAccounts, getReminders, saveReminders, getAssistants, saveAssistants } from '../utils/storage';

const Settings: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getUserSettings().theme);
  
  const handleToggleTheme = () => {
    const newTheme = toggleTheme().theme;
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL your data? This action cannot be undone.')) {
      // Clear all data from local storage
      saveAccounts([]);
      saveReminders([]);
      saveAssistants([]);
      
      alert('All data has been cleared successfully.');
    }
  };
  
  const handleExportData = () => {
    const data = {
      accounts: [],
      reminders: getReminders(),
      assistants: getAssistants(),
      settings: getUserSettings(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounthub-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        
        if (data.accounts && Array.isArray(data.accounts)) {
          saveAccounts(data.accounts);
        }
        
        if (data.reminders && Array.isArray(data.reminders)) {
          saveReminders(data.reminders);
        }
        
        if (data.assistants && Array.isArray(data.assistants)) {
          saveAssistants(data.assistants);
        }
        
        alert('Data imported successfully. Please refresh the page to see the changes.');
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please make sure the file is a valid JSON export.');
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div>
      <DashboardHeader 
        title="Settings" 
        subtitle="Customize your application preferences"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Theme</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose between light and dark mode
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleToggleTheme}
                leftIcon={theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              >
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Export Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Download a backup of all your accounts, reminders, and settings
              </p>
              <Button
                variant="outline"
                onClick={handleExportData}
                leftIcon={<Save size={16} />}
              >
                Export Data
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Import Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Restore from a previous backup file
              </p>
              <input
                type="file"
                id="import-file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                Select Backup File
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Danger Zone */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/30">
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400 mr-2" />
              <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Clear All Data</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This will permanently delete all your accounts, reminders, and settings
                </p>
              </div>
              <Button
                variant="danger"
                onClick={handleClearAllData}
                leftIcon={<Trash size={16} />}
              >
                Delete All Data
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-900/30 px-6 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">
              Warning: These actions cannot be undone. Please proceed with caution.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings;