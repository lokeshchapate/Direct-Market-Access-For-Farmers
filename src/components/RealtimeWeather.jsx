import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Thermometer, Droplets, Wind, Eye, Gauge, Sun, Cloud, CloudRain, CloudSnow, Zap } from 'lucide-react'

export default function RealtimeWeather() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [location, setLocation] = useState('Bangalore')
  const [customLocation, setCustomLocation] = useState('')
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    fetchWeatherData()
  }, [location])

  const fetchWeatherData = async () => {
    setLoading(true)
    
    try {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
      console.log('API Key:', API_KEY ? 'Present' : 'Missing')
      console.log('API Key value:', API_KEY)
      
      if (!API_KEY || API_KEY.trim() === 'your_key_here' || API_KEY.trim() === '') {
        throw new Error('OpenWeather API key not configured')
      }

      // Get coordinates for the city
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location},IN&limit=1&appid=${API_KEY}`
      console.log('Fetching geo data:', geoUrl)
      
      const geoResponse = await fetch(geoUrl)
      const geoData = await geoResponse.json()
      
      console.log('Geo response:', geoData)
      
      if (!geoData.length) {
        throw new Error(`City '${location}' not found`)
      }

      const { lat, lon } = geoData[0]

      // Get current weather
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      console.log('Fetching weather data:', weatherUrl)
      
      const weatherResponse = await fetch(weatherUrl)
      const weatherData = await weatherResponse.json()
      
      console.log('Weather response:', weatherData)
      console.log('Wind data:', weatherData.wind)
      console.log('Visibility data:', weatherData.visibility)
      
      if (weatherData.cod !== 200) {
        throw new Error(`Weather API error: ${weatherData.message}`)
      }

      // Get 7-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )
      const forecastData = await forecastResponse.json()

      // Get UV Index
      const uvResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      )
      const uvData = await uvResponse.json()

      const currentWeather = {
        location: weatherData.name,
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind?.speed * 3.6) || 0, // Convert m/s to km/h
        windDirection: getWindDirection(weatherData.wind?.deg || 0),
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility ? Math.round(weatherData.visibility / 1000) : 10, // Convert m to km, default 10km
        uvIndex: Math.round(uvData.value || 0),
        feelsLike: Math.round(weatherData.main.feels_like),
        dewPoint: Math.round(weatherData.main.temp - ((100 - weatherData.main.humidity) / 5)),
        sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        lastUpdated: new Date().toLocaleTimeString()
      }
      
      console.log('Processed weather data:', currentWeather)

      // Process 7-day forecast (OpenWeather free tier gives 5-day forecast)
      const dailyForecasts = {}
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString()
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            temps: [],
            conditions: [],
            humidity: [],
            precipitation: 0
          }
        }
        dailyForecasts[date].temps.push(item.main.temp)
        dailyForecasts[date].conditions.push(item.weather[0].main)
        dailyForecasts[date].humidity.push(item.main.humidity)
        if (item.rain) dailyForecasts[date].precipitation += item.rain['3h'] || 0
      })

      const processedForecast = Object.keys(dailyForecasts).slice(0, 7).map(date => {
        const dayData = dailyForecasts[date]
        return {
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          high: Math.round(Math.max(...dayData.temps)),
          low: Math.round(Math.min(...dayData.temps)),
          condition: dayData.conditions[0], // Most common condition
          precipitation: Math.round(dayData.precipitation),
          humidity: Math.round(dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length)
        }
      })

      setWeather(currentWeather)
      setForecast(processedForecast)
      setLoading(false)
    } catch (error) {
      console.error('Weather fetch error:', error)
      setLoading(false)
      // Fallback to demo data if API fails
      setWeather({
        location: location,
        temperature: 28,
        condition: 'Clear',
        description: 'clear sky',
        humidity: 65,
        windSpeed: 12,
        windDirection: 'SW',
        pressure: 1013,
        visibility: 10,
        uvIndex: 6,
        feelsLike: 31,
        dewPoint: 20,
        sunrise: '06:15 AM',
        sunset: '06:45 PM',
        lastUpdated: new Date().toLocaleTimeString(),
        error: 'Using demo data - API key needed for live weather'
      })
      setForecast([])
    }
  }

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(degrees / 22.5) % 16]
  }

  const handleCustomSearch = () => {
    if (customLocation.trim()) {
      setLocation(customLocation.trim())
      setCustomLocation('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCustomSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleLocationInput = (value) => {
    setCustomLocation(value)
    if (value.length > 1) {
      const filteredSuggestions = getCitySuggestions(value)
      setSuggestions(filteredSuggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const getCitySuggestions = (input) => {
    const cities = [
      'Agra', 'Ahmedabad', 'Ajmer', 'Allahabad', 'Amritsar', 'Aurangabad',
      'Bangalore', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai', 'Coimbatore',
      'Delhi', 'Dehradun', 'Faridabad', 'Ghaziabad', 'Goa', 'Gurgaon', 'Guwahati',
      'Hyderabad', 'Indore', 'Jaipur', 'Jalandhar', 'Jammu', 'Jodhpur', 'Kanpur',
      'Kochi', 'Kolkata', 'Lucknow', 'Ludhiana', 'Madurai', 'Mangalore', 'Meerut',
      'Mumbai', 'Mysore', 'Nagpur', 'Nashik', 'Noida', 'Patna', 'Pune', 'Raipur',
      'Rajkot', 'Ranchi', 'Salem', 'Surat', 'Thiruvananthapuram', 'Udaipur',
      'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam'
    ]
    
    return cities
      .filter(city => city.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5)
  }

  const selectSuggestion = (city) => {
    setCustomLocation(city)
    setLocation(city)
    setShowSuggestions(false)
  }

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear': return <Sun className="h-8 w-8 text-yellow-500" />
      case 'Clouds': return <Cloud className="h-8 w-8 text-gray-400" />
      case 'Rain': return <CloudRain className="h-8 w-8 text-blue-500" />
      case 'Drizzle': return <CloudRain className="h-8 w-8 text-blue-400" />
      case 'Thunderstorm': return <Zap className="h-8 w-8 text-purple-600" />
      case 'Snow': return <CloudSnow className="h-8 w-8 text-blue-300" />
      case 'Mist':
      case 'Fog':
      case 'Haze': return <Cloud className="h-8 w-8 text-gray-300" />
      default: return <Sun className="h-8 w-8 text-yellow-500" />
    }
  }

  const getSmallWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear': return <Sun className="h-5 w-5 text-yellow-500" />
      case 'Clouds': return <Cloud className="h-5 w-5 text-gray-400" />
      case 'Rain': return <CloudRain className="h-5 w-5 text-blue-500" />
      case 'Drizzle': return <CloudRain className="h-5 w-5 text-blue-400" />
      case 'Thunderstorm': return <Zap className="h-5 w-5 text-purple-600" />
      case 'Snow': return <CloudSnow className="h-5 w-5 text-blue-300" />
      case 'Mist':
      case 'Fog':
      case 'Haze': return <Cloud className="h-5 w-5 text-gray-300" />
      default: return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  const getUVLevel = (uvIndex) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-600' }
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-600' }
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-600' }
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-600' }
    return { level: 'Extreme', color: 'text-purple-600' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weather Forecast</h2>
          <p className="text-gray-600">Real-time weather conditions for farming</p>
        </div>
        <div className="relative flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => handleLocationInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => customLocation.length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter city name..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 w-48"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1">
                {suggestions.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(city)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleCustomSearch}
            className="btn-primary px-4 py-2"
          >
            Search
          </button>
        </div>
      </div>

      {/* Quick City Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'].map((city) => (
          <button
            key={city}
            onClick={() => setLocation(city)}
            className={`px-3 py-1 text-sm rounded-full border ${
              location === city
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span className="text-lg font-medium">{weather.location}</span>
            </div>
            <div className="text-right">
              <span className="text-sm opacity-75">Updated: {weather.lastUpdated}</span>
              {weather.error && (
                <div className="text-xs text-yellow-200 mt-1">{weather.error}</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-6xl font-bold mb-2">{weather.temperature}°</div>
              <div className="text-xl mb-1">{weather.condition}</div>
              <div className="text-sm opacity-75">Feels like {weather.feelsLike}°</div>
            </div>
            <div className="text-right">
              {getWeatherIcon(weather.condition)}
              <div className="mt-2 text-sm opacity-75">
                <div>H: {weather.temperature + 3}° L: {weather.temperature - 8}°</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white border-opacity-20">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <span className="text-sm">Sunrise: {weather.sunrise}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <span className="text-sm">Sunset: {weather.sunset}</span>
            </div>
          </div>
        </motion.div>

        {/* Weather Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6 border"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weather Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Humidity</span>
              </div>
              <span className="font-medium">{weather.humidity}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Wind</span>
              </div>
              <span className="font-medium">{weather.windSpeed} km/h {weather.windDirection}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">Pressure</span>
              </div>
              <span className="font-medium">{weather.pressure} hPa</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Visibility</span>
              </div>
              <span className="font-medium">{weather.visibility} km</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">UV Index</span>
              </div>
              <span className={`font-medium ${getUVLevel(weather.uvIndex).color}`}>
                {weather.uvIndex} ({getUVLevel(weather.uvIndex).level})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600">Dew Point</span>
              </div>
              <span className="font-medium">{weather.dewPoint}°</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 7-Day Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow p-6 border"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">7-Day Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {forecast.map((day, index) => (
            <div key={index} className="text-center p-3 rounded-lg hover:bg-gray-50">
              <div className="font-medium text-gray-900 mb-1">
                {index === 0 ? 'Today' : day.day}
              </div>
              <div className="text-xs text-gray-600 mb-2">{day.date}</div>
              <div className="flex justify-center mb-2">
                {getSmallWeatherIcon(day.condition)}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                {day.high}°
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {day.low}°
              </div>
              <div className="text-xs text-blue-600">
                {day.precipitation}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Enhanced Farming Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-green-50 rounded-lg p-6 border border-green-200"
      >
        <h3 className="text-lg font-medium text-green-900 mb-4">🌾 Weather-Based Farming Tips</h3>
        
        {/* Temperature-based tips */}
        {weather.temperature > 35 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2 flex items-center">
              🌡️ High Temperature Alert ({weather.temperature}°C)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-red-800">
              <div>• Water crops early morning (5-7 AM) and evening (6-8 PM)</div>
              <div>• Install shade nets (50-70% shade) for vegetables</div>
              <div>• Apply mulch to retain soil moisture</div>
              <div>• Monitor for heat stress: wilting, leaf burn</div>
              <div>• Avoid fertilizer application during peak heat</div>
              <div>• Harvest early morning when temperatures are cooler</div>
            </div>
          </div>
        )}
        
        {weather.temperature < 10 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              ❄️ Cold Weather Alert ({weather.temperature}°C)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <div>• Cover sensitive plants with frost cloth</div>
              <div>• Water plants before sunset to release heat overnight</div>
              <div>• Use row covers for vegetable crops</div>
              <div>• Delay planting of warm-season crops</div>
              <div>• Harvest mature crops before frost damage</div>
              <div>• Move potted plants to protected areas</div>
            </div>
          </div>
        )}
        
        {/* Humidity-based tips */}
        {weather.humidity > 80 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
              💧 High Humidity Alert ({weather.humidity}%)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-800">
              <div>• Improve air circulation with proper plant spacing</div>
              <div>• Apply preventive fungicide spray (neem oil)</div>
              <div>• Avoid overhead watering - use drip irrigation</div>
              <div>• Remove infected plant debris immediately</div>
              <div>• Monitor for powdery mildew, blight, and rust</div>
              <div>• Ensure greenhouse ventilation is adequate</div>
            </div>
          </div>
        )}
        
        {/* Wind-based tips */}
        {weather.windSpeed > 15 && (
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2 flex items-center">
              💨 Strong Wind Alert ({weather.windSpeed} km/h)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-purple-800">
              <div>• Stake tall plants (tomatoes, peppers, corn)</div>
              <div>• Install windbreaks using shade cloth</div>
              <div>• Harvest ripe fruits before they fall</div>
              <div>• Check and repair greenhouse structures</div>
              <div>• Avoid spraying pesticides/fertilizers</div>
              <div>• Secure loose equipment and tools</div>
            </div>
          </div>
        )}
        
        {/* Weather condition-based tips */}
        {(weather.condition === 'Rain' || weather.condition === 'Drizzle') && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              🌧️ Rainy Weather Management
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <div>• Avoid field operations to prevent soil compaction</div>
              <div>• Check drainage systems and clear blockages</div>
              <div>• Apply fungicide after rain stops</div>
              <div>• Harvest ready crops before quality deteriorates</div>
              <div>• Cover compost piles to prevent nutrient leaching</div>
              <div>• Protect seedlings from heavy rainfall</div>
            </div>
          </div>
        )}
        
        {weather.condition === 'Thunderstorm' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2 flex items-center">
              ⛈️ Thunderstorm Warning
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-red-800">
              <div>• Secure all loose equipment and structures</div>
              <div>• Harvest mature crops immediately if possible</div>
              <div>• Check insurance coverage for crop damage</div>
              <div>• Prepare drainage channels for heavy rainfall</div>
              <div>• Avoid working in open fields during storms</div>
              <div>• Move livestock to sheltered areas</div>
            </div>
          </div>
        )}
        
        {/* UV Index tips */}
        {weather.uvIndex > 7 && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2 flex items-center">
              ☀️ High UV Index Alert ({weather.uvIndex} - {getUVLevel(weather.uvIndex).level})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-orange-800">
              <div>• Provide shade for sensitive crops and workers</div>
              <div>• Schedule field work for early morning or evening</div>
              <div>• Use UV-protective covers for nursery plants</div>
              <div>• Increase water frequency for shallow-rooted crops</div>
              <div>• Monitor plants for sun scald damage</div>
              <div>• Apply reflective mulch to reduce heat stress</div>
            </div>
          </div>
        )}
        
        {/* General optimal conditions */}
        {weather.temperature >= 20 && weather.temperature <= 30 && weather.humidity < 70 && weather.windSpeed < 15 && weather.condition === 'Clear' && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2 flex items-center">
              🌿 Optimal Farming Conditions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
              <div>• Perfect day for field operations and planting</div>
              <div>• Ideal conditions for spraying pesticides/fertilizers</div>
              <div>• Good time for transplanting seedlings</div>
              <div>• Excellent for drying harvested crops</div>
              <div>• Optimal for soil preparation and cultivation</div>
              <div>• Great conditions for composting activities</div>
            </div>
          </div>
        )}
        
        {/* Seasonal tips */}
        <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">🗓️ Seasonal Farming Calendar</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
            {(() => {
              const month = new Date().getMonth()
              if (month >= 5 && month <= 8) { // Monsoon season
                return (
                  <>
                    <div>• Plant monsoon crops: rice, cotton, sugarcane</div>
                    <div>• Ensure proper field drainage systems</div>
                    <div>• Apply pre-emergence herbicides</div>
                    <div>• Monitor for pest outbreaks due to humidity</div>
                  </>
                )
              } else if (month >= 10 && month <= 2) { // Winter season
                return (
                  <>
                    <div>• Plant winter crops: wheat, barley, peas</div>
                    <div>• Reduce irrigation frequency</div>
                    <div>• Apply organic manure for slow nutrient release</div>
                    <div>• Protect crops from frost damage</div>
                  </>
                )
              } else { // Summer season
                return (
                  <>
                    <div>• Plant summer crops: maize, fodder, vegetables</div>
                    <div>• Focus on water conservation techniques</div>
                    <div>• Use mulching to retain soil moisture</div>
                    <div>• Plan for heat-resistant crop varieties</div>
                  </>
                )
              }
            })()}
          </div>
        </div>
      </motion.div>
    </div>
  )
}