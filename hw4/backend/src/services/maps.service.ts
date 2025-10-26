// Maps service - Google Maps API integration (server-side)
import { Client } from '@googlemaps/google-maps-services-js';
import { env } from '../env';
import type { GeocodeQueryDto, ReverseGeocodeQueryDto, PlacesSearchQueryDto } from '../schemas/maps.schema';

const mapsClient = new Client({});

export class MapsService {
  /**
   * Geocode: Convert address to coordinates
   */
  async geocode(query: GeocodeQueryDto) {
    try {
      const response = await mapsClient.geocode({
        params: {
          address: query.address,
          key: env.GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: `Geocoding failed: ${response.data.status}`,
          results: [],
        };
      }

      const results = response.data.results.map(result => ({
        address: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        place_id: result.place_id,
        types: result.types,
      }));

      return {
        success: true,
        count: results.length,
        data: results,
      };
    } catch (error: any) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: error.message || 'Geocoding failed',
        results: [],
      };
    }
  }

  /**
   * Reverse Geocode: Convert coordinates to address
   */
  async reverseGeocode(query: ReverseGeocodeQueryDto) {
    try {
      const response = await mapsClient.reverseGeocode({
        params: {
          latlng: { lat: query.lat, lng: query.lng },
          key: env.GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: `Reverse geocoding failed: ${response.data.status}`,
          results: [],
        };
      }

      const results = response.data.results.map(result => ({
        address: result.formatted_address,
        place_id: result.place_id,
        types: result.types,
      }));

      return {
        success: true,
        count: results.length,
        data: results,
      };
    } catch (error: any) {
      console.error('Reverse geocoding error:', error);
      return {
        success: false,
        error: error.message || 'Reverse geocoding failed',
        results: [],
      };
    }
  }

  /**
   * Search places by keyword and location
   */
  async searchPlaces(query: PlacesSearchQueryDto) {
    try {
      // Use Text Search API for keyword search
      const params: any = {
        query: query.q,
        key: env.GOOGLE_MAPS_API_KEY,
      };

      // Add location bias if provided
      if (query.lat && query.lng) {
        params.location = { lat: query.lat, lng: query.lng };
        params.radius = query.radius;
      }

      const response = await mapsClient.textSearch({ params });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        return {
          success: false,
          error: `Places search failed: ${response.data.status}`,
          results: [],
        };
      }

      const results = (response.data.results || []).map(place => ({
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry?.location.lat,
        lng: place.geometry?.location.lng,
        place_id: place.place_id,
        types: place.types,
        rating: place.rating,
      }));

      return {
        success: true,
        count: results.length,
        data: results,
      };
    } catch (error: any) {
      console.error('Places search error:', error);
      return {
        success: false,
        error: error.message || 'Places search failed',
        results: [],
      };
    }
  }
}

// Singleton instance
export const mapsService = new MapsService();

