// Theater data types

export interface Theater {
  id: number;
  name: string;
  location: string;
  type: string;
  screens: number;
  keyScreen: string;
  sound: string;
  projection: string;
  seating: string;
  features: string;
  highlights: string[];
  priceRange: string;
  image: string;
}

// Theater type categories
export const THEATER_TYPES = [
  'Multiplex',
  'Single Screen',
  'Twin Theaters',
  'Boutique',
  'Multiplex (Upcoming)',
] as const;

export type TheaterType = typeof THEATER_TYPES[number];

export interface Filters {
  type: string;
  sound: string;
  projection: string;
  location: string;
}

export type ViewMode = 'grid' | 'list';
export type MainView = 'theaters' | 'map';

