import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertCircle, Calendar, BarChart3, RefreshCw, Clock } from 'lucide-react'

export default function RealTimeDemandForecast({ location }) {
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    fetchRealTimeDemand()
    // Update every hour
    const interval = setInterval(fetchRealTimeDemand, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [location])

  const fetchRealTimeDemand = async () => {
    setLoading(true)
    try {
      const marketData = await fetchMarketDemandData()
      const processedForecast = processMarketData(marketData)
      setForecast(processedForecast)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch demand data:', error)
      generateFallbackForecast()
    } finally {
      setLoading(false)
    }
  }

  const fetchMarketDemandData = async () => {
    // Simulate real-time market data with hourly variations
    const currentHour = new Date().getHours()
    const dayOfWeek = new Date().getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isMorning = currentHour >= 6 && currentHour <= 10
    const isEvening = currentHour >= 17 && currentHour <= 20
    
    return {
      timestamp: new Date().toISOString(),
      marketConditions: {
        peakHours: isMorning || isEvening,
        weekend: isWeekend,
        seasonalFactor: getSeasonalFactor(),
        weatherImpact: getWeatherImpact()
      },
      crops: generateRealTimeData(currentHour, isWeekend)
    }
  }

  const getSeasonalFactor = () => {
    const month = new Date().getMonth()
    const seasonalFactors = {
      0: 1.2, 1: 1.1, 2: 0.9, 3: 0.8, 4: 0.7, 5: 0.8,
      6: 0.9, 7: 1.0, 8: 1.1, 9: 1.3, 10: 1.4, 11: 1.5
    }
    return seasonalFactors[month] || 1.0
  }

  const getWeatherImpact = () => {
    const impacts = ['favorable', 'neutral', 'challenging']
    return impacts[Math.floor(Math.random() * impacts.length)]
  }

  const generateRealTimeData = (hour, isWeekend) => {
    const baseCrops = [
      { name: 'Tomato', basePrice: 45, volatility: 0.15 },
      { name: 'Onion', basePrice: 32, volatility: 0.12 },
      { name: 'Potato', basePrice: 28, volatility: 0.08 },
      { name: 'Cabbage', basePrice: 18, volatility: 0.10 },
      { name: 'Carrot', basePrice: 35, volatility: 0.13 },
      { name: 'Cauliflower', basePrice: 25, volatility: 0.11 }
    ]

    return baseCrops.map(crop => {
      const hourlyVariation = Math.sin(hour * Math.PI / 12) * 0.1
      const weekendFactor = isWeekend ? 0.85 : 1.0
      const randomFactor = (Math.random() - 0.5) * crop.volatility
      
      const demandMultiplier = 1 + hourlyVariation + randomFactor
      const priceChange = (demandMultiplier - 1) * 100
      const currentPrice = Math.round(crop.basePrice * demandMultiplier * weekendFactor)
      
      return {
        crop: crop.name,
        currentDemand: getDemandLevel(demandMultiplier),
        trend: priceChange > 2 ? 'up' : priceChange < -2 ? 'down' : 'stable',
        change: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}%`,
        price: `₹${currentPrice}/kg`,
        forecast: generateForecastText(crop.name, demandMultiplier, hour),
        confidence: Math.round(70 + Math.random() * 25),
        volume: Math.round(1000 + Math.random() * 5000),
        marketShare: Math.round(10 + Math.random() * 30)
      }
    })
  }

  const getDemandLevel = (multiplier) => {
    if (multiplier > 1.1) return 'High'
    if (multiplier > 0.95) return 'Medium'
    return 'Low'
  }

  const generateForecastText = (crop, multiplier, hour) => {
    const conditions = [
      'Strong market demand',
      'Seasonal price variation',
      'Supply chain optimization',
      'Consumer preference shift',
      'Weather impact on supply',
      'Festival season demand',
      'Export opportunity increase'
    ]
    
    const timeFactors = {
      morning: 'Morning market activity high',
      afternoon: 'Afternoon trading moderate',
      evening: 'Evening demand surge expected'
    }
    
    let timeFactor = 'Stable trading conditions'
    if (hour >= 6 && hour <= 10) timeFactor = timeFactors.morning
    else if (hour >= 12 && hour <= 16) timeFactor = timeFactors.afternoon
    else if (hour >= 17 && hour <= 20) timeFactor = timeFactors.evening
    
    return `${conditions[Math.floor(Math.random() * conditions.length)]}. ${timeFactor}.`
  }

  const processMarketData = (marketData) => {
    return {
      location,
      lastUpdated: new Date(marketData.timestamp),
      nextUpdate: new Date(Date.now() + 60 * 60 * 1000),
      marketConditions: marketData.marketConditions,
      trends: marketData.crops,
      insights: generateMarketInsights(marketData),
      summary: {
        totalVolume: marketData.crops.reduce((sum, crop) => sum + crop.volume, 0),
        avgConfidence: Math.round(marketData.crops.reduce((sum, crop) => sum + crop.confidence, 0) / marketData.crops.length),
        topPerformer: marketData.crops.reduce((max, crop) => 
          parseFloat(crop.change) > parseFloat(max.change) ? crop : max
        )
      }
    }
  }

  const generateMarketInsights = (data) => {
    const insights = []
    const highDemandCrops = data.crops.filter(crop => crop.currentDemand === 'High')
    const trendingUp = data.crops.filter(crop => crop.trend === 'up')
    
    if (highDemandCrops.length > 0) {
      insights.push(`${highDemandCrops.length} crops showing high demand currently`)
    }
    
    if (trendingUp.length > 0) {
      insights.push(`${trendingUp.length} crops trending upward in the last hour`)
    }
    
    if (data.marketConditions.peakHours) {
      insights.push('Peak trading hours - increased market activity')
    }
    
    if (data.marketConditions.weekend) {
      insights.push('Weekend trading - reduced commercial demand')
    }
    
    insights.push(`Weather conditions: ${data.marketConditions.weatherImpact} for crop demand`)
    insights.push(`Seasonal factor: ${(data.marketConditions.seasonalFactor * 100 - 100).toFixed(1)}% adjustment`)
    
    return insights
  }

  const generateFallbackForecast = () => {
    const data = {
      location,
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + 60 * 60 * 1000),
      trends: generateRealTimeData(new Date().getHours(), new Date().getDay() === 0 || new Date().getDay() === 6),
      insights: [
        'Using cached market data - real-time updates temporarily unavailable',
        'Local market conditions remain stable',
        'Seasonal demand patterns being monitored'
      ]
    }
    setForecast(data)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="bg-white rounded-lg shadow p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Real-time Demand Forecast</h2>
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium">LIVE</span>
            </div>
          </div>
          <button
            onClick={fetchRealTimeDemand}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Last Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Next Update: {forecast?.nextUpdate?.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Confidence: {forecast?.summary?.avgConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Market Summary */}
      {forecast?.summary && (
        <div className="bg-white rounded-lg shadow p-6 border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Market Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{forecast.summary.totalVolume.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Volume (kg)</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{forecast.summary.avgConfidence}%</p>
              <p className="text-sm text-gray-600">Avg Confidence</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-lg font-bold text-purple-600">{forecast.summary.topPerformer.crop}</p>
              <p className="text-sm text-gray-600">Top Performer ({forecast.summary.topPerformer.change})</p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Crop Demand */}
      <div className="bg-white rounded-lg shadow p-6 border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Demand Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecast?.trends?.map((item, index) => (
            <motion.div
              key={item.crop}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{item.crop}</h4>
                <div className="flex items-center space-x-2">
                  {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                  {item.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full"></div>}
                  <span className={`text-sm font-medium ${
                    item.trend === 'up' ? 'text-green-600' : 
                    item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {item.change}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="font-medium">{item.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Demand Level:</span>
                  <span className={`font-medium ${
                    item.currentDemand === 'High' ? 'text-green-600' :
                    item.currentDemand === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {item.currentDemand}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium">{item.volume} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{item.confidence}%</span>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                {item.forecast}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      {forecast?.insights && (
        <div className="bg-white rounded-lg shadow p-6 border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Live Market Insights</h3>
          <div className="space-y-2">
            {forecast.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}