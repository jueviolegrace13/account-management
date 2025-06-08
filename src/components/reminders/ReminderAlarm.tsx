import React, { useEffect, useRef } from 'react';
import { Reminder } from '../../types';
import { useWorkspaces } from '../../contexts/WorkspaceContext';

interface ReminderAlarmProps {
  reminders: Reminder[];
}

const ReminderAlarm: React.FC<ReminderAlarmProps> = ({ reminders }) => {
  const { workspaces } = useWorkspaces();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkIntervalRef = useRef<number>();

  useEffect(() => {
    // Create audio element with online notification sound
    audioRef.current = new Audio('https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3');
    audioRef.current.volume = 0.5;

    // Function to check for due reminders
    const checkDueReminders = () => {
      const now = new Date();
      
      reminders.forEach(reminder => {
        if (reminder.completed) return;

        const reminderDate = new Date(reminder.date);
        const workspace = workspaces.find(ws => ws.id === reminder.workspace_id);
        const timezone = workspace?.timezone || 'UTC';

        // Convert reminder time to workspace timezone
        const reminderTimeInTimezone = new Date(reminderDate.toLocaleString('en-US', { timeZone: timezone }));
        const currentTimeInTimezone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

        // Check if reminder is due (within the same minute)
        if (
          reminderTimeInTimezone.getFullYear() === currentTimeInTimezone.getFullYear() &&
          reminderTimeInTimezone.getMonth() === currentTimeInTimezone.getMonth() &&
          reminderTimeInTimezone.getDate() === currentTimeInTimezone.getDate() &&
          reminderTimeInTimezone.getHours() === currentTimeInTimezone.getHours() &&
          reminderTimeInTimezone.getMinutes() === currentTimeInTimezone.getMinutes()
        ) {
          // Play alarm sound
          if (audioRef.current) {
            audioRef.current.play().catch(error => {
              console.error('Error playing notification sound:', error);
            });
            
            // Stop after 3 seconds
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
            }, 3000);
          }

          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Reminder Due', {
              body: reminder.title,
              icon: '/icon.png'
            });
          }
        }
      });
    };

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check every minute
    checkIntervalRef.current = window.setInterval(checkDueReminders, 60000);
    
    // Initial check
    checkDueReminders();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [reminders, workspaces]);

  return null; // This component doesn't render anything
};

export default ReminderAlarm; 