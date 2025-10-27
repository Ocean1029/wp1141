// TagForm - Modal form for creating/editing tags
import { useState, useEffect } from 'react';
import type { Tag } from '../types/tag';
import '../styles/TagForm.css';

interface TagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  initialData?: Tag | null;
}

export function TagForm({ isOpen, onClose, onSubmit, initialData }: TagFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tag-form-overlay" onClick={onClose}>
      <div className="tag-form" onClick={(e) => e.stopPropagation()}>
        <div className="tag-form__header">
          <h2>{initialData ? 'Edit Tag' : 'Create Tag'}</h2>
          <button
            className="tag-form__close"
            onClick={onClose}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M15 5L5 15M5 5l10 10" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tag-form__body">
          {error && (
            <div className="tag-form__error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                <circle cx="8" cy="8" r="7" strokeWidth="2"/>
                <line x1="8" y1="5" x2="8" y2="8" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="11" x2="8.01" y2="11" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="tag-form__field">
            <label htmlFor="tag-name" className="tag-form__label">
              Tag Name <span className="tag-form__required">*</span>
            </label>
            <input
              id="tag-name"
              type="text"
              className="tag-form__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Food, Sights, Shopping"
              maxLength={100}
              disabled={isSubmitting || !!initialData}
              required
            />
            {initialData && (
              <p className="tag-form__hint">Tag name cannot be changed</p>
            )}
          </div>

          <div className="tag-form__field">
            <label htmlFor="tag-description" className="tag-form__label">
              Description
            </label>
            <textarea
              id="tag-description"
              className="tag-form__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this tag"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
          </div>

          <div className="tag-form__actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn--secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


