import React from 'react';
import { 
  Home, 
  Settings, 
  ChevronRight, 
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  activePage, 
  setActivePage 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onToggle}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          w-64 pt-16
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 py-6 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`
                    flex items-center w-full px-3 py-3 rounded-md transition-colors
                    ${activePage === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                  onClick={() => setActivePage(item.id)}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className={`ml-3 ${!isOpen && 'md:hidden'}`}>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Toggle button for desktop */}
          <button
            className="hidden md:flex items-center justify-center py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onToggle}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;