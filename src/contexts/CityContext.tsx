import React, { createContext, useContext, useState } from 'react';
import { CityIntelligence, Shop } from '../types';
import { getCityIntelligence, searchSpecificIntelligence } from '../lib/gemini';
import { useAuth } from './AuthContext';

interface CityContextType {
  intelligence: CityIntelligence | null;
  loading: boolean;
  error: string | null;
  fetchIntelligence: (city: string) => Promise<boolean>;
  fetchCityFromCoords: (lat: number, lon: number) => Promise<boolean>;
  searchSpecific: (query: string) => Promise<void>;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [intelligence, setIntelligence] = useState<CityIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchIntelligence = async (city: string): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    setError(null);
    try {
      const data = await getCityIntelligence(city, user);
      setIntelligence(data);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to gather intelligence. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchSpecific = async (query: string) => {
    if (!user || !intelligence) return;
    setLoading(true);
    try {
      const newShops = await searchSpecificIntelligence(intelligence.city, query, user);
      // Avoid duplicates
      const existingNames = new Set(intelligence.shops.map(s => s.name.toLowerCase()));
      const uniqueNewShops = newShops.filter((s: Shop) => !existingNames.has(s.name.toLowerCase()));
      
      setIntelligence({
        ...intelligence,
        shops: [...intelligence.shops, ...uniqueNewShops]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCityFromCoords = async (lat: number, lon: number): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CityLens-App/1.0'
        }
      });
      const data = await res.json();
      const addr = data.address;
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.city_district || addr.state_district;
      
      if (city) {
        return await fetchIntelligence(city);
      } else {
        setError('Could not determine city from your location.');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Reverse geocoding failed', err);
      setError('Location lookup failed. Please search manually.');
      setLoading(false);
      return false;
    }
  };

  return (
    <CityContext.Provider value={{ intelligence, loading, error, fetchIntelligence, fetchCityFromCoords, searchSpecific }}>
      {children}
    </CityContext.Provider>
  );
}

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error('useCity must be used within CityProvider');
  return context;
};
