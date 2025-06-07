import { UserSettings } from '../types';

// Local storage keys
const USER_SETTINGS_KEY = 'user_settings';

// Default user settings
const defaultUserSettings: UserSettings = {
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

// User settings storage
export const getUserSettings = (): UserSettings => getItem<UserSettings>(USER_SETTINGS_KEY, defaultUserSettings);

export const saveUserSettings = (settings: UserSettings): void => {
  setItem(USER_SETTINGS_KEY, settings);
};

export const toggleTheme = (): UserSettings => {
  const settings = getUserSettings();
  const updatedSettings = {
    ...settings,
    theme: settings.theme === 'light' ? 'dark' : 'light' as 'light' | 'dark',
  };
  saveUserSettings(updatedSettings);
  return updatedSettings;
};

export const toggleSidebar = (): UserSettings => {
  const settings = getUserSettings();
  const updatedSettings = {
    ...settings,
    sidebarCollapsed: !settings.sidebarCollapsed,
  };
  saveUserSettings(updatedSettings);
  return updatedSettings;
};