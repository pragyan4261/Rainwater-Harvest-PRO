import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MainLayout from '../layouts/MainLayout';
import { useMap } from '../hooks/useMap';
import { useTranslation } from "react-i18next";
import L from 'leaflet';

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

const { BaseLayer } = LayersControl;

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

  // Precipitation heatmap state
  const [showPrecipitationHeatmap, setShowPrecipitationHeatmap] = useState(false);
  const [precipitationOpacity, setPrecipitationOpacity] = useState(0.8);
  const precipitationLayerRef = useRef<L.TileLayer | null>(null);

  // Tomorrow.io API configuration
  const TOMORROW_API_KEY = 'BTEvHO0kVYUl4eNcrogWQnwFsEon7S1a';
  const DATA_FIELD = 'precipitationIntensity';
  const TIMESTAMP = (new Date()).toISOString();

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

  // Toggle precipitation heatmap
  const togglePrecipitationHeatmap = () => {
    const map = mapRef.current;
    if (!map) return;

    if (showPrecipitationHeatmap) {
      // Remove precipitation layer
      if (precipitationLayerRef.current) {
        map.removeLayer(precipitationLayerRef.current);
        precipitationLayerRef.current = null;
      }
      setShowPrecipitationHeatmap(false);
    } else {
      // Add precipitation layer with enhanced visibility
      const precipitationLayer = L.tileLayer(
        `https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/${DATA_FIELD}/${TIMESTAMP}.png?apikey=${TOMORROW_API_KEY}`,
        {
          attribution: '&copy; <a href="https://www.tomorrow.io/weather-api">Tomorrow.io Weather API</a>',
          opacity: precipitationOpacity, // Use dynamic opacity
          zIndex: 1000,
          className: 'precipitation-layer' // Custom class for styling
        }
      );
      precipitationLayer.addTo(map);
      precipitationLayerRef.current = precipitationLayer;
      setShowPrecipitationHeatmap(true);
    }
  };

  // Handle opacity change for precipitation layer
  const handleOpacityChange = (newOpacity: number) => {
    setPrecipitationOpacity(newOpacity);
    if (precipitationLayerRef.current) {
      precipitationLayerRef.current.setOpacity(newOpacity);
    }
  };

  // Refresh precipitation data with current timestamp
  const refreshPrecipitationData = () => {
    if (!showPrecipitationHeatmap || !mapRef.current) return;

    // Remove current layer
    if (precipitationLayerRef.current) {
      mapRef.current.removeLayer(precipitationLayerRef.current);
    }

    // Add new layer with updated timestamp
    const newTimestamp = new Date().toISOString();
    const precipitationLayer = L.tileLayer(
      `https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/${DATA_FIELD}/${newTimestamp}.png?apikey=${TOMORROW_API_KEY}`,
      {
        attribution: '&copy; <a href="https://www.tomorrow.io/weather-api">Tomorrow.io Weather API</a>',
        opacity: precipitationOpacity,
        zIndex: 1000,
        className: 'precipitation-layer'
      }
    );
    precipitationLayer.addTo(mapRef.current);
    precipitationLayerRef.current = precipitationLayer;
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">RainWise {t("mapExplorer.title")}</h1>
          <p className="text-gray-600">
            {t("mapExplorer.subtitle")}
          </p>
        </div>
      </div>
      <div className="relative h-[calc(100vh-200px)] min-h-[500px] rounded-xl overflow-hidden">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={20}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          {/* Measurement Controls (overlay) */}
          <div className="absolute top-2 left-2 z-[1100] flex flex-col gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded shadow pointer-events-auto text-xs sm:text-sm max-w-[200px]">
            {!isMeasuring && (
              <button onClick={startMeasurement} className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500">Start Measure</button>
            )}
            {isMeasuring && (
              <>
                <div className="font-medium text-gray-800">Click map to add points</div>
                <button onClick={finishMeasurement} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500">Finish</button>
                <button onClick={resetMeasurement} className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-400">Reset</button>
              </>
            )}
            {!isMeasuring && measurePoints.length > 1 && (
              <button onClick={resetMeasurement} className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-400">Clear</button>
            )}
            <div className="mt-1 text-gray-700">
              Distance: {(totalDistance / 1000).toFixed(3)} km
            </div>
            {measurePoints.length > 1 && isMeasuring && (
              <div className="text-[10px] text-gray-500">(Click Finish to lock)</div>
            )}
            {/* Precipitation Heatmap Toggle */}
            <div className="mt-2 border-t border-gray-300 pt-2">
              <button
                onClick={togglePrecipitationHeatmap}
                className={`w-full px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 ${showPrecipitationHeatmap
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${showPrecipitationHeatmap ? 'bg-white' : 'bg-blue-500'}`}></span>
                {showPrecipitationHeatmap ? '🌧️ Hide Rain Data' : '🌦️ Show Rain Data'}
              </button>
              {showPrecipitationHeatmap && (
                <div className="mt-2 p-2 bg-white/95 rounded border text-[10px]">
                  <div className="font-medium text-gray-800 mb-1">Precipitation Intensity</div>
                  <div className="flex items-center justify-between text-gray-600 mb-2">
                    <span>Light</span>
                    <div className="flex-1 mx-2 h-2 rounded bg-gradient-to-r from-transparent via-blue-300 to-blue-600"></div>
                    <span>Heavy</span>
                  </div>

                  {/* Opacity Control */}
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <div className="flex items-center justify-between text-gray-600 mb-1">
                      <label htmlFor="precipitation-opacity" className="text-[10px]">Transparency</label>
                      <span className="text-blue-600 font-medium">{Math.round(precipitationOpacity * 100)}%</span>
                    </div>
                    <input
                      id="precipitation-opacity"
                      type="range"
                      min="0.2"
                      max="1"
                      step="0.1"
                      value={precipitationOpacity}
                      onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                      className="w-full precipitation-opacity-slider"
                      title="Adjust precipitation layer transparency"
                    />
                  </div>

                  <div className="text-center text-gray-500 mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                      <span>Live weather data</span>
                    </div>
                    <button
                      onClick={refreshPrecipitationData}
                      className="text-blue-600 hover:text-blue-700 text-[10px] underline"
                      title="Refresh precipitation data"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <LayersControl position="topright" collapsed={true}>
            <BaseLayer checked name="🗺️ Street Map">
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
            </BaseLayer>
            <BaseLayer name="🛰️ Satellite View">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </BaseLayer>
            <BaseLayer name="🗺️ Terrain View">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                maxZoom={17}
              />
            </BaseLayer>
          </LayersControl>
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
          {/* Responsive controls at bottom for mobile */}
          <div className="absolute bottom-0 left-0 w-full z-[1100] flex flex-col sm:flex-row sm:justify-between gap-2 p-4 pointer-events-auto">
            <form
              onSubmit={handleSearch}
              className="flex-1 bg-white rounded-lg shadow-md p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("mapExplorer.searchPlaceholder")}
                className="flex-1 py-2 px-2 text-sm focus:outline-none rounded"
              />
              <button type="submit" className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded">{t("mapExplorer.searchButton")}</button>
            </form>
            <button
              onClick={handleZoomToUser}
              className="w-full sm:w-auto px-3 py-2 bg-green-600 text-white rounded shadow"
            >
              {t("mapExplorer.zoomButton")}
            </button>
          </div>
        </MapContainer>
      </div>
    </MainLayout>
  );
};
export default MapExplorer;