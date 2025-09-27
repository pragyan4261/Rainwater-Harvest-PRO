import React, { useState, useEffect, useRef } from "react";
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
  AlertCircleIcon,
} from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/ui/Button";
import { weatherService, type WeatherData } from "../../services/weatherService";
import styles from './Results.module.css';


interface AssessmentData {
  _id: string;
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
  aquiferInfo?: {
    success: boolean;
    nearest_aquifer?: {
      name: string;
      state: string;
      latitude: number;
      longitude: number;
      type: string;
      depth_range: string;
      quality: string;
      recharge_potential: string;
      distance_km: number;
    };
    distance_km?: number;
    aquifer_type?: string;
    recharge_potential?: string;
    recommendations?: string[];
    feasibility_score?: number;
    overall_assessment?: string;
    statistics?: {
      average_distance: number;
      nearest_distance: number;
      most_common_type: string;
      recharge_potential_summary: string;
      total_nearby_aquifers: number;
    };
    error?: string;
  };
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
  createdAt: string; 
  updatedAt: string; 
}

const AssessmentResults: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const reportRef = useRef(null); // Add a reference to the report container
  const API_URL = import.meta.env.VITE_API_BASE_URL;

const handleDownloadPdf = async () => {
  try {
    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const assessmentId = data?._id;

    if (!token || !API_URL || !assessmentId) {
      alert("Authentication failed or assessment data is missing.");
      return;
    }
    
    // Make the authenticated request to the backend
    const response = await fetch(`${API_URL}/api/assessments/${assessmentId}/pdf`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // The backend is working, so this is unlikely unless the token is now bad
      throw new Error("Failed to generate PDF. The request was not authorized.");
    }

    // Get the response as a binary blob
    const blob = await response.blob();
    console.log("Blob type:", blob.type);
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment_report_${assessmentId}.pdf`; // This attribute is crucial
    document.body.appendChild(a);
    a.click();
    
    // Clean up the temporary URL and link
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("PDF Download Error:", err);
    alert(`Could not download the PDF. Please try again. Error: ${err.message}`);
  }
};



  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
       

        if (!token) {
          throw new Error("Not authenticated. Please log in.");
        }

        const response = await fetch(`${API_URL}/api/assessments/latest`, {
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

  // New function to handle PDF download
  // New, robust function to handle PDF download for long content


  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
          <div className="relative">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <DropletIcon className="w-4 h-4 text-white animate-pulse" />
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Loading Assessment Results
              </h3>
              <div className="flex items-center justify-center space-x-1 text-blue-600">
                <span className="text-sm">Analyzing your data</span>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                      style={{
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '1.5s'
                      } as React.CSSProperties}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 flex items-center space-x-4">
            {[
              { label: 'Processing', icon: '🔄', active: true },
              { label: 'Weather Data', icon: '🌦️', active: false },
              { label: 'Analysis', icon: '📊', active: false },
              { label: 'Results', icon: '✨', active: false }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                  step.active
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-xs mt-2 transition-colors duration-500 ${
                  step.active ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
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
      {/* Attach the reportRef to the main container */}
      <div ref={reportRef} className={styles.resultsContainer}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={`flex justify-between items-start mb-4 ${styles.heroHeaderActions}`}>
              <div>
                <h1 className="text-3xl font-bold mb-2">Assessment Results</h1>
                <p className="opacity-90 text-lg">
                  My Home Assessment • {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className={`flex space-x-3 ${styles.heroActionButtons}`}>
                <Button
                  variant="outline"
                  icon={<ShareIcon size={18} />}
                >
                  Share
                </Button>
                <Button
                  variant="outline"
                  icon={<DownloadIcon size={18} />}
                  onClick={handleDownloadPdf} // Attach the new handler
                >
                  {t('results.savePdf')}
                </Button>
              </div>
            </div>
            <div className={styles.feasibilityBadge}>
              <CheckCircleIcon className={`w-5 h-5 ${styles.feasibilityIcon}`} />
              Feasibility: {data?.feasibility || "N/A"}
            </div>
            <p className="opacity-90 mb-6">
              {data?.feasibilityDescription || "No description available"}
            </p>
            <div className={styles.heroStats}>
              <div className={`${styles.heroStat} ${styles.metricBlue}`}>
                <div className={styles.heroStatIcon}>
                  <HomeIcon className="w-6 h-6" />
                </div>
                <div className={styles.heroStatValue}>
                  {data?.roofArea || 0} m²
                </div>
                <div className={styles.heroStatLabel}>Roof Area</div>
              </div>
              <div className={`${styles.heroStat} ${styles.metricGreen}`}>
                <div className={styles.heroStatIcon}>
                  <CloudRainIcon className="w-6 h-6" />
                </div>
                <div className={styles.heroStatValue}>
                  {data?.rainfall || 0} mm
                </div>
                <div className={styles.heroStatLabel}>Annual Rainfall</div>
              </div>
              <div className={`${styles.heroStat} ${styles.metricCyan}`}>
                <div className={styles.heroStatIcon}>
                  <DropletIcon className="w-6 h-6" />
                </div>
                <div className={styles.heroStatValue}>
                  {(data?.potentialHarvest || 0).toLocaleString()} L
                </div>
                <div className={styles.heroStatLabel}>Potential Harvest</div>
              </div>
              <div className={`${styles.heroStat} ${styles.metricPurple}`}>
                <div className={styles.heroStatIcon}>
                  <BeakerIcon className="w-6 h-6" />
                </div>
                <div className={styles.heroStatValue}>
                  {(data?.tankVolume || 0).toLocaleString()} L
                </div>
                <div className={styles.heroStatLabel}>Tank Volume</div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 ${styles.leftColumn}`}>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <ZapIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={styles.sectionTitle}>System Performance Metrics</h2>
                  <p className={styles.sectionSubtitle}>Detailed technical specifications and efficiency analysis</p>
                </div>
              </div>
              <div className={styles.metricsGrid}>
                <div className={`${styles.metricCard} ${styles.metricCyan}`}>
                  <div className={styles.metricIcon}>
                    <ZapIcon className="w-6 h-6" />
                  </div>
                  <div className={styles.metricValue}>
                    {(data?.efficiency || 0).toLocaleString()}
                  </div>
                  <div className={styles.metricLabel}>System Efficiency</div>
                </div>
                <div className={`${styles.metricCard} ${styles.metricOrange}`}>
                  <div className={styles.metricIcon}>
                    <ArrowBigRightDashIcon className="w-6 h-6" />
                  </div>
                  <div className={styles.metricValue}>
                    {(data?.inertia || 0).toLocaleString()}
                  </div>
                  <div className={styles.metricLabel}>System Inertia</div>
                </div>
              </div>
            </div>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <DropletIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Recommended Structures</h3>
                  <p className={styles.sectionSubtitle}>Optimal rainwater harvesting components for your property</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.recommendedStructures?.length ? (
                  data.recommendedStructures.map((s, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 flex hover:shadow-md transition-all duration-300">
                      <div className="bg-blue-100 rounded-full p-3 mr-4">
                        <DropletIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{s.name}</h4>
                        <p className="text-gray-600 text-sm">{s.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <AlertCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No structures recommended at this time.</p>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <CloudRainIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>
                    {weatherData ? "Live Weather Data & Rainfall Distribution" : "Rainfall Distribution"}
                  </h3>
                  <p className={styles.sectionSubtitle}>Real-time weather conditions and precipitation analysis</p>
                </div>
              </div>
              {weatherLoading && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
                  <p className="text-blue-600">🌦️ Loading live weather data...</p>
                </div>
              )}
              {weatherData ? (
                <div className={styles.weatherChart}>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 mb-6">
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
                  <div className={styles.chartContainer}>
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
                    <div className={styles.chartBars}>
                      {weatherData.daily.rain_sum && weatherService.getWeeklyRainfall(weatherData.daily.rain_sum).map((rainfall, i) => {
                        const weeklyData = weatherService.getWeeklyRainfall(weatherData.daily.rain_sum || new Float32Array());
                        const maxRain = Math.max(...weeklyData);
                        const height = maxRain > 0 ? (rainfall / maxRain) * 100 : 0;
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        const isToday = i === 6;
                        const isHighRain = rainfall > maxRain * 0.7;
                        return (
                          <div key={i} className={styles.chartBar}>
                            <div
                              className={`${styles.barElement} ${
                                isToday ? styles.barToday :
                                isHighRain ? styles.barHeavy :
                                rainfall > 0 ? styles.barRegular : styles.barLight
                              }`}
                              style={{ height: `${Math.max(height, rainfall > 0 ? 4 : 0)}%` } as React.CSSProperties}
                            >
                              {rainfall > 0 && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                                  <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                </div>
                              )}
                            </div>
                            <div className={styles.barLabel}>
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
                    <div className="text-center mt-4">
                      <span className="text-sm font-medium text-gray-600">Months</span>
                    </div>
                    <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm"></div>
                        <span className="text-gray-600">Monthly Precipitation</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.weatherChart}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">{t('results.monthlyPrecipitation')}</h4>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{t('results.mmPerMonth')}</span>
                  </div>
                  <div className="relative bg-gradient-to-t from-gray-50 to-transparent rounded-lg p-6">
                    <div className="absolute left-0 top-6 bottom-16 flex flex-col justify-between text-xs text-gray-400">
                      <span>200</span>
                      <span>150</span>
                      <span>100</span>
                      <span>50</span>
                      <span>0</span>
                    </div>
                    <div className="absolute left-8 right-4 top-6 bottom-16 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-px bg-gray-200 opacity-40"></div>
                      ))}
                    </div>
                    <div className="relative h-48 ml-8 mr-4">
                      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-40">
                        {data?.rainfallDistribution?.length ? (
                          data.rainfallDistribution.map((value, i) => (
                            <div key={i} className="flex flex-col items-center group cursor-pointer transition-all duration-300 hover:transform hover:scale-110">
                              <div className="absolute -top-12 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                <div className="font-semibold">{value} mm</div>
                                <div className="text-gray-300">
                                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i]}
                                </div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                              <div
                                className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg shadow-lg transition-all hover:shadow-xl hover:from-blue-700 hover:to-blue-500"
                                style={{ height: `${(value / 200) * 100}%`, minHeight: value > 0 ? '4px' : '2px' } as React.CSSProperties}
                              >
                                {value > 0 && (
                                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex-1 flex items-center justify-center h-40">
                            <div className="text-center">
                              <CloudRainIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 font-medium">No rainfall data available</p>
                              <p className="text-sm text-gray-400 mt-1">Historical data will be shown when available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <span className="text-sm font-medium text-gray-600">Months</span>
                    </div>
                    <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm"></div>
                        <span className="text-gray-600">Monthly Precipitation</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <DropletIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Groundwater Level Prediction</h3>
                  <p className={styles.sectionSubtitle}>Estimated depth and recharge recommendations for your area</p>
                </div>
              </div>
              <div className={styles.groundwaterVisualization}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80">Surface Level</span>
                  <span className="text-sm text-white/80">Predicted Depth</span>
                </div>
                <div className={styles.groundwaterIndicator}></div>
                <div className={styles.groundwaterLevel}>
                  {data?.groundwaterLevel || 0}m
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  The <strong>groundwater level</strong> in your area is at <span className="font-semibold text-blue-600">{data?.groundwaterLevel || 0}m</span> depth.
                </p>
                <p className="text-xs text-gray-500">
                  Prediction based on historical data from your district. This depth is {(data?.groundwaterLevel || 0) < 10 ? 'suitable' : 'challenging'} for recharge structures.
                </p>
                {data?.groundwaterLevel && data.groundwaterLevel > 0 && (
                  <div className={styles.recommendationBadge}>
                    <div className={styles.recommendationText}>
                      <span className="mr-2">💧</span>
                      <div>
                        <strong>Recommendation:</strong> {
                          data.groundwaterLevel < 5 ? 'Shallow groundwater - ideal for recharge pits' :
                          data.groundwaterLevel < 10 ? 'Moderate depth - recharge wells recommended' :
                          'Deep groundwater - consider bore well recharge systems'
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {data?.aquiferInfo && data.aquiferInfo.success && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>
                    <DropletIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={styles.sectionTitle}>Nearest Major Aquifer</h3>
                    <p className={styles.sectionSubtitle}>Regional groundwater resources analysis</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-blue-900 text-lg mb-2">
                          {data.aquiferInfo.nearest_aquifer?.name || 'Unknown Aquifer'}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Distance:</span>
                            <span className="font-semibold text-blue-700">
                              {data.aquiferInfo.distance_km || data.aquiferInfo.nearest_aquifer?.distance_km || 'N/A'} km
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium text-gray-800">
                              {data.aquiferInfo.aquifer_type || data.aquiferInfo.nearest_aquifer?.type || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Depth Range:</span>
                            <span className="font-medium text-gray-800">
                              {data.aquiferInfo.nearest_aquifer?.depth_range || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Water Quality:</span>
                            <span className={`font-medium ${
                              data.aquiferInfo.nearest_aquifer?.quality === 'Good' ? 'text-green-600' :
                              data.aquiferInfo.nearest_aquifer?.quality === 'Moderate' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {data.aquiferInfo.nearest_aquifer?.quality || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Recharge Potential:</span>
                            <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                              data.aquiferInfo.recharge_potential === 'High' ? 'bg-green-100 text-green-700' :
                              data.aquiferInfo.recharge_potential === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {data.aquiferInfo.recharge_potential || data.aquiferInfo.nearest_aquifer?.recharge_potential || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {data.aquiferInfo.feasibility_score !== undefined && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Aquifer Feasibility Assessment</h4>
                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                              <div
                                className={`bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 ${styles.aquiferFeasibilityBar}`}
                                style={{"--feasibility-width": `${data.aquiferInfo.feasibility_score}%`} as React.CSSProperties}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Poor</span>
                              <span className="font-semibold text-blue-700">
                                {data.aquiferInfo.feasibility_score}/100
                              </span>
                              <span>Excellent</span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-blue-700 mt-2">
                            {data.aquiferInfo.overall_assessment}
                          </p>
                        </div>
                      )}
                      {data.aquiferInfo.statistics && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Regional Statistics</h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Nearby Aquifers:</span>
                              <span className="font-medium">{data.aquiferInfo.statistics.total_nearby_aquifers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Distance:</span>
                              <span className="font-medium">{data.aquiferInfo.statistics.average_distance} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Common Type:</span>
                              <span className="font-medium">{data.aquiferInfo.statistics.most_common_type}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {data.aquiferInfo.recommendations && data.aquiferInfo.recommendations.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <AlertCircleIcon className="w-4 h-4 mr-2" />
                        Aquifer-Based Recommendations
                      </h4>
                      <div className="space-y-2">
                        {data.aquiferInfo.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-blue-800">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.aquiferInfo.nearest_aquifer && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Aquifer Location:</span>
                          <div className="font-mono text-blue-700">
                            {data.aquiferInfo.nearest_aquifer.latitude.toFixed(4)}°N, {data.aquiferInfo.nearest_aquifer.longitude.toFixed(4)}°E
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">State:</span>
                          <div className="text-gray-800">{data.aquiferInfo.nearest_aquifer.state}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.costBreakdown}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <BarChart2Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>{t('results.costEstimation')}</h3>
                  <p className={styles.sectionSubtitle}>Detailed breakdown of implementation costs</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className={styles.costItem}>
                  <div>
                    <div className={styles.costItemLabel}>Storage Tank</div>
                    <div className={styles.costItemDescription}>Materials + Accessories</div>
                  </div>
                  <div className={styles.costItemValue}>
                    ₹{data?.costEstimation?.storageTank?.toLocaleString('en-IN') || 0}
                  </div>
                </div>
                <div className={styles.costItem}>
                  <div>
                    <div className={styles.costItemLabel}>Recharge Pit</div>
                    <div className={styles.costItemDescription}>Excavation + Filter Media</div>
                  </div>
                  <div className={styles.costItemValue}>
                    ₹{data?.costEstimation?.rechargePit?.toLocaleString('en-IN') || 0}
                  </div>
                </div>
                <div className={styles.costItem}>
                  <div>
                    <div className={styles.costItemLabel}>Gutters & Pipes</div>
                    <div className={styles.costItemDescription}>PVC System + Fittings</div>
                  </div>
                  <div className={styles.costItemValue}>
                    ₹{data?.costEstimation?.guttersPipes?.toLocaleString('en-IN') || 0}
                  </div>
                </div>
                <div className={styles.costItem}>
                  <div>
                    <div className={styles.costItemLabel}>Filtration System</div>
                    <div className={styles.costItemDescription}>Multi-stage + First Flush</div>
                  </div>
                  <div className={styles.costItemValue}>
                    ₹{data?.costEstimation?.filtrationSystem?.toLocaleString('en-IN') || 0}
                  </div>
                </div>
                <div className={styles.costItem}>
                  <div>
                    <div className={styles.costItemLabel}>Installation</div>
                    <div className={styles.costItemDescription}>Labor + Transport + Supervision</div>
                  </div>
                  <div className={styles.costItemValue}>
                    ₹{data?.costEstimation?.installation?.toLocaleString('en-IN') || 0}
                  </div>
                </div>
              </div>
              <div className={styles.costTotal}>
                <div className="text-lg font-semibold mb-1">Total Estimated Cost</div>
                <div className="text-3xl font-bold">
                  ₹{data?.costEstimation?.total?.toLocaleString('en-IN') || 0}
                </div>
                {data?.costEstimation?.currency && (
                  <div className="text-sm opacity-80 mt-2">
                    Currency: {data.costEstimation.currency} • ML Model: {data?.modelVersion || 'Standard'}
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 bg-white/50 rounded-lg border border-amber-200">
                <h5 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <BarChart2Icon className="w-4 h-4 mr-2" />
                  Cost Analysis
                </h5>
                <div className="text-sm text-amber-700 space-y-2">
                  <div className="flex justify-between">
                    <span>Cost per m² roof area:</span>
                    <span className="font-semibold">₹{data?.roofArea ? Math.round((data.costEstimation?.total || 0) / data.roofArea).toLocaleString('en-IN') : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per liter capacity:</span>
                    <span className="font-semibold">₹{data?.tankVolume ? ((data.costEstimation?.total || 0) / data.tankVolume).toFixed(1) : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per liter annual harvest:</span>
                    <span className="font-semibold">₹{data?.potentialHarvest ? ((data.costEstimation?.total || 0) / data.potentialHarvest).toFixed(3) : 0}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <div className="flex items-start">
                  <span className="mr-2">💡</span>
                  <div>
                    <strong>Regional Pricing Note:</strong> Costs are based on Tier-2 Indian cities.
                    Metro cities may be 15-20% higher, smaller towns 10-15% lower.
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.roiCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <BarChart2Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={styles.sectionTitle}>{t('results.returnOnInvestment')}</h4>
                  <p className={styles.sectionSubtitle}>Financial returns and payback analysis</p>
                </div>
              </div>
              <div className="text-center mb-6">
                <p className="text-sm text-green-700 mb-2">Estimated Annual Savings</p>
                <div className={styles.roiValue}>
                  ₹{data?.roi?.annualSavings?.toLocaleString('en-IN') || 0}
                </div>
                <div className={styles.roiLabel}>
                  Payback period: ~{data?.roi?.paybackPeriod || "N/A"}
                </div>
                {data?.roi?.currency && (
                  <p className="text-xs text-green-600 opacity-80">
                    Currency: {data.roi.currency}
                  </p>
                )}
              </div>
              <div className={styles.environmentalImpact}>
                <div className="flex items-center mb-3">
                  <DropletIcon className="w-5 h-5 text-green-600 mr-2" />
                  <h5 className="font-semibold text-green-800">{t('results.environmentalImpact')}</h5>
                </div>
                <div className={styles.impactItem}>
                  <DropletIcon className={`w-4 h-4 ${styles.impactIcon}`} />
                  <span className={styles.impactText}>
                    {data?.roi?.waterSaved
                      ? data.roi.waterSaved.toLocaleString()
                      : "0"}{" "}
                    L water saved annually
                  </span>
                </div>
                <div className={styles.impactItem}>
                  <BarChart2Icon className={`w-4 h-4 ${styles.impactIcon}`} />
                  <span className={styles.impactText}>
                    Reduced runoff by {data?.roi?.runoffReduction || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.nextStepsCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>{t('results.nextSteps')}</h3>
                  <p className={styles.sectionSubtitle}>Your roadmap to implementation</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className={styles.stepItem}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepText}>
                    Contact local contractors for detailed quotes and implementation plans.
                  </div>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepText}>
                    Check for available government subsidies or rebates in your area.
                  </div>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepText}>
                    {t('results.step3')}
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate("/knowledge")}
              >
                Explore Knowledge Hub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssessmentResults;

