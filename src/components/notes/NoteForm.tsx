import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import RichTextEditor from '../ui/RichTextEditor';
import { Note } from '../../types';
import { createNote, updateNote, deleteNote } from '../../lib/database';
import { supabase } from '../../lib/supabase';

interface NoteFormProps {
  note?: Note;
  accountId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({
  note,
  accountId,
  onSuccess,
  onCancel,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [type, setType] = useState<'regular' | 'report'>(note?.type || 'regular');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (note) {
        await updateNote(note.id, {
          title,
          content,
          type,
        });
      } else {
        await createNote({
          account_id: accountId,
          author_id: user.id,
          title,
          content,
          type,
        });
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      setLoading(true);
      try {
        await deleteNote(note.id);
        onSuccess();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">
          {note ? 'Edit Note' : 'Add New Note'}
        </h3>
        {note && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            fullWidth
            className="md:col-span-2"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'regular' | 'report')}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-800"
            >
              <option value="regular">Regular Note</option>
              <option value="report">Report</option>
            </select>
          </div>
        </div>
        
        <RichTextEditor
          label="Note Content"
          initialValue={content}
          onChange={setContent}
          placeholder="Write your note..."
        />
        
        <div className="flex justify-end mt-6 space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            leftIcon={<X size={16} />}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save size={16} />}
            isLoading={loading}
          >
            {note ? 'Update Note' : 'Save Note'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;