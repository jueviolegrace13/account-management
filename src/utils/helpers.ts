// Format date to readable string
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format date with time
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Check if a date is today
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Check if a date is in the future
export const isFuture = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date > new Date();
};

// Check if a date is within the next X days
export const isWithinDays = (dateString: string, days: number): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  return date >= now && date <= futureDate;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Convert HTML string to plain text
export const htmlToPlainText = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Get domain from URL
export const getDomainFromUrl = (url: string): string => {
  if (!url) return '';
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`);
    return domain.hostname;
  } catch (error) {
    return url;
  }
};

// Create a new date string in ISO format
export const createDateString = (): string => {
  return new Date().toISOString();
};