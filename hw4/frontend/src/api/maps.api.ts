// Maps API endpoints (Google Maps services proxy)
import axiosClient from './axiosClient';
import type { GeocodeResponse, PlacesSearchResponse } from '../types/maps';

export const mapsApi = {
  /**
   * Geocode an address to coordinates
   */
  async geocode(address: string): Promise<GeocodeResponse> {
    const response = await axiosClient.get<GeocodeResponse>('/maps/geocode', {
      params: { address },
    });
    return response.data;
  },

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResponse> {
    const response = await axiosClient.get<GeocodeResponse>('/maps/reverse-geocode', {
      params: { lat, lng },
    });
    return response.data;
  },

  /**
   * Search for places by keyword
   */
  async searchPlaces(params: {
    q: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<PlacesSearchResponse> {
    const response = await axiosClient.get<PlacesSearchResponse>('/maps/search', {
      params,
    });
    return response.data;
  },
};

