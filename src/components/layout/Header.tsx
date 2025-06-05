import React from 'react';
import { Menu, Bell, Moon, Sun, User } from 'lucide-react';
import Button from '../ui/Button';
import { getUserSettings, toggleTheme } from '../../utils/storage';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(getUserSettings().theme);
  
  const handleToggleTheme = () => {
    const newSettings = toggleTheme();
    setTheme(newSettings.theme);
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm fixed top-0 left-0 right-0 z-20 transition-all duration-300">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden mr-2" 
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
          >
            <Menu size={20} />
          </Button>
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">AccountHub</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;