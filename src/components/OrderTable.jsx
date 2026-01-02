import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLanguageStore } from '../store/languageStore'
import toast from 'react-hot-toast'

export default function OrderTable({ orders, onStatusUpdate }) {
  const { t } = useLanguageStore()
  const [loading, setLoading] = useState(null)

  const updateOrderStatus = async (orderId, status) => {
    setLoading(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error

      const statusMessages = {
        accepted: t('orderAccepted'),
        rejected: t('orderRejected'),
        shipped: t('orderShipped'),
        delivered: t('orderDelivered')
      }
      toast.success(statusMessages[status] || `Order ${status}!`)
      onStatusUpdate()
    } catch (error) {
      toast.error(t('failedToUpdateOrderStatus'))
    } finally {
      setLoading(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'accepted': return 'text-blue-600 bg-blue-100'
      case 'shipped': return 'text-purple-600 bg-purple-100'
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t('noOrdersYet')}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('product')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('buyer')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('quantity')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('amount')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('status')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('date')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <motion.tr
              key={order.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.products?.crop_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {order.profiles?.full_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {order.quantity}kg
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  ₹{order.total_amount}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(order.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {order.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'accepted')}
                      disabled={loading === order.id}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      title={t('acceptOrder')}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'rejected')}
                      disabled={loading === order.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title={t('rejectOrder')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {order.status === 'accepted' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                    disabled={loading === order.id}
                    className="text-blue-600 hover:text-blue-900 text-xs disabled:opacity-50"
                  >
                    {t('markShipped')}
                  </button>
                )}
                {order.status === 'shipped' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    disabled={loading === order.id}
                    className="text-green-600 hover:text-green-900 text-xs disabled:opacity-50"
                  >
                    {t('markDelivered')}
                  </button>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}