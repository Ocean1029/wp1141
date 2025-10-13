// CreateFolderDialog component - dialog for creating new folders

import React, { useState, useEffect, useRef } from 'react';
import '../styles/CreateFolderDialog.css';

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => void;
}

const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = folderName.trim();
    if (!trimmedName) {
      setError('Folder name is required');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Folder name must be less than 50 characters');
      return;
    }

    onCreateFolder(trimmedName);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-folder-dialog-overlay" onClick={onClose}>
      <div className="create-folder-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="create-folder-dialog__header">
          <h2 className="create-folder-dialog__title">Create New Folder</h2>
          <button
            className="create-folder-dialog__close"
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <form className="create-folder-dialog__content" onSubmit={handleSubmit}>
          <div className="create-folder-dialog__field">
            <label htmlFor="folder-name" className="create-folder-dialog__label">
              Folder Name
            </label>
            <input
              ref={inputRef}
              id="folder-name"
              type="text"
              className="create-folder-dialog__input"
              placeholder="Enter folder name..."
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              maxLength={50}
              required
            />
            {error && (
              <div className="create-folder-dialog__error" role="alert">
                {error}
              </div>
            )}
          </div>

          <div className="create-folder-dialog__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!folderName.trim()}
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderDialog;
