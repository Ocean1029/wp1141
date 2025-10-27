// MapPage - Main application page with map and timeline
import { useState, useEffect, useCallback } from 'react';
import { MapCanvas } from '../components/MapCanvas';
import { TimelinePanel } from '../components/TimelinePanel';
import { TagFilterBar } from '../components/TagFilterBar';
import { PlaceForm } from '../components/PlaceForm';
import { TagForm } from '../components/TagForm';
import { EventForm } from '../components/EventForm';
import { useAuth } from '../hooks/useAuth';
import { placesApi } from '../api/places.api';
import { eventsApi } from '../api/events.api';
import { tagsApi } from '../api/tags.api';
import type { Place, PlaceFormData } from '../types/place';
import type { Event, EventFormData } from '../types/event';
import type { Tag } from '../types/tag';
import '../styles/MapPage.css';

export function MapPage() {
  const { user, logout } = useAuth();
  
  // Data states
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Filter states
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  
  // UI states
  const [isPlaceFormOpen, setIsPlaceFormOpen] = useState(false);
  const [isTagFormOpen, setIsTagFormOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: Date; end: Date } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters (tags and event)
  useEffect(() => {
    let filtered = places;
    
    // Apply event filter first (if an event is selected)
    if (selectedEvent && selectedEvent.places.length > 0) {
      const eventPlaceIds = selectedEvent.places.map(ep => ep.place.id);
      filtered = filtered.filter(place => eventPlaceIds.includes(place.id));
    }
    // Apply tag filter (only if no event is selected)
    else if (selectedTagNames.length > 0) {
      filtered = filtered.filter(place =>
        place.tags.some(tag => selectedTagNames.includes(tag.name))
      );
    }
    
    setFilteredPlaces(filtered);
  }, [places, selectedTagNames, selectedEvent]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [placesData, eventsData, tagsData] = await Promise.all([
        placesApi.getAll(),
        eventsApi.getAll(),
        tagsApi.getAll(),
      ]);
      setPlaces(placesData);
      setEvents(eventsData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    console.log('[MapPage] handleMapClick called:', lat, lng);
    setClickedCoords({ lat, lng });
    setSelectedPlace(null); // Clear selected place when creating new one
    setIsPlaceFormOpen(true);
  }, []);

  const handleMarkerClick = useCallback((place: Place) => {
    setSelectedPlace(place);
    setIsPlaceFormOpen(true);
  }, []);

  const handleEventClick = useCallback((event: Event) => {
    // Toggle event selection - if clicking the same event, deselect it
    if (highlightedEventId === event.id) {
      setSelectedEvent(null);
      setHighlightedEventId(null);
      setSelectedPlace(null);
    } else {
      // Set selected event to filter places
      setSelectedEvent(event);
      setHighlightedEventId(event.id);
      
      // Focus on first place if exists
      if (event.places && event.places.length > 0) {
        const place = places.find(p => p.id === event.places[0].place.id);
        if (place) {
          setSelectedPlace(place);
        }
      }
    }
  }, [places, highlightedEventId]);

  const handleDateSelect = useCallback((start: Date, end: Date) => {
    setSelectedTimeRange({ start, end });
    setIsEventFormOpen(true);
  }, []);

  const handleEventDrop = async (eventId: string, start: Date, end: Date) => {
    try {
      await eventsApi.update(eventId, {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      await loadData();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handlePlaceSubmit = async (data: PlaceFormData) => {
    if (selectedPlace) {
      // Update existing place
      const { tags, title, lat, lng, address, notes } = data;
      await placesApi.update(selectedPlace.id, { title, lat, lng, address, notes });
      
      // Handle tag changes
      const oldTagNames = selectedPlace.tags.map(t => t.name);
      const newTagNames = tags;
      
      // Add new tags
      const tagsToAdd = newTagNames.filter(name => !oldTagNames.includes(name));
      for (const tagName of tagsToAdd) {
        await placesApi.addTag(selectedPlace.id, tagName);
      }
      
      // Remove old tags
      const tagsToRemove = oldTagNames.filter(name => !newTagNames.includes(name));
      for (const tagName of tagsToRemove) {
        await placesApi.removeTag(selectedPlace.id, tagName);
      }
    } else {
      // Create new place
      await placesApi.create(data);
    }
    
    await loadData();
    setClickedCoords(null);
    setSelectedPlace(null);
  };

  const handleTagSubmit = async (data: { name: string; description?: string }) => {
    await tagsApi.create(data);
    await loadData();
  };

  const handleEventSubmit = async (data: EventFormData) => {
    await eventsApi.create(data);
    await loadData();
    setSelectedTimeRange(null);
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTagNames(prev =>
      prev.includes(tagName)
        ? prev.filter(name => name !== tagName)
        : [...prev, tagName]
    );
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="map-page map-page--loading">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your trip data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page">
      <header className="map-page__header">
        <div className="map-page__brand">
          <h1 className="map-page__title">🗺️ TripTimeline Maps</h1>
          <p className="map-page__user">Welcome, {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="btn btn--secondary btn--sm">
          Logout
        </button>
      </header>

      <div className="map-page__content">
        <aside className="map-page__sidebar">
          {selectedEvent && (
            <div className="event-filter-badge">
              <div className="event-filter-badge__content">
                <div className="event-filter-badge__icon">📅</div>
                <div className="event-filter-badge__text">
                  <div className="event-filter-badge__label">Filtering by Event</div>
                  <div className="event-filter-badge__title">{selectedEvent.title}</div>
                </div>
              </div>
              <button 
                className="event-filter-badge__close"
                onClick={() => setSelectedEvent(null)}
                title="Clear event filter"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}
          <TagFilterBar
            tags={tags}
            selectedTagIds={selectedTagNames}
            onTagToggle={handleTagToggle}
            onClearAll={() => setSelectedTagNames([])}
            onCreateTag={() => setIsTagFormOpen(true)}
            disabled={!!selectedEvent}
          />
        </aside>

        <div className="map-page__main">
          <div className="map-page__map">
            <MapCanvas
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              highlightedPlaceId={selectedPlace?.id}
            />
          </div>

          <div className="map-page__timeline">
            <TimelinePanel
              events={events}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
              onEventDrop={handleEventDrop}
              highlightedEventId={highlightedEventId}
            />
          </div>
        </div>
      </div>

      <PlaceForm
        isOpen={isPlaceFormOpen}
        onClose={() => {
          setIsPlaceFormOpen(false);
          setClickedCoords(null);
          setSelectedPlace(null);
          }}
        onSubmit={handlePlaceSubmit}
        tags={tags}
        initialData={clickedCoords}
        editingPlace={selectedPlace}
      />

      <TagForm
        isOpen={isTagFormOpen}
        onClose={() => setIsTagFormOpen(false)}
        onSubmit={handleTagSubmit}
      />

      <EventForm
        isOpen={isEventFormOpen}
        onClose={() => {
          setIsEventFormOpen(false);
          setSelectedTimeRange(null);
        }}
        onSubmit={handleEventSubmit}
        places={places}
        initialTimeRange={selectedTimeRange}
      />
    </div>
  );
}

