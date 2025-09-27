import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapIcon,
  SearchIcon,
  RulerIcon,
  LayersIcon,
  NavigationIcon,
  ActivityIcon,
  EyeIcon,
  ZapIcon,
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useMap } from '../hooks/useMap';
import { useTranslation } from "react-i18next";
import L from 'leaflet';
import styles from './MapExplorer.module.css';

// Fix for marker icons in production deployment
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
    className: 'custom-marker-icon'
  });
};

// Create different colored markers
const userLocationIcon = createCustomIcon('#ef4444'); // Red for user location
const searchResultIcon = createCustomIcon('#3b82f6'); // Blue for search results
const measurementIcon = createCustomIcon('#10b981'); // Green for measurement points

const MapExplorer: React.FC = () => {
  const { t } = useTranslation();
  const { position } = useMap();
  const mapRef = useRef<L.Map | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ lat: string; lon: string; display_name: string }[]>([]);

  // Measurement state
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [totalDistance, setTotalDistance] = useState(0); // meters

  // Map layer control state
  const [currentMapLayer, setCurrentMapLayer] = useState('street'); // 'street', 'satellite', 'terrain'
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Close layer menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isLayerMenuOpen && !target.closest(`.${styles.customLayerControl}`)) {
        setIsLayerMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLayerMenuOpen]);

  // Layer configurations
  const layerConfigs = {
    street: {
      name: '🗺️ Street Map',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    },
    satellite: {
      name: '🛰️ Satellite View',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 17
    },
    terrain: {
      name: '⛰️ Terrain View',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 17
    }
  };

  // Handle layer change
  const handleLayerChange = (layerType: string) => {
    setCurrentMapLayer(layerType);
    setIsLayerMenuOpen(false);
  };

  // Refs to Leaflet objects for cleanup
  const measureMarkersRef = useRef<L.Marker[]>([]);
  const measureLineRef = useRef<L.Polyline | null>(null);

  const clearMeasurementLayers = () => {
    measureMarkersRef.current.forEach(m => m.remove());
    measureMarkersRef.current = [];
    if (measureLineRef.current) {
      measureLineRef.current.remove();
      measureLineRef.current = null;
    }
  };

  const resetMeasurement = () => {
    clearMeasurementLayers();
    setMeasurePoints([]);
    setTotalDistance(0);
    setIsMeasuring(false);
  };

  const startMeasurement = () => {
    resetMeasurement();
    setIsMeasuring(true);
  };

  const finishMeasurement = () => {
    setIsMeasuring(false);
  };

  // Recalculate distance whenever points change
  useEffect(() => {
    if (measurePoints.length < 2) {
      setTotalDistance(0);
      return;
    }
    let d = 0;
    for (let i = 0; i < measurePoints.length - 1; i++) {
      d += measurePoints[i].distanceTo(measurePoints[i + 1]);
    }
    setTotalDistance(d);
  }, [measurePoints]);

  // Initialize map properly for layer control
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      // Ensure the map is fully initialized
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, []);

  // Handle map click while measuring
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!isMeasuring) return;
      const latlng = e.latlng;
      // Add marker
      const marker = L.marker(latlng, {
        draggable: false,
        icon: measurementIcon
      });
      marker.addTo(map);
      measureMarkersRef.current.push(marker);
      // Update points state
      setMeasurePoints(prev => [...prev, latlng]);
      // Draw or update polyline
      if (!measureLineRef.current) {
        measureLineRef.current = L.polyline([latlng], { color: '#ff2d55', weight: 3 });
        measureLineRef.current.addTo(map);
      } else {
        measureLineRef.current.addLatLng(latlng);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isMeasuring]);

  // Zoom to user location
  const handleZoomToUser = () => {
    if (mapRef.current) {
      mapRef.current.setView([position.lat, position.lng], 30, { animate: true });
    }
  };

  // Search places using Nominatim API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`);
    const data = await res.json();
    setSearchResults(data);
    if (data.length > 0 && mapRef.current) {
      mapRef.current.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 13, { animate: true });
    }
  };

  return (
    <MainLayout>
      {/* Enhanced Header Section */}
      <div className={`relative mb-4 -mx-6 -mt-6 px-6 pt-6 pb-4 ${styles.headerSection} ${styles.fadeInUp}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${styles.slideInLeft}`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm ${styles.floatAnimation}`}>
                <MapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  RainWise {t("mapExplorer.title")}
                </h1>
                <p className="text-blue-100 font-medium text-lg">
                  {t("mapExplorer.subtitle")}
                </p>
              </div>
            </div>

            {/* Header Stats */}
            <div className={`flex items-center space-x-4 ${styles.slideInRight} ${styles.staggerDelay1}`}>
              <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                <ActivityIcon className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Live Maps</span>
              </div>
              <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                <EyeIcon className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Interactive</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-white">Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Map Container */}
      <div className={`relative ${styles.mapContainer} rounded-2xl shadow-2xl overflow-hidden ${styles.fadeInUp} ${styles.staggerDelay2}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 pointer-events-none z-10"></div>
        
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={20}
          scrollWheelZoom={true}
          style={{ 
            height: "calc(100vh - 160px)", 
            minHeight: "600px", 
            width: "100%"
          }}
          className="rounded-2xl z-20"
          ref={mapRef}
        >
          {/* Enhanced Measurement Controls - Hidden on Mobile */}
          <div className={`hidden sm:block absolute top-4 left-4 z-[1100] ${styles.measurementControls} ${styles.slideInDown} rounded-2xl max-w-xs sm:max-w-sm`}>
            {/* Panel Content - Desktop Only */}
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <RulerIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-800 text-sm">Distance Measurement</h3>
              </div>
              
              {!isMeasuring && (
                <button 
                  onClick={startMeasurement} 
                  className={`w-full ${styles.modernButton} ${styles.primaryButton} text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2`}
                >
                  <RulerIcon className="h-4 w-4" />
                  <span>Start Measuring</span>
                </button>
              )}
              
              {isMeasuring && (
                <div className="space-y-3">
                  <div className={`${styles.statusIndicator} text-xs`}>
                    <NavigationIcon className="h-3 w-3" />
                    <span>Click map to add points</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={finishMeasurement} 
                      className={`flex-1 ${styles.modernButton} ${styles.secondaryButton} text-white px-3 py-2 rounded-lg text-xs font-semibold`}
                    >
                      Finish
                    </button>
                    <button 
                      onClick={resetMeasurement} 
                      className={`flex-1 ${styles.modernButton} ${styles.dangerButton} text-white px-3 py-2 rounded-lg text-xs font-semibold`}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
              
              {!isMeasuring && measurePoints.length > 1 && (
                <button 
                  onClick={resetMeasurement} 
                  className={`w-full mt-3 ${styles.modernButton} ${styles.warningButton} text-white px-4 py-2 rounded-lg text-sm font-semibold`}
                >
                  Clear Measurement
                </button>
              )}
              
              <div className={`mt-4 ${styles.distanceDisplay}`}>
                <div className="text-xs text-gray-600 mb-1">Total Distance</div>
                <div className="text-lg font-bold">{(totalDistance / 1000).toFixed(3)} km</div>
                <div className="text-xs text-gray-500 mt-1">
                  {measurePoints.length} point{measurePoints.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {measurePoints.length > 1 && isMeasuring && (
                <div className={`mt-2 text-xs text-gray-500 ${styles.statusIndicator}`}>
                  <ZapIcon className="h-3 w-3" />
                  <span>Click Finish to lock measurement</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Custom Layer Control */}
          <div className={`${styles.customLayerControl} absolute top-4 right-4`}>
            <button
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className={`${styles.layerToggleButton} p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white/95 transition-all duration-300`}
              title="Change Map Layer"
            >
              <LayersIcon size={20} className="text-gray-700" />
            </button>
            
            {isLayerMenuOpen && (
              <div className={`${styles.layerMenu} absolute top-14 right-0 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 min-w-[180px]`}>
                {Object.entries(layerConfigs).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleLayerChange(key)}
                    className={`${currentMapLayer === key ? styles.activeLayerButton : styles.layerButton} w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2`}
                  >
                    <span>{config.name}</span>
                    {currentMapLayer === key && <span className="text-blue-500 ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Container with dynamic tile layer */}
          <TileLayer
            key={currentMapLayer} // Force re-render when layer changes
            attribution={layerConfigs[currentMapLayer as keyof typeof layerConfigs].attribution}
            url={layerConfigs[currentMapLayer as keyof typeof layerConfigs].url}
            maxZoom={layerConfigs[currentMapLayer as keyof typeof layerConfigs].maxZoom}
          />
          
          <Marker position={[position.lat, position.lng]} icon={userLocationIcon}>
            <Popup>
              {t("mapExplorer.yourLocation")}<br />
              (Lat: {position.lat}, Lng: {position.lng})
            </Popup>
          </Marker>
          {/* Show search results as markers */}
          {searchResults.map((result, idx) => (
            <Marker key={idx} position={[parseFloat(result.lat), parseFloat(result.lon)]} icon={searchResultIcon}>
              <Popup>{result.display_name}</Popup>
            </Marker>
          ))}
          {/* Enhanced Bottom Controls - Mobile Responsive */}
          <div className={`absolute bottom-0 left-0 right-0 z-[1100] p-4 sm:p-6 ${styles.slideInUp} ${styles.staggerDelay3}`}>
            <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto max-h-14">
              {/* Enhanced Search Form */}
              <form
                onSubmit={handleSearch}
                className={`flex-1 ${styles.searchForm} rounded-2xl p-4 transition-all duration-300`}
              >
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/4 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder={t("mapExplorer.searchPlaceholder") || "Search for places, landmarks, or addresses..."}
                      className={`${styles.searchInput} w-full pl-10 pr-4 py-0 text-base font-medium focus:outline-none`}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={`${styles.modernButton} ${styles.primaryButton} text-white mt-[-6px] px-6 py-2 rounded-xl font-semibold  flex items-center justify-center space-x-2 whitespace-nowrap min-w-[120px]`}
                    disabled={!search.trim()}
                  >
                    <SearchIcon className="h-4 w-4" />
                    <span>{t("mapExplorer.searchButton")}</span>
                  </button>
                </div>
              </form>

              {/* Enhanced Location Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleZoomToUser}
                  className={`${styles.modernButton} ${styles.secondaryButton} text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 whitespace-nowrap min-w-[140px]`}
                >
                  <NavigationIcon className="h-4 w-4" />
                  <span>{t("mapExplorer.zoomButton")}</span>
                </button>
                
                {/* Additional Quick Actions */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className={`${styles.statusIndicator} px-3 py-2`}>
                    <LayersIcon className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold">Interactive Map</span>
                  </div>
                  <div className={`${styles.statusIndicator} px-3 py-2`}>
                    <EyeIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold">Real-time View</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-only Quick Stats */}
            <div className="flex lg:hidden items-center justify-center space-x-4 mt-3 pt-3 border-t border-gray-200">
              <div className={`${styles.statusIndicator} px-2 py-1`}>
                <LayersIcon className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium">Interactive</span>
              </div>
              <div className={`${styles.statusIndicator} px-2 py-1`}>
                <EyeIcon className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium">Real-time</span>
              </div>
              <div className={`${styles.statusIndicator} px-2 py-1`}>
                <ZapIcon className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-medium">Live Data</span>
              </div>
            </div>
          </div>
        </MapContainer>
      </div>
    </MainLayout>
  );
};
export default MapExplorer;