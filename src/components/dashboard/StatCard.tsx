import React, { ReactNode } from 'react';
import Card from '../ui/Card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
}) => {
  return (
    <Card className="h-full">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </h3>
            <p className="text-2xl font-bold mt-1">{value}</p>
            
            {trend && (
              <div className="flex items-center mt-1">
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {trend.isPositive ? '+' : '-'}{trend.value}%
                </span>
                {description && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    {description}
                  </span>
                )}
              </div>
            )}
            
            {!trend && description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;