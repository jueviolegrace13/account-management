import React, { useState } from 'react';
import { Save, Trash, AlertTriangle, Search } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { getUserSettings, getAccounts, saveAccounts, getReminders, saveReminders, getAssistants, saveAssistants, saveUserSettings } from '../utils/storage';
import { useWorkspaces } from '../contexts/WorkspaceContext';
import { getTimeZones } from '../utils/helpers';
import PortalDropdown from '../components/ui/PortalDropdown';
import { updateWorkspace } from '../lib/database';

const Settings: React.FC = () => {
  const [timezone, setTimezone] = useState<string>(getUserSettings().timezone);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const { workspaces, reload } = useWorkspaces();
  const timezoneAnchorRef = React.useRef<HTMLDivElement>(null);
  const [savingTimezone, setSavingTimezone] = useState(false);
  const [timezoneSaved, setTimezoneSaved] = useState(false);

  const timezones = getTimeZones();
  const filteredTimezones = timezones.filter(tz => 
    tz.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  // Get selected workspace from localStorage and workspaces
  const SELECTED_WORKSPACE_KEY = 'selectedWorkspaceId';
  const selectedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem(SELECTED_WORKSPACE_KEY) : null;
  const selectedWorkspace = workspaces.find(ws => ws.id === selectedWorkspaceId) || workspaces[0];

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    const settings = getUserSettings();
    saveUserSettings({ ...settings, timezone: newTimezone });
    setIsTimezoneOpen(false);
    setTimezoneSearch('');
  };
  
  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to delete ALL your data? This action cannot be undone.')) {
      try {
        // Clear all data from local storage
        saveAccounts([]);
        saveReminders([]);
        saveAssistants([]);
        
        // Clear workspace data if needed
        if (workspaces.length > 0) {
          // Add workspace data clearing logic here if needed
        }
        
        alert('All data has been cleared successfully.');
        window.location.reload(); // Reload to reflect changes
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  };
  
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = {
        accounts: getAccounts(),
        reminders: getReminders(),
        assistants: getAssistants(),
        settings: getUserSettings(),
        workspaces: workspaces,
        exportDate: new Date().toISOString(),
        version: '1.0'
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
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImporting(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          const data = JSON.parse(result);
          
          // Validate data structure
          if (!data.version || !data.exportDate) {
            throw new Error('Invalid export file format');
          }
          
          // Import data
          if (data.accounts && Array.isArray(data.accounts)) {
            saveAccounts(data.accounts);
          }
          
          if (data.reminders && Array.isArray(data.reminders)) {
            saveReminders(data.reminders);
          }
          
          if (data.assistants && Array.isArray(data.assistants)) {
            saveAssistants(data.assistants);
          }
          
          if (data.settings) {
            saveUserSettings(data.settings);
            setTimezone(data.settings.timezone);
          }
          
          alert('Data imported successfully. The page will reload to apply changes.');
          window.location.reload();
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error importing data. Please make sure the file is a valid export file.');
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveTimezone = async () => {
    if (!selectedWorkspace) return;
    setSavingTimezone(true);
    setTimezoneSaved(false);
    try {
      await updateWorkspace(selectedWorkspace.id, { timezone });
      setTimezoneSaved(true);
      reload();
    } finally {
      setSavingTimezone(false);
      setTimeout(() => setTimezoneSaved(false), 2000);
    }
  };

  return (
    <div>
      <DashboardHeader 
        title="Settings" 
        subtitle="Customize your application preferences"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timezone */}
        <Card>
          <CardHeader>
            <CardTitle>Timezone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div>
                <h3 className="text-lg font-medium">Workspace Timezone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Set the timezone for your workspace
                </p>
              </div>
              <div className="relative" ref={timezoneAnchorRef}>
                <div
                  className="flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                  onClick={() => setIsTimezoneOpen(!isTimezoneOpen)}
                >
                  <span>{timezone}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isTimezoneOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <PortalDropdown open={isTimezoneOpen} anchorRef={timezoneAnchorRef}>
                  <div
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg"
                    style={{ maxHeight: 240, overflowY: 'auto', marginTop: 4 }}
                  >
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          value={timezoneSearch}
                          onChange={(e) => setTimezoneSearch(e.target.value)}
                          placeholder="Search timezone..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      {filteredTimezones.length > 0 ? (
                        filteredTimezones.map((tz) => (
                          <div
                            key={tz}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              timezone === tz ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200' : 'text-gray-800 dark:text-gray-100'
                            }`}
                            onClick={() => handleTimezoneChange(tz)}
                          >
                            {tz}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                          No timezones found
                        </div>
                      )}
                    </div>
                  </div>
                </PortalDropdown>
              </div>
              <div className="flex items-center mt-2">
                <Button
                  variant="primary"
                  onClick={handleSaveTimezone}
                  disabled={savingTimezone}
                  leftIcon={<Save size={16} />}
                >
                  {savingTimezone ? 'Saving...' : 'Save Timezone'}
                </Button>
                {timezoneSaved && (
                  <span className="ml-3 text-green-600 dark:text-green-400 text-sm">Saved!</span>
                )}
              </div>
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
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
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
                disabled={isImporting}
                aria-label="Import backup file"
                title="Select a backup file to import"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-file')?.click()}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Select Backup File'}
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