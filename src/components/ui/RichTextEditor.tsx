import React, { useState, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link } from 'lucide-react';
import Button from './Button';

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onChange,
  label,
  error,
  placeholder = 'Start typing...',
}) => {
  const [editorHtml, setEditorHtml] = useState(initialValue);

  useEffect(() => {
    setEditorHtml(initialValue);
  }, [initialValue]);

  const execCommand = (command: string, value: string | boolean = false) => {
    document.execCommand(command, false, value ? String(value) : '');
    const updatedContent = document.getElementById('rich-text-editor')?.innerHTML || '';
    setEditorHtml(updatedContent);
    onChange(updatedContent);
  };

  const handleKeyUp = () => {
    const content = document.getElementById('rich-text-editor')?.innerHTML || '';
    setEditorHtml(content);
    onChange(content);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="mb-4 w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('bold')}
            aria-label="Bold"
          >
            <Bold size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('italic')}
            aria-label="Italic"
          >
            <Italic size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('insertUnorderedList')}
            aria-label="Bullet List"
          >
            <List size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('insertOrderedList')}
            aria-label="Numbered List"
          >
            <ListOrdered size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('justifyLeft')}
            aria-label="Align Left"
          >
            <AlignLeft size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('justifyCenter')}
            aria-label="Align Center"
          >
            <AlignCenter size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => execCommand('justifyRight')}
            aria-label="Align Right"
          >
            <AlignRight size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={insertLink}
            aria-label="Insert Link"
          >
            <Link size={16} />
          </Button>
        </div>
        <div
          id="rich-text-editor"
          className="p-4 min-h-[150px] focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          contentEditable
          dangerouslySetInnerHTML={{ __html: editorHtml }}
          onKeyUp={handleKeyUp}
          data-placeholder={placeholder}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>}

      <style jsx>{`
        [contentEditable=true]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;