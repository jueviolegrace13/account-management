import React from 'react';
import { Users, Settings } from 'lucide-react';
import Card, { CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Workspace } from '../../types';
import { formatDate } from '../../utils/helpers';

interface WorkspaceCardProps {
  workspace: Workspace;
  onManage: (workspace: Workspace) => void;
  onSettings: (workspace: Workspace) => void;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  onManage,
  onSettings,
}) => {
  const { name, members, createdAt } = workspace;

  return (
    <Card hoverable onClick={() => onManage(workspace)} className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{name}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Users size={14} className="mr-2" />
          <span>{members.length} Members</span>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Created {formatDate(createdAt)}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSettings(workspace);
          }}
          aria-label="Settings"
        >
          <Settings size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkspaceCard;