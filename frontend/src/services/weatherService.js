// Drishti — OpenWeatherMap Integration
// Reads EXPO_PUBLIC_OPENWEATHER_API_KEY from environment

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Fallback mock data when API key is not configured
const MOCK_WEATHER = {
  temp: 32,
  humidity: 78,
  windSpeed: 12,
  condition: 'Clouds',
  conditionDesc: 'scattered clouds',
  icon: '03d',
  feelsLike: 35,
  pressure: 1008,
  city: 'New Delhi',
};

/**
 * Fetch current weather by city name or coordinates
 */
export async function fetchWeather(city = 'New Delhi') {
  if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
    console.log('[WeatherService] No API key configured, using mock data');
    return MOCK_WEATHER;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      condition: data.weather[0].main,
      conditionDesc: data.weather[0].description,
      icon: data.weather[0].icon,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      city: data.name,
    };
  } catch (error) {
    console.error('[WeatherService] Error fetching weather:', error);
    return MOCK_WEATHER;
  }
}

/**
 * Fetch weather by coordinates
 */
export async function fetchWeatherByCoords(lat, lon) {
  if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
    return MOCK_WEATHER;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      condition: data.weather[0].main,
      conditionDesc: data.weather[0].description,
      icon: data.weather[0].icon,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      city: data.name,
    };
  } catch (error) {
    console.error('[WeatherService] Error fetching weather by coords:', error);
    return MOCK_WEATHER;
  }
}

/**
 * Field Risk Rule Engine
 * Evaluates weather conditions to determine crop disease risk
 * Returns: { level: 'low'|'medium'|'high', riskKey: string, risks: string[] }
 */
export function evaluateFieldRisk(weather) {
  const risks = [];
  let level = 'low';

  // Fungal disease risk: high humidity (>75%) + moderate temps (20-30°C)
  if (weather.humidity > 75 && weather.temp >= 20 && weather.temp <= 30) {
    risks.push('homeFieldRiskFungal');
    level = 'high';
  }

  // Bacterial risk: warm + wet (rain or drizzle + >25°C)
  if (
    (weather.condition === 'Rain' || weather.condition === 'Drizzle') &&
    weather.temp > 25
  ) {
    risks.push('homeFieldRiskBacterial');
    level = 'high';
  }

  // Pest activity: rising temperatures (>35°C)
  if (weather.temp > 35) {
    risks.push('homeFieldRiskPest');
    if (level !== 'high') level = 'medium';
  }

  // Heat stress: very high temperature (>40°C)
  if (weather.temp > 40) {
    risks.push('homeFieldRiskHeatStress');
    level = 'high';
  }

  // Frost risk: very low temperature (<5°C)
  if (weather.temp < 5) {
    risks.push('homeFieldRiskFrost');
    level = 'high';
  }

  // Moderate humidity (60-75%) — general watch
  if (weather.humidity > 60 && weather.humidity <= 75 && risks.length === 0) {
    level = 'medium';
  }

  // Determine primary risk message key
  let riskKey = 'homeFieldRiskLow';
  if (level === 'medium') riskKey = 'homeFieldRiskMedium';
  if (level === 'high') riskKey = 'homeFieldRiskHigh';

  return { level, riskKey, risks };
}

export default { fetchWeather, fetchWeatherByCoords, evaluateFieldRisk };
