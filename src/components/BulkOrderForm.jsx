import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Users, Package, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function BulkOrderForm({ group, onClose, onSubmit }) {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    total_quantity: '',
    offered_price: '',
    delivery_location: '',
    delivery_date: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.total_quantity || !formData.offered_price) {
      toast.error('Please fill required fields')
      return
    }

    if (parseInt(formData.total_quantity) > group.current_quantity) {
      toast.error(`Maximum available quantity: ${group.current_quantity}kg`)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bulk_orders')
        .insert([{
          group_id: group.id,
          buyer_id: user.id,
          total_quantity: parseInt(formData.total_quantity),
          offered_price: parseFloat(formData.offered_price),
          delivery_location: formData.delivery_location,
          delivery_date: formData.delivery_date || null,
          notes: formData.notes,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Bulk order placed successfully!')
      onSubmit && onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Bulk order error:', error)
      toast.error('Failed to place bulk order')
    } finally {
      setLoading(false)
    }
  }

  const totalValue = formData.total_quantity && formData.offered_price ? 
    parseInt(formData.total_quantity) * parseFloat(formData.offered_price) : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Place Bulk Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Group Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">{group.name}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Crop:</span>
              <p className="font-medium">{group.crop_type}</p>
            </div>
            <div>
              <span className="text-gray-500">Available:</span>
              <p className="font-medium">{group.current_quantity}kg</p>
            </div>
            <div>
              <span className="text-gray-500">Members:</span>
              <p className="font-medium">{group.group_members?.length || 0}</p>
            </div>
            <div>
              <span className="text-gray-500">Min Price:</span>
              <p className="font-medium">₹{group.min_price}/kg</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (kg) *
              </label>
              <input
                type="number"
                value={formData.total_quantity}
                onChange={(e) => setFormData({...formData, total_quantity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={`Max: ${group.current_quantity}kg`}
                max={group.current_quantity}
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offered Price (₹/kg) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.offered_price}
                onChange={(e) => setFormData({...formData, offered_price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={`Min: ₹${group.min_price}`}
                min={group.min_price}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Location
            </label>
            <input
              type="text"
              value={formData.delivery_location}
              onChange={(e) => setFormData({...formData, delivery_location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter delivery address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Delivery Date
            </label>
            <input
              type="date"
              value={formData.delivery_date}
              onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Any special requirements or notes..."
            />
          </div>

          {totalValue > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Total Order Value: ₹{totalValue.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>Bulk Order Benefits:</strong> Direct negotiation with farmer groups, 
              better prices for large quantities, and guaranteed supply.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Bulk Order'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}