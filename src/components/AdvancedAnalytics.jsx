import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, PieChart, Target, Calendar, DollarSign } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'

export default function AdvancedAnalytics({ farmerId }) {
  const { t } = useLanguageStore()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateAnalytics()
  }, [farmerId])

  const generateAnalytics = () => {
    // Simulate advanced analytics
    setTimeout(() => {
      const data = {
        revenue: {
          current: 125000,
          previous: 98000,
          growth: 27.6,
          trend: 'up'
        },
        crops: {
          bestPerforming: 'Tomato',
          worstPerforming: 'Onion',
          totalVarieties: 8,
          seasonalTrends: [
            { crop: 'Tomato', profit: 45000, margin: 35 },
            { crop: 'Cabbage', profit: 32000, margin: 28 },
            { crop: 'Carrot', profit: 28000, margin: 25 }
          ]
        },
        market: {
          bestMarkets: ['Bangalore', 'Mumbai', 'Chennai'],
          priceOptimization: 15.2,
          demandForecast: 'High',
          competitorAnalysis: 'Above Average'
        },
        efficiency: {
          costReduction: 12.5,
          yieldImprovement: 18.3,
          wasteReduction: 8.7,
          timeToMarket: 2.1
        },
        predictions: {
          nextQuarterRevenue: 145000,
          recommendedCrops: ['Tomato', 'Cucumber', 'Bell Pepper'],
          optimalPlantingDates: {
            'Tomato': '2024-02-15',
            'Cucumber': '2024-03-01',
            'Bell Pepper': '2024-02-20'
          }
        }
      }
      setAnalytics(data)
      setLoading(false)
    }, 1500)
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
      {/* Revenue Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6 border"
      >
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">Revenue Analytics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">₹{analytics.revenue.current.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Current Revenue</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">+{analytics.revenue.growth}%</p>
            <p className="text-sm text-gray-600">Growth Rate</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">₹{analytics.predictions.nextQuarterRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Predicted Next Quarter</p>
          </div>
        </div>
      </motion.div>

      {/* Crop Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow p-6 border"
      >
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Crop Performance Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Performing Crops</h4>
            <div className="space-y-3">
              {analytics.crops.seasonalTrends.map((crop, index) => (
                <div key={crop.crop} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{crop.crop}</p>
                    <p className="text-sm text-gray-600">{crop.margin}% profit margin</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{crop.profit.toLocaleString()}</p>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${crop.margin * 2}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Market Insights</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">Best Markets</p>
                <p className="text-xs text-blue-600">{analytics.market.bestMarkets.join(', ')}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">Price Optimization</p>
                <p className="text-xs text-green-600">+{analytics.market.priceOptimization}% above market average</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800 font-medium">Demand Forecast</p>
                <p className="text-xs text-purple-600">{analytics.market.demandForecast} demand expected</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>



      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow p-6 border"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-medium text-gray-900">AI-Powered Recommendations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recommended Crops for Next Season</h4>
            <div className="space-y-2">
              {analytics.predictions.recommendedCrops.map((crop, index) => (
                <div key={crop} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm font-medium text-orange-900">{crop}</span>
                  <span className="text-xs text-orange-600">High Profit Potential</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Optimal Planting Schedule</h4>
            <div className="space-y-2">
              {Object.entries(analytics.predictions.optimalPlantingDates).map(([crop, date]) => (
                <div key={crop} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm font-medium text-green-900">{crop}</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">{new Date(date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}