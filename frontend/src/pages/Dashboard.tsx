import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DropletIcon, CloudRainIcon, FileTextIcon, BookOpenIcon, MapIcon, BarChart2Icon } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from "react-i18next";

const Dashboard: React.FC = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [city, setCity] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, name: string} | null>(null);

  // Rainfall chart data state
  const [rainfallChartData, setRainfallChartData] = useState<{ 
    time: Date[]; 
    temperature_2m: number[];
    precipitation: number[]; 
    precipitation_probability: number[];
    rain: number[]; 
    showers: number[];
    weather_code: number[];
    relative_humidity_2m: number[];
    evapotranspiration: number[];
    cloud_cover_low: number[];
    cloud_cover_mid: number[];
    cloud_cover_high: number[];
    wind_speed_10m: number[];
    soil_temperature_0cm: number[];
    soil_moisture_0_to_1cm: number[];
  } | null>(null);

    // Fetch user info from backend
useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token'); // ⬅️ get token from localStorage
      if (!token) return; // user not logged in

      try {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const normalizedBase = baseUrl.replace(/\/$/, '');
        const res = await fetch(`${normalizedBase}/api/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // ⬅️ attach token
          }
        });
        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        setUserName(data.fullName || 'User');
      } catch (err) {
        console.error('Error fetching user:', err);
        setUserName('User');
      }
    };

    fetchUser();
  }, []); // empty dependency → runs once on mount

  // Fetch weather data by city name
  const fetchWeatherByCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    
    setWeatherLoading(true);
    setWeatherError(null);
    
    try {
      // Get coordinates from city name using Nominatim
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
      const geoData = await geoRes.json();
      
      if (!geoData.length) {
        throw new Error('City not found');
      }
      
      const lat = parseFloat(geoData[0].lat);
      const lng = parseFloat(geoData[0].lon);
      
      // Update current location
      setCurrentLocation({
        lat,
        lng,
        name: geoData[0].display_name || city
      });
      
      // Fetch weather data for this location
      await fetchRainfallData(lat, lng);
      
    } catch (error) {
      setWeatherError((error as Error).message || 'Error fetching weather data');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch weather data using current geolocation
  const fetchWeatherByLocation = () => {
    setWeatherLoading(true);
    setWeatherError(null);
    
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const lat = coords.latitude;
          const lng = coords.longitude;
          
          // Update current location
          setCurrentLocation({
            lat,
            lng,
            name: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
          });
          
          // Fetch weather data for this location
          await fetchRainfallData(lat, lng);
          
        } catch (error) {
          setWeatherError((error as Error).message || 'Error fetching weather data');
        } finally {
          setWeatherLoading(false);
        }
      },
      (error) => {
        setWeatherLoading(false);
        setWeatherError('Location access denied. Please enable location services or search by city.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Extract fetchRainfallData function to be reusable
  const fetchRainfallData = async (latitude: number, longitude: number) => {
    try {
      console.log(`Fetching rainfall data for: ${latitude}, ${longitude}`);
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,precipitation_probability,rain,showers,weather_code,relative_humidity_2m,evapotranspiration,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_to_1cm`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.hourly && data.hourly.time) {
        const time = data.hourly.time.map((t: string) => new Date(t));
        const chartData = {
          time,
          temperature_2m: data.hourly.temperature_2m || [],
          precipitation: data.hourly.precipitation || [],
          precipitation_probability: data.hourly.precipitation_probability || [],
          rain: data.hourly.rain || [],
          showers: data.hourly.showers || [],
          weather_code: data.hourly.weather_code || [],
          relative_humidity_2m: data.hourly.relative_humidity_2m || [],
          evapotranspiration: data.hourly.evapotranspiration || [],
          cloud_cover_low: data.hourly.cloud_cover_low || [],
          cloud_cover_mid: data.hourly.cloud_cover_mid || [],
          cloud_cover_high: data.hourly.cloud_cover_high || [],
          wind_speed_10m: data.hourly.wind_speed_10m || [],
          soil_temperature_0cm: data.hourly.soil_temperature_0cm || [],
          soil_moisture_0_to_1cm: data.hourly.soil_moisture_0_to_1cm || []
        };
        
        console.log('Chart data processed:', chartData);
        setRainfallChartData(chartData);
      } else {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid weather data received');
      }
    } catch (error) {
      console.error('Error fetching rainfall data:', error);
      throw error; // Re-throw to be handled by calling function
    }
  };

  // Fetch rainfall chart data for user's location on mount
  useEffect(() => {
    // Try to get user's location
    console.log('Requesting geolocation...');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        console.log('Geolocation success:', coords.latitude, coords.longitude);
        try {
          await fetchRainfallData(coords.latitude, coords.longitude);
        } catch (error) {
          console.error('Error fetching rainfall data:', error);
          // Create sample data with the new structure for testing if API fails
          const now = new Date();
          const sampleData = {
            time: Array.from({ length: 24 }, (_, i) => new Date(now.getTime() + i * 60 * 60 * 1000)),
            temperature_2m: Array.from({ length: 24 }, () => 20 + Math.random() * 15),
            precipitation: Array.from({ length: 24 }, () => Math.random() * 5),
            precipitation_probability: Array.from({ length: 24 }, () => Math.random() * 100),
            rain: Array.from({ length: 24 }, () => Math.random() * 3),
            showers: Array.from({ length: 24 }, () => Math.random() * 2),
            weather_code: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
            relative_humidity_2m: Array.from({ length: 24 }, () => 40 + Math.random() * 40),
            evapotranspiration: Array.from({ length: 24 }, () => Math.random() * 2),
            cloud_cover_low: Array.from({ length: 24 }, () => Math.random() * 100),
            cloud_cover_mid: Array.from({ length: 24 }, () => Math.random() * 100),
            cloud_cover_high: Array.from({ length: 24 }, () => Math.random() * 100),
            wind_speed_10m: Array.from({ length: 24 }, () => Math.random() * 20),
            soil_temperature_0cm: Array.from({ length: 24 }, () => 15 + Math.random() * 20),
            soil_moisture_0_to_1cm: Array.from({ length: 24 }, () => Math.random() * 0.5)
          };
          console.log('Using sample data:', sampleData);
          setRainfallChartData(sampleData);
        }
      },
      async (error) => {
        console.warn('Geolocation error:', error);
        // Fallback to Berlin coordinates (from your API example)
        console.log('Using fallback location: Berlin');
        try {
          await fetchRainfallData(52.52, 13.41);
        } catch (error) {
          console.error('Error fetching fallback data:', error);
          // Create sample data
          const now = new Date();
          const sampleData = {
            time: Array.from({ length: 24 }, (_, i) => new Date(now.getTime() + i * 60 * 60 * 1000)),
            temperature_2m: Array.from({ length: 24 }, () => 20 + Math.random() * 15),
            precipitation: Array.from({ length: 24 }, () => Math.random() * 5),
            precipitation_probability: Array.from({ length: 24 }, () => Math.random() * 100),
            rain: Array.from({ length: 24 }, () => Math.random() * 3),
            showers: Array.from({ length: 24 }, () => Math.random() * 2),
            weather_code: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
            relative_humidity_2m: Array.from({ length: 24 }, () => 40 + Math.random() * 40),
            evapotranspiration: Array.from({ length: 24 }, () => Math.random() * 2),
            cloud_cover_low: Array.from({ length: 24 }, () => Math.random() * 100),
            cloud_cover_mid: Array.from({ length: 24 }, () => Math.random() * 100),
            cloud_cover_high: Array.from({ length: 24 }, () => Math.random() * 100),
            wind_speed_10m: Array.from({ length: 24 }, () => Math.random() * 20),
            soil_temperature_0cm: Array.from({ length: 24 }, () => 15 + Math.random() * 20),
            soil_moisture_0_to_1cm: Array.from({ length: 24 }, () => Math.random() * 0.5)
          };
          console.log('Using sample data:', sampleData);
          setRainfallChartData(sampleData);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  }, []);

  const quickActions = [
    {
      title: t("quickActions.startAssessment"),
      icon: <DropletIcon className="h-8 w-8 text-blue-600" />,
      description: t("quickActions.startAssessmentDesc"),
      action: () => navigate('/assessment'),
      color: 'bg-blue-50'
    },
    {
      title:t("quickActions.myReports"),
      icon: <FileTextIcon className="h-8 w-8 text-green-600" />,
      description:t("quickActions.myReportsDesc"),
      action: () => navigate('/reports'),
      color: 'bg-green-50'
    },
    {
      title: t("quickActions.localRainfall"),
      icon: <CloudRainIcon className="h-8 w-8 text-cyan-600" />,
      description:t("quickActions.localRainfallDesc"),
      action: () =>navigate('/roof-analysis'),
      color: 'bg-cyan-50'
    },
    {
      title: t("quickActions.knowledgeHub"),
      icon: <BookOpenIcon className="h-8 w-8 text-purple-600" />,
      description:t("quickActions.knowledgeHubDesc"),
      action: () => navigate('/knowledge'),
      color: 'bg-purple-50'
    }
  ];
  return <MainLayout>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">
       {t("welcome")} {userName} !
      </h1>
      <p className="text-gray-600">
        {t("subtitle")}
      </p>
    </div>
    {/* Weather Data from API */}
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Current Weather Forecast</h2>
      
      {/* Search and Location Controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={fetchWeatherByCity} className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={weatherLoading}
              />
              <button
                type="submit"
                disabled={weatherLoading || !city.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {weatherLoading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </form>
          <button
            onClick={fetchWeatherByLocation}
            disabled={weatherLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            📍 Use My Location
          </button>
        </div>
        
        {/* Loading and Error Display */}
        {weatherLoading && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              Fetching weather data...
            </div>
          </div>
        )}
        
        {weatherError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
            <strong>Error:</strong> {weatherError}
          </div>
        )}
        
        {currentLocation && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg">
            <strong>Current Location:</strong> {currentLocation.name}
          </div>
        )}
      </div>
      
      <Card className="p-4 sm:p-6">
        {rainfallChartData ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Live Weather Data for Your Location</h3>
              <div className="text-sm text-gray-600 mb-4">
                Data from Open-Meteo API • Updated hourly • Based on your coordinates
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Temperature (2m) */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Temperature (2m)</div>
                <div className="text-2xl font-bold text-orange-700">{rainfallChartData.temperature_2m[0]?.toFixed(1) || 0}°C</div>
              </div>
              
              {/* Precipitation */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Precipitation</div>
                <div className="text-2xl font-bold text-blue-700">{rainfallChartData.precipitation[0]?.toFixed(1) || 0} mm</div>
              </div>
              
              {/* Precipitation Probability */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Precipitation Probability</div>
                <div className="text-2xl font-bold text-yellow-700">{rainfallChartData.precipitation_probability[0]?.toFixed(0) || 0}%</div>
              </div>
              
              {/* Rain */}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="text-sm text-cyan-600 font-medium">Rain</div>
                <div className="text-2xl font-bold text-cyan-700">{rainfallChartData.rain[0]?.toFixed(1) || 0} mm</div>
              </div>
              
              {/* Showers */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Showers</div>
                <div className="text-2xl font-bold text-purple-700">{rainfallChartData.showers[0]?.toFixed(1) || 0} mm</div>
              </div>
              
              {/* Weather Code */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium">Weather Code</div>
                <div className="text-2xl font-bold text-gray-700">{rainfallChartData.weather_code[0] || 0}</div>
              </div>
              
              {/* Relative Humidity */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Relative Humidity</div>
                <div className="text-2xl font-bold text-green-700">{rainfallChartData.relative_humidity_2m[0]?.toFixed(0) || 0}%</div>
              </div>
              
              {/* Evapotranspiration */}
              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="text-sm text-teal-600 font-medium">Evapotranspiration</div>
                <div className="text-2xl font-bold text-teal-700">{rainfallChartData.evapotranspiration[0]?.toFixed(2) || 0} mm</div>
              </div>
              
              {/* Cloud Cover Low */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 font-medium">Cloud Cover Low</div>
                <div className="text-2xl font-bold text-slate-700">{rainfallChartData.cloud_cover_low[0]?.toFixed(0) || 0}%</div>
              </div>
              
              {/* Cloud Cover Mid */}
              <div className="bg-zinc-50 p-4 rounded-lg">
                <div className="text-sm text-zinc-600 font-medium">Cloud Cover Mid</div>
                <div className="text-2xl font-bold text-zinc-700">{rainfallChartData.cloud_cover_mid[0]?.toFixed(0) || 0}%</div>
              </div>
              
              {/* Cloud Cover High */}
              <div className="bg-stone-50 p-4 rounded-lg">
                <div className="text-sm text-stone-600 font-medium">Cloud Cover High</div>
                <div className="text-2xl font-bold text-stone-700">{rainfallChartData.cloud_cover_high[0]?.toFixed(0) || 0}%</div>
              </div>
              
              {/* Wind Speed 10m */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium">Wind Speed (10m)</div>
                <div className="text-2xl font-bold text-indigo-700">{rainfallChartData.wind_speed_10m[0]?.toFixed(1) || 0} m/s</div>
              </div>
              
              {/* Soil Temperature */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-600 font-medium">Soil Temperature (0cm)</div>
                <div className="text-2xl font-bold text-amber-700">{rainfallChartData.soil_temperature_0cm[0]?.toFixed(1) || 0}°C</div>
              </div>
              
              {/* Soil Moisture */}
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-emerald-600 font-medium">Soil Moisture (0-1cm)</div>
                <div className="text-2xl font-bold text-emerald-700">{rainfallChartData.soil_moisture_0_to_1cm[0]?.toFixed(3) || 0}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              Data timestamp: {rainfallChartData.time[0]?.toLocaleString() || 'Loading...'}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-lg font-medium">Loading weather data...</div>
            <div className="text-sm mt-2">Fetching data from Open-Meteo API</div>
          </div>
        )}
      </Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {quickActions.map((action, index) => <Card key={index} className="flex items-start p-6 hover:shadow-md transition-all cursor-pointer" onClick={action.action}>
        <div className={`p-4 rounded-lg mr-4 ${action.color}`}>
          {action.icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
          <p className="text-gray-600">{action.description}</p>
        </div>
      </Card>)}
    </div>
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{t("mapPreview")}</h2>
      <Card className="overflow-hidden">
        <div className="bg-gray-100 h-64 relative">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
          }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="primary" onClick={() => navigate('/map')} icon={<MapIcon size={16} />}>
              {t("exploreGIS")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("rainfallPatterns")}</h2>
        <Card className="h-64 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{t("rainfallChartTitle")}</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => window.location.reload()} 
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                Refresh Data
              </button>
              <span className="text-sm text-gray-500">{t("today")}</span>
            </div>
          </div>
          {rainfallChartData && (
            <div className="mb-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
              📍 Data loaded: {rainfallChartData.time.length} hours • 
              Max precipitation: {Math.max(...rainfallChartData.precipitation).toFixed(1)}mm • 
              Precipitation probability: {Math.max(...rainfallChartData.precipitation_probability).toFixed(0)}% •
              Temperature range: {Math.min(...rainfallChartData.temperature_2m).toFixed(1)}°C - {Math.max(...rainfallChartData.temperature_2m).toFixed(1)}°C
            </div>
          )}
          <div className="relative h-48">
            {rainfallChartData ? (
              <div>
                {/* Enhanced Chart Display */}
                <div className="absolute bottom-8 left-0 right-0 flex items-end justify-between h-32 px-2">
                  {rainfallChartData.time.slice(0, 12).map((timePoint, i) => {
                    const precipitation = rainfallChartData.precipitation[i] || 0;
                    const rain = rainfallChartData.rain[i] || 0;
                    const showers = rainfallChartData.showers[i] || 0;
                    const temperature = rainfallChartData.temperature_2m[i] || 0;
                    const precipitation_probability = rainfallChartData.precipitation_probability[i] || 0;
                    const humidity = rainfallChartData.relative_humidity_2m[i] || 0;
                    const wind_speed = rainfallChartData.wind_speed_10m[i] || 0;
                    const cloud_cover_total = (
                      (rainfallChartData.cloud_cover_low[i] || 0) + 
                      (rainfallChartData.cloud_cover_mid[i] || 0) + 
                      (rainfallChartData.cloud_cover_high[i] || 0)
                    ) / 3;
                    
                    // Scale the values for better visibility
                    const precipitationHeight = precipitation > 0 ? Math.max(precipitation * 15, 4) : 2;
                    const rainHeight = rain > 0 ? Math.max(rain * 15, 3) : 0;
                    const showersHeight = showers > 0 ? Math.max(showers * 15, 3) : 0;
                    
                    return (
                      <div key={i} className="flex flex-col items-center group relative">
                        {/* Enhanced Tooltip with all API data */}
                        <div className="absolute -top-28 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 shadow-lg">
                          <div className="font-semibold border-b border-gray-600 pb-1 mb-1">
                            {timePoint.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              hour12: true 
                            })}
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex justify-between gap-4">
                              <span>Precipitation:</span>
                              <span className="font-medium text-blue-300">{precipitation.toFixed(1)}mm</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Rain:</span>
                              <span className="font-medium text-cyan-300">{rain.toFixed(1)}mm</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Showers:</span>
                              <span className="font-medium text-purple-300">{showers.toFixed(1)}mm</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Probability:</span>
                              <span className="font-medium text-yellow-300">{precipitation_probability.toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Temperature:</span>
                              <span className="font-medium text-orange-300">{temperature.toFixed(1)}°C</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Humidity:</span>
                              <span className="font-medium text-green-300">{humidity.toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Wind:</span>
                              <span className="font-medium text-indigo-300">{wind_speed.toFixed(1)} m/s</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Cloud Cover:</span>
                              <span className="font-medium text-gray-300">{cloud_cover_total.toFixed(0)}%</span>
                            </div>
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                        
                        {/* Main precipitation bar */}
                        <div 
                          className="w-8 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 shadow-sm"
                          style={{ 
                            height: `${Math.min(precipitationHeight, 100)}px`,
                            minHeight: '2px'
                          }}
                        ></div>
                        
                        {/* Rain overlay */}
                        {rain > 0 && (
                          <div 
                            className="w-6 bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-400 rounded-t-md absolute bottom-6 transition-all duration-300"
                            style={{ 
                              height: `${Math.min(rainHeight, 80)}px`,
                              minHeight: '3px'
                            }}
                          ></div>
                        )}
                        
                        {/* Showers overlay */}
                        {showers > 0 && (
                          <div 
                            className="w-4 bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400 rounded-t-md absolute bottom-6 transition-all duration-300"
                            style={{ 
                              height: `${Math.min(showersHeight, 60)}px`,
                              minHeight: '3px'
                            }}
                          ></div>
                        )}
                        
                        {/* Time label */}
                        <div className="mt-1 text-center">
                          <span className="text-xs font-medium text-gray-700">
                            {timePoint.getHours()}:00
                          </span>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {temperature.toFixed(0)}°C
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Enhanced Legend */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-50 rounded-b-lg py-2">
                  <div className="flex justify-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm shadow-sm"></div>
                      <span className="text-xs font-medium text-gray-700">Precipitation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-sm shadow-sm"></div>
                      <span className="text-xs font-medium text-gray-700">Rain</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-sm shadow-sm"></div>
                      <span className="text-xs font-medium text-gray-700">Showers</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                <div className="text-sm font-medium">Loading rainfall data...</div>
                <div className="text-xs mt-1">Getting your location weather forecast</div>
              </div>
            )}
          </div>
        </Card>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("potentialSavings")}</h2>
        <Card className="h-64 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium">{t("estimatedSavings")}</h3>
            <BarChart2Icon className="text-green-600" />
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-full mb-3">
              <DropletIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">14,500</h3>
            <p className="text-gray-600">{t("litersPerYear")}</p>
            <div className="mt-4 text-sm text-gray-600">
              {t("completeAssessment")}
            </div>
          </div>
        </Card>
      </div>
    </div>
  </MainLayout>;
};
export default Dashboard;