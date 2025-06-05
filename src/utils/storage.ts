import { Account, Assistant, Reminder, User } from '../types';

// Local storage keys
const ACCOUNTS_KEY = 'accounts';
const ASSISTANTS_KEY = 'assistants';
const REMINDERS_KEY = 'reminders';
const USER_SETTINGS_KEY = 'user_settings';

// Default user settings
const defaultUserSettings: User = {
  theme: 'light',
  sidebarCollapsed: false,
};

// Helper functions for localStorage
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Account storage
export const getAccounts = (): Account[] => getItem<Account[]>(ACCOUNTS_KEY, []);

export const saveAccounts = (accounts: Account[]): void => {
  setItem(ACCOUNTS_KEY, accounts);
};

export const getAccount = (id: string): Account | undefined => {
  const accounts = getAccounts();
  return accounts.find(account => account.id === id);
};

// Assistant storage
export const getAssistants = (): Assistant[] => getItem<Assistant[]>(ASSISTANTS_KEY, []);

export const saveAssistants = (assistants: Assistant[]): void => {
  setItem(ASSISTANTS_KEY, assistants);
};

export const getAssistant = (id: string): Assistant | undefined => {
  const assistants = getAssistants();
  return assistants.find(assistant => assistant.id === id);
};

// Reminder storage
export const getReminders = (): Reminder[] => getItem<Reminder[]>(REMINDERS_KEY, []);

export const saveReminders = (reminders: Reminder[]): void => {
  setItem(REMINDERS_KEY, reminders);
};

export const getReminder = (id: string): Reminder | undefined => {
  const reminders = getReminders();
  return reminders.find(reminder => reminder.id === id);
};

// User settings storage
export const getUserSettings = (): User => getItem<User>(USER_SETTINGS_KEY, defaultUserSettings);

export const saveUserSettings = (settings: User): void => {
  setItem(USER_SETTINGS_KEY, settings);
};

export const toggleTheme = (): User => {
  const settings = getUserSettings();
  const updatedSettings = {
    ...settings,
    theme: settings.theme === 'light' ? 'dark' : 'light',
  };
  saveUserSettings(updatedSettings);
  return updatedSettings;
};

export const toggleSidebar = (): User => {
  const settings = getUserSettings();
  const updatedSettings = {
    ...settings,
    sidebarCollapsed: !settings.sidebarCollapsed,
  };
  saveUserSettings(updatedSettings);
  return updatedSettings;
};