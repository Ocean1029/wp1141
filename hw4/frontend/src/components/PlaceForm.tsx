// PlaceForm - Create/edit place modal
import { useState, useEffect } from 'react';
import type { Place, PlaceFormData } from '../types/place';
import type { Tag } from '../types/tag';
import '../styles/PlaceForm.css';

interface PlaceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlaceFormData) => Promise<void>;
  tags: Tag[];
  initialData?: { lat: number; lng: number } | null;
  editingPlace?: Place | null;
}

export function PlaceForm({
  isOpen,
  onClose,
  onSubmit,
  tags,
  initialData,
  editingPlace,
}: PlaceFormProps) {
  const [formData, setFormData] = useState<PlaceFormData>({
    title: '',
    lat: 0,
    lng: 0,
    address: '',
    notes: '',
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingPlace) {
      setFormData({
        title: editingPlace.title,
        lat: editingPlace.lat,
        lng: editingPlace.lng,
        address: editingPlace.address || '',
        notes: editingPlace.notes || '',
        tags: editingPlace.tags.map(pt => pt.tag.id),
      });
    } else if (initialData) {
      setFormData(prev => ({
        ...prev,
        lat: initialData.lat,
        lng: initialData.lng,
      }));
    }
  }, [editingPlace, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate at least one tag
    if (formData.tags.length === 0) {
      setError('Please select at least one tag');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save place');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      lat: 0,
      lng: 0,
      address: '',
      notes: '',
      tags: [],
    });
    setError('');
    onClose();
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="place-form-overlay" onClick={handleClose}>
      <div className="place-form" onClick={(e) => e.stopPropagation()}>
        <div className="place-form__header">
          <h2 className="place-form__title">
            {editingPlace ? 'Edit Place' : 'Add New Place'}
          </h2>
          <button onClick={handleClose} className="place-form__close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="place-form__content">
          {error && (
            <div className="place-form__error">
              {error}
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Taipei 101"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Latitude *</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Longitude *</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address (optional)"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Tags * <span className="form-hint-inline">(select at least one)</span>
            </label>
            {tags.length === 0 ? (
              <p className="form-hint">No tags available. Please create a tag first.</p>
            ) : (
              <div className="tag-selector">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`tag-chip ${formData.tags.includes(tag.id) ? 'tag-chip--selected' : ''}`}
                    disabled={isSubmitting}
                  >
                    {tag.name}
                    {formData.tags.includes(tag.id) && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="place-form__actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn--secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting || formData.tags.length === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                editingPlace ? 'Update Place' : 'Create Place'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

