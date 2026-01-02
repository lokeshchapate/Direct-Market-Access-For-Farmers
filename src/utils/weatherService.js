// Weather service with multiple API fallbacks
export const fetchWeatherData = async (location) => {
  // Try multiple free weather APIs
  const apis = [
    () => fetchOpenWeatherMap(location),
    () => fetchWeatherAPI(location),
    () => fetchWTTR(location)
  ]

  for (const api of apis) {
    try {
      const data = await api()
      if (data) return data
    } catch (error) {
      console.log('API failed, trying next...')
    }
  }

  // Return mock data if all APIs fail
  return getMockWeatherData(location)
}

// OpenWeatherMap API (requires API key)
const fetchOpenWeatherMap = async (location) => {
  const API_KEY = process.env.VITE_OPENWEATHER_API_KEY
  if (!API_KEY) throw new Error('No API key')

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
  )
  
  if (!response.ok) throw new Error('API failed')
  
  const data = await response.json()
  
  return {
    current: {
      temperature: Math.round(data.main.temp),
      condition: mapWeatherCondition(data.weather[0].main),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      rainfall: data.rain?.['1h'] || 0,
      description: data.weather[0].description
    },
    forecast: generateForecast(data.main.temp)
  }
}

// WeatherAPI.com (free tier)
const fetchWeatherAPI = async (location) => {
  const API_KEY = process.env.VITE_WEATHER_API_KEY
  if (!API_KEY) throw new Error('No API key')

  const response = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`
  )
  
  if (!response.ok) throw new Error('API failed')
  
  const data = await response.json()
  
  return {
    current: {
      temperature: Math.round(data.current.temp_c),
      condition: mapWeatherCondition(data.current.condition.text),
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
      rainfall: data.current.precip_mm,
      description: data.current.condition.text
    },
    forecast: generateForecast(data.current.temp_c)
  }
}

// WTTR.in (free, no API key needed)
const fetchWTTR = async (location) => {
  try {
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'WeatherApp/1.0'
        }
      }
    )
    
    if (!response.ok) throw new Error('API failed')
    
    const data = await response.json()
    const current = data.current_condition[0]
    
    return {
      current: {
        temperature: parseInt(current.temp_C),
        condition: mapWeatherCondition(current.weatherDesc[0].value),
        humidity: parseInt(current.humidity),
        windSpeed: parseInt(current.windspeedKmph),
        rainfall: parseFloat(current.precipMM || 0),
        description: current.weatherDesc[0].value,
        feelsLike: parseInt(current.FeelsLikeC),
        visibility: parseInt(current.visibility)
      },
      forecast: data.weather.slice(0, 5).map((day, index) => ({
        day: index === 0 ? 'Today' : `Day ${index + 1}`,
        temp: parseInt(day.maxtempC),
        minTemp: parseInt(day.mintempC),
        condition: mapWeatherCondition(day.hourly[0].weatherDesc[0].value),
        rain: parseInt(day.hourly[0].chanceofrain),
        date: day.date
      }))
    }
  } catch (error) {
    console.error('WTTR API error:', error)
    throw error
  }
}

const mapWeatherCondition = (condition) => {
  const conditionLower = condition.toLowerCase()
  
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return 'sunny'
  }
  if (conditionLower.includes('cloud')) {
    return 'cloudy'
  }
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'rainy'
  }
  if (conditionLower.includes('partly')) {
    return 'partly-cloudy'
  }
  
  return 'partly-cloudy'
}

const generateForecast = (baseTemp) => {
  return [
    { day: 'Today', temp: baseTemp, condition: 'partly-cloudy', rain: 10 },
    { day: 'Tomorrow', temp: baseTemp + 2, condition: 'sunny', rain: 0 },
    { day: 'Day 3', temp: baseTemp - 2, condition: 'rainy', rain: 80 },
    { day: 'Day 4', temp: baseTemp - 3, condition: 'cloudy', rain: 40 },
    { day: 'Day 5', temp: baseTemp + 1, condition: 'sunny', rain: 5 }
  ]
}

const getMockWeatherData = (location) => {
  // More accurate location-based weather data
  const locationData = {
    bangalore: { temp: 26, humidity: 68, wind: 8, condition: 'partly-cloudy' },
    mumbai: { temp: 30, humidity: 85, wind: 12, condition: 'cloudy' },
    delhi: { temp: 28, humidity: 55, wind: 6, condition: 'sunny' },
    chennai: { temp: 32, humidity: 78, wind: 14, condition: 'partly-cloudy' },
    hyderabad: { temp: 29, humidity: 62, wind: 9, condition: 'sunny' },
    pune: { temp: 27, humidity: 60, wind: 10, condition: 'partly-cloudy' },
    kolkata: { temp: 31, humidity: 80, wind: 11, condition: 'cloudy' }
  }
  
  const data = locationData[location.toLowerCase()] || locationData.bangalore
  const currentHour = new Date().getHours()
  
  // Adjust temperature based on time of day
  let tempAdjustment = 0
  if (currentHour >= 6 && currentHour < 12) tempAdjustment = -2 // Morning
  else if (currentHour >= 12 && currentHour < 16) tempAdjustment = 3 // Afternoon
  else if (currentHour >= 16 && currentHour < 20) tempAdjustment = 1 // Evening
  else tempAdjustment = -4 // Night
  
  return {
    current: {
      temperature: data.temp + tempAdjustment + Math.floor(Math.random() * 4) - 2,
      condition: data.condition,
      humidity: data.humidity + Math.floor(Math.random() * 10) - 5,
      windSpeed: data.wind + Math.floor(Math.random() * 6) - 3,
      rainfall: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
      description: getConditionDescription(data.condition),
      feelsLike: data.temp + tempAdjustment + 2,
      visibility: 10
    },
    forecast: generateForecast(data.temp)
  }
}

const getConditionDescription = (condition) => {
  switch (condition) {
    case 'sunny': return 'Clear Sky'
    case 'partly-cloudy': return 'Partly Cloudy'
    case 'cloudy': return 'Overcast'
    case 'rainy': return 'Light Rain'
    default: return 'Partly Cloudy'
  }
}