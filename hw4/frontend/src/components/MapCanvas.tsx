// MapCanvas - Google Maps integration component
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { Place } from '../types/place';
import '../styles/MapCanvas.css';

interface MapCanvasProps {
  places: Place[];
  selectedPlace?: Place | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (place: Place) => void;
  highlightedPlaceId?: string | null;
}

export function MapCanvas({
  places,
  selectedPlace,
  onMapClick,
  onMarkerClick,
  highlightedPlaceId,
}: MapCanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<Map<string, google.maps.Marker>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) {
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        setError('Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in .env');
        setIsLoading(false);
        return;
      }

      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 25.0330, lng: 121.5654 }, // Taipei default
          zoom: 13,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
        });

        // Add click listener
        if (onMapClick) {
          mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setMap(mapInstance);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error loading Google Maps:', err);
        setError(`Failed to load Google Maps: ${err.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    initMap();
  }, [onMapClick]);

  // Update markers when places change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = new Map<string, google.maps.Marker>();

    // Create new markers
    places.forEach(place => {
      const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map,
        title: place.title,
        animation: google.maps.Animation.DROP,
      });

      // Add click listener
      if (onMarkerClick) {
        marker.addListener('click', () => {
          onMarkerClick(place);
        });
      }

      newMarkers.set(place.id, marker);
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (places.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      places.forEach(place => {
        bounds.extend({ lat: place.lat, lng: place.lng });
      });
      map.fitBounds(bounds);
    }
  }, [map, places, onMarkerClick]);

  // Handle selected/highlighted place
  useEffect(() => {
    if (!map) return;

    const placeToFocus = selectedPlace || places.find(p => p.id === highlightedPlaceId);
    
    if (placeToFocus) {
      map.panTo({ lat: placeToFocus.lat, lng: placeToFocus.lng });
      map.setZoom(15);

      // Highlight marker
      const marker = markers.get(placeToFocus.id);
      if (marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 2000);
      }
    }
  }, [map, selectedPlace, highlightedPlaceId, markers, places]);

  return (
    <div className="map-canvas">
      {/* Always render the map container so ref is available */}
      <div 
        ref={mapRef} 
        className="map-canvas__container"
        style={{ display: isLoading || error ? 'none' : 'block' }}
      />
      
      {isLoading && (
        <div className="map-canvas__overlay map-canvas--loading">
          <div className="map-loading">
            <div className="spinner"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="map-canvas__overlay map-canvas--error">
          <div className="map-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && places.length === 0 && (
        <div className="map-overlay">
          <div className="map-hint">
            <p>Click on the map to add a place</p>
          </div>
        </div>
      )}
    </div>
  );
}

