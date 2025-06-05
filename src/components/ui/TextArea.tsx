import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, fullWidth = false, className = '', rows = 4, ...props }, ref) => {
    const textAreaClasses = `
      px-4 py-2 rounded-md border 
      ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} 
      focus:outline-none focus:ring-2 focus:border-transparent
      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `;

    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <textarea ref={ref} className={textAreaClasses} rows={rows} {...props} />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;