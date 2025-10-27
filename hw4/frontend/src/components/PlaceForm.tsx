// PlaceForm - Create/edit place modal
import { useState, useEffect } from 'react';
import { mapsApi } from '../api/maps.api';
import type { Place, PlaceFormData } from '../types/place';
import type { Tag } from '../types/tag';
import type { PlaceDetails } from '../types/maps';
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
    id: '', // Google Place ID
    title: '',
    lat: 0,
    lng: 0,
    address: '',
    notes: '',
    tags: [], // Tag names
  });
  const [googlePlaceInfo, setGooglePlaceInfo] = useState<PlaceDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingPlace, setIsFetchingPlace] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingPlace) {
      setFormData({
        id: editingPlace.id,
        title: editingPlace.title,
        lat: editingPlace.lat,
        lng: editingPlace.lng,
        address: editingPlace.address || '',
        notes: editingPlace.notes || '',
        tags: editingPlace.tags.map(tag => tag.name), // Use tag.name
      });
    } else if (initialData) {
      // Fetch place info from Google Maps API
      fetchPlaceInfo(initialData.lat, initialData.lng);
    }
  }, [editingPlace, initialData]);

  const fetchPlaceInfo = async (lat: number, lng: number) => {
    setIsFetchingPlace(true);
    setError('');
    setGooglePlaceInfo(null);
    
    try {
      // Step 1: Use reverse geocoding to get place_id
      const geocodeResponse = await mapsApi.reverseGeocode(lat, lng);
      
      if (geocodeResponse.success && geocodeResponse.data && geocodeResponse.data.length > 0) {
        const firstResult = geocodeResponse.data[0];
        const placeId = firstResult.place_id;
        
        // Step 2: Get detailed place information
        try {
          const detailsResponse = await mapsApi.getPlaceDetails(
            placeId,
            'name,formatted_address,geometry,rating,types,photos,international_phone_number,opening_hours,website'
          );
          
          if (detailsResponse.success && detailsResponse.data) {
            const placeDetails = detailsResponse.data;
            setGooglePlaceInfo(placeDetails);
            
            // Auto-fill form with Google data
            setFormData(prev => ({
              ...prev,
              id: placeId,
              lat,
              lng,
              address: placeDetails.formatted_address,
              title: placeDetails.name, // Auto-fill title with Google's name
            }));
          } else {
            // Fallback to basic geocoding data
            setFormData(prev => ({
              ...prev,
              id: placeId,
              lat,
              lng,
              address: firstResult.address,
            }));
          }
        } catch (detailsError) {
          console.warn('Failed to fetch place details, using basic info:', detailsError);
          setFormData(prev => ({
            ...prev,
            id: placeId,
            lat,
            lng,
            address: firstResult.address,
          }));
        }
      } else {
        // Fallback if reverse geocoding fails
        setFormData(prev => ({
          ...prev,
          lat,
          lng,
        }));
        setError('Could not fetch place information from Google Maps');
      }
    } catch (err) {
      console.error('Failed to fetch place info:', err);
      setFormData(prev => ({
        ...prev,
        lat,
        lng,
      }));
      setError('Failed to fetch place information');
    } finally {
      setIsFetchingPlace(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate at least one tag
    if (formData.tags.length === 0) {
      setError('Please select at least one tag');
      return;
    }

    // Validate Google Place ID
    if (!formData.id || formData.id.trim() === '') {
      setError('Please enter a Google Place ID');
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
      id: '',
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

  const toggleTag = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(name => name !== tagName)
        : [...prev.tags, tagName],
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
          {isFetchingPlace && (
            <div className="place-form__info">
              <div className="spinner-small"></div>
              <span>Loading location information...</span>
            </div>
          )}

          {error && (
            <div className="place-form__error">
              {error}
            </div>
          )}

          {/* Google Place Info Card */}
          {googlePlaceInfo && !editingPlace && (
            <div className="google-place-card">
              <div className="google-place-card__header">
                <svg className="google-place-card__icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                <span className="google-place-card__badge">Google Maps Info</span>
              </div>
              
              <div className="google-place-card__content">
                <h3 className="google-place-card__name">{googlePlaceInfo.name}</h3>
                
                {googlePlaceInfo.rating && (
                  <div className="google-place-card__rating">
                    <span className="google-place-card__stars">
                      {'⭐'.repeat(Math.round(googlePlaceInfo.rating))}
                    </span>
                    <span className="google-place-card__rating-text">
                      {googlePlaceInfo.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                
                <p className="google-place-card__address">
                  📍 {googlePlaceInfo.formatted_address}
                </p>
                
                {googlePlaceInfo.types && googlePlaceInfo.types.length > 0 && (
                  <div className="google-place-card__types">
                    {googlePlaceInfo.types.slice(0, 3).map((type, index) => (
                      <span key={index} className="google-place-card__type-tag">
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden fields - auto-filled in background */}
          <input type="hidden" value={formData.id} />
          <input type="hidden" value={formData.lat} />
          <input type="hidden" value={formData.lng} />
          <input type="hidden" value={formData.address} />

          <div className="form-field">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Taipei 101, Din Tai Fung Restaurant"
              required
              disabled={isSubmitting || isFetchingPlace}
              autoFocus
            />
            <p className="form-hint">
              {googlePlaceInfo 
                ? 'Auto-filled from Google Maps. You can edit it if needed.' 
                : 'Give this place a memorable name'}
            </p>
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
                    key={tag.name}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`tag-chip ${formData.tags.includes(tag.name) ? 'tag-chip--selected' : ''}`}
                    disabled={isSubmitting}
                  >
                    {tag.name}
                    {formData.tags.includes(tag.name) && (
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
              disabled={isSubmitting || isFetchingPlace || formData.tags.length === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : isFetchingPlace ? (
                <>
                  <span className="spinner-small"></span>
                  Loading...
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

