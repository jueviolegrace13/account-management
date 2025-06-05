import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Account, Note } from '../../types';
import { formatDateTime, truncateText, htmlToPlainText } from '../../utils/helpers';

interface RecentReportsProps {
  accounts: Account[];
  onViewAccount: (account: Account) => void;
}

const RecentReports: React.FC<RecentReportsProps> = ({
  accounts,
  onViewAccount,
}) => {
  // Get all report notes from all accounts
  const getAllReportNotes = (): { note: Note; account: Account }[] => {
    const reportNotes: { note: Note; account: Account }[] = [];
    
    accounts.forEach(account => {
      account.notes
        .filter(note => note.type === 'report')
        .forEach(note => {
          reportNotes.push({ note, account });
        });
    });
    
    // Sort by created date (newest first)
    return reportNotes.sort((a, b) => 
      new Date(b.note.createdAt).getTime() - new Date(a.note.createdAt).getTime()
    ).slice(0, 5); // Get only the 5 most recent reports
  };
  
  const recentReports = getAllReportNotes();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium">Recent Reports</h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {recentReports.length > 0 ? (
          recentReports.map(({ note, account }) => (
            <div 
              key={note.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
              onClick={() => onViewAccount(account)}
            >
              <div className="flex items-start">
                <div className="rounded-full p-2 mr-3 flex-shrink-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <AlertCircle size={16} />
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {note.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {account.name} ({account.username})
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {truncateText(htmlToPlainText(note.content), 120)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDateTime(note.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No reports to display.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentReports;