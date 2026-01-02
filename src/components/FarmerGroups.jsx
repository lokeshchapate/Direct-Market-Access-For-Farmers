import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Package, TrendingUp, MapPin, Phone, X, DollarSign, MessageSquare, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function FarmerGroups() {
  const { user, profile } = useAuthStore()
  const [groups, setGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [bulkOrders, setBulkOrders] = useState([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showJoinGroup, setShowJoinGroup] = useState(null)
  const [showBulkOrders, setShowBulkOrders] = useState(null)
  const [showNegotiation, setShowNegotiation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('groups')

  useEffect(() => {
    fetchGroups()
    fetchMyGroups()
    fetchBulkOrders()
  }, [user])

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('farmer_groups')
      .select(`
        *,
        group_members (
          profiles (full_name, location)
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (!error) {
      setGroups(data || [])
    }
    setLoading(false)
  }

  const fetchMyGroups = async () => {
    // Get from localStorage for now
    const groups = JSON.parse(localStorage.getItem('farmer_groups') || '[]')
    const myGroups = groups.filter(g => 
      g.group_members?.some(m => m.farmer_id === user.id)
    ).map(g => ({
      id: Date.now().toString(),
      farmer_groups: g,
      role: g.group_members.find(m => m.farmer_id === user.id)?.role || 'member',
      status: 'active',
      quantity_committed: g.group_members.find(m => m.farmer_id === user.id)?.quantity_committed || 0
    }))
    setMyGroups(myGroups)
  }

  const fetchBulkOrders = async () => {
    // Get from localStorage for now
    const orders = JSON.parse(localStorage.getItem('bulk_orders') || '[]')
    setBulkOrders(orders)
  }

  const createGroup = async (groupData) => {
    const { data, error } = await supabase
      .from('farmer_groups')
      .insert([{
        ...groupData,
        created_by: user.id,
        status: 'active'
      }])
      .select()
      .single()

    if (error) {
      toast.error('Failed to create group')
      return
    }

    // Add creator as first member
    await supabase
      .from('group_members')
      .insert([{
        group_id: data.id,
        farmer_id: user.id,
        role: 'admin',
        status: 'active'
      }])

    toast.success('Group created successfully!')
    setShowCreateGroup(false)
    fetchGroups()
    fetchMyGroups()
  }

  const joinGroup = async (groupId, quantityCommitted) => {
    const groups = JSON.parse(localStorage.getItem('farmer_groups') || '[]')
    const groupIndex = groups.findIndex(g => g.id === groupId)
    
    if (groupIndex !== -1) {
      groups[groupIndex].group_members.push({
        id: Date.now().toString(),
        farmer_id: user.id,
        role: 'member',
        status: 'active',
        quantity_committed: quantityCommitted
      })
      groups[groupIndex].current_quantity += quantityCommitted
      localStorage.setItem('farmer_groups', JSON.stringify(groups))
    }

    toast.success('Joined group successfully!')
    setShowJoinGroup(null)
    fetchGroups()
    fetchMyGroups()
  }

  const updateOrderStatus = async (orderId, status, negotiatedPrice = null) => {
    const updateData = { status }
    if (negotiatedPrice) updateData.negotiated_price = negotiatedPrice

    const { error } = await supabase
      .from('bulk_orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update order')
      return
    }

    toast.success(`Order ${status}!`)
    fetchBulkOrders()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Farmer Groups</h2>
          <p className="text-gray-600">Form groups to sell bulk and negotiate better prices</p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'groups', label: 'My Groups', icon: Users },
              { id: 'orders', label: 'Bulk Orders', icon: Package },
              { id: 'available', label: 'Available Groups', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.id === 'orders' && bulkOrders.length > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {bulkOrders.length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'groups' && (
            <div>
              {myGroups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">You haven't joined any groups yet</p>
                  <button
                    onClick={() => setActiveTab('available')}
                    className="mt-4 btn-secondary"
                  >
                    Browse Available Groups
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myGroups.map((membership) => (
                    <div key={membership.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{membership.farmer_groups.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              membership.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {membership.role}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              membership.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {membership.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{membership.farmer_groups.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Crop:</span>
                              <p className="font-medium">{membership.farmer_groups.crop_type}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Target:</span>
                              <p className="font-medium">{membership.farmer_groups.target_quantity}kg</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Current:</span>
                              <p className="font-medium">{membership.farmer_groups.current_quantity}kg</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Your Commitment:</span>
                              <p className="font-medium">{membership.quantity_committed}kg</p>
                            </div>
                          </div>
                          
                          {membership.farmer_groups.negotiated_price && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  Negotiated Price: ₹{membership.farmer_groups.negotiated_price}/kg
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {membership.role === 'admin' && (
                          <button
                            onClick={() => setShowBulkOrders(membership.farmer_groups)}
                            className="btn-secondary text-sm px-4 py-2"
                          >
                            View Orders
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Orders</h3>
              {bulkOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No bulk orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bulkOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{order.farmer_groups.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'negotiating' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">Buyer:</span>
                              <p className="font-medium">{order.profiles.full_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <p className="font-medium">{order.total_quantity}kg</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Offered Price:</span>
                              <p className="font-medium">₹{order.offered_price}/kg</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Value:</span>
                              <p className="font-medium">₹{order.total_quantity * order.offered_price}</p>
                            </div>
                          </div>
                          
                          {order.negotiated_price && (
                            <div className="mb-3 p-2 bg-green-50 rounded">
                              <span className="text-sm text-green-800">
                                Negotiated: ₹{order.negotiated_price}/kg
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setShowNegotiation(order)}
                                className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                              >
                                <MessageSquare className="h-3 w-3" />
                                <span>Negotiate</span>
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'accepted')}
                                className="btn-primary text-sm px-3 py-1"
                              >
                                Accept
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'available' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Groups</h3>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No groups available. Create the first one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.filter(group => 
                    !myGroups.some(mg => mg.farmer_groups.id === group.id)
                  ).map((group) => (
                    <div key={group.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{group.name}</h4>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {group.group_members?.length || 0} members
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              group.current_quantity >= group.target_quantity ? 
                              'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {Math.round((group.current_quantity / group.target_quantity) * 100)}% filled
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Crop:</span>
                              <p className="font-medium">{group.crop_type}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Target:</span>
                              <p className="font-medium">{group.target_quantity}kg</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Current:</span>
                              <p className="font-medium">{group.current_quantity}kg</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Min Price:</span>
                              <p className="font-medium">₹{group.min_price}/kg</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <p className="font-medium">{group.location}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                              💰 <strong>Bulk Benefits:</strong> Higher prices through collective bargaining, 
                              shared logistics costs, and stronger market position.
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setShowJoinGroup(group)}
                          className="btn-secondary text-sm px-4 py-2"
                          disabled={group.current_quantity >= group.target_quantity}
                        >
                          {group.current_quantity >= group.target_quantity ? 'Full' : 'Join Group'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onSubmit={createGroup}
        />
      )}

      {/* Join Group Modal */}
      {showJoinGroup && (
        <JoinGroupModal
          group={showJoinGroup}
          onClose={() => setShowJoinGroup(null)}
          onJoin={(quantityCommitted) => joinGroup(showJoinGroup.id, quantityCommitted)}
        />
      )}

      {/* Bulk Orders Modal */}
      {showBulkOrders && (
        <BulkOrdersModal
          group={showBulkOrders}
          onClose={() => setShowBulkOrders(null)}
        />
      )}

      {/* Price Negotiation Modal */}
      {showNegotiation && (
        <PriceNegotiationModal
          order={showNegotiation}
          onClose={() => setShowNegotiation(null)}
          onUpdate={fetchBulkOrders}
        />
      )}
    </div>
  )
}

function CreateGroupModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    crop_type: '',
    target_quantity: '',
    min_price: '',
    location: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.crop_type || !formData.target_quantity) {
      toast.error('Please fill required fields')
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create Farmer Group</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Tomato Farmers Union"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Brief description of the group"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop Type *
              </label>
              <input
                type="text"
                value={formData.crop_type}
                onChange={(e) => setFormData({...formData, crop_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tomato"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Quantity (kg) *
              </label>
              <input
                type="number"
                value={formData.target_quantity}
                onChange={(e) => setFormData({...formData, target_quantity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price (₹/kg)
              </label>
              <input
                type="number"
                value={formData.min_price}
                onChange={(e) => setFormData({...formData, min_price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Bangalore"
              />
            </div>
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
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Group
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function JoinGroupModal({ group, onClose, onJoin }) {
  const [quantityCommitted, setQuantityCommitted] = useState('')
  const remainingQuantity = group.target_quantity - group.current_quantity

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!quantityCommitted || quantityCommitted <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }
    if (quantityCommitted > remainingQuantity) {
      toast.error(`Maximum available: ${remainingQuantity}kg`)
      return
    }
    onJoin(parseInt(quantityCommitted))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Join Group</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">{group.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{group.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Crop:</span>
              <p className="font-medium">{group.crop_type}</p>
            </div>
            <div>
              <span className="text-gray-500">Target:</span>
              <p className="font-medium">{group.target_quantity}kg</p>
            </div>
            <div>
              <span className="text-gray-500">Available:</span>
              <p className="font-medium">{remainingQuantity}kg</p>
            </div>
            <div>
              <span className="text-gray-500">Min Price:</span>
              <p className="font-medium">₹{group.min_price}/kg</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Quantity Commitment (kg) *
            </label>
            <input
              type="number"
              value={quantityCommitted}
              onChange={(e) => setQuantityCommitted(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={`Max: ${remainingQuantity}kg`}
              max={remainingQuantity}
              min="1"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              💰 <strong>Bulk Benefits:</strong> Higher prices through collective bargaining, 
              shared logistics costs, and stronger market position.
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
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send Join Request
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function BulkOrdersModal({ group, onClose }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupOrders()
  }, [group.id])

  const fetchGroupOrders = async () => {
    const { data, error } = await supabase
      .from('bulk_orders')
      .select(`
        *,
        profiles (full_name, location, phone)
      `)
      .eq('group_id', group.id)
      .order('created_at', { ascending: false })

    if (!error) {
      setOrders(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Bulk Orders - {group.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bulk orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{order.profiles.full_name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'negotiating' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">{order.total_quantity}kg</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Offered Price:</span>
                        <p className="font-medium">₹{order.offered_price}/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Value:</span>
                        <p className="font-medium">₹{order.total_quantity * order.offered_price}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <p className="font-medium">{order.profiles.location}</p>
                      </div>
                    </div>
                    
                    {order.delivery_date && (
                      <p className="text-sm text-gray-600">
                        Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                      </p>
                    )}
                    
                    {order.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Notes:</strong> {order.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function PriceNegotiationModal({ order, onClose, onUpdate }) {
  const [proposedPrice, setProposedPrice] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!proposedPrice) {
      toast.error('Please enter a proposed price')
      return
    }

    setLoading(true)
    try {
      // Create negotiation record
      const { error: negError } = await supabase
        .from('price_negotiations')
        .insert([{
          bulk_order_id: order.id,
          proposed_by: user.id,
          proposed_price: parseFloat(proposedPrice),
          message: message,
          status: 'pending'
        }])

      if (negError) throw negError

      // Update order status to negotiating
      const { error: orderError } = await supabase
        .from('bulk_orders')
        .update({ status: 'negotiating' })
        .eq('id', order.id)

      if (orderError) throw orderError

      toast.success('Counter-offer sent!')
      onUpdate()
      onClose()
    } catch (error) {
      toast.error('Failed to send counter-offer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Price Negotiation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm">
              <p><strong>Buyer's Offer:</strong> ₹{order.offered_price}/kg</p>
              <p><strong>Quantity:</strong> {order.total_quantity}kg</p>
              <p><strong>Total Value:</strong> ₹{order.total_quantity * order.offered_price}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Counter-Offer (₹/kg) *
            </label>
            <input
              type="number"
              step="0.01"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your price"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Explain your counter-offer..."
            />
          </div>

          {proposedPrice && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>New Total Value:</strong> ₹{order.total_quantity * parseFloat(proposedPrice || 0)}
              </p>
            </div>
          )}

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
              {loading ? 'Sending...' : 'Send Counter-Offer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}