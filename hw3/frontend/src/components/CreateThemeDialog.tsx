// CreateThemeDialog component - creates new themes
import React, { useState } from 'react';
import '../styles/CreateThemeDialog.css';

interface CreateThemeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTheme: (themeData: { name: string; description: string; color_hex: string }) => void;
}

const CreateThemeDialog: React.FC<CreateThemeDialogProps> = ({
  isOpen,
  onClose,
  onCreateTheme,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  const colors = [
    { hex: '#6366f1', name: 'Indigo' },
    { hex: '#10b981', name: 'Emerald' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#8b5cf6', name: 'Violet' },
    { hex: '#06b6d4', name: 'Cyan' },
    { hex: '#84cc16', name: 'Lime' },
    { hex: '#f97316', name: 'Orange' },
    { hex: '#ec4899', name: 'Pink' },
    { hex: '#6b7280', name: 'Gray' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateTheme({
        name: name.trim(),
        description: description.trim(),
        color_hex: selectedColor,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedColor('#6366f1');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="create-theme-overlay" onClick={handleClose}>
      <div className="create-theme-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="create-theme-dialog__header">
          <h3 className="create-theme-dialog__title">Create New Theme</h3>
          <button 
            className="create-theme-dialog__close"
            onClick={handleClose}
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

        <form onSubmit={handleSubmit} className="create-theme-dialog__form">
          <div className="create-theme-dialog__field">
            <label className="create-theme-dialog__label">Theme Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter theme name..."
              className="create-theme-dialog__input"
              required
              autoFocus
            />
          </div>

          <div className="create-theme-dialog__field">
            <label className="create-theme-dialog__label">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter theme description..."
              className="create-theme-dialog__textarea"
              rows={3}
            />
          </div>

          <div className="create-theme-dialog__field">
            <label className="create-theme-dialog__label">Color</label>
            <div className="create-theme-dialog__color-picker">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  className={`create-theme-dialog__color-option ${
                    selectedColor === color.hex ? 'create-theme-dialog__color-option--selected' : ''
                  }`}
                  onClick={() => setSelectedColor(color.hex)}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="create-theme-dialog__actions">
            <button 
              type="button"
              className="create-theme-dialog__cancel-btn"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="create-theme-dialog__create-btn"
              disabled={!name.trim()}
            >
              Create Theme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateThemeDialog;
