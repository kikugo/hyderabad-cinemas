import { MapPin, Film, Heart, Map, Volume2, Projector } from 'lucide-react';
import type { Theater } from '../types/theater';
import { locationCoords, HYDERABAD_CENTER } from '../data/locations';
import { getFallbackImage } from '../utils/helpers';

interface TheaterListItemProps {
  theater: Theater;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export const TheaterListItem = ({
  theater,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: TheaterListItemProps) => {
  const isUpcoming = theater.type.includes('Upcoming');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const fallback = getFallbackImage(theater.id, theater.type);
    if (target.src !== fallback) {
      target.src = fallback;
    }
  };

  const openGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const coords = locationCoords[theater.location] || HYDERABAD_CENTER;
    const searchQuery = encodeURIComponent(`${theater.name}, ${theater.location}, Hyderabad`);
    window.open(
      `https://www.google.com/maps/search/${searchQuery}/@${coords[0]},${coords[1]},17z`,
      '_blank'
    );
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <div
      className={`group bg-slate-900/80 backdrop-blur-sm rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-xl cursor-pointer ${
        isUpcoming
          ? 'border-amber-500/30 hover:border-amber-500/60'
          : 'border-slate-800 hover:border-cyan-500/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0">
          <img
            src={theater.image}
            alt={theater.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              onClick={openGoogleMaps}
              className="p-1.5 bg-slate-900/80 backdrop-blur rounded-full hover:bg-green-600 transition-colors"
              aria-label="View on Google Maps"
              title="View Photos"
            >
              <Map className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleFavoriteClick}
              className="p-1.5 bg-slate-900/80 backdrop-blur rounded-full hover:bg-cyan-600 transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-bold text-white">{theater.name}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{theater.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isUpcoming ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}
              >
                {theater.type}
              </span>
              <span className="text-yellow-400 font-semibold text-sm">{theater.priceRange}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs text-slate-400">
              <Film className="w-3 h-3 inline mr-1" />
              {theater.screens} Screens
            </span>
            <span className="text-xs text-slate-400">
              <Volume2 className="w-3 h-3 inline mr-1" />
              {theater.sound}
            </span>
            <span className="text-xs text-slate-400">
              <Projector className="w-3 h-3 inline mr-1" />
              {theater.projection}
            </span>
          </div>

          <p className="text-sm text-slate-400 line-clamp-1">{theater.features}</p>
        </div>
      </div>
    </div>
  );
};
