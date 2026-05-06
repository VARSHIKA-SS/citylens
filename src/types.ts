export interface User {
  name: string;
  gender: 'male' | 'female' | 'other';
}

export interface Shop {
  name: string;
  rating: number;
  description: string;
  location: [number, number];
  mapsLink: string;
  address: string;
  category: 'restaurant' | 'monument' | 'market' | 'temple' | 'other';
  priceRange: 'low' | 'medium' | 'high';
}

export interface Souvenir {
  name: string;
  description: string;
  whereToBuy: string;
  fairPrice: string;
  rating: number;
  category: 'food' | 'craft' | 'clothing' | 'other';
}

export interface FamousPoint {
  name: string;
  description: string;
  location: [number, number];
  category: 'landmark' | 'temple' | 'park' | 'museum';
}

export interface LingoPhrase {
  phrase: string;
  script: string;
  pronunciation: string;
  meaning: string;
}

export interface CityIntelligence {
  city: string;
  state: string;
  shops: Shop[];
  souvenirs: Souvenir[];
  famousPoints: FamousPoint[];
  lingo: LingoPhrase[];
  safetyTips: string[];
  etiquette: string[];
  transportFares: {
    autoBase: number;
    autoPerKm: number;
    taxiBase: number;
    taxiPerKm: number;
  };
}
