import { MapPin, Film, Heart, Map, ChevronRight } from 'lucide-react';
import type { Theater } from '../types/theater';
import { locationCoords, HYDERABAD_CENTER } from '../data/locations';
import { getFallbackImage } from '../utils/helpers';

interface TheaterCardProps {
  theater: Theater;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export const TheaterCard = ({ theater, isFavorite, onSelect, onToggleFavorite }: TheaterCardProps) => {
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
    window.open(`https://www.google.com/maps/search/${searchQuery}/@${coords[0]},${coords[1]},17z`, '_blank');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };
  
  return (
    <div 
      className={`group bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${
        isUpcoming 
          ? 'border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/10' 
          : 'border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-500/10'
      }`}
      onClick={onSelect}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={theater.image} 
          alt={theater.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            onClick={openGoogleMaps}
            className="p-2 bg-slate-900/80 backdrop-blur rounded-full hover:bg-green-600 transition-colors"
            aria-label="View on Google Maps"
            title="View Photos on Google Maps"
          >
            <Map className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleFavoriteClick}
            className="p-2 bg-slate-900/80 backdrop-blur rounded-full hover:bg-cyan-600 transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-3 py-1 backdrop-blur text-white rounded-full text-xs font-semibold ${
            isUpcoming ? 'bg-amber-500/90' : 'bg-slate-900/90'
          }`}>
            {theater.type}
          </span>
          {theater.id === 94 && (
            <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-xs font-bold animate-pulse">
              🎉 NEW TODAY
            </span>
          )}
          {isUpcoming && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xs font-bold">
              🚀 COMING SOON
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{theater.name}</h3>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{theater.location}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-400">{theater.screens} Screen{theater.screens > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-yellow-400">{theater.priceRange}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {theater.sound.includes('Atmos') && (
            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-xs font-medium">
              🎵 Atmos
            </span>
          )}
          {theater.projection.includes('Laser') && (
            <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-xs font-medium">
              ⚡ Laser
            </span>
          )}
          {theater.projection.includes('4K') && (
            <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg text-xs font-medium">
              📺 4K
            </span>
          )}
          {theater.projection.includes('LED') && (
            <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg text-xs font-medium">
              💡 LED
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {theater.highlights.slice(0, 2).map((h, i) => (
            <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
              {h}
            </span>
          ))}
        </div>

        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{theater.features}</p>

        <button className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          isUpcoming 
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white' 
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
        }`}>
          {isUpcoming ? 'Coming Soon' : 'View Details'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

