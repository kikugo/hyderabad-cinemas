import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Theater } from '../types/theater';
import { locationCoords, HYDERABAD_CENTER } from '../data/locations';

interface MapViewProps {
  theaters: Theater[];
  onSelectTheater: (theater: Theater) => void;
}

/**
 * Create a custom marker icon for the map
 */
const createCustomIcon = (isUpcoming: boolean) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background: ${isUpcoming ? '#f59e0b' : '#06b6d4'};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px ${isUpcoming ? 'rgba(245, 158, 11, 0.5)' : 'rgba(6, 182, 212, 0.5)'};
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

/**
 * Get theater coordinates from location name
 */
const getTheaterCoords = (location: string): [number, number] => {
  return locationCoords[location] || HYDERABAD_CENTER;
};

export const MapView = ({ theaters, onSelectTheater }: MapViewProps) => {
  const activeTheaters = theaters.filter(t => !t.type.includes('Upcoming'));
  const upcomingTheaters = theaters.filter(t => t.type.includes('Upcoming'));

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-700">
      <MapContainer
        center={HYDERABAD_CENTER}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* Dark theme map tiles from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Theater markers */}
        {theaters.map(theater => {
          const isUpcoming = theater.type.includes('Upcoming');
          const coords = getTheaterCoords(theater.location);

          return (
            <Marker
              key={theater.id}
              position={coords}
              icon={createCustomIcon(isUpcoming)}
              eventHandlers={{
                click: () => onSelectTheater(theater),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-white text-sm mb-1">{theater.name}</h3>
                  <div className="flex items-center gap-1 text-slate-300 text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{theater.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isUpcoming
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {theater.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600 text-slate-200">
                      {theater.screens} {theater.screens === 1 ? 'Screen' : 'Screens'}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectTheater(theater)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-1.5 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700 z-[1000]">
        <div className="text-xs font-semibold text-slate-300 mb-2">Legend</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-xs text-slate-400">
              Active Theaters ({activeTheaters.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-400">Coming Soon ({upcomingTheaters.length})</span>
          </div>
        </div>
      </div>

      {/* Theater count overlay */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700 z-[1000]">
        <div className="text-xs text-slate-300">
          <span className="font-bold text-cyan-400">{theaters.length}</span> theaters shown
        </div>
      </div>
    </div>
  );
};
