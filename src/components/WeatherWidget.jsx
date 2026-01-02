import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin, RefreshCw } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import { fetchWeatherData as fetchWeatherService } from '../utils/weatherService'

export default function WeatherWidget({ initialLocation = 'Bangalore' }) {
  const { t } = useLanguageStore()
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(initialLocation)
  const [inputLocation, setInputLocation] = useState(initialLocation)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)

  // Mock weather data (in real app, fetch from weather API)
  const mockWeatherData = {
    current: {
      temperature: 28,
      condition: 'partly-cloudy',
      humidity: 65,
      windSpeed: 12,
      rainfall: 0,
      description: 'Partly Cloudy'
    },
    forecast: [
      { day: 'Today', temp: 28, condition: 'partly-cloudy', rain: 10 },
      { day: 'Tomorrow', temp: 30, condition: 'sunny', rain: 0 },
      { day: 'Day 3', temp: 26, condition: 'rainy', rain: 80 },
      { day: 'Day 4', temp: 25, condition: 'cloudy', rain: 40 },
      { day: 'Day 5', temp: 29, condition: 'sunny', rain: 5 }
    ]
  }

  useEffect(() => {
    fetchWeatherData()
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [location])

  const fetchWeatherData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const realWeather = await fetchRealWeatherData(location)
      if (realWeather) {
        setWeather(realWeather.current)
        setForecast(realWeather.forecast)
      } else {
        setWeather(mockWeatherData.current)
        setForecast(mockWeatherData.forecast)
      }
      setLastUpdated(new Date())
    } catch (error) {
      setError('Failed to fetch weather data')
      setWeather(mockWeatherData.current)
      setForecast(mockWeatherData.forecast)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const fetchRealWeatherData = async (city) => {
    try {
      return await fetchWeatherService(city)
    } catch (error) {
      console.error('Weather service failed:', error)
      return null
    }
  }

  const mapWeatherCondition = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear': return 'sunny'
      case 'clouds': return 'cloudy'
      case 'rain': return 'rainy'
      default: return 'partly-cloudy'
    }
  }

  const handleLocationChange = (e) => {
    e.preventDefault()
    if (inputLocation.trim()) {
      setLocation(inputLocation.trim())
    }
  }

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />
      case 'cloudy': return <Cloud className="h-8 w-8 text-gray-500" />
      case 'partly-cloudy': return <Cloud className="h-8 w-8 text-gray-400" />
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />
      default: return <Sun className="h-8 w-8 text-yellow-500" />
    }
  }

  const getSmallWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-5 w-5 text-yellow-500" />
      case 'cloudy': return <Cloud className="h-5 w-5 text-gray-500" />
      case 'partly-cloudy': return <Cloud className="h-5 w-5 text-gray-400" />
      case 'rainy': return <CloudRain className="h-5 w-5 text-blue-500" />
      default: return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  const getFarmingAdvice = () => {
    if (!weather) return []
    
    const advice = []
    
    if (weather.condition === 'rainy' || weather.rainfall > 0) {
      advice.push('🌧️ Good time for transplanting seedlings')
      advice.push('⚠️ Avoid harvesting during rain')
    }
    
    if (weather.temperature > 30) {
      advice.push('🌡️ Ensure adequate irrigation')
      advice.push('🌿 Provide shade for sensitive crops')
    }
    
    if (weather.humidity > 70) {
      advice.push('🍄 Watch for fungal diseases')
      advice.push('💨 Ensure good air circulation')
    }
    
    if (weather.windSpeed > 15) {
      advice.push('🌪️ Secure lightweight structures')
      advice.push('🌱 Protect young plants')
    }
    
    return advice
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Real-time Weather</h3>
          <button
            onClick={() => fetchWeatherData()}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Refresh weather"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleLocationChange} className="flex space-x-2 mb-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={inputLocation}
              onChange={(e) => setInputLocation(e.target.value)}
              placeholder="Enter city name..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            type="submit"
            className="btn-primary px-4 py-2 text-sm"
          >
            Get Weather
          </button>
        </form>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">📍 {location}</span>
          {lastUpdated && (
            <span className="text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ {error} - Showing sample data
          </div>
        )}
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {getWeatherIcon(weather.condition)}
          <div>
            <div className="text-3xl font-bold text-gray-900">{weather.temperature}°C</div>
            <div className="text-sm text-gray-600">{weather.description}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">5-Day Forecast</h4>
        <div className="grid grid-cols-5 gap-2">
          {forecast.map((day, index) => (
            <div key={index} className="text-center p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-600 mb-1">{day.day}</div>
              <div className="flex justify-center mb-1">
                {getSmallWeatherIcon(day.condition)}
              </div>
              <div className="text-sm font-medium">{day.temp}°</div>
              <div className="text-xs text-blue-600">{day.rain}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Farming Advice */}
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">🌾 Farming Advice</h4>
        <div className="space-y-1">
          {getFarmingAdvice().map((advice, index) => (
            <div key={index} className="text-xs text-green-800">
              {advice}
            </div>
          ))}
          {getFarmingAdvice().length === 0 && (
            <div className="text-xs text-green-800">
              ✅ Good conditions for general farming activities
            </div>
          )}
        </div>
      </div>
    </div>
  )
}