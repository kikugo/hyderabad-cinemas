// Theater data types

/**
 * Raw theater data as imported from CSV
 */
export interface RawTheater {
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
}

/**
 * Processed theater data with computed fields
 */
export interface Theater extends RawTheater {
  highlights: string[];
  priceRange: string;
  image: string;
}

/**
 * Theater type categories
 */
export const THEATER_TYPES = [
  'Multiplex',
  'Single Screen',
  'Twin Theaters',
  'Boutique',
  'Multiplex (Upcoming)',
] as const;

export type TheaterType = (typeof THEATER_TYPES)[number];

/**
 * Filter state for theater search
 */
export interface Filters {
  type: string;
  sound: string;
  projection: string;
  location: string;
}

/**
 * View mode for theater list display
 */
export type ViewMode = 'grid' | 'list';

/**
 * Main view tabs
 */
export type MainView = 'theaters' | 'map' | 'favorites';

/**
 * Sound system options for filtering
 */
export const SOUND_SYSTEMS = ['Dolby Atmos', 'Dolby 7.1', 'Dolby Digital', 'DTS'] as const;

/**
 * Projection type options for filtering
 */
export const PROJECTION_TYPES = ['4K Laser', '4K Digital', '4K Projection', '2K Digital', 'LED', 'Laser'] as const;
