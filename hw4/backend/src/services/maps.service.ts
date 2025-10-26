// Maps service - Google Maps API integration (server-side)
import { Client } from '@googlemaps/google-maps-services-js';
import { env } from '../env';
import type { GeocodeQueryDto, ReverseGeocodeQueryDto, PlacesSearchQueryDto, PlaceDetailsQueryDto } from '../schemas/maps.schema';
import https from 'https';
import axios from 'axios';

// Create axios instance with SSL configuration
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Only for development
  })
});

const mapsClient = new Client({ axiosInstance });

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

  /**
   * Get place details by place_id
   */
  async getPlaceDetails(query: PlaceDetailsQueryDto) {
    try {
      const response = await mapsClient.placeDetails({
        params: {
          place_id: query.placeId,
          fields: query.fields?.split(',').map(f => f.trim()) || ['name', 'formatted_address', 'geometry', 'place_id', 'rating'],
          key: env.GOOGLE_MAPS_API_KEY,
          language: 'zh-TW' as any,
        },
      });

      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: `Place details failed: ${response.data.status}`,
          data: null,
        };
      }

      const place = response.data.result;
      const result = {
        name: place.name,
        address: place.formatted_address,
        place_id: place.place_id,
        lat: place.geometry?.location.lat,
        lng: place.geometry?.location.lng,
        rating: place.rating,
        types: place.types,
        phone: place.international_phone_number || place.formatted_phone_number,
        website: place.website,
        openingHours: place.opening_hours?.weekday_text,
        priceLevel: place.price_level,
        photos: place.photos?.slice(0, 3).map((photo: any) => ({
          photo_reference: photo.photo_reference,
          height: photo.height,
          width: photo.width,
        })),
      };

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('Place details error:', error);
      return {
        success: false,
        error: error.message || 'Place details failed',
        data: null,
      };
    }
  }
}

// Singleton instance
export const mapsService = new MapsService();

