import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Package, TrendingUp, Users, Cloud, Target, Lightbulb, Award, Truck, MessageCircle, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import ProductForm from '../components/ProductForm'
import OrderTable from '../components/OrderTable'
import KarnatakaPrices from '../components/KarnatakaPrices'
import GovernmentSchemes from '../components/GovernmentSchemes'
import LogisticsIntegration from '../components/LogisticsIntegration'
import CommunityForum from '../components/CommunityForum'
import RealtimeWeather from '../components/RealtimeWeather'



import toast from 'react-hot-toast'


export default function FarmerDashboard() {
  const { user, profile } = useAuthStore()
  const { t, currentLanguage } = useLanguageStore()
  
  console.log('FarmerDashboard - User:', user)
  console.log('FarmerDashboard - Profile:', profile)
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)



  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchOrders()
    }
  }, [user])

  const fetchProducts = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) {
      setProducts(data || [])
      setStats(prev => ({ ...prev, totalProducts: data?.length || 0 }))
    }
  }

  const fetchOrders = async () => {
    console.log('Fetching orders for farmer:', user.id)
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (crop_name, price),
        profiles!orders_buyer_id_fkey (full_name)
      `)
      .eq('farmer_id', user.id)
      .order('created_at', { ascending: false })

    console.log('Farmer orders fetch result:', { data, error })
    
    if (error) {
      console.error('Farmer orders fetch error:', error)
    } else {
      setOrders(data || [])
      const revenue = data?.reduce((sum, order) => 
        sum + order.total_amount, 0) || 0
      setStats(prev => ({ 
        ...prev, 
        totalOrders: data?.length || 0,
        totalRevenue: revenue
      }))
    }
  }



  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t('confirmDeleteProduct'))) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('farmer_id', user.id)

      if (error) {
        console.error('Delete error:', error)
        toast.error(t('failedToDeleteProduct'))
        return
      }

      toast.success(t('productDeletedSuccessfully'))
      fetchProducts()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(t('failedToDeleteProduct'))
    }
  }

  const handleProductSubmit = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .eq('farmer_id', user.id)
          .select()

        if (error) {
          console.error('Update error:', error)
          toast.error(t('failedToUpdateProduct') + ': ' + error.message)
          return
        }

        toast.success(t('productUpdatedSuccessfully'))
      } else {
        // First ensure user has a profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              full_name: user.email.split('@')[0],
              role: 'farmer',
              phone: '0000000000',
              location: 'Unknown',
              verified: false
            }])
          
          if (createError) {
            console.error('Profile creation error:', createError)
            toast.error(t('failedToCreateProfile') + ': ' + createError.message)
            return
          }
        } else if (profileError) {
          console.error('Profile fetch error:', profileError)
          toast.error(t('failedToVerifyProfile') + ': ' + profileError.message)
          return
        }

        // Now add the product
        const { data, error } = await supabase
          .from('products')
          .insert([{ ...productData, farmer_id: user.id }])
          .select()

        if (error) {
          console.error('Insert error:', error)
          toast.error(t('failedToAddProduct') + ': ' + error.message)
          return
        }

        console.log('Product created successfully:', data)
        toast.success(t('productAddedSuccessfully'))
      }

      fetchProducts()
      setShowProductForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(editingProduct ? t('failedToUpdateProduct') : t('failedToAddProduct'))
    }
  }

  const tabs = [
    { id: 'products', label: t('myProducts'), icon: Package },
    { id: 'orders', label: t('orders'), icon: Users },
    { id: 'prices', label: t('marketPrices'), icon: TrendingUp },
    { id: 'community', label: t('community'), icon: MessageCircle },
    { id: 'weather', label: t('weather'), icon: Cloud },
    { id: 'government', label: t('governmentSchemes'), icon: Award },
    { id: 'logistics', label: t('logistics'), icon: Truck }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">




        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('totalProducts')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('totalOrders')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('totalRevenue')}</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
              </div>
            </div>
          </motion.div>


        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-6 overflow-x-auto" key={currentLanguage}>
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">


            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{t('myProducts')}</h3>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('addProduct')}</span>
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('noProductsYet')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.crop_name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{product.crop_name}</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product)
                                setShowProductForm(true)
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {t('edit')}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              {t('delete')}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-lg font-bold text-primary-600">₹{product.price}/kg</span>
                          <span className={`text-sm ${
                            product.quantity > 0 ? 'text-gray-500' : 'text-red-500 font-medium'
                          }`}>
                            {product.quantity > 0 ? `${product.quantity}${t('kg')} ${t('available')}` : t('outOfStock')}
                          </span>
                        </div>
                        {product.quantity === 0 && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-center">
                            <span className="text-red-600 text-sm font-medium">⚠️ {t('productUnavailable')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">{t('orders')}</h3>
                <OrderTable orders={orders} onStatusUpdate={fetchOrders} />
              </div>
            )}

            {activeTab === 'prices' && (
              <KarnatakaPrices />
            )}

            {activeTab === 'weather' && (
              <RealtimeWeather />
            )}





            {activeTab === 'government' && (
              <GovernmentSchemes farmerProfile={profile} />
            )}

            {activeTab === 'logistics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">{t('logisticsDelivery')}</h3>
                {orders.filter(order => order.status === 'shipped' || order.status === 'accepted').map((order) => (
                  <LogisticsIntegration key={order.id} order={order} />
                ))}
                {orders.filter(order => order.status === 'shipped' || order.status === 'accepted').length === 0 && (
                  <div className="text-center py-12">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('noActiveShipments')}</p>
                  </div>
                )}
              </div>
            )}



            {activeTab === 'community' && (
              <CommunityForum />
            )}
          </div>
        </div>
      </div>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleProductSubmit}
          onClose={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
        />
      )}
      



      </div>
      

    </div>
  )
}