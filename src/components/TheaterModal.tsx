import {
  X,
  MapPin,
  Film,
  Star,
  Zap,
  Heart,
  Users,
  Volume2,
  Projector,
  Navigation,
  Map,
  Sparkles,
  Clapperboard,
} from 'lucide-react';
import type { Theater } from '../types/theater';
import { locationCoords, HYDERABAD_CENTER } from '../data/locations';
import { getFallbackImage } from '../utils/helpers';

interface TheaterModalProps {
  theater: Theater;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
}

export const TheaterModal = ({
  theater,
  isFavorite,
  onClose,
  onToggleFavorite,
}: TheaterModalProps) => {
  const isUpcoming = theater.type.includes('Upcoming');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const fallback = getFallbackImage(theater.id, theater.type);
    if (target.src !== fallback) {
      target.src = fallback;
    }
  };

  const getTheaterCoords = (): [number, number] => {
    return locationCoords[theater.location] || HYDERABAD_CENTER;
  };

  const openGoogleMaps = () => {
    const coords = getTheaterCoords();
    const searchQuery = encodeURIComponent(`${theater.name}, ${theater.location}, Hyderabad`);
    window.open(
      `https://www.google.com/maps/search/${searchQuery}/@${coords[0]},${coords[1]},17z`,
      '_blank'
    );
  };

  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(theater.name + ', ' + theater.location + ', Hyderabad')}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64">
          <img
            src={theater.image}
            alt={theater.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 backdrop-blur rounded-full hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={onToggleFavorite}
            className="absolute top-4 left-4 p-2 bg-slate-900/80 backdrop-blur rounded-full hover:bg-cyan-600 transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isUpcoming ? 'bg-amber-500' : 'bg-cyan-600'
                } text-white`}
              >
                {theater.type}
              </span>
              {theater.id === 94 && (
                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-xs font-bold">
                  🎉 OPENS TODAY
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{theater.name}</h2>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4" />
                <span>{theater.location}</span>
              </div>
              <button
                onClick={openGoogleMaps}
                className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white text-xs transition-colors"
              >
                <Map className="w-3 h-3" />
                View Photos
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Film className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{theater.screens}</div>
              <div className="text-xs text-slate-400">Screens</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{theater.seating}</div>
              <div className="text-xs text-slate-400">Seats</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Volume2 className="w-6 h-6 text-pink-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-white leading-tight">
                {theater.sound.split('/')[0]}
              </div>
              <div className="text-xs text-slate-400">Sound</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Projector className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-white leading-tight">
                {theater.projection.split('/')[0]}
              </div>
              <div className="text-xs text-slate-400">Projection</div>
            </div>
          </div>

          {/* Key Screen Info */}
          {theater.keyScreen && theater.keyScreen !== 'TBA' && (
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-white">Key Screen</span>
              </div>
              <p className="text-slate-300">{theater.keyScreen}</p>
            </div>
          )}

          {/* Highlights */}
          {theater.highlights.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Highlights
              </h3>
              <div className="flex flex-wrap gap-2">
                {theater.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tech Badges */}
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Technology
            </h3>
            <div className="flex flex-wrap gap-2">
              {theater.sound.includes('Atmos') && (
                <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm">
                  🎵 Dolby Atmos
                </span>
              )}
              {theater.projection.includes('Laser') && (
                <span className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
                  ⚡ Laser Projection
                </span>
              )}
              {theater.projection.includes('4K') && (
                <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm">
                  📺 4K Resolution
                </span>
              )}
              {theater.projection.includes('LED') && (
                <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm">
                  💡 LED Screen
                </span>
              )}
              {theater.sound.includes('7.1') && (
                <span className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm">
                  🔊 7.1 Surround
                </span>
              )}
            </div>
          </div>

          {/* Features/USP */}
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-cyan-400" />
              About & USP
            </h3>
            <p className="text-slate-300 leading-relaxed">{theater.features}</p>
          </div>

          {/* Price Range */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
            <div>
              <span className="text-slate-400 text-sm">Price Range</span>
              <div className="text-xl font-bold text-yellow-400">{theater.priceRange}</div>
            </div>
            {!isUpcoming && (
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            )}
            {isUpcoming && (
              <span className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg text-sm font-medium">
                Opening Soon
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
