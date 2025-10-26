// MapPage - Main application page with map and timeline
import { useState, useEffect } from 'react';
import { MapCanvas } from '../components/MapCanvas';
import { TimelinePanel } from '../components/TimelinePanel';
import { TagFilterBar } from '../components/TagFilterBar';
import { PlaceForm } from '../components/PlaceForm';
import { useAuth } from '../hooks/useAuth';
import { placesApi } from '../api/places.api';
import { eventsApi } from '../api/events.api';
import { tagsApi } from '../api/tags.api';
import type { Place } from '../types/place';
import type { Event } from '../types/event';
import type { Tag } from '../types/tag';
import '../styles/MapPage.css';

export function MapPage() {
  const { user, logout } = useAuth();
  
  // Data states
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Filter states
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  
  // UI states
  const [isPlaceFormOpen, setIsPlaceFormOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Apply tag filter
  useEffect(() => {
    if (selectedTagIds.length === 0) {
      setFilteredPlaces(places);
    } else {
      const filtered = places.filter(place =>
        place.tags.some(pt => selectedTagIds.includes(pt.tag.id))
      );
      setFilteredPlaces(filtered);
    }
  }, [places, selectedTagIds]);

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

  const handleMapClick = (lat: number, lng: number) => {
    setClickedCoords({ lat, lng });
    setIsPlaceFormOpen(true);
  };

  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleEventClick = (event: Event) => {
    if (event.places && event.places.length > 0) {
      const place = places.find(p => p.id === event.places[0].place.id);
      if (place) {
        setSelectedPlace(place);
      }
    }
    setHighlightedEventId(event.id);
  };

  const handleDateSelect = (start: Date, end: Date) => {
    // TODO: Open event creation form
    console.log('Create event:', start, end);
  };

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

  const handlePlaceSubmit = async (data: any) => {
    await placesApi.create(data);
    await loadData();
    setClickedCoords(null);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
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
          <TagFilterBar
            tags={tags}
            selectedTagIds={selectedTagIds}
            onTagToggle={handleTagToggle}
            onClearAll={() => setSelectedTagIds([])}
            onCreateTag={() => console.log('Create tag')}
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
        }}
        onSubmit={handlePlaceSubmit}
        tags={tags}
        initialData={clickedCoords}
      />
    </div>
  );
}

