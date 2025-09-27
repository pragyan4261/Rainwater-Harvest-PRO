import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import {
  DownloadIcon,
  ShareIcon,
  CheckCircleIcon,
  CloudRainIcon,
  HomeIcon,
  DropletIcon,
  BarChart2Icon,
  ZapIcon,
  BeakerIcon,
  ArrowBigRightDashIcon,
} from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { weatherService, type WeatherData } from "../../services/weatherService";

interface AssessmentData {
  feasibility: string;
  feasibilityDescription: string;
  roofArea: number;
  rainfall: number;
  potentialHarvest: number;
  tankVolume: number;
  efficiency: number;
  inertia: number;
  recommendedStructures: { name: string; description: string }[];
  rainfallDistribution: number[]; // [12 months]
  groundwaterLevel: number;
  latitude?: number;
  longitude?: number;
  costEstimation: {
    storageTank: number;
    rechargePit: number;
    guttersPipes: number;
    filtrationSystem: number;
    installation: number;
    total: number;
    currency?: string;
  };
  roi: {
    annualSavings: number;
    paybackPeriod: string;
    waterSaved: number;
    runoffReduction: string;
    currency?: string;
  };
  currency?: string;
  modelVersion?: string;
}

const AssessmentResults: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/assessments/latest", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch assessment data");
        }
        const result = await response.json();
        setData(result);
        
        // Fetch weather data if coordinates are available
        if (result.latitude && result.longitude) {
          try {
            setWeatherLoading(true);
            const weather = await weatherService.getWeatherData(
              parseFloat(result.latitude),
              parseFloat(result.longitude)
            );
            setWeatherData(weather);
          } catch (weatherError) {
            console.error("Failed to fetch weather data:", weatherError);
            // Continue without weather data - fallback to original rainfall chart
          } finally {
            setWeatherLoading(false);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading assessment results...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600">{error || "No data available"}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assessment Results</h1>
          <p className="text-gray-600">
            My Home Assessment • {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<ShareIcon size={16} />}>
            Share
          </Button>
          <Button variant="outline" icon={<DownloadIcon size={16} />}>
            {t('results.savePdf')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== LEFT SECTION ===== */}
        <div className="lg:col-span-2">
          <Card className="mb-6 p-6">
            {/* Feasibility */}
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">
                  Feasibility: {data?.feasibility || "N/A"}
                </h2>
                <p className="text-gray-600">
                  {data?.feasibilityDescription || "No description available"}
                </p>
              </div>
            </div>

            {/* Roof, Rainfall, Harvest */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <HomeIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Roof Area</h3>
                <p className="text-2xl font-bold text-blue-700">
                  {data?.roofArea || 0} m²
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <CloudRainIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Annual Rainfall</h3>
                <p className="text-2xl font-bold text-green-700">
                  {data?.rainfall || 0} mm
                </p>
              </div>
              <div className="bg-slate-100 rounded-lg p-4 text-center">
                <DropletIcon className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                <h3 className="font-semibold">Potential Harvest</h3>
                <p className="text-2xl font-bold text-cyan-700">
                  {(data?.potentialHarvest || 0).toLocaleString()} L
                </p>
              </div>
                <div className="bg-cyan-200 rounded-lg p-4 text-center">
                <BeakerIcon className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                <h3 className="font-semibold">Recommended tank volume</h3>
                <p className="text-2xl font-bold text-cyan-700">
                  {(data?.tankVolume || 0).toLocaleString()} L
                </p>
              </div>
              <div className="bg-cyan-200 rounded-lg p-4 text-center">
                <ZapIcon className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                <h3 className="font-semibold">Efficiency</h3>
                <p className="text-2xl font-bold text-cyan-700">
                  {(data?.efficiency || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-cyan-200 rounded-lg p-4 text-center">
                <ArrowBigRightDashIcon className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                <h3 className="font-semibold">Inertia</h3>
                <p className="text-2xl font-bold text-cyan-700">
                  {(data?.inertia || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Structures */}
            <h3 className="font-semibold text-lg mb-3">Recommended Structures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {data?.recommendedStructures?.length ? (
                data.recommendedStructures.map((s, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 flex">
                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                      <DropletIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{s.name}</h4>
                      <p className="text-gray-600 text-sm">{s.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No structures recommended.</p>
              )}
            </div>

            {/* Live Weather Data & Rainfall Distribution */}
            <h3 className="font-semibold text-lg mb-3">
              {weatherData ? "Live Weather Data & Rainfall Distribution" : "Rainfall Distribution"}
            </h3>
            
            {weatherLoading && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
                <p className="text-blue-600">🌦️ Loading live weather data...</p>
              </div>
            )}
            
            {weatherData ? (
              <div className="space-y-6 mb-6">
                {/* Current Weather Conditions */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
                  <h4 className="font-medium mb-4">Current Weather Conditions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {weatherData.current.temperature_2m.toFixed(1)}°C
                      </div>
                      <div className="text-sm text-gray-600">Temperature</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-700">
                        {weatherData.current.rain.toFixed(1)} mm
                      </div>
                      <div className="text-sm text-gray-600">Current Rain</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">
                        {weatherData.current.cloud_cover.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Cloud Cover</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {weatherData.current.precipitation.toFixed(1)} mm
                      </div>
                      <div className="text-sm text-gray-600">Precipitation</div>
                    </div>
                  </div>
                </div>

                {/* 7-Day Rainfall Chart */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <CloudRainIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">7-Day Rainfall Distribution</h4>
                        <p className="text-xs text-gray-500">Live weather data for your location</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">Total</div>
                      <div className="text-lg font-bold text-blue-600">
                        {weatherData.daily.rain_sum && weatherService.getWeeklyRainfall(weatherData.daily.rain_sum).reduce((sum, val) => sum + val, 0).toFixed(1)} mm
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Chart Container */}
                  <div className="relative h-64 bg-gradient-to-t from-gray-50 to-transparent rounded-lg p-4">
                    {/* Grid Lines */}
                    <div className="absolute inset-4 flex flex-col justify-between pointer-events-none">
                      {[0, 25, 50, 75, 100].map((percent) => (
                        <div key={percent} className="h-px bg-gray-200 opacity-40"></div>
                      ))}
                    </div>
                    
                    {/* Y-Axis Labels */}
                    <div className="absolute left-0 top-4 bottom-12 flex flex-col justify-between text-xs text-gray-400">
                      {weatherData.daily.rain_sum && (() => {
                        const weeklyData = weatherService.getWeeklyRainfall(weatherData.daily.rain_sum);
                        const maxRain = Math.max(...weeklyData);
                        return [maxRain, maxRain * 0.75, maxRain * 0.5, maxRain * 0.25, 0].map((val, i) => (
                          <span key={i} className="leading-none">
                            {val.toFixed(1)}
                          </span>
                        ));
                      })()}
                    </div>
                    
                    {/* Chart Bars */}
                    <div className="absolute bottom-12 left-8 right-4 flex items-end justify-around h-44">
                      {weatherData.daily.rain_sum && weatherService.getWeeklyRainfall(weatherData.daily.rain_sum).map((rainfall, i) => {
                        const weeklyData = weatherService.getWeeklyRainfall(weatherData.daily.rain_sum || new Float32Array());
                        const maxRain = Math.max(...weeklyData);
                        const height = maxRain > 0 ? (rainfall / maxRain) * 100 : 0;
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        const isToday = i === 6;
                        const isHighRain = rainfall > maxRain * 0.7;
                        
                        return (
                          <div key={i} className="flex flex-col items-center group cursor-pointer transform hover:scale-110 transition-all duration-300">
                            {/* Tooltip */}
                            <div className="absolute -top-16 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              <div className="font-semibold">{rainfall.toFixed(1)} mm</div>
                              <div className="text-gray-300">
                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </div>
                            
                            {/* Bar */}
                            <div className="relative">
                              <div
                                className={`w-10 rounded-t-lg shadow-lg transition-all duration-500 ease-out relative ${
                                  isToday 
                                    ? 'bg-gradient-to-t from-orange-500 to-orange-300 ring-2 ring-orange-200' 
                                    : isHighRain
                                      ? 'bg-gradient-to-t from-blue-700 to-blue-500'
                                      : rainfall > 0
                                        ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                                        : 'bg-gradient-to-t from-gray-300 to-gray-200'
                                } group-hover:shadow-xl`}
                                style={{ 
                                  height: `${Math.max(height, rainfall > 0 ? 4 : 0)}%`
                                } as React.CSSProperties}
                              >
                                {/* Rain drop animation for active bars */}
                                {rainfall > 0 && (
                                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Value label on hover */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-md text-xs font-semibold whitespace-nowrap">
                                {rainfall.toFixed(1)}mm
                              </div>
                            </div>
                            
                            {/* Date Labels */}
                            <div className="mt-3 text-center">
                              <div className={`text-xs font-medium ${isToday ? 'text-orange-600' : 'text-gray-600'}`}>
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                              <div className={`text-xs ${isToday ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                                {date.getDate()}/{date.getMonth() + 1}
                              </div>
                              {isToday && (
                                <div className="text-xs text-orange-600 font-semibold">Today</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Enhanced Footer with Statistics */}
                  <div className="mt-6 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm"></div>
                        <span className="text-gray-600">Regular rain</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-t from-blue-700 to-blue-500 rounded-sm"></div>
                        <span className="text-gray-600">Heavy rain</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-t from-orange-500 to-orange-300 rounded-sm"></div>
                        <span className="text-gray-600">Today</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-500">
                      <span>📊 Avg: {weatherData.daily.rain_sum && (weatherService.getWeeklyRainfall(weatherData.daily.rain_sum).reduce((sum, val) => sum + val, 0) / 7).toFixed(1)} mm/day</span>
                      <span>•</span>
                      <span>🌐 Open-Meteo API</span>
                    </div>
                  </div>
                  
                  {/* Rain Status Indicator */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          weatherData.current.rain > 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700">
                          {weatherData.current.rain > 0 ? '🌧️ Currently Raining' : '☀️ No Current Rain'}
                        </span>
                      </div>
                      <div className="text-sm text-blue-600 font-semibold">
                        {weatherData.current.rain.toFixed(1)} mm/h
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Fallback to original rainfall distribution
              <div className="bg-gray-50 rounded-lg p-4 h-64 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">{t('results.monthlyPrecipitation')}</h4>
                  <span className="text-sm text-gray-500">{t('results.mmPerMonth')}</span>
                </div>
                <div className="relative h-48">
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-40">
                    {data?.rainfallDistribution?.length ? (
                      data.rainfallDistribution.map((value, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div
                            className="w-6 bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                            style={{ height: `${(value / 180) * 100}%` } as React.CSSProperties}
                          ></div>
                          <span className="text-xs mt-1 text-gray-600">
                            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No rainfall data</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Groundwater */}
            <h3 className="font-semibold text-lg mb-3">Groundwater Level Prediction</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Surface Level</span>
                <span className="text-sm text-gray-500">Predicted Depth</span>
              </div>
              <div className="relative h-16 bg-gradient-to-b from-blue-100 to-blue-300 rounded-md">
                <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-blue-600"></div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {data?.groundwaterLevel || 0}m
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-600">
                  The <strong>groundwater level</strong> in your area is at <span className="font-semibold text-blue-600">{data?.groundwaterLevel || 0}m</span> depth.
                </p>
                <p className="text-xs text-gray-500">
                  Prediction based on historical data from your district. This depth is {(data?.groundwaterLevel || 0) < 10 ? 'suitable' : 'challenging'} for recharge structures.
                </p>
                {data?.groundwaterLevel && data.groundwaterLevel > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    💧 <strong>Recommendation:</strong> {
                      data.groundwaterLevel < 5 ? 'Shallow groundwater - ideal for recharge pits' :
                      data.groundwaterLevel < 10 ? 'Moderate depth - recharge wells recommended' :
                      'Deep groundwater - consider bore well recharge systems'
                    }
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* ===== RIGHT SECTION ===== */}
        <div>
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">{t('results.costEstimation')}</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Storage Tank</span>
                <div className="text-right">
                  <span className="font-medium">₹{data?.costEstimation?.storageTank?.toLocaleString('en-IN') || 0}</span>
                  <div className="text-xs text-gray-500">Materials + Accessories</div>
                </div>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Recharge Pit</span>
                <div className="text-right">
                  <span className="font-medium">₹{data?.costEstimation?.rechargePit?.toLocaleString('en-IN') || 0}</span>
                  <div className="text-xs text-gray-500">Excavation + Filter Media</div>
                </div>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Gutters & Pipes</span>
                <div className="text-right">
                  <span className="font-medium">₹{data?.costEstimation?.guttersPipes?.toLocaleString('en-IN') || 0}</span>
                  <div className="text-xs text-gray-500">PVC System + Fittings</div>
                </div>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Filtration System</span>
                <div className="text-right">
                  <span className="font-medium">₹{data?.costEstimation?.filtrationSystem?.toLocaleString('en-IN') || 0}</span>
                  <div className="text-xs text-gray-500">Multi-stage + First Flush</div>
                </div>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Installation</span>
                <div className="text-right">
                  <span className="font-medium">₹{data?.costEstimation?.installation?.toLocaleString('en-IN') || 0}</span>
                  <div className="text-xs text-gray-500">Labor + Transport + Supervision</div>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                <span className="font-semibold">Total Estimated Cost</span>
                <span className="font-bold text-blue-700">
                  ₹{data?.costEstimation?.total?.toLocaleString('en-IN') || 0}
                </span>
              </div>
              {data?.costEstimation?.currency && (
                <div className="text-xs text-gray-500 mt-1">
                  Currency: {data.costEstimation.currency} • ML Model: {data?.modelVersion || 'Standard'}
                </div>
              )}
              
              {/* Cost Analysis */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">Cost Analysis</h5>
                <div className="text-sm text-blue-700">
                  <div className="flex justify-between mb-1">
                    <span>Cost per m² roof area:</span>
                    <span>₹{data?.roofArea ? Math.round((data.costEstimation?.total || 0) / data.roofArea).toLocaleString('en-IN') : 0}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Cost per liter capacity:</span>
                    <span>₹{data?.tankVolume ? ((data.costEstimation?.total || 0) / data.tankVolume).toFixed(1) : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per liter annual harvest:</span>
                    <span>₹{data?.potentialHarvest ? ((data.costEstimation?.total || 0) / data.potentialHarvest).toFixed(3) : 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Regional Note */}
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                💡 <strong>Note:</strong> Costs are based on Tier-2 Indian cities. 
                Metro cities may be 15-20% higher, smaller towns 10-15% lower.
              </div>
            </div>

            {/* ROI */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">{t('results.returnOnInvestment')}</h4>
              <div className="bg-green-50 rounded-lg p-4 text-center mb-4">
                <p className="text-sm text-gray-600 mb-1">Estimated Annual Savings</p>
                <p className="text-2xl font-bold text-green-700">
                  ₹{data?.roi?.annualSavings?.toLocaleString('en-IN') || 0}
                </p>
                <p className="text-sm text-gray-500">
                  Payback period: ~{data?.roi?.paybackPeriod || "N/A"}
                </p>
                {data?.roi?.currency && (
                  <p className="text-xs text-gray-400 mt-1">
                    Currency: {data.roi.currency}
                  </p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">{t('results.environmentalImpact')}</h4>
                <div className="flex items-center mb-2">
                  <DropletIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm">
                    {data?.roi?.waterSaved
                      ? data.roi.waterSaved.toLocaleString()
                      : "0"}{" "}
                    L water saved annually
                  </span>
                </div>
                <div className="flex items-center">
                  <BarChart2Icon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm">
                    Reduced runoff by {data?.roi?.runoffReduction || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Next steps */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">{t('results.nextSteps')}</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mr-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    1
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Contact local contractors for detailed quotes and implementation plans.
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mr-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    2
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Check for available government subsidies or rebates in your area.
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mr-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    3
                  </span>
                </div>
                <p className="text-sm text-gray-600">{t('results.step3')}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate("/knowledge")}
              >
                Explore Knowledge Hub
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssessmentResults;
