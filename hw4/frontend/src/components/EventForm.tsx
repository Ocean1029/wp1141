// EventForm - Modal form for creating/editing events
import { useState, useEffect } from 'react';
import type { Event, EventFormData } from '../types/event';
import type { Place } from '../types/place';
import '../styles/EventForm.css';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  places: Place[];
  initialTimeRange?: { start: Date; end: Date } | null;
  editingEvent?: Event | null;
}

export function EventForm({
  isOpen,
  onClose,
  onSubmit,
  places,
  initialTimeRange,
  editingEvent,
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    notes: '',
    placeIds: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        // Populate form with existing event data
        setFormData({
          title: editingEvent.title,
          startTime: editingEvent.startTime,
          endTime: editingEvent.endTime,
          notes: editingEvent.notes || '',
          placeIds: editingEvent.places.map(ep => ep.placeId),
        });
      } else if (initialTimeRange) {
        // Pre-fill with selected time range
        setFormData({
          title: '',
          startTime: initialTimeRange.start.toISOString(),
          endTime: initialTimeRange.end.toISOString(),
          notes: '',
          placeIds: [],
        });
      } else {
        // Default empty form
        setFormData({
          title: '',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          notes: '',
          placeIds: [],
        });
      }
      setError(null);
    }
  }, [isOpen, editingEvent, initialTimeRange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate title
    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }

    // Validate time range
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData: EventFormData = {
        title: formData.title.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes?.trim() || undefined,
        placeIds: formData.placeIds.length > 0 ? formData.placeIds : undefined,
      };
      await onSubmit(submitData);
      handleClose();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message 
        : undefined;
      setError(errorMessage || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      startTime: '',
      endTime: '',
      notes: '',
      placeIds: [],
    });
    setError(null);
    onClose();
  };

  const togglePlace = (placeId: string) => {
    setFormData(prev => ({
      ...prev,
      placeIds: prev.placeIds.includes(placeId)
        ? prev.placeIds.filter(id => id !== placeId)
        : [...prev.placeIds, placeId],
    }));
  };

  const formatDateTimeForInput = (isoString: string) => {
    if (!isoString) return '';
    // Convert ISO string to format required by datetime-local input
    return new Date(isoString).toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    if (!value) return;
    // Convert datetime-local value to ISO string
    const isoString = new Date(value).toISOString();
    setFormData(prev => ({ ...prev, [field]: isoString }));
  };

  if (!isOpen) return null;

  return (
    <div className="event-form-overlay" onClick={handleClose}>
      <div className="event-form" onClick={(e) => e.stopPropagation()}>
        <div className="event-form__header">
          <h2 className="event-form__title">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button onClick={handleClose} className="event-form__close" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form__content">
          {error && (
            <div className="event-form__error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                <circle cx="8" cy="8" r="7" strokeWidth="2"/>
                <line x1="8" y1="5" x2="8" y2="8" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="11" x2="8.01" y2="11" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Lunch at Restaurant, Visit Museum"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Start Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formatDateTimeForInput(formData.startTime)}
                onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label className="form-label">End Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formatDateTimeForInput(formData.endTime)}
                onChange={(e) => handleDateTimeChange('endTime', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details about this event..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Associated Places <span className="form-hint-inline">(optional)</span>
            </label>
            {places.length === 0 ? (
              <p className="form-hint">No places available. Add places from the map first.</p>
            ) : (
              <div className="place-selector">
                {places.map(place => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => togglePlace(place.id)}
                    className={`place-chip ${formData.placeIds.includes(place.id) ? 'place-chip--selected' : ''}`}
                    disabled={isSubmitting}
                  >
                    <span className="place-chip__icon">📍</span>
                    <span className="place-chip__text">{place.title}</span>
                    {formData.placeIds.includes(place.id) && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="event-form__actions">
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                editingEvent ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

