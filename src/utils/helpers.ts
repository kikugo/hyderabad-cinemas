// Utility functions for theater data processing

import type { TheaterType } from '../types/theater';

/**
 * Calculate price range based on theater attributes
 */
export const getPriceRange = (type: string, sound: string, projection: string): string => {
  let price = 1;
  if (type === 'Multiplex') price += 1;
  if (type === 'Boutique') price += 2;
  if (sound.includes('Atmos')) price += 1;
  if (projection.includes('Laser') || projection.includes('4K')) price += 1;
  return '₹'.repeat(Math.min(price, 4));
};

/**
 * Extract highlight tags from theater features description
 */
export const extractHighlights = (features: string): string[] => {
  const highlights: string[] = [];
  
  if (features.includes('Celebrity') || features.includes('Co-owned') || 
      features.includes('Mahesh Babu') || features.includes('Allu Arjun') || 
      features.includes('Ravi Teja')) {
    highlights.push('Celebrity Owned');
  }
  if (features.includes('Largest') || features.includes('largest')) {
    highlights.push('Largest Screen');
  }
  if (features.includes('LED')) highlights.push('LED Tech');
  if (features.includes('Laser')) highlights.push('Laser');
  if (features.includes('IMAX') || features.includes('PCX') || 
      features.includes('EPIQ') || features.includes('PLF')) {
    highlights.push('Premium Format');
  }
  if (features.includes('Fan') || features.includes('FDFS') || features.includes('fan')) {
    highlights.push('Fan Culture');
  }
  if (features.includes('Metro') || features.includes('metro')) {
    highlights.push('Metro Connected');
  }
  if (features.includes('VIP') || features.includes('Luxury') || 
      features.includes('luxury') || features.includes('Gold')) {
    highlights.push('VIP/Luxury');
  }
  if (features.includes('Recliner') || features.includes('recliner')) {
    highlights.push('Recliners');
  }
  if (features.includes('Record') || features.includes('First')) {
    highlights.push('Record Breaker');
  }
  if (features.includes('Renovated') || features.includes('New') || 
      features.includes('2024') || features.includes('2025')) {
    highlights.push('Recently Updated');
  }
  if (features.includes('Heritage') || features.includes('Legendary') || 
      features.includes('Iconic') || features.includes('Classic')) {
    highlights.push('Iconic');
  }
  if (features.includes('Budget') || features.includes('Affordable') || 
      features.includes('cheap') || features.includes('₹50')) {
    highlights.push('Budget Friendly');
  }
  if (features.includes('sound') || features.includes('Sound') || 
      features.includes('Audio') || features.includes('Atmos')) {
    highlights.push('Great Audio');
  }
  
  return highlights.slice(0, 3);
};

// Fallback images organized by theater type
const MULTIPLEX_IMAGES = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80",
  "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&q=80",
  "https://images.unsplash.com/photo-1574267432644-f610bcb4f0e4?w=800&q=80",
  "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&q=80",
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&q=80",
  "https://images.unsplash.com/photo-1596445836561-991bcd39a86f?w=800&q=80",
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80",
];

const SINGLE_SCREEN_IMAGES = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
  "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&q=80",
  "https://images.unsplash.com/photo-1568876694728-451bbf694b83?w=800&q=80",
  "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80",
  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&q=80",
  "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80",
];

const BOUTIQUE_IMAGES = [
  "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&q=80",
  "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?w=800&q=80",
  "https://images.unsplash.com/photo-1604975701397-6365ccbd028a?w=800&q=80",
  "https://images.unsplash.com/photo-1613095219511-e094a0ee61f0?w=800&q=80",
];

/**
 * Get fallback image based on theater type
 */
export const getFallbackImage = (id: number, type: string): string => {
  if (type === 'Boutique') {
    return BOUTIQUE_IMAGES[id % BOUTIQUE_IMAGES.length];
  } else if (type === 'Single Screen' || type === 'Twin Theaters') {
    return SINGLE_SCREEN_IMAGES[id % SINGLE_SCREEN_IMAGES.length];
  }
  return MULTIPLEX_IMAGES[id % MULTIPLEX_IMAGES.length];
};

/**
 * Get theater image path (local scraped image)
 */
export const getTheaterImage = (id: number): string => {
  return `/theaters/theater-${id}.jpg`;
};

/**
 * Handle image error - fall back to stock images
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement>,
  id: number,
  type: string
): void => {
  const target = e.target as HTMLImageElement;
  const fallback = getFallbackImage(id, type);
  if (target.src !== fallback) {
    target.src = fallback;
  }
};

/**
 * Get Google Maps directions URL
 */
export const getDirectionsUrl = (lat: number, lng: number, name: string, location: string): string => {
  const query = encodeURIComponent(`${name}, ${location}, Hyderabad`);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&query=${query}`;
};

/**
 * Get Google Maps search URL (for photos)
 */
export const getGoogleMapsSearchUrl = (lat: number, lng: number, name: string, location: string): string => {
  const query = encodeURIComponent(`${name}, ${location}, Hyderabad`);
  return `https://www.google.com/maps/search/${query}/@${lat},${lng},17z`;
};

