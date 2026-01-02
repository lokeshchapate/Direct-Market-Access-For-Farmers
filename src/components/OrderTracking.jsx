import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLanguageStore } from '../store/languageStore'

export default function OrderTracking({ orderId, onClose }) {
  const { t } = useLanguageStore()
  const [order, setOrder] = useState(null)
  const [trackingHistory, setTrackingHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          products (crop_name, price),
          profiles!orders_farmer_id_fkey (full_name, location)
        `)
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      setOrder(orderData)
      // Generate mock tracking history based on order status
      const mockTracking = generateTrackingHistory(orderData)
      setTrackingHistory(mockTracking)
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTrackingHistory = (order) => {
    const baseDate = new Date(order.created_at)
    const history = []
    
    // Always add order placed
    history.push({
      status: 'pending',
      timestamp: order.created_at,
      description: 'Order placed successfully'
    })
    
    if (['accepted', 'shipped', 'delivered'].includes(order.status)) {
      history.push({
        status: 'accepted',
        timestamp: new Date(baseDate.getTime() + 30 * 60000).toISOString(), // +30 min
        description: 'Order accepted by farmer'
      })
    }
    
    if (['shipped', 'delivered'].includes(order.status)) {
      history.push({
        status: 'shipped',
        timestamp: new Date(baseDate.getTime() + 24 * 60 * 60000).toISOString(), // +1 day
        description: 'Order shipped for delivery'
      })
    }
    
    if (order.status === 'delivered') {
      history.push({
        status: 'delivered',
        timestamp: new Date(baseDate.getTime() + 48 * 60 * 60000).toISOString(), // +2 days
        description: 'Order delivered successfully'
      })
    }
    
    return history
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />
      case 'accepted': return <CheckCircle className="h-5 w-5" />
      case 'shipped': return <Truck className="h-5 w-5" />
      case 'delivered': return <Package className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'accepted': return 'text-blue-600 bg-blue-100'
      case 'shipped': return 'text-purple-600 bg-purple-100'
      case 'delivered': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const trackingSteps = [
    { key: 'pending', label: t('pending') || 'Order Placed' },
    { key: 'accepted', label: t('accepted') || 'Order Accepted' },
    { key: 'shipped', label: t('shipped') || 'Order Shipped' },
    { key: 'delivered', label: t('delivered') || 'Order Delivered' }
  ]

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Order Tracking</h2>
              <p className="text-sm text-gray-600">Order #{order?.id?.slice(0, 8)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Order Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Product:</span>
                <span className="ml-2 font-medium">{order?.products?.crop_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Quantity:</span>
                <span className="ml-2 font-medium">{order?.quantity}kg</span>
              </div>
              <div>
                <span className="text-gray-600">Farmer:</span>
                <span className="ml-2 font-medium">{order?.profiles?.full_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-medium">₹{order?.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Tracking Timeline</h3>
            
            <div className="relative">
              {trackingHistory.map((item, index) => {
                const stepInfo = trackingSteps.find(s => s.key === item.status)
                const isCurrent = item.status === order?.status
                
                return (
                  <div key={`${item.status}-${index}`} className="relative flex items-center pb-8">
                    {index < trackingHistory.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-8 bg-primary-600" />
                    )}
                    
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-primary-600 border-primary-600 text-white">
                      {getStatusIcon(item.status)}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className={`font-medium ${
                        isCurrent ? 'text-primary-600' : 'text-gray-900'
                      }`}>
                        {stepInfo?.label || item.status}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.description}
                        {isCurrent && ' (Current Status)'}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString()}
                      <br />
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Delivery Information */}
          {order?.status === 'shipped' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <Truck className="h-5 w-5" />
                <span className="font-medium">Out for Delivery</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Your order is on the way and will be delivered soon.
              </p>
            </div>
          )}

          {order?.status === 'delivered' && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Order Delivered</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your order has been successfully delivered. Thank you for your purchase!
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}