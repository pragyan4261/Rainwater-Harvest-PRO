import { fetchWeatherApi } from 'openmeteo';

export interface WeatherData {
  current: {
    time: Date;
    rain: number;
    temperature_2m: number;
    cloud_cover: number;
    precipitation: number;
  };
  hourly: {
    time: Date[];
    temperature_2m: Float32Array | null;
    precipitation: Float32Array | null;
    precipitation_probability: Float32Array | null;
    rain: Float32Array | null;
    showers: Float32Array | null;
    weather_code: Float32Array | null;
    relative_humidity_2m: Float32Array | null;
    evapotranspiration: Float32Array | null;
    cloud_cover_low: Float32Array | null;
    cloud_cover_mid: Float32Array | null;
    cloud_cover_high: Float32Array | null;
    wind_speed_10m: Float32Array | null;
    soil_temperature_0cm: Float32Array | null;
    soil_moisture_0_to_1cm: Float32Array | null;
  };
  daily: {
    time: Date[];
    precipitation_hours: Float32Array | null;
    precipitation_probability_max: Float32Array | null;
    temperature_2m_max: Float32Array | null;
    temperature_2m_min: Float32Array | null;
    showers_sum: Float32Array | null;
    rain_sum: Float32Array | null;
    wind_speed_10m_max: Float32Array | null;
  };
}

export class WeatherService {
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    const params = {
      latitude,
      longitude,
      daily: ["precipitation_hours", "precipitation_probability_max", "temperature_2m_max", "temperature_2m_min", "showers_sum", "rain_sum", "wind_speed_10m_max"],
      hourly: ["temperature_2m", "precipitation", "precipitation_probability", "rain", "showers", "weather_code", "relative_humidity_2m", "evapotranspiration", "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high", "wind_speed_10m", "soil_temperature_0cm", "soil_moisture_0_to_1cm"],
      current: ["rain", "temperature_2m", "cloud_cover", "precipitation"],
      timezone: "auto",
      past_days: 1,
    };
    
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);

    // Process first location
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const current = response.current()!;
    const hourly = response.hourly()!;
    const daily = response.daily()!;

    // Process the weather data
    const weatherData: WeatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        rain: current.variables(0)!.value(),
        temperature_2m: current.variables(1)!.value(),
        cloud_cover: current.variables(2)!.value(),
        precipitation: current.variables(3)!.value(),
      },
      hourly: {
        time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
          (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
        ),
        temperature_2m: hourly.variables(0)?.valuesArray() || null,
        precipitation: hourly.variables(1)?.valuesArray() || null,
        precipitation_probability: hourly.variables(2)?.valuesArray() || null,
        rain: hourly.variables(3)?.valuesArray() || null,
        showers: hourly.variables(4)?.valuesArray() || null,
        weather_code: hourly.variables(5)?.valuesArray() || null,
        relative_humidity_2m: hourly.variables(6)?.valuesArray() || null,
        evapotranspiration: hourly.variables(7)?.valuesArray() || null,
        cloud_cover_low: hourly.variables(8)?.valuesArray() || null,
        cloud_cover_mid: hourly.variables(9)?.valuesArray() || null,
        cloud_cover_high: hourly.variables(10)?.valuesArray() || null,
        wind_speed_10m: hourly.variables(11)?.valuesArray() || null,
        soil_temperature_0cm: hourly.variables(12)?.valuesArray() || null,
        soil_moisture_0_to_1cm: hourly.variables(13)?.valuesArray() || null,
      },
      daily: {
        time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
          (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
        ),
        precipitation_hours: daily.variables(0)?.valuesArray() || null,
        precipitation_probability_max: daily.variables(1)?.valuesArray() || null,
        temperature_2m_max: daily.variables(2)?.valuesArray() || null,
        temperature_2m_min: daily.variables(3)?.valuesArray() || null,
        showers_sum: daily.variables(4)?.valuesArray() || null,
        rain_sum: daily.variables(5)?.valuesArray() || null,
        wind_speed_10m_max: daily.variables(6)?.valuesArray() || null,
      },
    };

    return weatherData;
  }

  // Convert daily rain data to monthly distribution for display
  processRainfallDistribution(dailyRainSum: Float32Array | null, dailyTimes: Date[]): number[] {
    if (!dailyRainSum) return new Array(12).fill(0);
    
    // Create array for 12 months
    const monthlyRainfall = new Array(12).fill(0);
    const monthlyDays = new Array(12).fill(0);

    // Group daily data by month
    for (let i = 0; i < dailyTimes.length && i < dailyRainSum.length; i++) {
      const month = dailyTimes[i].getMonth();
      monthlyRainfall[month] += dailyRainSum[i];
      monthlyDays[month]++;
    }

    // Calculate average rainfall per day for each month
    return monthlyRainfall.map((total, index) => 
      monthlyDays[index] > 0 ? total / monthlyDays[index] : 0
    );
  }

  // Get last 7 days rainfall for chart display
  getWeeklyRainfall(dailyRainSum: Float32Array | null): number[] {
    if (!dailyRainSum) return new Array(7).fill(0);
    
    const weeklyData: number[] = [];
    const startIndex = Math.max(0, dailyRainSum.length - 7);
    
    for (let i = startIndex; i < dailyRainSum.length; i++) {
      weeklyData.push(dailyRainSum[i]);
    }
    
    return weeklyData;
  }
}

export const weatherService = new WeatherService();