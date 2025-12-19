import { useState, useMemo } from 'react';
import { 
  Search, Film, Zap, TrendingUp, LayoutGrid, List, 
  Sparkles, Map, Heart, Building2 
} from 'lucide-react';

// Components
import { TheaterCard, TheaterListItem, TheaterModal, MapView, StatCard } from './components';

// Data
import { rawTheaters } from './data/theaters';

// Types
import type { Theater, Filters, ViewMode, MainView } from './types/theater';
import { SOUND_SYSTEMS, PROJECTION_TYPES } from './types/theater';

// Utils
import { getPriceRange, extractHighlights, getTheaterImage } from './utils/helpers';

/**
 * Main Theater Explorer Application
 */
const TheaterExplorer = () => {
  // View state
  const [view, setView] = useState<ViewMode>('grid');
  const [mainView, setMainView] = useState<MainView>('theaters');
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    sound: 'all',
    projection: 'all',
    location: 'all'
  });
  
  // Selection and favorites state
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Process raw theater data with computed fields
  const theaters: Theater[] = useMemo(() => 
    rawTheaters.map(t => ({
      ...t,
      highlights: extractHighlights(t.features),
      priceRange: getPriceRange(t.type, t.sound, t.projection),
      image: getTheaterImage(t.id)
    })), []
  );

  // Derive filter options from data
  const locations = useMemo(() => 
    [...new Set(theaters.map(t => t.location))].sort(), 
    [theaters]
  );
  const theaterTypes = useMemo(() => 
    [...new Set(theaters.map(t => t.type))], 
    [theaters]
  );

  // Filter theaters based on search and filter criteria
  const filteredTheaters = useMemo(() => {
    return theaters.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.features.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filters.type === 'all' || t.type.includes(filters.type);
      const matchesSound = filters.sound === 'all' || t.sound.includes(filters.sound);
      const matchesProjection = filters.projection === 'all' || t.projection.includes(filters.projection);
      const matchesLocation = filters.location === 'all' || t.location === filters.location;
      
      return matchesSearch && matchesType && matchesSound && matchesProjection && matchesLocation;
    });
  }, [theaters, searchTerm, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const activeTheaters = theaters.filter(t => !t.type.includes('Upcoming'));
    const total = activeTheaters.length;
    const multiplexes = activeTheaters.filter(t => t.type === 'Multiplex').length;
    const singleScreens = activeTheaters.filter(t => t.type === 'Single Screen').length;
    const boutique = activeTheaters.filter(t => t.type === 'Boutique' || t.type === 'Twin Theaters').length;
    const atmosCount = activeTheaters.filter(t => t.sound.includes('Atmos')).length;
    const laserCount = activeTheaters.filter(t => t.projection.includes('Laser')).length;
    const fourKCount = activeTheaters.filter(t => t.projection.includes('4K')).length;
    const totalScreens = activeTheaters.reduce((acc, t) => acc + (t.screens || 0), 0);
    const upcoming = theaters.filter(t => t.type.includes('Upcoming')).length;
    
    return { total, multiplexes, singleScreens, boutique, atmosCount, laserCount, fourKCount, totalScreens, upcoming };
  }, [theaters]);

  // Toggle favorite status
  const toggleFavorite = (theaterId: number) => {
    setFavorites(prev => 
      prev.includes(theaterId) 
        ? prev.filter(id => id !== theaterId)
        : [...prev, theaterId]
    );
  };

  // Reset all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ type: 'all', sound: 'all', projection: 'all', location: 'all' });
  };

  // Get theaters for current view
  const displayedTheaters = mainView === 'favorites' 
    ? theaters.filter(t => favorites.includes(t.id))
    : filteredTheaters;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Ambient background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
              🎬 Hyderabad Cinemas
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Discover {stats.total} movie theaters across the city of pearls — from iconic single screens to premium multiplexes
            </p>
          </header>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
            <StatCard icon={Building2} label="Theaters" value={stats.total} color="from-cyan-600 to-cyan-700" />
            <StatCard icon={LayoutGrid} label="Multiplexes" value={stats.multiplexes} color="from-purple-600 to-purple-700" />
            <StatCard icon={Film} label="Single Screens" value={stats.singleScreens} color="from-indigo-600 to-indigo-700" />
            <StatCard icon={Zap} label="Dolby Atmos" value={stats.atmosCount} color="from-pink-600 to-pink-700" />
            <StatCard icon={TrendingUp} label="4K Projection" value={stats.fourKCount} color="from-orange-600 to-orange-700" />
            <StatCard icon={Sparkles} label="Total Screens" value={stats.totalScreens} color="from-emerald-600 to-emerald-700" />
          </section>

          {/* Search & Filters */}
          <section className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 mb-8 border border-slate-800 shadow-2xl">
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by theater name, location, or features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
              
              {/* Filter Dropdowns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                  aria-label="Filter by theater type"
                >
                  <option value="all">All Types</option>
                  {theaterTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                  aria-label="Filter by location"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>

                <select
                  value={filters.sound}
                  onChange={(e) => setFilters({...filters, sound: e.target.value})}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                  aria-label="Filter by sound system"
                >
                  <option value="all">All Sound Systems</option>
                  {SOUND_SYSTEMS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={filters.projection}
                  onChange={(e) => setFilters({...filters, projection: e.target.value})}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                  aria-label="Filter by projection type"
                >
                  <option value="all">All Projections</option>
                  {PROJECTION_TYPES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* View Controls */}
          <section className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Main View Tabs */}
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setMainView('theaters')}
                className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${
                  mainView === 'theaters' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4 inline mr-2" />
                Theaters
              </button>
              <button
                onClick={() => setMainView('map')}
                className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${
                  mainView === 'map' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Map className="w-4 h-4 inline mr-2" />
                Map View
              </button>
              {favorites.length > 0 && (
                <button
                  onClick={() => setMainView('favorites')}
                  className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${
                    mainView === 'favorites' 
                      ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-4 h-4 inline mr-2" />
                  Favorites ({favorites.length})
                </button>
              )}
            </div>

            {/* Grid/List Toggle */}
            {mainView === 'theaters' && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">
                  <span className="text-cyan-400 font-semibold">{filteredTheaters.length}</span> theaters found
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      view === 'grid' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-lg transition-all ${
                      view === 'list' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Main Content */}
          <main>
            {mainView === 'map' ? (
              <MapView 
                theaters={filteredTheaters} 
                onSelectTheater={setSelectedTheater} 
              />
            ) : (
              <>
                {/* Theater Grid/List */}
                <div className={view === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "flex flex-col gap-4"
                }>
                  {displayedTheaters.map(theater => (
                    view === 'grid' 
                      ? <TheaterCard 
                          key={theater.id} 
                          theater={theater}
                          isFavorite={favorites.includes(theater.id)}
                          onSelect={() => setSelectedTheater(theater)}
                          onToggleFavorite={() => toggleFavorite(theater.id)}
                        />
                      : <TheaterListItem 
                          key={theater.id} 
                          theater={theater}
                          isFavorite={favorites.includes(theater.id)}
                          onSelect={() => setSelectedTheater(theater)}
                          onToggleFavorite={() => toggleFavorite(theater.id)}
                        />
                  ))}
                </div>

                {/* Empty State - Favorites */}
                {mainView === 'favorites' && favorites.length === 0 && (
                  <div className="text-center py-20">
                    <Heart className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-300 mb-2">No favorites yet</h3>
                    <p className="text-slate-400">Click the heart icon on theaters to add them to your favorites</p>
                  </div>
                )}

                {/* Empty State - No Results */}
                {mainView === 'theaters' && filteredTheaters.length === 0 && (
                  <div className="text-center py-20">
                    <Film className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-300 mb-2">No theaters found</h3>
                    <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
                    <button 
                      onClick={clearFilters}
                      className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Footer */}
          <footer className="mt-16 text-center text-slate-500 text-sm">
            <p>Data includes {stats.total} active theaters and {stats.upcoming} upcoming venues</p>
            <p className="mt-1">Last updated: December 2025</p>
          </footer>
        </div>
      </div>

      {/* Theater Detail Modal */}
      {selectedTheater && (
        <TheaterModal 
          theater={selectedTheater} 
          isFavorite={favorites.includes(selectedTheater.id)}
          onClose={() => setSelectedTheater(null)}
          onToggleFavorite={() => toggleFavorite(selectedTheater.id)}
        />
      )}
    </div>
  );
};

export default TheaterExplorer;
