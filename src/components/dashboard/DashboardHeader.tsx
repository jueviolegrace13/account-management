import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onAddNew?: () => void;
  addButtonText?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onAddNew,
  addButtonText = 'Add New',
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div className="mb-4 md:mb-0">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      
      {onAddNew && (
        <Button
          variant="primary"
          onClick={onAddNew}
          leftIcon={<Plus size={16} />}
        >
          {addButtonText}
        </Button>
      )}
    </div>
  );
};

export default DashboardHeader;