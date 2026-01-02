import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Truck, MapPin, Clock, Phone, Package, Navigation } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'

export default function LogisticsIntegration({ order }) {
  const { t } = useLanguageStore()
  const [logistics, setLogistics] = useState(null)
  const [tracking, setTracking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (order) {
      generateLogistics()
    }
  }, [order])

  const generateLogistics = () => {
    // Simulate logistics partner assignment
    const partners = [
      { name: 'FreshExpress', phone: '+91-9876543210', vehicle: 'Refrigerated Truck' },
      { name: 'AgriLogistics', phone: '+91-9876543211', vehicle: 'Temperature Controlled' },
      { name: 'FarmToTable', phone: '+91-9876543212', vehicle: 'Cold Chain Truck' }
    ]

    const partner = partners[Math.floor(Math.random() * partners.length)]
    const trackingId = `TRK${Date.now().toString(36).toUpperCase()}`

    const logisticsData = {
      partner: partner.name,
      driverPhone: partner.phone,
      vehicleType: partner.vehicle,
      trackingId,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      currentLocation: 'Pickup Point',
      status: order.status === 'shipped' ? 'IN_TRANSIT' : 'ASSIGNED'
    }

    // Generate tracking history
    const trackingData = [
      {
        status: 'ASSIGNED',
        location: 'Logistics Hub',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: `Order assigned to ${partner.name}`
      },
      {
        status: 'PICKED_UP',
        location: 'Farm Location',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        description: 'Product picked up from farmer'
      }
    ]

    if (order.status === 'shipped') {
      trackingData.push({
        status: 'IN_TRANSIT',
        location: 'Highway Checkpoint',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        description: 'Package in transit to destination'
      })
    }

    setLogistics(logisticsData)
    setTracking(trackingData)
    setLoading(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ASSIGNED': return 'text-blue-600 bg-blue-100'
      case 'PICKED_UP': return 'text-yellow-600 bg-yellow-100'
      case 'IN_TRANSIT': return 'text-purple-600 bg-purple-100'
      case 'DELIVERED': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6 border"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Truck className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Logistics Tracking</h3>
      </div>

      {/* Logistics Partner Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-800 font-medium">{logistics.partner}</p>
            <p className="text-xs text-blue-600">{logistics.vehicleType}</p>
          </div>
          <div>
            <p className="text-sm text-blue-800">Tracking ID: {logistics.trackingId}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Phone className="h-3 w-3 text-blue-600" />
              <p className="text-xs text-blue-600">{logistics.driverPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(logistics.status)}`}>
            {logistics.status.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{logistics.currentLocation}</span>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="mb-6 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">Estimated Delivery</p>
            <p className="text-xs text-green-700">
              {new Date(logistics.estimatedDelivery).toLocaleDateString()} at {new Date(logistics.estimatedDelivery).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Tracking Timeline</h4>
        <div className="space-y-3">
          {tracking.map((event, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.description}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1">
          <Navigation className="h-4 w-4" />
          <span>Live Tracking</span>
        </button>
        <button className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1">
          <Phone className="h-4 w-4" />
          <span>Call Driver</span>
        </button>
      </div>
    </motion.div>
  )
}